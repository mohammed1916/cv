const ERROR = 'Enter {"grid":["XY.",...]} with 1 to 6 rows of equal length (1 to 6 characters), using only X, Y and . characters.'

export function parseInput(text) {
  const value = JSON.parse(text)
  if (!value || typeof value !== 'object' || !Array.isArray(value.grid)) throw new Error(ERROR)
  const { grid } = value
  if (grid.length < 1 || grid.length > 6) throw new Error(ERROR)
  const cols = typeof grid[0] === 'string' ? grid[0].length : -1
  if (cols < 1 || cols > 6) throw new Error(ERROR)
  if (!grid.every(row => typeof row === 'string' && row.length === cols && /^[XY.]+$/.test(row))) throw new Error(ERROR)
  return { grid }
}

export const code = `count submatrices that contain the top-left cell with equal X and Y counts and at least one X
make prefix-count tables cx and cy, one extra row and column of zeros
set count to 0
for each row i from 1 to rows
  for each column j from 1 to cols
    cx[i][j] = X's in the rectangle from the top-left corner to (i, j)
    cy[i][j] = Y's in that same rectangle
    if cx[i][j] equals cy[i][j] and cx[i][j] is at least 1 then add 1 to count
return count`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export function buildTrace({ grid }) {
  const rows = grid.length, cols = grid[0].length
  const cx = Array.from({ length: rows + 1 }, () => new Array(cols + 1).fill(0))
  const cy = Array.from({ length: rows + 1 }, () => new Array(cols + 1).fill(0))
  let count = 0
  const frames = [{ phase: 'start', activeLine: L('set count to 0'), cell: null, diff: null, count, message: 'A submatrix containing the top-left cell is fixed by its bottom-right corner. Compare the X and Y counts of each such corner.' }]
  for (let i = 1; i <= rows; i++) {
    for (let j = 1; j <= cols; j++) {
      const ch = grid[i - 1][j - 1]
      cx[i][j] = cx[i - 1][j] + cx[i][j - 1] - cx[i - 1][j - 1] + (ch === 'X' ? 1 : 0)
      cy[i][j] = cy[i - 1][j] + cy[i][j - 1] - cy[i - 1][j - 1] + (ch === 'Y' ? 1 : 0)
      const counts = cx[i][j] === cy[i][j] && cx[i][j] >= 1
      if (counts) count++
      frames.push({ phase: 'cell', activeLine: L('cx[i][j] = X'), cell: [i - 1, j - 1], diff: Array.from({ length: rows }, (_, r) => Array.from({ length: cols }, (_, c) => cx[r + 1][c + 1] - cy[r + 1][c + 1])), count, message: `Rectangle from (0, 0) to (${i - 1}, ${j - 1}): ${cx[i][j]} X and ${cy[i][j]} Y. ${counts ? 'Equal and non-zero, so it counts.' : cx[i][j] === cy[i][j] ? 'Equal but no X, so it does not count.' : 'Not equal, so it does not count.'}` })
    }
  }
  frames.push({ phase: 'done', activeLine: L('return count'), cell: null, diff: null, count, message: `Qualifying submatrices: ${count}.` })
  return { input: { grid }, result: count, frames }
}

export const python = `def num_submatrices(grid):
    rows = len(grid)
    cols = len(grid[0])
    cx = [[0] * (cols + 1) for _ in range(rows + 1)]
    cy = [[0] * (cols + 1) for _ in range(rows + 1)]
    count = 0
    for i in range(1, rows + 1):
        for j in range(1, cols + 1):
            ch = grid[i - 1][j - 1]
            cx[i][j] = cx[i - 1][j] + cx[i][j - 1] - cx[i - 1][j - 1] + (ch == 'X')
            cy[i][j] = cy[i - 1][j] + cy[i][j - 1] - cy[i - 1][j - 1] + (ch == 'Y')
            if cx[i][j] == cy[i][j] and cx[i][j] >= 1:
                count += 1
    return count
`
