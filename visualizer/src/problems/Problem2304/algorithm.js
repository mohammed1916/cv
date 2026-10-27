const MAX_SIZE = 4
const MAX_COST = 9

export function parseInput(text) {
  const data = JSON.parse(text)
  const grid = data?.grid
  const moveCost = data?.move_cost
  if (!Array.isArray(grid) || grid.length < 1 || grid.length > MAX_SIZE) throw new Error(`grid must have 1 to ${MAX_SIZE} rows.`)
  const n = Array.isArray(grid[0]) ? grid[0].length : 0
  if (n < 1 || n > MAX_SIZE) throw new Error(`Each row must have 1 to ${MAX_SIZE} cells.`)
  const m = grid.length
  for (const row of grid) {
    if (!Array.isArray(row) || row.length !== n) throw new Error('Every row must have the same number of cells.')
  }
  const values = grid.flat().slice().sort((a, b) => a - b)
  if (values.length !== m * n || values.some((v, i) => v !== i)) throw new Error(`grid must hold each integer from 0 to ${m * n - 1} exactly once.`)
  if (!Array.isArray(moveCost) || moveCost.length !== m * n) throw new Error(`move_cost must have ${m * n} rows, one for each grid value.`)
  for (const row of moveCost) {
    if (!Array.isArray(row) || row.length !== n) throw new Error(`Each move_cost row must have ${n} entries.`)
    if (row.some(v => !Number.isInteger(v) || v < 0 || v > MAX_COST)) throw new Error(`move_cost entries are integers from 0 to ${MAX_COST}.`)
  }
  return { grid, move_cost: moveCost }
}

export const code = `min path cost(grid, move_cost):
  set best to the values of the first row, since a path may start in any of its cells
  for each later row r of grid:
    set next to an empty row
    for each column c of row r:
      find the smallest best[k] + move_cost[grid value above k][c] over the columns k of the row above
      append that smallest value plus grid[r][c] to next
    set best to next
  return the smallest value in best`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export function buildTrace({ grid, move_cost }) {
  const m = grid.length
  const n = grid[0].length
  const done = [[...grid[0]]]
  // The table shows every row, with '·' for cells not yet computed.
  const view = (partial = []) => Array.from({ length: m }, (_, r) => Array.from({ length: n }, (_, c) => {
    if (r < done.length) return done[r][c]
    if (r === done.length && c < partial.length) return partial[c]
    return '·'
  }))
  const frames = [{ phase: 'start', activeLine: L('set best to the values'), row: 0, col: -1, table: view(), message: `Row 0 starts the path costs: ${grid[0].join(', ')}.` }]
  for (let r = 1; r < m; r++) {
    const prev = done[r - 1]
    const next = []
    for (let c = 0; c < n; c++) {
      let smallest = Infinity
      for (let k = 0; k < n; k++) smallest = Math.min(smallest, prev[k] + move_cost[grid[r - 1][k]][c])
      next.push(smallest + grid[r][c])
      frames.push({ phase: 'cell', activeLine: L('find the smallest'), row: r, col: c, table: view(next), message: `Cell (${r}, ${c}): cheapest arrival ${smallest} plus its value ${grid[r][c]}.` })
    }
    done.push(next)
  }
  const result = Math.min(...done[m - 1])
  frames.push({ phase: 'done', activeLine: L('return the smallest value in best'), row: m - 1, col: -1, table: view(), message: `Minimum path cost: ${result}.` })
  return { input: { grid, move_cost }, grid, move_cost, result, frames }
}

export const python = `def min_path_cost(grid, move_cost):
    m, n = len(grid), len(grid[0])
    best = list(grid[0])
    for r in range(1, m):
        nxt = []
        for c in range(n):
            smallest = min(best[k] + move_cost[grid[r - 1][k]][c] for k in range(n))
            nxt.append(smallest + grid[r][c])
        best = nxt
    return min(best)
`
