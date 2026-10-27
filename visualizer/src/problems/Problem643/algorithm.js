export function parseInput(text) {
  const data = JSON.parse(text)
  const { nums, k } = data ?? {}
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 20000 || nums.some(v => !Number.isInteger(v) || Math.abs(v) > 10000)) throw new Error('nums must be 1–20,000 integers with |v| ≤ 10,000.')
  if (!Number.isInteger(k) || k < 1 || k > nums.length) throw new Error('k must be an integer from 1 to the length of nums.')
  return { nums, k }
}

export function buildTrace({ nums, k }) {
  let sum = 0
  for (let i = 0; i < k; i++) sum += nums[i]
  let best = sum, bestStart = 0
  const frames = [{ phase: 'start', start: 0, end: k - 1, sum, best: sum / k, activeLine: 3, message: `First window of ${k}: sum ${sum}.` }]
  for (let end = k; end < nums.length; end++) {
    sum += nums[end] - nums[end - k]
    const start = end - k + 1
    if (sum > best) { best = sum; bestStart = start }
    frames.push({ phase: 'slide', start, end, sum, best: best / k, activeLine: 6, message: `Slide to [${start}, ${end}]: add ${nums[end]}, drop ${nums[end - k]}; sum ${sum}.` })
  }
  const result = best / k
  frames.push({ phase: 'done', start: bestStart, end: bestStart + k - 1, sum: best, best: result, result, activeLine: 8, message: `Maximum average ${result}.` })
  return { input: { nums, k }, result, frames }
}

export const code = `set window sum to 0 and best to negative infinity
for each index i and value in nums
  add value to the window sum
  if i is at least k, subtract nums[i - k] from the window sum
  if i is at least k - 1, keep the larger of best and the window sum
return best divided by k`.split('\n').map((text, index) => ({ line: index + 1, text }))

// The sequence-family trace reports activeLine 1 (setup), 4 (update per index), 5 (return).
// Before the first full window, the update frame describes the partial window (line 3).
export const LINE_MAP = { 1: 1, 4: 5, 5: 6 }

export function familyLine(frame) {
  if (frame.phase === 'update' && frame.metrics?.best === 'no full window') return 3
  return LINE_MAP[frame.activeLine] ?? frame.activeLine
}

export const python = `def find_max_average(nums, k):
    window_sum = 0
    best = float('-inf')
    for i, value in enumerate(nums):
        window_sum += value
        if i >= k:
            window_sum -= nums[i - k]
        if i >= k - 1:
            best = max(best, window_sum)
    return best / k`
