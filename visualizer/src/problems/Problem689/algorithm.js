export function parseInput(text) {
  const data = JSON.parse(text)
  const { nums, k } = data ?? {}
  if (!Array.isArray(nums) || nums.length < 3 || nums.length > 60 || nums.some(v => !Number.isInteger(v) || v < 0 || v > 65535)) throw new Error('nums must be 3–60 integers from 0 to 65,535.')
  if (!Number.isInteger(k) || k < 1 || 3 * k > nums.length) throw new Error('k must satisfy 1 ≤ k and 3k ≤ length of nums.')
  return { nums, k }
}

// Best window sums: left[i] = best window starting at or before i; right[i] = best starting at or after i.
// The middle window's start j is chosen to maximize left + mid + right, with ties to the smaller index.
export function buildTrace({ nums, k }) {
  const n = nums.length
  const sum = Array(n + 1).fill(0)
  for (let i = 0; i < n; i++) sum[i + 1] = sum[i] + nums[i]
  const at = i => sum[i + k] - sum[i]
  const left = Array(n).fill(0), right = Array(n).fill(0)
  for (let i = k - 1, best = -1, idx = 0; i < n; i++) {
    const cur = at(i - k + 1)
    if (cur > best) { best = cur; idx = i - k + 1 }
    left[i] = idx
  }
  for (let i = n - k, best = -1, idx = 0; i >= 0; i--) {
    const cur = at(i)
    if (cur >= best) { best = cur; idx = i }
    right[i] = idx
  }
  const frames = [{ phase: 'start', pythonLine: 10, j: null, starts: null, total: null, activeLine: L('precompute left'), message: `Precompute the best window to the left and right of each position (windows of length ${k}).` }]
  let bestTotal = -1, bestStarts = null
  for (let j = k; j <= n - 2 * k; j++) {
    const a = left[j - 1], c = right[j + k]
    const total = at(a) + at(j) + at(c)
    if (total > bestTotal) { bestTotal = total; bestStarts = [a, j, c] }
    frames.push({ phase: 'middle', pythonLine: 29, j, starts: [a, j, c], total, best: bestStarts, activeLine: L('if best is nothing'), message: `Middle window at ${j}: sums ${at(a)} + ${at(j)} + ${at(c)} = ${total}.` })
  }
  frames.push({ phase: 'done', pythonLine: 31, j: null, starts: bestStarts, total: bestTotal, result: bestStarts, activeLine: L('return the kept starts'), message: `Best starts: [${bestStarts.join(', ')}] with total ${bestTotal}.` })
  return { input: { nums, k }, result: bestStarts, frames }
}

export const code = `build prefix sums so any window sum takes constant time
precompute left, where left[i] is the best window start at or before i
precompute right, where right[i] is the best window start at or after i
best = nothing
for each middle start j from k to n - 2k
  a = left[j - 1], c = right[j + k]
  total = the sum of the windows at a, j and c
  if best is nothing or total is larger than best, keep a, j, c as the best
return the kept starts`.split('\n').map((text, index) => ({ line: index + 1, text }))

const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def max_sum_of_three_subarrays(nums, k):
    n = len(nums)
    prefix = [0]
    for x in nums:
        prefix.append(prefix[-1] + x)

    def window(s):
        return prefix[s + k] - prefix[s]

    left = [0] * n
    best_start = 0
    for i in range(k - 1, n):
        start = i - k + 1
        if window(start) > window(best_start):
            best_start = start
        left[i] = best_start

    right = [0] * n
    best_start = n - k
    for i in range(n - k, -1, -1):
        if window(i) >= window(best_start):
            best_start = i
        right[i] = best_start

    best = None
    for j in range(k, n - 2 * k + 1):
        a, c = left[j - 1], right[j + k]
        total = window(a) + window(j) + window(c)
        if best is None or total > best[0]:
            best = (total, [a, j, c])
    return best[1]
`