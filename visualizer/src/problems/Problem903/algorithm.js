const MOD = 1000000007
export function parseInput(text) {
  const s = JSON.parse(text)
  if (typeof s !== 'string' || !s.length || s.length > 100 || /[^DI]/.test(s)) throw new Error('Enter a JSON string of 1-100 characters, each "D" or "I" (capped at 100 for visualization).')
  return s
}
export function buildTrace(s) {
  let dp = [1]
  const frames = [{ phase: 'start', activeLine: L('start with dp = [1]'), dp: [...dp], i: -1, message: 'With one element there is exactly one arrangement; dp[j] counts arrangements whose last element has rank j among those placed.' }]
  for (let i = 0; i < s.length; i++) {
    const c = s[i]
    const prefix = [0]
    for (const v of dp) prefix.push((prefix[prefix.length - 1] + v) % MOD)
    const next = []
    for (let j = 0; j <= i + 1; j++) {
      next.push(c === 'I' ? prefix[j] : (prefix[i + 1] - prefix[j] + MOD) % MOD)
    }
    frames.push({ phase: 'prefix', activeLine: L('build prefix sums'), dp: [...dp], prefix: prefix.slice(1), i, c, message: `Prefix sums of dp let us add ranges in O(1).` })
    dp = next
    frames.push({ phase: c === 'I' ? 'increase' : 'decrease', activeLine: c === 'I' ? L('set dp[j] to prefix[j]') : L('set dp[j] to the sum of old dp[j]'), dp: [...dp], i, c,
      message: c === 'I'
        ? `s[${i}] = I: the new last element must exceed the previous one. New rank j can follow any old rank below j, so dp[j] = sum of old dp[0..j-1].`
        : `s[${i}] = D: the new last element must be below the previous one. New rank j can follow any old rank at least j, so dp[j] = sum of old dp[j..${i}].` })
  }
  const result = dp.reduce((a, b) => (a + b) % MOD, 0)
  frames.push({ phase: 'done', activeLine: L('return the sum of dp'), dp: [...dp], i: s.length - 1, message: `Sum of all ranks of the last element: ${result} valid permutations.` })
  return { input: s, result, frames }
}
export const code = `Let n be the length of s, and start with dp = [1], the single arrangement of one element
for each index i and character c in s
  build prefix sums, where prefix[j] is the sum of dp[0] through dp[j - 1]
  if c is I
    set dp[j] to prefix[j] for every j from 0 to i + 1
  else
    set dp[j] to the sum of old dp[j] through dp[i] for every j from 0 to i + 1
return the sum of dp, modulo 1000000007`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def num_perms_di_sequence(s):
    MOD = 10**9 + 7
    dp = [1]
    for i, c in enumerate(s):
        prefix = [0]
        for v in dp:
            prefix.append((prefix[-1] + v) % MOD)
        if c == 'I':
            dp = [prefix[j] for j in range(i + 2)]
        else:
            dp = [(prefix[i + 1] - prefix[j]) % MOD for j in range(i + 2)]
    return sum(dp) % MOD`
