export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || !Array.isArray(data.nums) || !Number.isInteger(data.k)) throw new Error('Use an object with an array nums and an integer k, for example {"nums":[1,2,3],"k":2}.')
  const n = data.nums.length
  if (n < 1 || n > 12) throw new Error('nums must have 1 to 12 entries.')
  if (!data.nums.every(v => Number.isInteger(v) && v >= -50 && v <= 50)) throw new Error('Values must be integers from -50 to 50.')
  if (data.k < 1 || data.k > n) throw new Error('k must be from 1 to the length of nums.')
  return { nums: data.nums, k: data.k }
}

export function buildTrace(input) {
  const { nums, k } = input
  const n = nums.length
  let total = 0
  const frames = [{ phase: 'start', activeLine: L('set total to 0'), start: -1, end: -1, total, result: null, message: `Sum the largest plus smallest value over every subarray of length at most ${k}.` }]
  for (let i = 0; i < n; i++) {
    let low = nums[i]
    let high = nums[i]
    for (let j = i; j < Math.min(n, i + k); j++) {
      low = Math.min(low, nums[j])
      high = Math.max(high, nums[j])
      total += low + high
      frames.push({ phase: 'extend', activeLine: L('add low plus high to total'), start: i, end: j, total, result: null, message: `Subarray [${i}..${j}] has minimum ${low} and maximum ${high}. Running total: ${total}.` })
    }
  }
  frames.push({ phase: 'done', activeLine: L('return total'), start: -1, end: -1, total, result: total, message: `The sum over all subarrays is ${total}.` })
  return { input, result: total, frames }
}

export const code = `sum of minimum plus maximum over subarrays of length at most k (nums, k)
  set total to 0
  for each start index i
    set low and high to nums[i]
    for each end index j from i up to i plus k minus 1, while j is inside nums
      set low to the smaller of low and nums[j]
      set high to the larger of high and nums[j]
      add low plus high to total
  return total`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def min_max_sum(nums, k):
    total = 0
    n = len(nums)
    for i in range(n):
        low = high = nums[i]
        for j in range(i, min(n, i + k)):
            low = min(low, nums[j])
            high = max(high, nums[j])
            total += low + high
    return total
`
