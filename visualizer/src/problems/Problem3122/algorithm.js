export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || !Array.isArray(data.grid)) throw new Error('Use an object with a grid array of rows, for example {"grid":[[1,0,2],[1,0,2]]}.')
  const rows = data.grid.length
  if (rows < 1 || rows > 4) throw new Error('grid must have 1 to 4 rows.')
  const cols = Array.isArray(data.grid[0]) ? data.grid[0].length : 0
  if (cols < 1 || cols > 4) throw new Error('grid must have 1 to 4 columns.')
  if (!data.grid.every(row => Array.isArray(row) && row.length === cols && row.every(v => Number.isInteger(v) && v >= 0 && v <= 9))) throw new Error('Every row must have the same length, with integers from 0 to 9.')
  return { grid: data.grid }
}

export function buildTrace(input) {
  const { grid } = input
  const rows = grid.length
  const cols = grid[0].length
  let previous = Array.from({ length: 10 }, () => 0)
  const frames = [{ phase: 'start', activeLine: L('set previous to zeros'), column: -1, previous: previous.slice(), result: null, message: 'Before the first column, every colour costs 0, so the first column has no neighbour to clash with.' }]
  for (let j = 0; j < cols; j++) {
    const next = Array.from({ length: 10 }, () => 0)
    for (let c = 0; c < 10; c++) {
      let cost = 0
      for (let i = 0; i < rows; i++) if (grid[i][j] !== c) cost += 1
      let cheapestOther = Infinity
      for (let p = 0; p < 10; p++) if (p !== c) cheapestOther = Math.min(cheapestOther, previous[p])
      next[c] = cost + cheapestOther
    }
    previous = next
    frames.push({ phase: 'column', activeLine: L('set previous to next'), column: j, previous: previous.slice(), result: null, message: `Column ${j} costs for each colour: ${previous.join(', ')}.` })
  }
  const result = Math.min(...previous)
  frames.push({ phase: 'done', activeLine: L('return the smallest value'), column: cols, previous: previous.slice(), result, message: `Fewest operations: ${result}.` })
  return { input, result, frames }
}

export const code = `minimum operations to satisfy the conditions (grid)
  set previous to zeros, one for each colour from 0 to 9
  for each column j
    for each colour c from 0 to 9
      set cost to the number of cells in column j that are not c
      set next[c] to cost plus the smallest previous[p] for a colour p not equal to c
    set previous to next
  return the smallest value in previous`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def min_operations(grid):
    rows = len(grid)
    cols = len(grid[0])
    previous = [0] * 10
    for j in range(cols):
        nxt = [0] * 10
        for c in range(10):
            cost = sum(1 for i in range(rows) if grid[i][j] != c)
            nxt[c] = cost + min(previous[p] for p in range(10) if p != c)
        previous = nxt
    return min(previous)
`
