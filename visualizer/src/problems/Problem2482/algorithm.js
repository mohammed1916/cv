export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with a grid array.')
  const { grid } = input
  if (!Array.isArray(grid) || grid.length < 1 || grid.length > 6 || !Array.isArray(grid[0]) || grid[0].length < 1 || grid[0].length > 6) throw new Error('grid must be at most 6 by 6.')
  const n = grid[0].length
  if (grid.some(row => !Array.isArray(row) || row.length !== n || row.some(v => v !== 0 && v !== 1))) throw new Error('grid must be rectangular, with only 0 and 1 values.')
  return { grid }
}

export function buildTrace(input) {
  const { grid } = input
  const rows = grid.length
  const cols = grid[0].length
  const onesRow = grid.map(row => row.reduce((sum, v) => sum + v, 0))
  const onesCol = Array.from({ length: cols }, (_, c) => grid.reduce((sum, row) => sum + row[c], 0))
  const result = grid.map(() => Array(cols).fill(0))
  const frames = [{ phase: 'start', activeLine: L('count the ones in each row'), row: -1, col: -1, onesRow, onesCol, result: result.map(r => [...r]), message: 'Tally the ones in every row and column first.' }]
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const zerosRow = cols - onesRow[r]
      const zerosCol = rows - onesCol[c]
      result[r][c] = onesRow[r] + onesCol[c] - zerosRow - zerosCol
      frames.push({ phase: 'cell', activeLine: L('set the value to'), row: r, col: c, onesRow, onesCol, result: result.map(row => [...row]), message: `Cell (${r}, ${c}): ${onesRow[r]} + ${onesCol[c]} - ${zerosRow} - ${zerosCol} = ${result[r][c]}.` })
    }
  }
  frames.push({ phase: 'done', activeLine: L('return the result'), row: -1, col: -1, onesRow, onesCol, result: result.map(row => [...row]), message: 'Every cell has its difference.' })
  return { input, result, frames }
}

export const code = `difference between ones and zeros (grid):
  count the ones in each row
  count the ones in each column
  for each cell at row i and column j
    zeros in row i is the row length minus the ones in row i
    zeros in column j is the column height minus the ones in column j
    set the value to ones in row i plus ones in column j minus zeros in row i minus zeros in column j
  return the result`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def ones_minus_zeros(grid):
    rows, cols = len(grid), len(grid[0])
    ones_row = [sum(grid[r]) for r in range(rows)]
    ones_col = [sum(grid[r][c] for r in range(rows)) for c in range(cols)]
    result = []
    for r in range(rows):
        line = []
        for c in range(cols):
            zeros_row = cols - ones_row[r]
            zeros_col = rows - ones_col[c]
            line.append(ones_row[r] + ones_col[c] - zeros_row - zeros_col)
        result.append(line)
    return result
`
