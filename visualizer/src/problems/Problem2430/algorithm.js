export function parseInput(text) {
  const obj = JSON.parse(text)
  if (!obj || typeof obj !== 'object' || typeof obj.s !== 'string') throw new Error('Use a JSON object with a string s.')
  const { s } = obj
  if (s.length < 1 || s.length > 40) throw new Error('s must have 1 to 40 letters (visualization cap).')
  if (!/^[a-z]+$/.test(s)) throw new Error('s uses lowercase letters only.')
  return { s }
}

export function buildTrace(input) {
  const { s } = input
  const n = s.length
  const dp = new Array(n + 1).fill(0)
  const frames = []
  for (let i = n - 1; i >= 0; i--) {
    dp[i] = 1
    frames.push({ phase: 'rest', activeLine: L('dp[i] = 1'), index: i, dp: [...dp], message: `From position ${i}, deleting the whole rest counts as 1 operation.` })
    for (let len = 1; 2 * len <= n - i; len++) {
      if (s.slice(i, i + len) === s.slice(i + len, i + 2 * len)) {
        dp[i] = Math.max(dp[i], 1 + dp[i + len])
        frames.push({ phase: 'repeat', activeLine: L('dp[i] = max'), index: i, len, dp: [...dp], message: `Delete ${len} letters at ${i}, since the next ${len} match. Best from ${i}: ${dp[i]}.` })
      }
    }
  }
  frames.push({ phase: 'done', activeLine: L('return dp[0]'), index: 0, dp: [...dp], message: `Maximum operations: ${dp[0]}.` })
  return { input, s, result: dp[0], frames }
}

export const code = `maximum operations to delete all of s
  let n be the length of s
  set dp[n] to 0
  for i from n - 1 down to 0 do
    dp[i] = 1, which deletes the whole rest
    for each length L from 1 to half the rest do
      if the next L letters equal the L letters after them then
        dp[i] = max(dp[i], 1 + dp[i + L])
  return dp[0]`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def max_deletions(s):
    n = len(s)
    dp = [0] * (n + 1)
    for i in range(n - 1, -1, -1):
        dp[i] = 1
        for length in range(1, (n - i) // 2 + 1):
            if s[i:i + length] == s[i + length:i + 2 * length]:
                dp[i] = max(dp[i], 1 + dp[i + length])
    return dp[0]
`
