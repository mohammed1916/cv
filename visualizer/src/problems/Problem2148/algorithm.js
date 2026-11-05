// LeetCode 2148: Count Elements With Strictly Smaller and Greater Elements.
// An element counts only when it is strictly between the minimum and maximum. If every value is equal,
// nothing is strictly between them.

export function parseInput(text) {
  let nums
  try { nums = JSON.parse(text) } catch { throw new Error('Use a JSON array of integers, e.g. [11,7,2,15].') }
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 40 || nums.some(v => !Number.isInteger(v) || Math.abs(v) > 100000)) {
    throw new Error('Use 1 to 40 integers with absolute value up to 100000.')
  }
  return { nums }
}

export const code = `function countElements(nums) {
  const low = Math.min(...nums)
  const high = Math.max(...nums)
  let count = 0
  for (const value of nums) {
    if (value > low && value < high) count++
  }
  return count
}`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `# entry: count_elements
def count_elements(nums):
    low = min(nums)
    high = max(nums)
    count = 0
    for value in nums:
        if low < value < high:
            count += 1
    return count
`

const L = text => {
  const index = code.findIndex(line => line.text.includes(text))
  if (index < 0) throw new Error(`Missing pseudocode line: ${text}`)
  return index + 1
}
const P = text => {
  const index = python.split('\n').findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`Missing python line: ${text}`)
  return index + 1
}

export const phases = [
  { id: 'bounds', label: 'Bounds', description: 'Find the smallest and largest values.' },
  { id: 'check', label: 'Check value', description: 'A value counts only if it sits strictly between the bounds.' },
  { id: 'done', label: 'Result', description: 'How many values were counted.' },
]

export function buildTrace({ nums }) {
  const frames = []
  const low = Math.min(...nums)
  const high = Math.max(...nums)
  frames.push({ phase: 'bounds', activeLine: L('const low'), pythonLine: P('low = min'), message: `Smallest ${low}, largest ${high}.`, i: -1, low, high, count: 0, marks: Object.fromEntries(nums.map((v, i) => [i, v === low ? 'min' : v === high ? 'max' : ''])) })
  let count = 0
  nums.forEach((value, i) => {
    const counted = value > low && value < high
    if (counted) count++
    frames.push({ phase: 'check', activeLine: L('if (value > low'), pythonLine: P('if low < value'), message: counted ? `${value} is strictly between ${low} and ${high}: counted.` : `${value} is not strictly between the bounds.`, i, low, high, count, marks: Object.fromEntries(nums.map((v, k) => [k, v === low ? 'min' : v === high ? 'max' : ''])) })
  })
  frames.push({ phase: 'done', activeLine: L('return count'), pythonLine: P('return count'), message: `${count} element${count === 1 ? '' : 's'} strictly between the bounds.`, i: -1, low, high, count, marks: {} })
  return { input: { nums }, result: count, frames }
}
