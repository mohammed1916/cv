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
  const frames = [{ phase: 'start', j: null, starts: null, total: null, activeLine: 2, message: `Precompute the best window to the left and right of each position (windows of length ${k}).` }]
  let bestTotal = -1, bestStarts = null
  for (let j = k; j <= n - 2 * k; j++) {
    const a = left[j - 1], c = right[j + k]
    const total = at(a) + at(j) + at(c)
    if (total > bestTotal) { bestTotal = total; bestStarts = [a, j, c] }
    frames.push({ phase: 'middle', j, starts: [a, j, c], total, best: bestStarts, activeLine: 7, message: `Middle window at ${j}: sums ${at(a)} + ${at(j)} + ${at(c)} = ${total}.` })
  }
  frames.push({ phase: 'done', j: null, starts: bestStarts, total: bestTotal, result: bestStarts, activeLine: 10, message: `Best starts: [${bestStarts.join(', ')}] with total ${bestTotal}.` })
  return { input: { nums, k }, result: bestStarts, frames }
}

export const code = `def maxSumOfThreeSubarrays(nums, k):
    # left[i] / right[i]: start of the best length-k window in nums[:i+1] / nums[i:]
    ...
    best = None
    for j in range(k, n - 2 * k + 1):
        a, c = left[j - 1], right[j + k]
        total = S(a) + S(j) + S(c)
        if best is None or total > best[0]: best = (total, [a, j, c])
    return best[1]`.split('\n').map((text, index) => ({ line: index + 1, text }))
