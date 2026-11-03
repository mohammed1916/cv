export const phases = [
  { id: 'start', label: 'Start at lower', description: 'The first value that could be missing is lower itself.' },
  { id: 'scan', label: 'Scan numbers', description: 'Each present number closes the gap before it, then moves the expected value past itself.' },
  { id: 'tail', label: 'Tail gap', description: 'After the last number, anything from the expected value up to upper is missing.' },
  { id: 'answer', label: 'Missing ranges', description: 'Every gap found along the way is one range in the answer.' },
]

export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || !Array.isArray(data.nums) || !Number.isInteger(data.lower) || !Number.isInteger(data.upper)) throw new Error('Use {"nums":[...],"lower":..,"upper":..}.')
  if (data.lower < -100 || data.upper > 100 || data.lower > data.upper) throw new Error('Use integers with -100 ≤ lower ≤ upper ≤ 100.')
  if (data.nums.length > 20) throw new Error('Use at most 20 numbers.')
  if (!data.nums.every(v => Number.isInteger(v) && v >= data.lower && v <= data.upper)) throw new Error('Every number must be an integer between lower and upper.')
  if (data.nums.some((v, i) => i > 0 && v <= data.nums[i - 1])) throw new Error('The numbers must be strictly increasing.')
  return { nums: [...data.nums], lower: data.lower, upper: data.upper }
}

const CODE = `missing ranges (nums, lower, upper):
  expected = lower
  ranges = []
  for each number x in nums:
    if x > expected:
      add the range expected to x - 1
    expected = x + 1
  if expected <= upper:
    add the range expected to upper
  return ranges`.split('\n')
export const code = CODE.map((text, index) => ({ line: index + 1, text }))
const L = { start: 2, compare: 5, add: 6, advance: 7, tail: 8, tailAdd: 9, answer: 10 }

export const python = `def missing_ranges(nums, lower, upper):
    expected = lower
    ranges = []
    for x in nums:
        if x > expected:
            ranges.append((expected, x - 1))
        expected = x + 1
    if expected <= upper:
        ranges.append((expected, upper))
    return ranges`

export function buildTrace(input) {
  const { nums, lower, upper } = input
  const frames = []
  const ranges = []
  let expected = lower
  const show = r => (r[0] === r[1] ? `${r[0]}` : `${r[0]}..${r[1]}`)
  const snap = (index) => ({ index, expected, ranges: ranges.map(r => [...r]) })
  frames.push({ phase: 'start', activeLine: L.start, pythonLine: L.start, message: `Start with expected = ${lower}, the first value that could be missing.`, ...snap(-1) })
  nums.forEach((x, i) => {
    frames.push({ phase: 'scan', activeLine: L.compare, pythonLine: L.compare, message: `Compare ${x} with expected ${expected}.`, ...snap(i) })
    if (x > expected) {
      ranges.push([expected, x - 1])
      frames.push({ phase: 'scan', activeLine: L.add, pythonLine: L.add, message: `${x} is above ${expected}, so ${show([expected, x - 1])} is missing. Add it.`, ...snap(i) })
    } else {
      frames.push({ phase: 'scan', activeLine: L.advance, pythonLine: L.advance, message: `${x} equals expected, so nothing is missing before it.`, ...snap(i) })
    }
    expected = x + 1
    frames.push({ phase: 'scan', activeLine: L.advance, pythonLine: L.advance, message: `Move expected past ${x} to ${expected}.`, ...snap(i) })
  })
  frames.push({ phase: 'tail', activeLine: L.tail, pythonLine: L.tail, message: `After the numbers, expected is ${expected} and upper is ${upper}.`, ...snap(nums.length) })
  if (expected <= upper) {
    ranges.push([expected, upper])
    frames.push({ phase: 'tail', activeLine: L.tailAdd, pythonLine: L.tailAdd, message: `Everything from ${expected} to ${upper} is missing. Add ${show([expected, upper])}.`, ...snap(nums.length) })
  }
  frames.push({ phase: 'answer', activeLine: L.answer, pythonLine: L.answer, message: ranges.length ? `The missing ranges are ${ranges.map(show).join(', ')}.` : 'No value between lower and upper is missing.', ...snap(nums.length) })
  return { input, result: ranges.map(r => [...r]), frames }
}
