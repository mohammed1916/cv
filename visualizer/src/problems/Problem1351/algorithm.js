export const phases = [
  { id: 'start', label: 'Start', description: 'Begin at the bottom-left corner. Each row and column is sorted, so the boundary between negatives and non-negatives is a staircase.' },
  { id: 'nonneg', label: 'Non-negative', description: 'The cell is not negative, so move one column right to find the first negative in this row.' },
  { id: 'neg', label: 'Negative', description: 'Every cell from here to the end of this row is negative, so count them all and move up a row.' },
  { id: 'done', label: 'Complete', description: 'The staircase has left the grid; return the total count.' },
]

export const examples = [
  { label: 'Staircase', input: '[[4,3,2,-1],[3,2,1,-1],[1,1,-1,-2],[-1,-1,-2,-3]]' },
  { label: 'Positive grid', input: '[[3,2],[1,0]]' },
  { label: 'All negative', input: '[[-1,-2],[-3,-4]]' },
    { label: "Single cell", input: "[[5]]" },
    { label: "Equal values", input: "[[3,3],[3,3]]" },
    { label: "Eight by eight staircase", input: "[[100,88,76,64,52,40,28,16],[88,76,64,52,40,28,16,4],[76,64,52,40,28,16,4,-8],[64,52,40,28,16,4,-8,-20],[52,40,28,16,4,-8,-20,-32],[40,28,16,4,-8,-20,-32,-44],[28,16,4,-8,-20,-32,-44,-56],[16,4,-8,-20,-32,-44,-56,-68]]" },
    { label: "Long run: eight by eight random", input: "[[-5,-46,-46,-46,-46,-46,-88,-88],[-34,-46,-88,-88,-88,-88,-88,-88],[-62,-62,-96,-96,-96,-96,-96,-96],[-62,-62,-96,-96,-96,-96,-96,-96],[-62,-62,-96,-96,-96,-96,-96,-96],[-92,-92,-96,-96,-96,-96,-96,-96],[-92,-92,-96,-96,-96,-96,-96,-96],[-92,-92,-96,-96,-96,-96,-96,-96]]" },
]

export function parseInput(text) {
  const grid = JSON.parse(text)
  if (!Array.isArray(grid) || grid.length < 1 || grid.length > 8) throw new Error('Use a JSON grid of 1 to 8 rows.')
  const n = Array.isArray(grid[0]) ? grid[0].length : 0
  if (n < 1 || n > 8) throw new Error('Each row must have 1 to 8 values.')
  if (grid.some(row => !Array.isArray(row) || row.length !== n)) throw new Error('Every row must have the same length.')
  if (grid.some(row => row.some(v => !Number.isInteger(v) || v < -100 || v > 100))) throw new Error('Every value must be an integer from -100 to 100.')
  for (let r = 0; r < grid.length; r++) {
    for (let c = 1; c < n; c++) if (grid[r][c] > grid[r][c - 1]) throw new Error('Each row must not increase from left to right.')
  }
  for (let r = 1; r < grid.length; r++) {
    for (let c = 0; c < n; c++) if (grid[r][c] > grid[r - 1][c]) throw new Error('Each column must not increase from top to bottom.')
  }
  return grid
}

export function buildTrace(grid) {
  const m = grid.length, n = grid[0].length
  let r = m - 1, c = 0, count = 0
  const snap = (extra = {}) => ({ grid, r, c, count, ...extra })
  const frames = [{ phase: 'start', activeLine: L('let r = m - 1'), pythonLine: P('r, c = m - 1'), snapshot: snap(),
    message: 'Start at the bottom-left corner and move up or right.' }]
  while (r >= 0 && c < n) {
    if (grid[r][c] < 0) {
      count += n - c
      frames.push({ phase: 'neg', activeLine: L('count += n - c'), pythonLine: P('count += n - c'), snapshot: snap({ counted: n - c }),
        message: `${grid[r][c]} at row ${r}, column ${c} is negative, so the ${n - c} cells to its right are negative too. Count ${count} so far.` })
      r--
    } else {
      frames.push({ phase: 'nonneg', activeLine: L('c++'), pythonLine: P('c += 1'), snapshot: snap(),
        message: `${grid[r][c]} at row ${r}, column ${c} is not negative, so move right.` })
      c++
    }
  }
  frames.push({ phase: 'done', activeLine: L('return count'), pythonLine: P('return count'), snapshot: snap({ r: -1, c: -1 }),
    message: `Return ${count}: every negative has been counted once.`, result: count })
  return { input: grid, result: count, frames }
}

export const code = `function countNegatives(grid) {
  const m = grid.length, n = grid[0].length
  let r = m - 1, c = 0, count = 0
  while (r >= 0 && c < n) {
    if (grid[r][c] < 0) {
      count += n - c
      r--
    } else {
      c++
    }
  }
  return count
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def count_negatives(grid):
    m, n = len(grid), len(grid[0])
    r, c = m - 1, 0
    count = 0
    while r >= 0 and c < n:
        if grid[r][c] < 0:
            count += n - c
            r -= 1
        else:
            c += 1
    return count
`
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1
