export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || !Array.isArray(data.nums) || !Number.isInteger(data.target)) throw new Error('Use an object with an integer array nums and an integer target, for example {"nums":[-1,1,2,3,1],"target":3}.')
  if (data.nums.length < 1 || data.nums.length > 30) throw new Error('nums must have 1 to 30 values.')
  if (data.nums.some(v => !Number.isInteger(v) || v < -50 || v > 50)) throw new Error('Each value in nums must be an integer from -50 to 50.')
  if (data.target < -100 || data.target > 100) throw new Error('target must be an integer from -100 to 100.')
  return { nums: [...data.nums], target: data.target }
}

export function buildTrace({ nums, target }) {
  const frames = []
  const sorted = [...nums].sort((a, b) => a - b)
  let count = 0
  let left = 0
  let right = sorted.length - 1
  frames.push({ phase: 'sort', pythonLine: 2, activeLine: L('sort nums'), left: -1, right: -1, count, sorted, message: `Sort the values to ${sorted.join(', ')}. The pair order does not matter for counting.` })
  frames.push({ phase: 'start', pythonLine: 5, activeLine: L('set left to the first index'), left, right, count, sorted, message: `Put one pointer on the smallest value and one on the largest.` })
  while (left < right) {
    const sum = sorted[left] + sorted[right]
    if (sum < target) {
      const added = right - left
      count += added
      frames.push({ phase: 'count', pythonLine: 8, activeLine: L('add right minus left'), left, right, count, sorted, message: `${sorted[left]} + ${sorted[right]} = ${sum} is below ${target}, so all ${added} indices from left+1 to right pair with ${sorted[left]}. Count is ${count}.` })
      left += 1
      frames.push({ phase: 'move', pythonLine: 9, activeLine: L('move left one step'), left, right, count, sorted, message: `Move the left pointer right.` })
    } else {
      frames.push({ phase: 'skip', pythonLine: 11, activeLine: L('move right one step'), left, right, count, sorted, message: `${sorted[left]} + ${sorted[right]} = ${sum} is not below ${target}, so the right value is too large for any remaining left value. Move right left.` })
      right -= 1
    }
  }
  frames.push({ phase: 'done', pythonLine: 12, activeLine: L('return count'), left: -1, right: -1, count, sorted, message: `All pairs are counted. Answer: ${count}.` })
  return { input: { nums, target }, result: count, frames }
}

export const code = `count pairs whose sum is less than target (nums, target)
  sort nums in increasing order
  set count to 0
  set left to the first index and right to the last index
  while left is less than right
    if nums at left plus nums at right is less than target then
      add right minus left to count
      move left one step to the right
    otherwise
      move right one step to the left
  return count`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1
export const python = `def count_pairs(nums, target):
    values = sorted(nums)
    count = 0
    left = 0
    right = len(values) - 1
    while left < right:
        if values[left] + values[right] < target:
            count += right - left
            left += 1
        else:
            right -= 1
    return count
`
