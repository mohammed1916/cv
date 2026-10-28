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
  const rowCount = grid.map(row => row.reduce((sum, v) => sum + v, 0))
  const colCount = Array.from({ length: cols }, (_, c) => grid.reduce((sum, row) => sum + row[c], 0))
  let total = 0
  const frames = [{ phase: 'start', activeLine: L('count the servers in each row'), cell: null, counted: [], total, message: 'Tally servers per row and per column.' }]
  const counted = []
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] !== 1) continue
      if (rowCount[r] > 1 || colCount[c] > 1) {
        total += 1
        counted.push({ row: r, col: c })
        frames.push({ phase: 'count', activeLine: L('add one to total'), cell: [r, c], counted: [...counted], total, message: `Server (${r}, ${c}) shares a line with another server. Total: ${total}.` })
      } else {
        frames.push({ phase: 'skip', activeLine: L('if the cell holds a server'), cell: [r, c], counted: [...counted], total, message: `Server (${r}, ${c}) is alone in its row and column.` })
      }
    }
  }
  frames.push({ phase: 'done', activeLine: L('return total'), cell: null, counted: [...counted], total, message: `${total} servers communicate.` })
  return { input, result: total, frames }
}

export const code = `count servers that communicate (grid):
  count the servers in each row
  count the servers in each column
  set total to 0
  for each cell in the grid
    if the cell holds a server and its row or column has another server then
      add one to total
  return total`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def count_servers(grid):
    rows, cols = len(grid), len(grid[0])
    row_count = [sum(grid[r]) for r in range(rows)]
    col_count = [sum(grid[r][c] for r in range(rows)) for c in range(cols)]
    total = 0
    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == 1 and (row_count[r] > 1 or col_count[c] > 1):
                total += 1
    return total
`
