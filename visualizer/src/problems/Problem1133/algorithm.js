// Largest value that appears exactly once; -1 when no value is unique.
// Count every value first, then scan the distinct values from largest to smallest.

const LENGTH_LIMIT = 20
const VALUE_LIMIT = 1000

export const phases = [
  { id: 'start', label: 'Start', description: 'Begin with empty counts.' },
  { id: 'count', label: 'Count', description: 'Add one to the count of each value as it is read.' },
  { id: 'check', label: 'Check largest', description: 'Walk the values from largest to smallest and test whether the count is one.' },
  { id: 'done', label: 'Result', description: 'Return the first unique value found, or -1.' },
]

export function parseInput(text) {
  let obj = text
  if (typeof obj === 'string') {
    try { obj = JSON.parse(obj) } catch { throw new Error('Use a JSON object with a list nums.') }
  }
  if (!obj || typeof obj !== 'object' || !Array.isArray(obj.nums)) throw new Error('Use an object with a list nums.')
  if (obj.nums.length < 1 || obj.nums.length > LENGTH_LIMIT) throw new Error(`nums needs 1 to ${LENGTH_LIMIT} entries in this visualization.`)
  if (!obj.nums.every(v => Number.isInteger(v) && v >= 0 && v <= VALUE_LIMIT)) throw new Error(`Values are integers from 0 to ${VALUE_LIMIT}.`)
  return { nums: obj.nums }
}

export const code = `largest unique (nums):
  count how many times each value appears
  for each value v from largest to smallest:
    if count[v] equals 1 then return v
  return -1`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `from collections import Counter

def largest_unique(nums):
    counts = Counter(nums)
    for v in sorted(counts, reverse=True):
        if counts[v] == 1:
            return v
    return -1
`

const P = text => python.split('\n').findIndex(line => line.includes(text)) + 1

export function buildTrace(input) {
  const { nums } = parseInput(input)
  const counts = new Map()
  const frames = [{
    phase: 'start', activeLine: 1, pythonLine: P('def largest_unique'),
    message: 'Start with empty counts. Every value gets one count per appearance.',
    snapshot: { counts: {}, current: null, answer: null },
  }]
  for (const v of nums) {
    counts.set(v, (counts.get(v) ?? 0) + 1)
    frames.push({
      phase: 'count', activeLine: 2, pythonLine: P('counts = Counter'),
      message: `Read ${v}; its count is now ${counts.get(v)}.`,
      snapshot: { counts: Object.fromEntries(counts), current: v, answer: null },
    })
  }
  const order = [...counts.keys()].sort((x, y) => y - x)
  let answer = -1
  for (const v of order) {
    const c = counts.get(v)
    frames.push({
      phase: 'check', activeLine: 4, pythonLine: P('if counts[v] == 1'),
      message: c === 1 ? `${v} appears once, so it is the answer.` : `${v} appears ${c} times, so keep looking downward.`,
      snapshot: { counts: Object.fromEntries(counts), current: v, answer: c === 1 ? v : null },
    })
    if (c === 1) { answer = v; break }
  }
  frames.push({
    phase: 'done', activeLine: 5, pythonLine: P('return -1'),
    message: answer === -1 ? 'No value appears exactly once, so the answer is -1.' : `The largest unique value is ${answer}.`,
    snapshot: { counts: Object.fromEntries(counts), current: null, answer },
  })
  return { input: { nums }, result: answer, frames }
}
