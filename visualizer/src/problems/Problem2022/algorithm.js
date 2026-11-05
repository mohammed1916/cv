export const phases = [
  { id: 'start', label: 'Check size', description: 'The flat array must have exactly m * n values to fill the grid.' },
  { id: 'row', label: 'Cut a row', description: 'Each row takes the next n consecutive values in order.' },
  { id: 'done', label: 'Result', description: 'Return the m rows, or an empty array when the size does not match.' },
]

export const code = `function construct2DArray(original, m, n) {
  if (original.length !== m * n) return []
  const rows = []
  for (let r = 0; r < m; r++) rows.push(original.slice(r * n, (r + 1) * n))
  return rows
}`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def construct_2d_array(original, m, n):
    if len(original) != m * n:
        return []
    rows = []
    for r in range(m):
        rows.append(original[r * n:(r + 1) * n])
    return rows
`

const C = fragment => code.findIndex(c => c.text.includes(fragment)) + 1
const P = fragment => python.split('\n').findIndex(line => line.includes(fragment)) + 1

export function parseInput(text) {
  let obj
  try { obj = JSON.parse(text) } catch { throw new Error('Use a JSON object such as {"original":[1,2,3,4],"m":2,"n":2}.') }
  const { original, m, n } = obj || {}
  if (!Array.isArray(original) || original.length < 1 || original.length > 40 || !original.every(v => Number.isInteger(v) && v >= 1 && v <= 100000)) {
    throw new Error('original must have 1 to 40 whole numbers from 1 to 100000.')
  }
  if (!Number.isInteger(m) || !Number.isInteger(n) || m < 1 || n < 1 || m > 40 || n > 40) throw new Error('m and n must be whole numbers from 1 to 40.')
  return { original, m, n }
}

export function buildTrace({ original, m, n }) {
  const frames = []
  const ok = original.length === m * n
  const rows = []
  const add = (phase, c, p, message, r) => frames.push({
    phase, activeLine: C(c), pythonLine: P(p), message,
    snapshot: { original, m, n, rows: rows.map(row => row.slice()), r, ok },
  })
  add('start', 'if (original.length !== m', 'if len(original) != m', ok ? `${original.length} values fit a ${m} x ${n} grid.` : `${original.length} values do not fit ${m} x ${n}.`, -1)
  if (ok) {
    for (let r = 0; r < m; r++) {
      rows.push(original.slice(r * n, (r + 1) * n))
      add('row', 'rows.push(original.slice', 'rows.append(original', `Row ${r} takes positions ${r * n} to ${(r + 1) * n - 1}.`, r)
    }
  }
  add('done', 'return rows', 'return rows', ok ? 'The grid is filled in order.' : 'No grid is possible, so the answer is empty.', -1)
  return { input: { original, m, n }, result: ok ? rows : [], frames }
}
