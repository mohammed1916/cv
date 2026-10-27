const MAX_ROWS = 6
const MAX_COLS = 6

export function parseInput(text) {
  const data = JSON.parse(text)
  const grid = data?.grid
  if (!Array.isArray(grid) || grid.length < 1 || grid.length > MAX_ROWS) throw new Error(`grid must have 1 to ${MAX_ROWS} rows.`)
  const n = Array.isArray(grid[0]) ? grid[0].length : 0
  if (n < 1 || n > MAX_COLS) throw new Error(`Each row must have 1 to ${MAX_COLS} columns.`)
  for (const row of grid) {
    if (!Array.isArray(row) || row.length !== n) throw new Error('Every row must have the same number of columns.')
    if (row.some(v => !Number.isInteger(v) || v < 1 || v > 99)) throw new Error('Cell values are integers from 1 to 99.')
  }
  return { grid }
}

export const code = `max moves(grid):
  set reach to 0 for every cell in the first column, and unreached for every other cell
  for each column c from the second to the last:
    for each row r:
      look at rows r-1, r and r+1 of column c-1 that are reached and hold a smaller value than grid[r][c]
      if any, set reach[r][c] to one more than the largest of those reach values
  return the largest reached value in the grid`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export function buildTrace({ grid }) {
  const m = grid.length
  const n = grid[0].length
  const reach = Array.from({ length: m }, () => Array(n).fill(null))
  for (let r = 0; r < m; r++) reach[r][0] = 0
  const view = () => reach.map(row => row.map(v => (v === null ? '·' : v)))
  const frames = [{ phase: 'start', activeLine: L('set reach to 0'), row: 0, col: 0, table: view(), message: 'Every cell in the first column starts with 0 moves.' }]
  for (let c = 1; c < n; c++) {
    for (let r = 0; r < m; r++) {
      let best = null
      const from = []
      for (let pr = r - 1; pr <= r + 1; pr++) {
        if (pr < 0 || pr >= m || reach[pr][c - 1] === null) continue
        if (grid[pr][c - 1] < grid[r][c]) {
          from.push(pr)
          const candidate = reach[pr][c - 1] + 1
          if (best === null || candidate > best) best = candidate
        }
      }
      reach[r][c] = best
      frames.push({ phase: 'cell', activeLine: L('look at rows'), row: r, col: c, table: view(), message: best === null ? `Cell (${r}, ${c}) cannot be reached from the column to its left.` : `Cell (${r}, ${c}) is reached in ${best} move(s) from row(s) ${from.join(', ')}.` })
    }
  }
  const result = Math.max(...reach.flat().filter(v => v !== null))
  frames.push({ phase: 'done', activeLine: L('return the largest reached'), row: 0, col: 0, table: view(), message: `Maximum number of moves: ${result}.` })
  return { input: { grid }, grid, result, frames }
}

export const python = `def max_moves(grid):
    m, n = len(grid), len(grid[0])
    reach = [[None] * n for _ in range(m)]
    for r in range(m):
        reach[r][0] = 0
    for c in range(1, n):
        for r in range(m):
            best = None
            for pr in (r - 1, r, r + 1):
                if 0 <= pr < m and reach[pr][c - 1] is not None and grid[pr][c - 1] < grid[r][c]:
                    candidate = reach[pr][c - 1] + 1
                    if best is None or candidate > best:
                        best = candidate
            reach[r][c] = best
    return max(v for row in reach for v in row if v is not None)
`
