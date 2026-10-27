const ERROR = 'Enter {"grid":[[...],...],"k":k} with 1 to 6 rows and 1 to 6 columns of integers from 0 to 9, and k from 0 to 100.'

export function parseInput(text) {
  const value = JSON.parse(text)
  if (!value || typeof value !== 'object' || !Array.isArray(value.grid) || !Number.isInteger(value.k)) throw new Error(ERROR)
  const { grid, k } = value
  if (grid.length < 1 || grid.length > 6 || !Array.isArray(grid[0])) throw new Error(ERROR)
  const cols = grid[0].length
  if (cols < 1 || cols > 6) throw new Error(ERROR)
  const cellsOk = grid.every(row => Array.isArray(row) && row.length === cols && row.every(v => Number.isInteger(v) && v >= 0 && v <= 9))
  if (!cellsOk || k < 0 || k > 100) throw new Error(ERROR)
  return { grid, k }
}

export const code = `count submatrices that contain the top-left cell with sum at most k
make a prefix-sum table the same size as grid
set count to 0
for each row i from top to bottom
  for each column j from left to right
    prefix[i][j] = grid[i][j] + the prefix above + the prefix to the left - the prefix above-left
    if prefix[i][j] is at most k then add 1 to count
return count`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export function buildTrace({ grid, k }) {
  const rows = grid.length, cols = grid[0].length
  const prefix = Array.from({ length: rows }, () => new Array(cols).fill(0))
  let count = 0
  const frames = [{ phase: 'start', activeLine: L('set count to 0'), cell: null, value: null, prefix: prefix.map(r => [...r]), count, message: `A submatrix that contains the top-left cell is fixed by its bottom-right corner. Count the corners whose sum is at most ${k}.` }]
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const above = i > 0 ? prefix[i - 1][j] : 0
      const left = j > 0 ? prefix[i][j - 1] : 0
      const corner = i > 0 && j > 0 ? prefix[i - 1][j - 1] : 0
      prefix[i][j] = grid[i][j] + above + left - corner
      const counts = prefix[i][j] <= k
      if (counts) count++
      frames.push({ phase: 'cell', activeLine: L('prefix[i][j] = grid'), cell: [i, j], value: prefix[i][j], prefix: prefix.map(r => [...r]), count, message: `Corner (${i}, ${j}): the rectangle from the top-left has sum ${prefix[i][j]}. ${counts ? `That is at most ${k}, so it counts.` : `That is more than ${k}, so it does not count.`}` })
    }
  }
  frames.push({ phase: 'done', activeLine: L('return count'), cell: null, value: null, prefix: prefix.map(r => [...r]), count, message: `Submatrices with the top-left cell and sum at most ${k}: ${count}.` })
  return { input: { grid, k }, result: count, frames }
}

export const python = `def count_top_left_submatrices(grid, k):
    rows = len(grid)
    cols = len(grid[0])
    prefix = [[0] * cols for _ in range(rows)]
    count = 0
    for i in range(rows):
        for j in range(cols):
            above = prefix[i - 1][j] if i > 0 else 0
            left = prefix[i][j - 1] if j > 0 else 0
            corner = prefix[i - 1][j - 1] if i > 0 and j > 0 else 0
            prefix[i][j] = grid[i][j] + above + left - corner
            if prefix[i][j] <= k:
                count += 1
    return count
`
