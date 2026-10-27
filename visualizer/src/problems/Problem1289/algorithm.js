const MAX_SIZE = 5

export function parseInput(text) {
  const data = JSON.parse(text)
  const grid = data?.grid
  if (!Array.isArray(grid) || grid.length < 1 || grid.length > MAX_SIZE) throw new Error(`grid must have 1 to ${MAX_SIZE} rows.`)
  const n = grid.length
  for (const row of grid) {
    if (!Array.isArray(row) || row.length !== n) throw new Error('grid must be square.')
    if (row.some(v => !Number.isInteger(v) || v < -9 || v > 9)) throw new Error('Values are integers from -9 to 9.')
  }
  return { grid }
}

export const code = `minimum falling path sum(grid):
  set best to a copy of the first row
  for each later row:
    set next to an empty row
    for each column c of this row:
      find the smallest best value in a column other than c
      append grid value at c plus that smallest value to next
    set best to next
  return the smallest value in best`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export function buildTrace({ grid }) {
  const n = grid.length
  const done = [[...grid[0]]]
  // The table shows every row, with '·' for cells not yet computed.
  const view = (partial = []) => Array.from({ length: n }, (_, r) => Array.from({ length: n }, (_, c) => {
    if (r < done.length) return done[r][c]
    if (r === done.length && c < partial.length) return partial[c]
    return '·'
  }))
  const frames = [{ phase: 'start', activeLine: L('set best to a copy'), row: 0, col: -1, table: view(), message: `Row 0 starts the paths: ${grid[0].join(', ')}.` }]
  for (let r = 1; r < n; r++) {
    const prev = done[r - 1]
    const next = []
    for (let c = 0; c < n; c++) {
      let smallest = Infinity
      for (let k = 0; k < n; k++) if (k !== c) smallest = Math.min(smallest, prev[k])
      next.push(grid[r][c] + smallest)
      frames.push({ phase: 'cell', activeLine: L('find the smallest best value'), row: r, col: c, table: view(next), message: `Cell (${r}, ${c}) adds ${grid[r][c]} to ${smallest}, the smallest value above outside column ${c}.` })
    }
    done.push(next)
  }
  const result = Math.min(...done[n - 1])
  frames.push({ phase: 'done', activeLine: L('return the smallest value'), row: n - 1, col: -1, table: view(), message: `Smallest falling path sum: ${result}.` })
  return { input: { grid }, grid, result, frames }
}

export const python = `def min_falling_path_sum(grid):
    n = len(grid)
    best = list(grid[0])
    for r in range(1, n):
        nxt = []
        for c in range(n):
            smallest = min(best[k] for k in range(n) if k != c)
            nxt.append(grid[r][c] + smallest)
        best = nxt
    return min(best)
`
