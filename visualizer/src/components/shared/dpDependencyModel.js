// Pure model for "which earlier cells does this DP cell read, and why". No React; node-testable.
// Cells are addressed [row, column]. One-dimensional tables (linear, bitmask) use row 0.

export const DP_SHAPES = ['linear', 'grid', 'interval', 'bitmask', 'knapsack']
const MAX_ROWS = 12
const MAX_COLUMNS = 14
const MAX_LINEAR_CELLS = 64

const key = ([r, c]) => `${r},${c}`
const asCell = cell => (Array.isArray(cell) ? cell : [0, cell])

/** Format one table value for display. */
export function dpFormatValue(value) {
  if (value === null || value === undefined) return '·'
  if (value === Infinity) return '∞'
  if (value === -Infinity) return '-∞'
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

/** Predecessor builders for the common table shapes. Each returns [{ cell, note }]. */
export const linearSources = (i, offsets = [1, 2]) =>
  offsets.filter(k => i - k >= 0).map(k => ({ cell: [0, i - k], note: `${k} step${k > 1 ? 's' : ''} back` }))

export function gridSources(row, column, kinds = ['up', 'left', 'diagonal']) {
  const table = { up: [row - 1, column], left: [row, column - 1], diagonal: [row - 1, column - 1] }
  return kinds.filter(kind => table[kind][0] >= 0 && table[kind][1] >= 0).map(kind => ({ cell: table[kind], note: kind }))
}

/** Interval [left, right] reads shorter intervals: either the two trimmed ends or every split point. */
export function intervalSources(left, right, splits = null) {
  if (splits) return splits.flatMap(split => [
    { cell: [left, split], note: `left part [${left}..${split}]` },
    { cell: [split + 1, right], note: `right part [${split + 1}..${right}]` },
  ])
  const out = []
  if (left + 1 <= right) out.push({ cell: [left + 1, right], note: 'drop left end' })
  if (right - 1 >= left) out.push({ cell: [left, right - 1], note: 'drop right end' })
  if (left + 1 <= right - 1) out.push({ cell: [left + 1, right - 1], note: 'drop both ends' })
  return out
}

/** A subset mask reads the masks obtained by removing one chosen element. */
export function bitmaskSources(mask, bits) {
  const out = []
  for (let i = 0; i < bits; i++) if (mask & (1 << i)) out.push({ cell: [0, mask ^ (1 << i)], note: `without element ${i}` })
  return out
}

/** Knapsack cell [item, capacity]: skip the item, or take it from capacity - weight. */
export function knapsackSources(item, capacity, weight) {
  const out = []
  if (item >= 1) out.push({ cell: [item - 1, capacity], note: 'skip the item' })
  if (item >= 1 && capacity - weight >= 0) out.push({ cell: [item - 1, capacity - weight], note: `take it (capacity - ${weight})` })
  return out
}

export function dpCellName(shape, [row, column]) {
  if (shape === 'linear' || shape === 'bitmask') return `dp[${column}]`
  return `dp[${row}][${column}]`
}

/** Normalize a spec: values become a 2-D matrix, sources become {cell, note, chosen}. */
export function normalizeDpSpec(spec) {
  const shape = DP_SHAPES.includes(spec.shape) ? spec.shape : 'grid'
  const oneD = shape === 'linear' || shape === 'bitmask'
  const values = oneD ? [spec.values] : spec.values
  const target = asCell(spec.target)
  const sources = (spec.sources ?? []).map(s => ({ cell: asCell(s.cell), note: s.note ?? '', chosen: Boolean(s.chosen) }))
  return { ...spec, shape, oneD, values, target, sources }
}

/** Visible rows and columns: everything when small, otherwise a window around target and sources. */
export function dpWindow(spec) {
  const { values, target, sources, oneD } = normalizeDpSpec(spec)
  const rows = values.length, columns = values[0]?.length ?? 0
  if (oneD && columns > MAX_LINEAR_CELLS) return { hidden: true, rowStart: 0, rowEnd: 0, columnStart: 0, columnEnd: 0 }
  const cells = [target, ...sources.map(s => s.cell)].filter(([r, c]) => r < rows && c < columns)
  if (!cells.length) return { hidden: false, rowStart: 0, rowEnd: Math.min(rows, MAX_ROWS), columnStart: 0, columnEnd: Math.min(columns, MAX_COLUMNS) }
  const span = (index, size, limit) => {
    if (size <= limit) return [0, size]
    const lo = Math.min(...cells.map(c => c[index])), hi = Math.max(...cells.map(c => c[index]))
    const target = cells[0][index]
    // Prefer showing every source; when they are too far apart, always keep the target and the nearest sources.
    const start = hi - lo + 3 <= limit
      ? Math.max(0, Math.min(lo - 1, size - limit, hi + 2 - limit))
      : Math.max(0, Math.min(target - 1, size - limit, target + 2 - limit))
    return [start, Math.min(size, start + limit)]
  }
  const [rowStart, rowEnd] = span(0, rows, MAX_ROWS), [columnStart, columnEnd] = span(1, columns, MAX_COLUMNS)
  return { hidden: false, rowStart, rowEnd, columnStart, columnEnd }
}

/** Role of every cell: target, chosen (source that supplied the result), or source. */
export function dpCellRoles(spec) {
  const { target, sources } = normalizeDpSpec(spec)
  const roles = {}
  for (const s of sources) roles[key(s.cell)] = s.chosen ? 'chosen' : 'source'
  roles[key(target)] = 'target'
  return roles
}

/** Plain-language lines: what is computed, which cells it reads, the recurrence and the reason. */
export function describeDpTransition(spec) {
  const n = normalizeDpSpec(spec)
  const name = cell => dpCellName(n.shape, cell)
  const valueAt = ([r, c]) => dpFormatValue(n.values[r]?.[c])
  const lines = [`Fill ${name(n.target)}${n.values[n.target[0]]?.[n.target[1]] !== undefined ? ` = ${valueAt(n.target)}` : ''}.`]
  if (n.sources.length === 0) lines.push('It reads no earlier cell: this is a base case.')
  else {
    const reads = n.sources.map(s => `${name(s.cell)} = ${valueAt(s.cell)}${s.note ? ` (${s.note})` : ''}${s.chosen ? ' [chosen]' : ''}`)
    lines.push(`It reads ${reads.join('; ')}.`)
  }
  if (n.recurrence) lines.push(`Recurrence: ${n.recurrence}`)
  if (n.why) lines.push(`Why: ${n.why}`)
  return lines
}

/** Whether the table itself should be drawn (otherwise only the words and source chips). */
export const dpShowsTable = spec => !dpWindow(spec).hidden
