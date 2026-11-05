// Maximum of |a[i]-a[j]| + |b[i]-b[j]| + |i-j| over all index pairs.
// Each absolute value is removed by trying the four sign pairs (s1, s2); for a fixed pair the
// best value is the largest minus the smallest of s1*a[i] + s2*b[i] + i.

const SIGN_PAIRS = [[1, 1], [1, -1], [-1, 1], [-1, -1]]
const VALUE_LIMIT = 50
const LENGTH_LIMIT = 10

export const phases = [
  { id: 'start', label: 'Start', description: 'Begin with the best range at zero.' },
  { id: 'signs', label: 'Sign pair', description: 'Fix one sign pair and start its transformed values.' },
  { id: 'scan', label: 'Scan index', description: 'Add the next index and update the smallest and largest transformed value.' },
  { id: 'record', label: 'Record range', description: 'Keep the largest range seen across sign pairs.' },
  { id: 'done', label: 'Result', description: 'Return the best value found.' },
]

export function parseInput(text) {
  let obj = text
  if (typeof obj === 'string') {
    try { obj = JSON.parse(obj) } catch { throw new Error('Use a JSON object with two equal-length lists a and b.') }
  }
  if (!obj || typeof obj !== 'object' || !Array.isArray(obj.a) || !Array.isArray(obj.b)) {
    throw new Error('Use an object with two lists a and b.')
  }
  if (obj.a.length !== obj.b.length) throw new Error('a and b must have the same length.')
  if (obj.a.length < 2 || obj.a.length > LENGTH_LIMIT) throw new Error(`Each list needs 2 to ${LENGTH_LIMIT} entries in this visualization.`)
  for (const v of [...obj.a, ...obj.b]) {
    if (!Number.isInteger(v) || Math.abs(v) > VALUE_LIMIT) throw new Error(`Values are integers from -${VALUE_LIMIT} to ${VALUE_LIMIT}.`)
  }
  return { a: obj.a, b: obj.b }
}

export const code = `max absolute difference (a, b):
  best = 0
  for each sign pair (s1, s2) in the four choices:
    low = high = s1*a[0] + s2*b[0]
    for i from 1 to n - 1:
      value = s1*a[i] + s2*b[i] + i
      low = min(low, value); high = max(high, value)
    best = max(best, high - low)
  return best`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def max_abs_val_expr(a, b):
    best = 0
    n = len(a)
    for s1, s2 in ((1, 1), (1, -1), (-1, 1), (-1, -1)):
        low = high = s1 * a[0] + s2 * b[0]
        for i in range(1, n):
            value = s1 * a[i] + s2 * b[i] + i
            low = min(low, value)
            high = max(high, value)
        best = max(best, high - low)
    return best
`

const P = text => python.split('\n').findIndex(line => line.includes(text)) + 1

export function buildTrace(input) {
  const { a, b } = parseInput(input)
  const n = a.length
  const frames = []
  let best = 0
  frames.push({
    phase: 'start', activeLine: 2, pythonLine: P('best = 0'),
    message: 'Start with the best range at 0. Each sign pair gives one candidate range.',
    snapshot: { s1: null, s2: null, values: [], scanned: -1, low: null, high: null, best },
  })
  for (const [s1, s2] of SIGN_PAIRS) {
    const values = a.map((x, i) => s1 * x + s2 * b[i] + i)
    let low = values[0]
    let high = values[0]
    frames.push({
      phase: 'signs', activeLine: 5, pythonLine: P('low = high ='),
      message: `Sign pair (${s1}, ${s2}): index 0 gives value ${values[0]}.`,
      snapshot: { s1, s2, values, scanned: 0, low, high, best },
    })
    for (let i = 1; i < n; i++) {
      low = Math.min(low, values[i])
      high = Math.max(high, values[i])
      frames.push({
        phase: 'scan', activeLine: 10, pythonLine: P('high = max(high'),
        message: `Index ${i} gives value ${values[i]}. Low is ${low} and high is ${high}.`,
        snapshot: { s1, s2, values, scanned: i, low, high, best },
      })
    }
    best = Math.max(best, high - low)
    frames.push({
      phase: 'record', activeLine: 12, pythonLine: P('best = max(best'),
      message: `This sign pair spans ${high - low}, so the best is now ${best}.`,
      snapshot: { s1, s2, values, scanned: n - 1, low, high, best },
    })
  }
  frames.push({
    phase: 'done', activeLine: 14, pythonLine: P('return best'),
    message: `All four sign pairs are checked. The answer is ${best}.`,
    snapshot: { s1: null, s2: null, values: [], scanned: n - 1, low: null, high: null, best },
  })
  return { input: { a, b }, result: best, frames }
}
