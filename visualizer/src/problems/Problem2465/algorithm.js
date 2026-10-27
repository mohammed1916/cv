export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || !Array.isArray(data.nums)) throw new Error('Use an object with an array nums, for example {"nums":[4,1,4,0,3,5]}.')
  if (data.nums.length < 2 || data.nums.length > 30 || data.nums.length % 2 !== 0) throw new Error('nums must have an even number of values from 2 to 30.')
  if (data.nums.some(v => !Number.isInteger(v) || v < 0 || v > 100)) throw new Error('Each value in nums must be an integer from 0 to 100.')
  return { nums: [...data.nums] }
}

export function buildTrace({ nums }) {
  const frames = []
  const values = [...nums].sort((a, b) => a - b)
  const seen = new Set()
  let left = 0
  let right = values.length - 1
  frames.push({ phase: 'sort', activeLine: L('sort nums'), left: -1, right: -1, values, seen: [], message: `Sort the values to ${values.join(', ')}.` })
  while (left < right) {
    const sum = values[left] + values[right]
    seen.add(sum)
    frames.push({ phase: 'pair', activeLine: L('add the pair sum'), left, right, values, seen: [...seen].map(s => s / 2), message: `Pair ${values[left]} with ${values[right]}. Their average is ${sum / 2}.` })
    left += 1
    right -= 1
  }
  frames.push({ phase: 'done', activeLine: L('return the size'), left: -1, right: -1, values, seen: [...seen].map(s => s / 2), message: `${seen.size} distinct averages were found.` })
  return { input: { nums }, result: seen.size, frames }
}

export const code = `number of distinct averages (nums)
  sort nums in increasing order
  set seen to an empty set
  set left to the first index and right to the last index
  while left is less than right
    add the pair sum of nums at left and right to seen, since equal sums give equal averages
    move left one step right and right one step left
  return the size of seen`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1
export const python = `def distinct_averages(nums):
    values = sorted(nums)
    seen = set()
    left = 0
    right = len(values) - 1
    while left < right:
        seen.add(values[left] + values[right])
        left += 1
        right -= 1
    return len(seen)
`
