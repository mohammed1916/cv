export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with nums.')
  const { nums } = input
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 12) throw new Error('nums has 1 to 12 integers.')
  if (!nums.every(v => Number.isInteger(v) && v >= 1 && v <= 5)) throw new Error('Each value is an integer from 1 to 5.')
  return { nums }
}

// One operation removes the first three elements. The answer is the number of operations needed
// so the remaining suffix has no repeats. Scanning from the right finds the first index where the
// suffix stops being distinct.
export function buildTrace({ nums }) {
  const frames = []
  const seen = new Set()
  let start = nums.length
  frames.push({ pythonLine: PY('seen = set()'), phase: 'start', activeLine: L('scan from the right'), index: -1, start, message: 'Scan from the right, growing a set of distinct values.' })
  for (let i = nums.length - 1; i >= 0; i--) {
    if (seen.has(nums[i])) {
      frames.push({ pythonLine: PY('if nums[i] in seen'), phase: 'repeat', activeLine: L('a repeat appears'), index: i, start, message: `${nums[i]} at index ${i} already appears later; stop.` })
      break
    }
    seen.add(nums[i])
    start = i
    frames.push({ pythonLine: PY('start = i'), phase: 'extend', activeLine: L('extend the distinct suffix'), index: i, start, message: `${nums[i]} at index ${i} is new; the distinct suffix starts at ${i}.` })
  }
  const result = Math.floor((start + 2) / 3)
  frames.push({ pythonLine: PY('return (start'), phase: 'done', activeLine: L('return the number of operations'), index: -1, start, result,
    message: `Each operation removes three elements: ${result} operation(s).` })
  return { input: { nums }, result, frames }
}

export const code = `minimum operations so the remaining array has distinct values
  seen is an empty set
  start is the length of nums
  for i from the last index down to 0
    if nums[i] is already in seen
      stop
    add nums[i] to seen
    start is i
  return the number of groups of three needed to reach start`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def min_operations(nums):
    seen = set()
    start = len(nums)
    for i in range(len(nums) - 1, -1, -1):
        if nums[i] in seen:
            break
        seen.add(nums[i])
        start = i
    return (start + 2) // 3
`
const PY = s => python.split('\n').findIndex(line => line.includes(s)) + 1
