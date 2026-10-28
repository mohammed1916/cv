export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || !Array.isArray(data.nums) || data.nums.length < 2 || data.nums.length > 30) throw new Error('Use an array nums of 2 to 30 integers.')
  if (data.nums.some(v => !Number.isInteger(v) || v < 1 || v > 1000)) throw new Error('Values are integers from 1 to 1000.')
  const n = data.nums.length
  const total = new Map()
  for (const x of data.nums) total.set(x, (total.get(x) || 0) + 1)
  if (![...total.values()].some(c => 2 * c > n)) throw new Error('nums must have a dominant value that appears more than half the time.')
  return { nums: data.nums }
}

export function buildTrace({ nums }) {
  const n = nums.length
  const total = new Map()
  for (const x of nums) total.set(x, (total.get(x) || 0) + 1)
  const dominant = [...total].find(([, c]) => 2 * c > n)[0]
  const dominantTotal = total.get(dominant)
  const base = { dominant, dominantTotal, total: dominantTotal }
  const frames = [{ phase: 'count', activeLine: L('count how many times'), ...base, index: -1, left: 0, right: dominantTotal, found: false, message: `The whole array has dominant value ${dominant}, which appears ${dominantTotal} times.` }]
  let left = 0
  for (let i = 0; i < n - 1; i++) {
    if (nums[i] === dominant) left++
    const right = dominantTotal - left
    const valid = 2 * left > i + 1 && 2 * right > n - i - 1
    frames.push({ phase: 'scan', activeLine: L('if the left part'), ...base, index: i, left, right, found: valid, message: `Split after index ${i}: ${dominant} is ${left} of ${i + 1} on the left and ${right} of ${n - i - 1} on the right.${valid ? ' Both sides keep a majority.' : ''}` })
    if (valid) {
      frames.push({ phase: 'found', activeLine: L('return i'), ...base, index: i, left, right, found: true, result: i, message: `Split ${i} is valid and is the first one.` })
      return { input: { nums }, result: i, frames }
    }
  }
  frames.push({ phase: 'done', activeLine: L('return minus one'), ...base, index: -1, left, right: dominantTotal - left, found: false, result: -1, message: 'No split keeps the dominant value a majority on both sides.' })
  return { input: { nums }, result: -1, frames }
}

export const code = `minimum index of a valid split
  count how many times each value appears in nums and find the dominant value
  set left to zero, the count of dominant values in the prefix
  for each index i from 0 to n minus 2
    add one to left if nums at i is the dominant value
    right is the dominant total minus left
    if the left part and the right part both have the dominant value more than half then
      return i
  return minus one`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def minimum_index_of_valid_split(nums):
    n = len(nums)
    total = {}
    for x in nums:
        total[x] = total.get(x, 0) + 1
    dominant = None
    for x in total:
        if 2 * total[x] > n:
            dominant = x
    dominant_total = total[dominant]
    left = 0
    for i in range(n - 1):
        if nums[i] == dominant:
            left += 1
        right = dominant_total - left
        if 2 * left > i + 1 and 2 * right > n - i - 1:
            return i
    return -1
`
