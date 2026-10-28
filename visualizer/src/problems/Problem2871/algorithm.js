export function parseInput(text) {
  const nums = JSON.parse(text)
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 14) throw new Error('Use an array of 1 to 14 integers.')
  if (nums.some(v => !Number.isInteger(v) || v < 0 || v > 63)) throw new Error('Values are integers from 0 to 63.')
  return nums
}

export function buildTrace(nums) {
  let total = -1
  for (const v of nums) total &= v
  const frames = [{ phase: 'whole', activeLine: L('set total to the AND'), index: -1, running: null, count: 0, message: `The AND of every value is ${total}.` }]
  if (total !== 0) {
    frames.push({ phase: 'done', activeLine: L('return 1'), index: -1, running: null, count: 1, message: 'The whole array has a nonzero AND, so one subarray is best.' })
    return { input: nums, result: 1, frames }
  }
  let running = -1
  let count = 0
  for (let i = 0; i < nums.length; i++) {
    running &= nums[i]
    frames.push({ phase: 'scan', activeLine: L('set running to running AND value'), index: i, running, count, message: `Add ${nums[i]} to the current segment. Its AND is now ${running}.` })
    if (running === 0) {
      count++
      frames.push({ phase: 'cut', activeLine: L('increase count by 1'), index: i, running, count, message: `The segment ends at position ${i} with AND 0. Count is ${count}; start a new segment.` })
      running = -1
    }
  }
  frames.push({ phase: 'done', activeLine: L('return count'), index: -1, running, count, message: `Maximum number of subarrays: ${count}.` })
  return { input: nums, result: count, frames }
}

export const code = `maximum number of subarrays with the smallest total score:
  set total to the AND of every value
  if total is not zero then
    return 1
  set running to all ones and count to 0
  for each value in nums do
    set running to running AND value
    if running is zero then
      increase count by 1 and reset running to all ones
  return count`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `from functools import reduce

def max_subarrays(nums):
    total = reduce(lambda a, b: a & b, nums)
    if total != 0:
        return 1
    running = -1
    count = 0
    for value in nums:
        running &= value
        if running == 0:
            count += 1
            running = -1
    return count
`
