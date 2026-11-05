export function parseInput(text) {
  const n = JSON.parse(text)
  if (!Number.isInteger(n) || n < 1 || n > 60) throw new Error('Enter an integer n from 1 to 60.')
  return n
}

const MOD = 1000000007n
const JS_LINES = [
  'function numTilings(n) {',
  '  const MOD = 1000000007n',
  '  const dp = [1n, 1n, 2n] // dp[i] = tilings of a 2 by i board',
  '  for (let i = 3; i <= n; i++) {',
  '    dp[i] = (2n * dp[i - 1] + dp[i - 3]) % MOD // a vertical domino, two horizontal dominoes, or a tromino pair',
  '  }',
  '  return dp[n]',
  '}',
]
const PY_LINES = [
  'def num_tilings(n):',
  '    MOD = 10**9 + 7',
  '    dp = [1, 1, 2]',
  '    for i in range(3, n + 1):',
  '        dp.append((2 * dp[i - 1] + dp[i - 3]) % MOD)',
  '    return dp[n]',
]
const L = s => JS_LINES.findIndex(t => t.includes(s)) + 1
const P = s => PY_LINES.findIndex(t => t.includes(s)) + 1

export const code = JS_LINES.map((text, index) => ({ line: index + 1, text }))
export const python = PY_LINES.join('\n')

// dp[i] for a 2 by i board. Column i is filled either by a domino (dp[i-1]), by two dominoes stacked over a
// tromino-shaped pair (2 * dp[i-1] covers the two L-shaped options), or by the tromino block from three columns back.
export function buildTrace(n) {
  const MODN = 1000000007n
  const dp = [1n, 1n, 2n]
  const frames = [{ phase: 'base', i: n < 3 ? n : 2, dp: dp.slice(0, Math.max(n, 2) + 1).map(String), reads: [], activeLine: L('const dp = [1n'), pythonLine: P('dp = [1, 1, 2]'), message: 'Base cases: 1 tiling for width 0 and 1, and 2 tilings for width 2.' }]
  for (let i = 3; i <= n; i++) {
    dp[i] = (2n * dp[i - 1] + dp[i - 3]) % MODN
    frames.push({ phase: 'step', i, dp: dp.map(String), reads: [i - 1, i - 3], activeLine: L('dp[i] = (2n'), pythonLine: P('dp.append'),
      message: `dp[${i}] = 2 · dp[${i - 1}] + dp[${i - 3}] = 2 · ${dp[i - 1]} + ${dp[i - 3]}, reduced modulo 1,000,000,007 to ${dp[i]}.` })
  }
  const result = Number(dp[n])
  frames.push({ phase: 'done', i: n, dp: dp.map(String), reads: [], result, activeLine: L('return dp[n]'), pythonLine: P('return dp[n]'), message: `Tilings of a 2 by ${n} board: ${result}.` })
  return { input: n, result, frames }
}
