export function parseInput(text) {
  const obj = JSON.parse(text)
  if (!obj || typeof obj !== 'object' || !Array.isArray(obj.grid) || !Array.isArray(obj.rowShift) || !Array.isArray(obj.colShift)) throw new Error('Use an object with grid, rowShift and colShift arrays.')
  const { grid, rowShift, colShift } = obj
  const n = grid.length
  if (n < 1 || n > 10) throw new Error('Use an n by n grid with n from 1 to 10.')
  if (grid.some(row => !Array.isArray(row) || row.length !== n || row.some(v => !Number.isInteger(v) || v < 1 || v > 100))) throw new Error('grid must be n by n with integers from 1 to 100.')
  if (rowShift.length !== n || colShift.length !== n) throw new Error('rowShift and colShift must each have n entries.')
  if ([...rowShift, ...colShift].some(v => !Number.isInteger(v) || v < 0 || v >= n)) throw new Error('Each shift must be an integer from 0 to n-1.')
  return { grid, rowShift, colShift }
}

export function buildTrace(input) {
  const { grid, rowShift, colShift } = input
  const n = grid.length
  const frames = []
  const rows = grid.map(row => row.slice())
  for (let i = 0; i < n; i++) {
    const s = rowShift[i]
    rows[i] = grid[i].map((_, j) => grid[i][(j + s) % n])
    frames.push({ pythonLine: P('rows[i][j] = grid'), phase: 'row', activeLine: L('rows[i][j] = grid'), index: i, rows: rows.map(r => r.slice()), grid: rows.map(r => r.slice()), message: `Row ${i} moves left by ${s}.` })
  }
  const out = Array.from({ length: n }, () => Array(n).fill(0))
  for (let j = 0; j < n; j++) {
    const s = colShift[j]
    for (let i = 0; i < n; i++) out[i][j] = rows[(i + s) % n][j]
    frames.push({ pythonLine: P('out[i][j] = rows'), phase: 'column', activeLine: L('out[i][j] = rows'), index: j, rows: rows.map(r => r.slice()), grid: out.map(r => r.slice()), message: `Column ${j} moves up by ${s}.` })
  }
  return { input, result: out, frames }
}

export const code = `function shiftGrid(grid, rowShift, colShift) {
  const n = grid.length
  const rows = Array.from({ length: n }, () => Array(n).fill(0))
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) rows[i][j] = grid[i][(j + rowShift[i]) % n]
  }
  const out = Array.from({ length: n }, () => Array(n).fill(0))
  for (let j = 0; j < n; j++) {
    for (let i = 0; i < n; i++) out[i][j] = rows[(i + colShift[j]) % n][j]
  }
  return out
}`.split('\n').map((text, index) => ({ line: index + 1, text }))

const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def shift_grid(grid, row_shift, col_shift):
    n = len(grid)
    rows = [[0] * n for _ in range(n)]
    for i in range(n):
        for j in range(n):
            rows[i][j] = grid[i][(j + row_shift[i]) % n]
    out = [[0] * n for _ in range(n)]
    for j in range(n):
        for i in range(n):
            out[i][j] = rows[(i + col_shift[j]) % n][j]
    return out
`

const PY = python.split('\n')
const P = fragment => {
  const index = PY.findIndex(line => line.includes(fragment))
  if (index < 0) throw new Error(`Missing Python line: ${fragment}`)
  return index + 1
}
