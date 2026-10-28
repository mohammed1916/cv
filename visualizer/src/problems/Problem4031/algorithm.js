export function parseInput(text) {
  const obj = JSON.parse(text)
  if (!obj || typeof obj !== 'object' || !Array.isArray(obj.nums)) throw new Error('Use an object with nums, lower and upper.')
  const { nums, lower, upper } = obj
  if (nums.length < 1 || nums.length > 16) throw new Error('Use 1 to 16 numbers for the visualization.')
  if (nums.some(v => !Number.isInteger(v) || v < 1 || v > 100000)) throw new Error('Each number must be an integer from 1 to 100000.')
  if (!Number.isInteger(lower) || !Number.isInteger(upper) || lower < 1 || upper > 100000 || lower > upper) throw new Error('lower and upper must be integers with 1 <= lower <= upper <= 100000.')
  if (upper - lower > 60) throw new Error('Use a range of at most 61 integers for the visualization.')
  return { nums, lower, upper }
}

export function buildTrace(input) {
  const { nums, lower, upper } = input
  const present = new Set(nums)
  const frames = []
  const ranges = []
  let start = null
  let last = null
  for (let v = lower; v <= upper; v++) {
    if (!present.has(v)) {
      if (start === null) start = v
      last = v
      frames.push({ phase: 'missing', activeLine: L('set last to v'), v, ranges: ranges.map(r => r.slice()), message: `${v} is missing.` })
    } else if (start !== null) {
      ranges.push([start, last])
      start = null
      frames.push({ phase: 'close', activeLine: L('append [start, last]'), v, ranges: ranges.map(r => r.slice()), message: `${v} is present, so the missing run ends.` })
    } else {
      frames.push({ phase: 'present', activeLine: L('for each value v'), v, ranges: ranges.map(r => r.slice()), message: `${v} is present.` })
    }
  }
  if (start !== null) ranges.push([start, last])
  frames.push({ phase: 'done', activeLine: L('return ranges'), v: null, ranges: ranges.map(r => r.slice()), message: `Missing ranges: ${ranges.length} found.` })
  return { input, result: ranges, frames }
}

export const code = `missing ranges(nums, lower, upper)
  set present to the set of values in nums
  set ranges to an empty list and set start to nothing
  for each value v from lower to upper do
    if v is missing from present then
      if start is nothing then set start to v
      set last to v
    otherwise if start is not nothing then
      append [start, last] to ranges and set start to nothing
  if start is not nothing then append [start, last] to ranges
  return ranges`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def missing_ranges(nums, lower, upper):
    present = set(nums)
    ranges = []
    start = None
    last = None
    for v in range(lower, upper + 1):
        if v not in present:
            if start is None:
                start = v
            last = v
        elif start is not None:
            ranges.append([start, last])
            start = None
    if start is not None:
        ranges.append([start, last])
    return ranges
`
