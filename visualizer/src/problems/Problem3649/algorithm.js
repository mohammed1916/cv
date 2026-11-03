// Teaching model (knowledge-derived): check every index pair against the two inequalities,
// then count distinct value pairs. Counting distinct value pairs is an interpretation to confirm.
const lineOf = (lines, text) => lines.findIndex(line => line.includes(text)) + 1

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input) || !Array.isArray(input.nums)) throw new Error('Use an object with nums.')
  const { nums } = input
  if (nums.length < 2 || nums.length > 12) throw new Error('nums has 2 to 12 integers for the visualization.')
  if (!nums.every(v => Number.isInteger(v) && Math.abs(v) <= 50)) throw new Error('Each value is an integer from -50 to 50.')
  return { nums }
}

export function buildTrace({ nums }) {
  const frames = []
  const seen = new Map()
  frames.push({ pythonLine: lineOf(PY_LINES, 'seen = set()'), phase: 'start', activeLine: L('start with no pairs'), pair: null, verdict: null, count: 0, message: 'No perfect value pairs found yet.' })
  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j < nums.length; j++) {
      const a = nums[i]
      const b = nums[j]
      const lowDiff = Math.min(Math.abs(a - b), Math.abs(a + b))
      const highDiff = Math.max(Math.abs(a - b), Math.abs(a + b))
      const lowAbs = Math.min(Math.abs(a), Math.abs(b))
      const highAbs = Math.max(Math.abs(a), Math.abs(b))
      const perfect = lowDiff <= lowAbs && highDiff >= highAbs
      if (perfect) seen.set(`${Math.min(a, b)},${Math.max(a, b)}`, [Math.min(a, b), Math.max(a, b)])
      frames.push({ pythonLine: lineOf(PY_LINES, 'if min('), phase: 'check', activeLine: L('check the two inequalities'), pair: [i, j], values: [a, b], verdict: perfect, count: seen.size,
        message: `Pair (${i}, ${j}) = (${a}, ${b}): min ${lowDiff} <= ${lowAbs} and max ${highDiff} >= ${highAbs} is ${perfect ? 'true' : 'false'}.` })
    }
  }
  frames.push({ pythonLine: lineOf(PY_LINES, 'return len'), phase: 'done', activeLine: L('return the number of distinct'), pair: null, verdict: null, count: seen.size, message: `${seen.size} distinct perfect value pair${seen.size === 1 ? '' : 's'}.` })
  return { input: { nums }, result: seen.size, frames }
}

export const code = `count distinct perfect value pairs
  start with no pairs
  for each index pair i less than j
    let a and b be the two values
    check the two inequalities on their absolute values and sums
    if perfect then record the value pair
  return the number of distinct perfect value pairs`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def count_perfect_pairs(nums):
    seen = set()
    for i in range(len(nums)):
        for j in range(i + 1, len(nums)):
            a, b = nums[i], nums[j]
            if min(abs(a - b), abs(a + b)) <= min(abs(a), abs(b)) and \\
               max(abs(a - b), abs(a + b)) >= max(abs(a), abs(b)):
                seen.add((min(a, b), max(a, b)))
    return len(seen)`
const PY_LINES = python.split('\n')
