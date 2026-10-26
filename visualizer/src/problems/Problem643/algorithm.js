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

export const code = `def findMaxAverage(nums, k):
    total = sum(nums[:k])
    best = total
    for i in range(k, len(nums)):
        total += nums[i] - nums[i - k]
        best = max(best, total)
    return best / k`.split('\n').map((text, index) => ({ line: index + 1, text }))
