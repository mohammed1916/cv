const MOD = 1000000007
export function parseInput(text) {
  const s = JSON.parse(text)
  if (typeof s !== 'string' || !s.length || s.length > 100 || /[^DI]/.test(s)) throw new Error('Enter a JSON string of 1-100 characters, each "D" or "I" (capped at 100 for visualization).')
  return s
}
export function buildTrace(s) {
  let dp = [1]
  const frames = [{ phase: 'start', activeLine: 4, dp: [...dp], i: -1, message: 'With one element there is exactly one arrangement; dp[j] counts arrangements whose last element has rank j among those placed.' }]
  for (let i = 0; i < s.length; i++) {
    const c = s[i]
    const prefix = [0]
    for (const v of dp) prefix.push((prefix[prefix.length - 1] + v) % MOD)
    const next = []
    for (let j = 0; j <= i + 1; j++) {
      next.push(c === 'I' ? prefix[j] : (prefix[i + 1] - prefix[j] + MOD) % MOD)
    }
    frames.push({ phase: 'prefix', activeLine: 7, dp: [...dp], prefix: prefix.slice(1), i, c, message: `Prefix sums of dp let us add ranges in O(1).` })
    dp = next
    frames.push({ phase: c === 'I' ? 'increase' : 'decrease', activeLine: c === 'I' ? 9 : 11, dp: [...dp], i, c,
      message: c === 'I'
        ? `s[${i}] = I: the new last element must exceed the previous one. New rank j can follow any old rank below j, so dp[j] = sum of old dp[0..j-1].`
        : `s[${i}] = D: the new last element must be below the previous one. New rank j can follow any old rank at least j, so dp[j] = sum of old dp[j..${i}].` })
  }
  const result = dp.reduce((a, b) => (a + b) % MOD, 0)
  frames.push({ phase: 'done', activeLine: 12, dp: [...dp], i: s.length - 1, message: `Sum of all ranks of the last element: ${result} valid permutations.` })
  return { input: s, result, frames }
}
export const code = `def numPermsDISequence(s):
    MOD = 10**9 + 7
    n = len(s)
    dp = [1]
    for i, c in enumerate(s):
        prefix = [0]
        for v in dp:
            prefix.append((prefix[-1] + v) % MOD)
        if c == 'I':
            dp = [prefix[j] for j in range(i + 2)]
        else:
            dp = [(prefix[i + 1] - prefix[j]) % MOD for j in range(i + 2)]
    return sum(dp) % MOD`.split('\n').map((text, index) => ({ line: index + 1, text }))
