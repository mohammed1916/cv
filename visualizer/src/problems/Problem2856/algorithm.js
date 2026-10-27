export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || !Array.isArray(data.nums)) throw new Error('Use an object with a sorted array nums, for example {"nums":[1,1,2,2,3,3]}.')
  if (data.nums.length < 1 || data.nums.length > 30) throw new Error('nums must have 1 to 30 values.')
  if (data.nums.some(v => !Number.isInteger(v) || v < 0 || v > 20)) throw new Error('Each value in nums must be an integer from 0 to 20.')
  if (data.nums.some((v, i) => i > 0 && v < data.nums[i - 1])) throw new Error('nums must be sorted in non-decreasing order.')
  return { nums: [...data.nums] }
}

export function buildTrace({ nums }) {
  const frames = []
  const counts = new Map()
  frames.push({ phase: 'start', activeLine: L('set counts to an empty tally'), value: null, counts: {}, most: 0, result: null, message: 'Pairs must have a smaller value on the left and a larger value on the right, so repeated values are the obstacle.' })
  for (const value of nums) {
    counts.set(value, (counts.get(value) || 0) + 1)
  }
  for (const [value, count] of counts) {
    frames.push({ phase: 'count', activeLine: L('add one to its count'), value, counts: Object.fromEntries(counts), most: Math.max(...counts.values()), result: null, message: `${value} appears ${count} time${count === 1 ? '' : 's'}.` })
  }
  const most = Math.max(...counts.values())
  if (most * 2 > nums.length) {
    const result = most * 2 - nums.length
    frames.push({ phase: 'excess', activeLine: L('return most times 2 minus'), value: null, counts: Object.fromEntries(counts), most, result, message: `${most} copies of one value outnumber the rest, so ${result} cannot be paired.` })
    return { input: { nums }, result, frames }
  }
  const result = nums.length % 2
  frames.push({ phase: 'balanced', activeLine: L('return the length modulo 2'), value: null, counts: Object.fromEntries(counts), most, result, message: `No value fills more than half, so only the parity of ${nums.length} remains.` })
  return { input: { nums }, result, frames }
}

export const code = `minimum array length after pair removals (nums)
  set counts to an empty tally
  for each value in nums
    add one to its count in counts
  set most to the largest count
  if most times 2 is more than the length of nums then
    return most times 2 minus the length of nums
  return the length modulo 2`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1
export const python = `def min_length_after_removals(nums):
    counts = {}
    for value in nums:
        counts[value] = counts.get(value, 0) + 1
    most = max(counts.values())
    if most * 2 > len(nums):
        return most * 2 - len(nums)
    return len(nums) % 2
`
