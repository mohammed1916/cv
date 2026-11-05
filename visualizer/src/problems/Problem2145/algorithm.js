// LeetCode 2145: Count the Hidden Sequences.
// Hidden values are x + prefix sums of the differences (the first value is x, prefix 0 included).
// Let lo and hi be the smallest and largest prefix sums. Every value must stay in [lower, upper], so
// lower <= x + lo and x + hi <= upper, which gives (upper - lower) - (hi - lo) + 1 choices for x.

export function parseInput(text) {
  let data
  try { data = JSON.parse(text) } catch { throw new Error('Use a JSON object such as {"differences":[1,-3,4],"lower":1,"upper":6}.') }
  const { differences, lower, upper } = data ?? {}
  if (!Array.isArray(differences) || differences.length < 1 || differences.length > 30 || differences.some(v => !Number.isInteger(v) || Math.abs(v) > 100000)) {
    throw new Error('differences holds 1 to 30 integers with absolute value up to 100000.')
  }
  if (!Number.isInteger(lower) || !Number.isInteger(upper) || lower > upper || upper - lower > 1000000) {
    throw new Error('lower and upper are integers with lower <= upper.')
  }
  return { differences, lower, upper }
}

export const code = `function numberOfArrays(differences, lower, upper) {
  let current = 0
  let low = 0
  let high = 0
  for (const d of differences) {
    current += d
    low = Math.min(low, current)
    high = Math.max(high, current)
  }
  return Math.max(0, (upper - lower) - (high - low) + 1)
}`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `# entry: number_of_arrays
def number_of_arrays(differences, lower, upper):
    current = 0
    low = 0
    high = 0
    for d in differences:
        current += d
        low = min(low, current)
        high = max(high, current)
    return max(0, (upper - lower) - (high - low) + 1)
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
  { id: 'walk', label: 'Walk the differences', description: 'Track the running offset from the first value.' },
  { id: 'extent', label: 'Track extent', description: 'Record the lowest and highest offset reached.' },
  { id: 'done', label: 'Count', description: 'The first value can slide within the span that fits.' },
]

export function buildTrace({ differences, lower, upper }) {
  const frames = []
  let current = 0
  let low = 0
  let high = 0
  const offsets = [0]
  frames.push({ phase: 'walk', activeLine: L('let current = 0'), pythonLine: P('current = 0'), message: 'The first value is x; offsets start at 0.', offsets: [...offsets], low, high, count: null })
  differences.forEach(d => {
    current += d
    offsets.push(current)
    low = Math.min(low, current)
    high = Math.max(high, current)
    frames.push({ phase: 'extent', activeLine: L('low = Math.min'), pythonLine: P('low = min'), message: `Step ${d >= 0 ? '+' : ''}${d} gives offset ${current}; span is ${low} to ${high}.`, offsets: [...offsets], low, high, count: null })
  })
  const count = Math.max(0, (upper - lower) - (high - low) + 1)
  frames.push({ phase: 'done', activeLine: L('return Math.max'), pythonLine: P('return max(0'), message: `x can run from ${lower - low} to ${upper - high}: ${count} sequence${count === 1 ? '' : 's'}.`, offsets: [...offsets], low, high, count })
  return { input: { differences, lower, upper }, result: count, frames }
}
