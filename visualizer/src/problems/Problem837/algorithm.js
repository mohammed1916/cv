export function parseInput(text) {
  const data = JSON.parse(text)
  const { n, k, maxPts } = data ?? {}
  if (!Number.isInteger(n) || n < 0 || n > 10000) throw new Error('n is an integer from 0 to 10,000.')
  if (!Number.isInteger(k) || k < 0 || k > 10000) throw new Error('k is an integer from 0 to 10,000.')
  if (!Number.isInteger(maxPts) || maxPts < 1 || maxPts > 10000) throw new Error('maxPts is an integer from 1 to 10,000.')
  return { n, k, maxPts }
}

const JS_LINES = [
  'function new21Game(n, k, maxPts) {',
  '  if (k === 0 || n >= k + maxPts - 1) return 1 // Alice cannot be stopped before reaching k',
  '  const dp = new Array(n + 1).fill(0) // dp[x] = chance of reaching exactly x points',
  '  dp[0] = 1',
  '  let windowSum = 1 // sum of dp over the last maxPts scores below k',
  '  let answer = 0',
  '  for (let x = 1; x <= n; x++) {',
  '    dp[x] = windowSum / maxPts',
  '    if (x < k) windowSum += dp[x] // scores below k keep the game going',
  '    else answer += dp[x] // scores from k to n are the winning ones',
  '    if (x - maxPts >= 0 && x - maxPts < k) windowSum -= dp[x - maxPts] // the oldest score leaves the window',
  '  }',
  '  return answer',
  '}',
]
const PY_LINES = [
  'def new21_game(n, k, max_pts):',
  '    if k == 0 or n >= k + max_pts - 1:',
  '        return 1.0',
  '    dp = [0.0] * (n + 1)',
  '    dp[0] = 1.0',
  '    window = 1.0',
  '    answer = 0.0',
  '    for x in range(1, n + 1):',
  '        dp[x] = window / max_pts',
  '        if x < k:',
  '            window += dp[x]',
  '        else:',
  '            answer += dp[x]',
  '        if 0 <= x - max_pts < k:',
  '            window -= dp[x - max_pts]',
  '    return answer',
]
const L = s => JS_LINES.findIndex(t => t.includes(s)) + 1
const P = s => PY_LINES.findIndex(t => t.includes(s)) + 1

export const code = JS_LINES.map((text, index) => ({ line: index + 1, text }))
export const python = PY_LINES.join('\n')

// A sliding window holds the last maxPts probabilities that can still lead to a continuing game (scores below k).
export function buildTrace({ n, k, maxPts }) {
  if (k === 0 || n >= k + maxPts - 1) {
    return { input: { n, k, maxPts }, result: 1, frames: [{ phase: 'done', x: n, lo: 0, hi: 0, windowSum: 1, answer: 1, activeLine: L('return 1'), pythonLine: P('return 1.0'), message: 'Alice cannot be stopped before reaching k, so the answer is 1.' }] }
  }
  const dp = new Array(n + 1).fill(0)
  dp[0] = 1
  let windowSum = 1, answer = 0
  const frames = [{ phase: 'start', x: 0, lo: 0, hi: 0, windowSum, answer, activeLine: L('const dp ='), pythonLine: P('dp = [0.0]'), message: 'Score 0 has chance 1; the window holds it.' }]
  for (let x = 1; x <= n; x++) {
    dp[x] = windowSum / maxPts
    const keeps = x < k
    if (keeps) windowSum += dp[x]
    else answer += dp[x]
    const dropped = x - maxPts >= 0 && x - maxPts < k
    if (dropped) windowSum -= dp[x - maxPts]
    frames.push({ phase: keeps ? 'keep' : 'win', x, lo: Math.max(0, x - maxPts), hi: Math.min(x, k - 1), windowSum, answer, dp: dp.slice(0, x + 1), activeLine: L(keeps ? 'windowSum += dp[x]' : 'answer += dp[x]'), pythonLine: P(keeps ? 'window += dp[x]' : 'answer += dp[x]'),
      message: keeps ? `Score ${x} has chance ${dp[x].toFixed(4)} and keeps the game going.` : `Score ${x} is at least k, so its chance ${dp[x].toFixed(4)} adds to the answer.` })
  }
  frames.push({ phase: 'done', x: n, lo: 0, hi: 0, windowSum, answer, result: answer, activeLine: L('return answer'), pythonLine: P('return answer'), message: `Chance that Alice wins: ${answer.toFixed(5)}.` })
  return { input: { n, k, maxPts }, result: answer, frames }
}
