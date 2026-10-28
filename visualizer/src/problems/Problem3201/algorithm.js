const MAX_LENGTH = 12

export function parseInput(text) {
  const nums = JSON.parse(text)
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > MAX_LENGTH) throw new Error(`Use an array of 1 to ${MAX_LENGTH} integers.`)
  if (nums.some(v => !Number.isInteger(v) || v < 1 || v > 9)) throw new Error('Values are integers from 1 to 9.')
  return nums
}

export const code = `longest valid subsequence, where every neighbouring pair has the same sum parity
  set evens to the count of even values and odds to the count of odd values
  set runs to 1
  for each index i from 1 to n minus 1
    if nums[i] and nums[i-1] have different parity then
      add one to runs
  return the largest of evens, odds, and runs`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export function buildTrace(nums) {
  const evens = nums.filter(v => v % 2 === 0).length
  const odds = nums.length - evens
  let runs = 1
  const frames = [{ phase: 'start', index: -1, evens, odds, runs, activeLine: L('set evens to'), message: `There are ${evens} even and ${odds} odd values.` }]
  for (let i = 1; i < nums.length; i++) {
    if (nums[i] % 2 !== nums[i - 1] % 2) {
      runs += 1
      frames.push({ phase: 'switch', index: i, evens, odds, runs, activeLine: L('add one to runs'), message: `${nums[i - 1]} and ${nums[i]} have different parity: runs is ${runs}.` })
    } else {
      frames.push({ phase: 'same', index: i, evens, odds, runs, activeLine: L('if nums[i] and nums[i-1]'), message: `${nums[i - 1]} and ${nums[i]} share parity, so the alternating run does not grow.` })
    }
  }
  const result = Math.max(evens, odds, runs)
  frames.push({ phase: 'done', index: nums.length - 1, evens, odds, runs, activeLine: L('return the largest of'), message: `Best of ${evens} evens, ${odds} odds, and ${runs} alternating runs: ${result}.` })
  return { input: nums, result, frames }
}

export const python = `def maximum_length_valid_subsequence_i(nums):
    evens = sum(1 for v in nums if v % 2 == 0)
    odds = len(nums) - evens
    runs = 1
    for i in range(1, len(nums)):
        if nums[i] % 2 != nums[i - 1] % 2:
            runs += 1
    return max(evens, odds, runs)
`
