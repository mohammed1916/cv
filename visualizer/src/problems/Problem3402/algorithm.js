export function parseInput(text) {
  const input = JSON.parse(text)
  const grid = input && input.grid
  if (!Array.isArray(grid) || grid.length < 1 || grid.length > 5) throw new Error('Use {"grid": [[...], ...]} with 1 to 5 rows.')
  const width = Array.isArray(grid[0]) ? grid[0].length : 0
  if (width < 1 || width > 5) throw new Error('Each row has 1 to 5 columns.')
  if (grid.some(row => !Array.isArray(row) || row.length !== width || row.some(v => !Number.isInteger(v) || v < 0 || v > 9))) {
    throw new Error('Every row must have the same length, and each cell is an integer from 0 to 9.')
  }
  return { grid }
}

export function buildTrace(input) {
  const grid = input.grid.map(row => [...row])
  const rows = grid.length
  const cols = grid[0].length
  const frames = [{ phase: 'start', activeLine: L('set total to 0'), cell: null, total: 0, message: 'Work down each column. Each cell must be strictly larger than the cell above it.' }]
  let total = 0
  for (let j = 0; j < cols; j++) {
    let previous = null
    for (let i = 0; i < rows; i++) {
      const value = grid[i][j]
      const target = previous === null || value > previous ? value : previous + 1
      total += target - value
      grid[i][j] = target
      previous = target
      frames.push({ phase: 'cell', activeLine: L('set target'), cell: [i, j], total, message: `Cell [${i}, ${j}] holds ${value}, raised to ${target} so it sits above the cell above it.` })
    }
  }
  frames.push({ phase: 'done', activeLine: L('return total'), cell: null, total, message: `Minimum increments: ${total}.` })
  return { input, result: total, frames }
}

export const code = `minimum increments to make every column strictly increasing
  set total to 0
  for each column from left to right
    set previous to nothing
    for each row from top to bottom
      set target to this value if it is above previous otherwise previous plus 1
      add target minus this value to total
      set previous to target
  return total`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def min_increments(grid):
    total = 0
    for j in range(len(grid[0])):
        previous = None
        for i in range(len(grid)):
            cur = grid[i][j]
            target = cur if previous is None or cur > previous else previous + 1
            total += target - cur
            previous = target
    return total
`
