// Knowledge-derived model: sort the distinct values, then walk every integer between the smallest and largest.
export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || Array.isArray(input) || !Array.isArray(input.nums)) throw new Error('Use an object with a nums list.')
  const { nums } = input
  if (nums.length < 2 || nums.length > 12) throw new Error('nums has 2 to 12 integers.')
  if (!nums.every(v => Number.isInteger(v) && Math.abs(v) <= 100)) throw new Error('Values are integers from -100 to 100.')
  if (new Set(nums).size !== nums.length) throw new Error('Values must be unique.')
  return { nums }
}

export function buildTrace({ nums }) {
  const frames = []
  const sorted = [...nums].sort((x, y) => x - y)
  const present = new Set(nums)
  const lo = sorted[0]
  const hi = sorted[sorted.length - 1]
  frames.push({ pythonLine: 2, phase: 'sort', activeLine: L('sort the values'), at: -1, value: null, missing: [], message: `Smallest ${lo}, largest ${hi}: scan the full range.` })
  const missing = []
  for (let v = lo; v <= hi; v++) {
    if (present.has(v)) {
      frames.push({ pythonLine: 6, phase: 'scan', activeLine: L('if v is present'), at: v - lo, value: v, missing: [...missing], message: `${v} is present, skip it.` })
    } else {
      missing.push(v)
      frames.push({ pythonLine: 7, phase: 'missing', activeLine: L('append v to missing'), at: v - lo, value: v, missing: [...missing], message: `${v} is missing, record it.` })
    }
  }
  frames.push({ pythonLine: 8, phase: 'done', activeLine: L('return missing'), at: -1, value: null, missing: [...missing], message: missing.length ? `Missing values: ${missing.join(', ')}.` : 'Nothing is missing.' })
  return { input: { nums }, result: missing, frames }
}

export const code = `find the missing values between the smallest and largest
  sort the values
  missing = empty list
  for each value v from the smallest to the largest
    if v is present then continue
    append v to missing
  return missing`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def find_missing(nums):
    present = set(nums)
    low, high = min(nums), max(nums)
    missing = []
    for v in range(low, high + 1):
        if v in present:
            continue
        missing.append(v)
    return missing
`
