export const phases = [
  { id: 'start', label: 'Residue check', description: 'Every value must share one remainder mod x, because each move changes a value by x.' },
  { id: 'quotients', label: 'Quotients', description: 'With one remainder, value v becomes the quotient floor(v / x); moves between values are steps between quotients.' },
  { id: 'median', label: 'Median', description: 'The total distance to a target is smallest at the median of the sorted quotients.' },
  { id: 'done', label: 'Result', description: 'Sum the distances from every quotient to the median.' },
]

export const code = `function minOperations(grid, x) {
  const values = grid.flat()
  const residue = values[0] % x
  if (values.some(v => v % x !== residue)) return -1
  const sorted = values.map(v => Math.floor(v / x)).sort((a, b) => a - b)
  const median = sorted[Math.floor(sorted.length / 2)]
  return sorted.reduce((sum, q) => sum + Math.abs(q - median), 0)
}`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def min_operations(grid, x):
    values = [v for row in grid for v in row]
    residue = values[0] % x
    if any(v % x != residue for v in values):
        return -1
    ordered = sorted(v // x for v in values)
    median = ordered[len(ordered) // 2]
    return sum(abs(q - median) for q in ordered)
`

const C = fragment => code.findIndex(c => c.text.includes(fragment)) + 1
const P = fragment => python.split('\n').findIndex(line => line.includes(fragment)) + 1

export function parseInput(text) {
  let obj
  try { obj = JSON.parse(text) } catch { throw new Error('Use a JSON object such as {"grid":[[2,4],[6,8]],"x":2}.') }
  const { grid, x } = obj || {}
  if (!Array.isArray(grid) || grid.length < 1 || grid.length > 6) throw new Error('grid must have 1 to 6 rows.')
  const width = grid[0].length
  if (!grid.every(row => Array.isArray(row) && row.length === width && width >= 1 && width <= 6)) throw new Error('Every row must have the same length, from 1 to 6.')
  if (!grid.every(row => row.every(v => Number.isInteger(v) && v >= 1 && v <= 1000))) throw new Error('Grid values must be whole numbers from 1 to 1000.')
  if (!Number.isInteger(x) || x < 1 || x > 100) throw new Error('x must be a whole number from 1 to 100.')
  return { grid, x }
}

export function buildTrace({ grid, x }) {
  const frames = []
  const values = grid.flat()
  const residue = values[0] % x
  const add = (phase, c, p, message, extra) => frames.push({
    phase, activeLine: C(c), pythonLine: P(p), message,
    snapshot: { values, x, residue, ...extra },
  })
  add('start', 'const residue', 'residue = values[0]', `Every value should have remainder ${residue} mod ${x}.`, { ordered: null, median: null, distances: null })
  if (values.some(v => v % x !== residue)) {
    add('done', 'return -1', 'return -1', 'Some value has a different remainder, so the grid cannot be made uni-value.', { ordered: null, median: null, distances: null })
    return { input: { grid, x }, result: -1, frames }
  }
  const ordered = values.map(v => Math.floor(v / x)).sort((a, b) => a - b)
  add('quotients', 'const sorted = values.map', 'ordered = sorted', `Quotients in order: ${ordered.join(', ')}.`, { ordered, median: null, distances: null })
  const middle = Math.floor(ordered.length / 2)
  const median = ordered[middle]
  add('median', 'const median = sorted', 'median = ordered', `The middle position ${middle} holds the median quotient ${median}.`, { ordered, median, distances: null })
  const distances = ordered.map(q => Math.abs(q - median))
  const result = distances.reduce((sum, d) => sum + d, 0)
  add('done', 'return sorted.reduce', 'return sum(', `Total operations: ${result}.`, { ordered, median, distances })
  return { input: { grid, x }, result, frames }
}
