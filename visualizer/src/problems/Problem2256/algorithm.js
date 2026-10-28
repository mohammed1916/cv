export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || !Array.isArray(input.nums) || input.nums.length < 1 || input.nums.length > 12) throw new Error('Use an object with nums: an array of 1 to 12 integers.')
  if (input.nums.some(v => !Number.isInteger(v) || v < 0 || v > 20)) throw new Error('Each nums entry is an integer from 0 to 20.')
  return { nums: input.nums }
}

export function buildTrace(input) {
  const nums = input.nums
  const n = nums.length
  const total = nums.reduce((sum, value) => sum + value, 0)
  let left = 0
  let best = null
  let bestIndex = 0
  const frames = [{ phase: 'start', activeLine: L('set total to the sum'), index: -1, left: 0, leftAvg: null, rightAvg: null, diff: null, best: null, bestIndex: 0, message: `Total ${total}. Each split compares two floored averages.` }]
  for (let i = 0; i < n; i++) {
    left += nums[i]
    const leftAvg = Math.floor(left / (i + 1))
    const rightCount = n - i - 1
    const rightAvg = rightCount === 0 ? 0 : Math.floor((total - left) / rightCount)
    const diff = Math.abs(leftAvg - rightAvg)
    if (best === null || diff < best) {
      best = diff
      bestIndex = i
    }
    frames.push({ phase: 'scan', activeLine: L('if best is nothing or diff'), index: i, left, leftAvg, rightAvg, diff, best, bestIndex, message: `Split after index ${i}: left average ${leftAvg}, right average ${rightAvg}, difference ${diff}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return best_index'), index: -1, left: total, leftAvg: null, rightAvg: null, diff: null, best, bestIndex, message: `Smallest difference ${best} is at index ${bestIndex}.` })
  return { input, result: bestIndex, frames }
}

export const code = `index with the minimum average difference
  set total to the sum of all numbers
  set left to 0, best to nothing, and best_index to 0
  for each index i from 0 to n minus 1 do
    add nums[i] to left
    set left_avg to left divided by i plus 1, rounded down
    set right_count to n minus i minus 1
    if right_count is 0 then right_avg is 0
    otherwise right_avg is total minus left, divided by right_count, rounded down
    set diff to the absolute difference of left_avg and right_avg
    if best is nothing or diff is smaller than best then update best and best_index
  return best_index`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def minimum_average_difference(nums):
    n = len(nums)
    total = sum(nums)
    left = 0
    best = None
    best_index = 0
    for i, value in enumerate(nums):
        left += value
        left_avg = left // (i + 1)
        right_count = n - i - 1
        right_avg = 0 if right_count == 0 else (total - left) // right_count
        diff = abs(left_avg - right_avg)
        if best is None or diff < best:
            best = diff
            best_index = i
    return best_index
`
