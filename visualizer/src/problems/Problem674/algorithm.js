export function parseInput(text) {
  const nums = JSON.parse(text)
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 10000 || nums.some(v => !Number.isInteger(v) || Math.abs(v) > 1000000000)) throw new Error('Enter a JSON array of 1–10,000 integers with |v| ≤ 1,000,000,000.')
  return nums
}

export function buildTrace(nums) {
  let best = 1, run = 1, bestEnd = 0
  const frames = [{ phase: 'start', index: 0, run, best, activeLine: 2, message: 'A single element is a run of length 1.' }]
  for (let i = 1; i < nums.length; i++) {
    if (nums[i] > nums[i - 1]) run++
    else run = 1
    if (run > best) { best = run; bestEnd = i }
    frames.push({ phase: nums[i] > nums[i - 1] ? 'grow' : 'reset', index: i, run, best, activeLine: nums[i] > nums[i - 1] ? 5 : 7,
      message: nums[i] > nums[i - 1] ? `${nums[i - 1]} < ${nums[i]}: the run grows to ${run}.` : `${nums[i]} ≤ ${nums[i - 1]}: the run restarts at 1.` })
  }
  frames.push({ phase: 'done', index: nums.length - 1, run, best, result: best, activeLine: 10, message: `Longest continuous increasing subsequence: ${best}, ending at index ${bestEnd}.` })
  return { input: nums, result: best, frames }
}

export const code = `set run to 0 and best to 0
for each index i and value in nums
  compare value with the immediately previous value
  if i > 0 and value is strictly greater, extend run by one; otherwise restart run at one
  set best to the larger of best and run
return best`.split('\n').map((text, index) => ({ line: index + 1, text }))

// The sequence-family trace reports activeLine 1 (setup), 4 (per-index update), 5 (return).
export const LINE_MAP = { 1: 1, 4: 4, 5: 6 }

export function familyLine(frame) {
  return LINE_MAP[frame.activeLine] ?? frame.activeLine
}

export const python = `def find_length_of_lcis(nums):
    run = 0
    best = 0
    for i, value in enumerate(nums):
        if i > 0 and value > nums[i - 1]:
            run += 1
        else:
            run = 1
        best = max(best, run)
    return best`
