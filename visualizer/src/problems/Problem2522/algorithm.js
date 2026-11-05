export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with a digit string s and an integer k.')
  const { s, k } = input
  if (typeof s !== 'string' || s.length < 1 || s.length > 12 || !/^[0-9]+$/.test(s)) throw new Error('s must be 1 to 12 digits.')
  if (!Number.isInteger(k) || k < 1 || k > 1000) throw new Error('k must be an integer from 1 to 1000.')
  return { s, k }
}

export const code = `function minPartitions(s, k) {
  const n = s.length
  const dp = Array(n + 1).fill(Infinity)
  dp[0] = 0
  for (let i = 1; i <= n; i++) {
    for (let j = 0; j < i; j++) {
      if (s[j] === '0') continue
      if (Number(s.slice(j, i)) <= k) dp[i] = Math.min(dp[i], dp[j] + 1)
    }
  }
  return dp[n] === Infinity ? -1 : dp[n]
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export function buildTrace(input) {
  const { s, k } = input
  const n = s.length
  const dp = Array(n + 1).fill(null)
  dp[0] = 0
  const frames = [{ phase: 'start', activeLine: L('dp[0] = 0'), pythonLine: 5, end: 0, start: -1, dp: [...dp], message: 'The empty prefix needs zero pieces. Every other prefix starts unset.' }]
  for (let i = 1; i <= n; i++) {
    for (let j = 0; j < i; j++) {
      if (s[j] === '0') {
        frames.push({ phase: 'skip', activeLine: L("if (s[j] === '0')"), pythonLine: 9, end: i, start: j, dp: [...dp], message: `A piece cannot start with 0, so the piece from ${j} to ${i - 1} is skipped.` })
        continue
      }
      const value = Number(s.slice(j, i))
      if (value <= k && dp[j] !== null) {
        const candidate = dp[j] + 1
        dp[i] = dp[i] === null ? candidate : Math.min(dp[i], candidate)
        frames.push({ phase: 'piece', activeLine: L('if (Number(s.slice'), pythonLine: 11, end: i, start: j, dp: [...dp], message: `${s.slice(j, i)} = ${value} is at most ${k}. Taking it after prefix ${j} gives ${dp[i]} pieces for the first ${i} digits.` })
      } else if (value > k) {
        frames.push({ phase: 'big', activeLine: L('if (Number(s.slice'), pythonLine: 10, end: i, start: j, dp: [...dp], message: `${s.slice(j, i)} = ${value} is larger than ${k}, so this piece is not allowed.` })
      }
    }
  }
  const result = dp[n] === null ? -1 : dp[n]
  frames.push({ phase: 'done', activeLine: L('return dp[n]'), pythonLine: 12, end: n, start: -1, dp: [...dp], message: result === -1 ? 'No valid partition exists.' : `Fewest pieces: ${result}.` })
  return { input, result, frames }
}

export const python = `def min_partitions(s, k):
    n = len(s)
    INF = float('inf')
    dp = [INF] * (n + 1)
    dp[0] = 0
    for i in range(1, n + 1):
        for j in range(i):
            if s[j] == '0':
                continue
            if int(s[j:i]) <= k:
                dp[i] = min(dp[i], dp[j] + 1)
    return dp[n] if dp[n] != INF else -1
`
