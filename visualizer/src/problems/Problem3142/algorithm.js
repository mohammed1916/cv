export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with a grid array.')
  const { grid } = input
  if (!Array.isArray(grid) || grid.length < 1 || grid.length > 6 || !Array.isArray(grid[0]) || grid[0].length < 1 || grid[0].length > 6) throw new Error('grid must be at most 6 by 6.')
  const n = grid[0].length
  if (grid.some(row => !Array.isArray(row) || row.length !== n || row.some(v => !Number.isInteger(v) || v < 0 || v > 9))) throw new Error('grid must be rectangular, with digits from 0 to 9.')
  return { grid }
}

export function buildTrace(input) {
  const { grid } = input
  const rows = grid.length
  const cols = grid[0].length
  const frames = [{ phase: 'start', activeLine: L('for each row'), cell: null, ok: true, message: 'Each cell must equal the cell below and differ from the cell to its right.' }]
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const here = grid[r][c]
      if (r + 1 < rows && here !== grid[r + 1][c]) {
        frames.push({ phase: 'fail', activeLine: L('differs from the cell below'), cell: [r, c], ok: false, message: `(${r}, ${c}) differs from the cell below it.` })
        return { input, result: false, frames }
      }
      if (c + 1 < cols && here === grid[r][c + 1]) {
        frames.push({ phase: 'fail', activeLine: L('equals the cell to the right'), cell: [r, c], ok: false, message: `(${r}, ${c}) equals the cell to its right.` })
        return { input, result: false, frames }
      }
      frames.push({ phase: 'check', activeLine: L('differs from the cell below'), cell: [r, c], ok: true, message: `(${r}, ${c}) passes both checks.` })
    }
  }
  frames.push({ phase: 'done', activeLine: L('return true'), cell: null, ok: true, message: 'Every cell passes both checks.' })
  return { input, result: true, frames }
}

export const code = `check grid satisfies conditions (grid):
  for each row r from the top to the bottom
    for each column c from the left to the right
      if there is a row below and the cell differs from the cell below then
        return false
      if there is a column to the right and the cell equals the cell to the right then
        return false
  return true`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def satisfies_conditions(grid):
    rows, cols = len(grid), len(grid[0])
    for r in range(rows):
        for c in range(cols):
            if r + 1 < rows and grid[r][c] != grid[r + 1][c]:
                return False
            if c + 1 < cols and grid[r][c] == grid[r][c + 1]:
                return False
    return True
`
