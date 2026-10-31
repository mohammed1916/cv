const COLUMNS = 'ABCDEFGHIJ'
const ROW_LIMIT = 10
const KINDS = ['set', 'sum', 'get']

// "A1" or "A1:B2" as [row, column] pairs (0-based), checked against the sheet size.
function expandRef(ref, rows, cols) {
  const match = /^([A-J])(\d+)(?::([A-J])(\d+))?$/.exec(ref)
  if (!match) throw new Error(`Bad reference ${ref}: use A1 or A1:B2.`)
  const c1 = COLUMNS.indexOf(match[1]), r1 = Number(match[2]) - 1
  const c2 = match[3] ? COLUMNS.indexOf(match[3]) : c1
  const r2 = match[4] ? Number(match[4]) - 1 : r1
  if (r1 < 0 || r2 >= rows || c2 >= cols || c1 > c2 || r1 > r2) throw new Error(`Reference ${ref} is outside the sheet.`)
  const cells = []
  for (let r = r1; r <= r2; r++) for (let c = c1; c <= c2; c++) cells.push([r, c])
  return cells
}

export function parseInput(text) {
  const spec = JSON.parse(text)
  if (!Number.isInteger(spec.h) || spec.h < 1 || spec.h > ROW_LIMIT) throw new Error(`Enter h from 1 to ${ROW_LIMIT}.`)
  if (typeof spec.w !== 'string' || spec.w.length !== 1 || !COLUMNS.includes(spec.w)) throw new Error(`Enter w as one column letter from A to ${COLUMNS.at(-1)}.`)
  if (!Array.isArray(spec.ops) || spec.ops.length < 1 || spec.ops.length > 30) throw new Error('Enter 1 to 30 operations.')
  const cols = COLUMNS.indexOf(spec.w) + 1
  for (const [kind, row, column, arg] of spec.ops) {
    if (!KINDS.includes(kind)) throw new Error(`Unknown operation ${kind}: use set, sum or get.`)
    if (!Number.isInteger(row) || row < 1 || row > spec.h || !COLUMNS.includes(column) || COLUMNS.indexOf(column) >= cols) throw new Error(`Cell ${column}${row} is outside the sheet.`)
    if (kind === 'set' && !Number.isInteger(arg)) throw new Error('set needs an integer value.')
    if (kind === 'sum') {
      if (!Array.isArray(arg) || arg.length === 0) throw new Error('sum needs a list of references.')
      arg.forEach(ref => expandRef(ref, spec.h, cols))
    }
  }
  return spec
}

export function buildTrace(spec) {
  const rows = spec.h, cols = COLUMNS.indexOf(spec.w) + 1
  const cells = Array.from({ length: rows }, () => Array.from({ length: cols }, () => ({ value: 0, refs: null })))
  const valueAt = (r, c) => {
    const cell = cells[r][c]
    return cell.refs ? cell.refs.reduce((total, [rr, cc]) => total + valueAt(rr, cc), 0) : cell.value
  }
  // Does evaluating `from` reach the target cell through formula links?
  const reaches = ([fr, fc], [tr, tc]) => {
    if (fr === tr && fc === tc) return true
    return (cells[fr][fc].refs ?? []).some(ref => reaches(ref, [tr, tc]))
  }
  const snapshot = () => cells.map((row, r) => row.map((_, c) => valueAt(r, c)))
  const rowLabels = Array.from({ length: rows }, (_, r) => String(r + 1))
  const columnLabels = [...COLUMNS.slice(0, cols)]
  const frames = [{ phase: 'start', activeLine: L('create a grid'), pythonLine: 3, cell: null, refs: [], value: null, grid: snapshot(), message: `Create a ${rows} by ${cols} sheet. Every cell starts at 0.` }]
  const result = []
  for (const [kind, row, column, arg] of spec.ops) {
    const r = row - 1, c = COLUMNS.indexOf(column)
    const label = `${column}${row}`
    if (kind === 'set') {
      cells[r][c] = { value: arg, refs: null }
      result.push(null)
      frames.push({ phase: 'set', activeLine: L('store arg as the raw'), pythonLine: 27, cell: [r, c], refs: [], value: null, grid: snapshot(), message: `Set ${label} to ${arg}. Any formula that reads it will see the new value.` })
    } else if (kind === 'sum') {
      const refs = arg.flatMap(ref => expandRef(ref, rows, cols))
      if (refs.some(ref => reaches(ref, [r, c]))) throw new Error(`${label} cannot sum a cell that depends on ${label}.`)
      cells[r][c] = { value: 0, refs }
      const value = valueAt(r, c)
      result.push(value)
      frames.push({ phase: 'sum', activeLine: L('total = value of'), pythonLine: 31, cell: [r, c], refs, value, grid: snapshot(), message: `${label} = ${arg.join(' + ')} = ${value}. The cell stays linked to those references.` })
    } else {
      const value = valueAt(r, c)
      result.push(value)
      frames.push({ phase: 'get', activeLine: L('append value of (row, column)'), pythonLine: 33, cell: [r, c], refs: [], value, grid: snapshot(), message: `Read ${label}: ${value}. Its formula links are followed, so the value is current.` })
    }
  }
  frames.push({ phase: 'done', activeLine: L('return results'), pythonLine: 34, cell: null, refs: [], value: null, grid: snapshot(), message: `Results in order: ${result.map(v => v ?? '-').join(', ')}.` })
  return { input: spec, rows, cols, result, frames, rowLabels, columnLabels }
}

export const code = `set cols to the number of columns from A to width
create a grid of height rows and cols columns, every cell 0
clear the formula table
results = empty list
for each operation (kind, row, column, arg) in ops:
  if kind is "set":
    remove any formula stored at (row, column)
    store arg as the raw value at (row, column)
    append nothing to results
  else if kind is "sum":
    store the cells named by arg as the formula at (row, column)
    total = value of (row, column)
    append total to results
  else:
    append value of (row, column) to results
return results

value of (r, c):
  if (r, c) has a formula:
    return the sum of value of each cell in that formula
  return the raw value at (r, c)`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def design_excel_sum(h, w, ops):
    cols = ord(w) - ord('A') + 1
    raw = [[0] * cols for _ in range(h)]
    formula = {}

    def expand(ref):
        if ':' in ref:
            a, b = ref.split(':')
        else:
            a = b = ref
        c1, r1 = ord(a[0]) - ord('A'), int(a[1:]) - 1
        c2, r2 = ord(b[0]) - ord('A'), int(b[1:]) - 1
        return [(r, c) for r in range(r1, r2 + 1) for c in range(c1, c2 + 1)]

    def value(r, c):
        if (r, c) in formula:
            return sum(value(rr, cc) for rr, cc in formula[(r, c)])
        return raw[r][c]

    out = []
    for op in ops:
        kind, row, column = op[0], op[1], op[2]
        arg = op[3] if len(op) > 3 else None
        r, c = row - 1, ord(column) - ord('A')
        if kind == 'set':
            formula.pop((r, c), None)
            raw[r][c] = arg
            out.append(None)
        elif kind == 'sum':
            formula[(r, c)] = [cell for ref in arg for cell in expand(ref)]
            out.append(value(r, c))
        else:
            out.append(value(r, c))
    return out`
