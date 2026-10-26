export function parseInput(text) {
  const n = JSON.parse(text)
  if (!Number.isInteger(n) || n < 1 || n > 10000000) throw new Error('Enter one integer n from 1 to 10,000,000 (visualization cap; LeetCode allows 10^9).')
  return n
}
export function buildTrace(n) {
  let count = 0
  const hits = []
  const frames = [{ phase: 'start', k: 0, count: 0, activeLine: 2, message: `A run of k consecutive numbers starting at a sums to k*a + k(k-1)/2 = ${n}. Try each length k while the smallest possible run 1+...+k fits.` }]
  for (let k = 1; k * (k + 1) / 2 <= n; k++) {
    const rest = n - k * (k - 1) / 2
    if (rest % k === 0) {
      count++
      const a = rest / k
      hits.push({ k, a })
      frames.push({ phase: 'hit', k, rest, start: a, count, activeLine: 6, message: `k = ${k}: ${n} - ${k * (k - 1) / 2} = ${rest} divides by ${k}, so start a = ${a}: ${a}..${a + k - 1}. Count ${count}.` })
    } else {
      frames.push({ phase: 'miss', k, rest, count, activeLine: 5, message: `k = ${k}: ${n} - ${k * (k - 1) / 2} = ${rest} is not divisible by ${k}; no run of this length.` })
    }
  }
  frames.push({ phase: 'done', k: hits.length ? hits[hits.length - 1].k : 0, count, activeLine: 8, message: `${n} can be written as a sum of consecutive positive integers in ${count} way(s).` })
  return { input: n, hits, result: count, frames }
}
export const code = `def consecutiveNumbersSum(n):
    count = 0
    k = 1
    while k * (k + 1) // 2 <= n:
        if (n - k * (k - 1) // 2) % k == 0:
            count += 1
        k += 1
    return count`.split('\n').map((text, index) => ({ line: index + 1, text }))
