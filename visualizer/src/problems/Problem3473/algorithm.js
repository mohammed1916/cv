export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use a JSON object with nums, k and m.')
  const { nums, k, m } = input
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 12) throw new Error('nums must be an array of 1 to 12 integers.')
  if (nums.some(v => !Number.isInteger(v) || v < -10000 || v > 10000)) throw new Error('Each nums value is an integer from -10000 to 10000.')
  if (!Number.isInteger(m) || m < 1 || m > 3) throw new Error('m must be an integer from 1 to 3.')
  if (!Number.isInteger(k) || k < 1 || k > Math.floor(nums.length / m)) throw new Error('k must be an integer from 1 to floor(length / m).')
  return { nums, k, m }
}

export function buildTrace(input) {
  const { nums, k, m } = input
  const n = nums.length
  const pre = [0]
  for (const v of nums) pre.push(pre[pre.length - 1] + v)
  // best[j][i]: the best total using j subarrays inside the first i elements; null when impossible.
  const best = Array.from({ length: k + 1 }, () => Array(n + 1).fill(null))
  for (let i = 0; i <= n; i++) best[0][i] = 0
  const frames = [{ phase: 'start', activeLine: L('set best[0][i] to 0'), j: 0, i: 0, value: 0, table: best, message: 'With zero subarrays every prefix totals 0.' }]
  for (let j = 1; j <= k; j++) {
    best[j][0] = null
    frames.push({ phase: 'row', activeLine: L('set best[j][0]'), j, i: 0, value: null, table: best, message: `Row ${j}: with no elements no subarray fits.` })
    for (let i = 1; i <= n; i++) {
      let value = best[j][i - 1]
      for (let s = 0; s <= i - m; s++) {
        if (best[j - 1][s] === null) continue
        value = Math.max(value ?? -Infinity, best[j - 1][s] + pre[i] - pre[s])
      }
      best[j][i] = value
      frames.push({ phase: 'cell', activeLine: L('best[j][i] = max'), j, i, value, table: best, message: `Best with ${j} subarray(s) in the first ${i} elements is ${value === null ? 'impossible' : value}.` })
    }
  }
  const result = best[k][n]
  frames.push({ phase: 'done', activeLine: L('return best[k][n]'), j: k, i: n, value: result, table: best, message: `Maximum total: ${result}.` })
  return { input, result, frames }
}

export const code = `max total of k non-overlapping subarrays, each at least m long:
  pre = running prefix sums of nums
  set best[0][i] to 0 for every i
  for j from 1 to k:
    set best[j][0] to unset
    for i from 1 to n:
      best[j][i] = best[j][i-1]
      for each start s from 0 to i - m:
        if best[j-1][s] is set then
          best[j][i] = max(best[j][i], best[j-1][s] + pre[i] - pre[s])
  return best[k][n]`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def sum_of_k_subarrays(nums, k, m):
    n = len(nums)
    pre = [0]
    for v in nums:
        pre.append(pre[-1] + v)
    NEG = None
    best = [[NEG] * (n + 1) for _ in range(k + 1)]
    for i in range(n + 1):
        best[0][i] = 0
    for j in range(1, k + 1):
        best[j][0] = NEG
        for i in range(1, n + 1):
            value = best[j][i - 1]
            for s in range(0, i - m + 1):
                if best[j - 1][s] is None:
                    continue
                cand = best[j - 1][s] + pre[i] - pre[s]
                if value is None or cand > value:
                    value = cand
            best[j][i] = value
    return best[k][n]
`
