const CODE = [
  'FUNCTION minimizeMax(grid)',
  '    m, n ← dimensions of grid',
  '    assigned ← m by n grid of zeros',
  '    rowMax ← m zeros, colMax ← n zeros',
  '    cells ← every (r, c), sorted by grid[r][c] ascending',
  '    FOR each (r, c) in cells',
  '        value ← max(rowMax[r], colMax[c]) + 1',
  '        assigned[r][c] ← value',
  '        rowMax[r] ← value, colMax[c] ← value',
  '    RETURN assigned',
]

const PY = [
  'def minimize_max(grid):',
  '    m, n = len(grid), len(grid[0])',
  '    assigned = [[0] * n for _ in range(m)]',
  '    row_max = [0] * m',
  '    col_max = [0] * n',
  '    cells = sorted(((r, c) for r in range(m) for c in range(n)), key=lambda p: grid[p[0]][p[1]])',
  '    for r, c in cells:',
  '        value = max(row_max[r], col_max[c]) + 1',
  '        assigned[r][c] = value',
  '        row_max[r] = value',
  '        col_max[c] = value',
  '    return assigned',
]

const at = (lines, text) => {
  const index = lines.findIndex(line => line.trim() === text.trim())
  if (index < 0) throw new Error(`Missing trace line: ${text}`)
  return index + 1
}
const codeLine = text => at(CODE, text)
const pyLine = text => at(PY, text)

export const phases = [
  { id: 'start', label: 'Order', description: 'Sort the cells by their original value.' },
  { id: 'assign', label: 'Assign', description: 'Give the cell the smallest value its row and column allow.' },
  { id: 'done', label: 'Result', description: 'Report the grid and its maximum.' },
]

export function parseInput(text) {
  const grid = JSON.parse(text)
  if (!Array.isArray(grid) || grid.length < 1 || grid.length > 6) throw new Error('grid has 1 to 6 rows in this visualization.')
  const n = grid[0].length
  if (!Array.isArray(grid[0]) || n < 1 || n > 6) throw new Error('Each row has 1 to 6 values in this visualization.')
  if (!grid.every(row => Array.isArray(row) && row.length === n)) throw new Error('Every row must have the same length.')
  const flat = grid.flat()
  if (!flat.every(v => Number.isInteger(v) && v >= 1 && v <= 100)) throw new Error('Values are integers from 1 to 100 in this visualization.')
  if (new Set(flat).size !== flat.length) throw new Error('All values in the grid must be distinct.')
  return grid
}

export function buildTrace(grid) {
  const m = grid.length
  const n = grid[0].length
  const assigned = Array.from({ length: m }, () => Array(n).fill(0))
  const rowMax = Array(m).fill(0)
  const colMax = Array(n).fill(0)
  const cells = []
  for (let r = 0; r < m; r++) for (let c = 0; c < n; c++) cells.push([r, c])
  cells.sort((a, b) => grid[a[0]][a[1]] - grid[b[0]][b[1]])
  const frames = []
  frames.push({ pythonLine: pyLine('cells = sorted(((r, c) for r in range(m) for c in range(n)), key=lambda p: grid[p[0]][p[1]])'), phase: 'start', activeLine: codeLine('cells ← every (r, c), sorted by grid[r][c] ascending'), cell: null, value: null, order: cells.map(([r, c]) => [r, c]), assigned: assigned.map(row => [...row]), rowMax: [...rowMax], colMax: [...colMax], message: `Visit the ${m * n} cells from smallest original value to largest.` })
  cells.forEach(([r, c], index) => {
    const value = Math.max(rowMax[r], colMax[c]) + 1
    frames.push({ pythonLine: pyLine('value = max(row_max[r], col_max[c]) + 1'), phase: 'assign', activeLine: codeLine('value ← max(rowMax[r], colMax[c]) + 1'), cell: [r, c], value, index, order: cells.map(([a, b]) => [a, b]), assigned: assigned.map(row => [...row]), rowMax: [...rowMax], colMax: [...colMax], message: `Cell (${r}, ${c}) has original value ${grid[r][c]}. Its row's largest so far is ${rowMax[r]} and its column's is ${colMax[c]}, so it takes ${value}.` })
    assigned[r][c] = value
    rowMax[r] = value
    colMax[c] = value
    frames.push({ pythonLine: pyLine('col_max[c] = value'), phase: 'assign', activeLine: codeLine('rowMax[r] ← value, colMax[c] ← value'), cell: [r, c], value, index, order: cells.map(([a, b]) => [a, b]), assigned: assigned.map(row => [...row]), rowMax: [...rowMax], colMax: [...colMax], message: `Row ${r} and column ${c} now record ${value}.` })
  })
  const best = Math.max(...assigned.flat())
  frames.push({ pythonLine: pyLine('return assigned'), phase: 'done', activeLine: codeLine('RETURN assigned'), cell: null, value: best, order: cells.map(([a, b]) => [a, b]), assigned: assigned.map(row => [...row]), rowMax: [...rowMax], colMax: [...colMax], message: `Every cell is placed. The largest assigned value is ${best}.` })
  return { input: grid, result: assigned, best, frames }
}

export const code = CODE.map((text, index) => ({ line: index + 1, text }))
export const python = PY.join('\n') + '\n'
