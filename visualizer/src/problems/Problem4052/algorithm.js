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
    frames.push({ phase: 'row', activeLine: L('rotate row i to the left'), index: i, grid: rows.map(r => r.slice()), message: `Row ${i} moves left by ${s}.` })
  }
  const out = Array.from({ length: n }, () => Array(n).fill(0))
  for (let j = 0; j < n; j++) {
    const s = colShift[j]
    for (let i = 0; i < n; i++) out[i][j] = rows[(i + s) % n][j]
    frames.push({ phase: 'column', activeLine: L('rotate column j upward'), index: j, grid: out.map(r => r.slice()), message: `Column ${j} moves up by ${s}.` })
  }
  return { input, result: out, frames }
}

export const code = `shift grid rows and columns(grid, rowShift, colShift)
  set n to the number of rows
  for each row i do
    rotate row i to the left by rowShift[i]
  for each column j do
    rotate column j upward by colShift[j], using the rotated rows
  return the grid`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def shift_grid(grid, rowShift, colShift):
    n = len(grid)
    rows = [[grid[i][(j + rowShift[i]) % n] for j in range(n)] for i in range(n)]
    return [[rows[(i + colShift[j]) % n][j] for j in range(n)] for i in range(n)]
`
