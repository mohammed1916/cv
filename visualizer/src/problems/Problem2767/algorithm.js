export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with a binary string s.')
  const { s } = input
  if (typeof s !== 'string' || s.length < 1 || s.length > 15 || !/^[01]+$/.test(s)) throw new Error('s must be 1 to 15 characters, each 0 or 1.')
  return { s }
}

const INF = Infinity

export function buildTrace(input) {
  const { s } = input
  const n = s.length
  const powers = new Set()
  for (let p = 1; p < 2 ** n; p *= 5) powers.add(p)
  const dp = Array(n + 1).fill(INF)
  dp[0] = 0
  const shown = () => dp.map(v => (v === INF ? null : v))
  const frames = [{ phase: 'start', activeLine: L('set dp to'), end: 0, start: -1, dp: shown(), message: 'The empty prefix needs zero pieces.' }]
  for (let i = 1; i <= n; i++) {
    for (let j = 0; j < i; j++) {
      if (s[j] === '0') continue
      const value = parseInt(s.slice(j, i), 2)
      if (powers.has(value) && dp[j] + 1 < dp[i]) dp[i] = dp[j] + 1
      if (powers.has(value)) frames.push({ phase: 'piece', activeLine: L('if the substring from j to i'), end: i, start: j, dp: shown(), message: `${s.slice(j, i)} is ${value}, a power of 5, so piece count ${dp[i] === INF ? 'unset' : dp[i]} is available up to ${i}.` })
    }
  }
  const result = dp[n] === INF ? -1 : dp[n]
  frames.push({ phase: 'done', activeLine: L('return dp[n]'), end: n, start: -1, dp: shown(), message: result === -1 ? 'No split into beautiful substrings exists.' : `Minimum pieces: ${result}.` })
  return { input, result, frames }
}

export const code = `minimum beautiful substrings (s):
  set dp to an array of n + 1 unset values, with dp[0] = 0
  for each end position i from 1 to n:
    for each start j from 0 to i - 1:
      if s[j] is 0 then skip this start (a leading zero is not allowed)
      if the substring from j to i is a power of 5 then
        set dp[i] to the smaller of dp[i] and dp[j] + 1
  if dp[n] is unset then return -1
  return dp[n]`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def minimum_beautiful_substrings(s):
    n = len(s)
    powers = set()
    p = 1
    while p < (1 << n):
        powers.add(p)
        p *= 5
    INF = float('inf')
    dp = [INF] * (n + 1)
    dp[0] = 0
    for i in range(1, n + 1):
        for j in range(i):
            if s[j] == '0':
                continue
            value = int(s[j:i], 2)
            if value in powers and dp[j] + 1 < dp[i]:
                dp[i] = dp[j] + 1
    return dp[n] if dp[n] != INF else -1
`
