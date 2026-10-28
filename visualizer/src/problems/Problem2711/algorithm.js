export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with a grid array.')
  const { grid } = input
  if (!Array.isArray(grid) || grid.length < 1 || grid.length > 6 || !Array.isArray(grid[0]) || grid[0].length < 1 || grid[0].length > 6) throw new Error('grid must be at most 6 by 6.')
  const n = grid[0].length
  if (grid.some(row => !Array.isArray(row) || row.length !== n || row.some(v => !Number.isInteger(v) || v < 1 || v > 50))) throw new Error('grid must be rectangular, with integers from 1 to 50.')
  return { grid }
}

export function buildTrace(input) {
  const { grid } = input
  const rows = grid.length
  const cols = grid[0].length
  const answer = grid.map(row => row.map(() => ''))
  const frames = [{ phase: 'start', activeLine: L('set answer to an empty grid'), cell: null, above: null, below: null, answer: answer.map(r => [...r]), message: 'Each cell compares the diagonal above-left with the diagonal below-right.' }]
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const above = new Set()
      const cellsAbove = []
      for (let r = i - 1, c = j - 1; r >= 0 && c >= 0; r--, c--) { above.add(grid[r][c]); cellsAbove.push([r, c]) }
      const below = new Set()
      const cellsBelow = []
      for (let r = i + 1, c = j + 1; r < rows && c < cols; r++, c++) { below.add(grid[r][c]); cellsBelow.push([r, c]) }
      const gap = Math.abs(above.size - below.size)
      answer[i][j] = gap
      frames.push({ phase: 'cell', activeLine: L('store the absolute difference'), cell: [i, j], above: cellsAbove, below: cellsBelow, answer: answer.map(r => [...r]), message: `Cell (${i}, ${j}): ${above.size} distinct above-left, ${below.size} below-right, gap ${gap}.` })
    }
  }
  frames.push({ phase: 'done', activeLine: L('return answer'), cell: null, above: null, below: null, answer: answer.map(r => [...r]), message: 'Every cell has its gap.' })
  return { input, result: answer, frames }
}

export const code = `difference of distinct diagonal values (grid):
  set answer to an empty grid of the same size
  for each cell at row i and column j
    collect the distinct values strictly up and left of the cell along its diagonal
    collect the distinct values strictly down and right of the cell along its diagonal
    store the absolute difference of the two counts at (i, j)
  return answer`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def diagonal_difference(grid):
    rows, cols = len(grid), len(grid[0])
    answer = [[0] * cols for _ in range(rows)]
    for i in range(rows):
        for j in range(cols):
            above = set()
            r, c = i - 1, j - 1
            while r >= 0 and c >= 0:
                above.add(grid[r][c])
                r -= 1
                c -= 1
            below = set()
            r, c = i + 1, j + 1
            while r < rows and c < cols:
                below.add(grid[r][c])
                r += 1
                c += 1
            answer[i][j] = abs(len(above) - len(below))
    return answer
`
