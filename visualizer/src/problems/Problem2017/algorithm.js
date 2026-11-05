export const phases = [
  { id: 'start', label: 'Start', description: 'The first robot starts by taking the whole top row, so the second robot has the whole top row left to collect.' },
  { id: 'switch', label: 'Switch column', description: 'The first robot drops down at column i. It leaves the top cells after i for the second robot.' },
  { id: 'best', label: 'Second robot', description: 'The second robot takes the better of the two rows left to it: the top remainder or the bottom cells the first robot skipped.' },
  { id: 'done', label: 'Result', description: 'Return the smallest value the second robot can collect.' },
]

export const code = `function gridGame(grid) {
  const n = grid[0].length
  let topRest = grid[0].reduce((sum, value) => sum + value, 0)
  let bottomTaken = 0
  let best = Infinity
  for (let i = 0; i < n; i++) {
    topRest -= grid[0][i]
    best = Math.min(best, Math.max(topRest, bottomTaken))
    bottomTaken += grid[1][i]
  }
  return best
}`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def grid_game(grid):
    n = len(grid[0])
    top_rest = sum(grid[0])
    bottom_taken = 0
    best = float('inf')
    for i in range(n):
        top_rest -= grid[0][i]
        best = min(best, max(top_rest, bottom_taken))
        bottom_taken += grid[1][i]
    return best
`

const C = fragment => code.findIndex(c => c.text.includes(fragment)) + 1
const P = fragment => python.split('\n').findIndex(line => line.includes(fragment)) + 1

export function parseInput(text) {
  let grid
  try { grid = JSON.parse(text) } catch { throw new Error('Use a JSON array of two rows, such as [[2,5,4],[1,5,1]].') }
  if (!Array.isArray(grid) || grid.length !== 2 || !Array.isArray(grid[0]) || grid[0].length < 2 || grid[0].length > 12) {
    throw new Error('grid must have two rows of 2 to 12 columns.')
  }
  if (grid[1].length !== grid[0].length || !grid.every(row => row.every(v => Number.isInteger(v) && v >= 0 && v <= 100))) {
    throw new Error('Both rows must have the same length, with whole numbers from 0 to 100.')
  }
  return grid
}

export function buildTrace(grid) {
  const frames = []
  const n = grid[0].length
  let topRest = grid[0].reduce((sum, value) => sum + value, 0)
  let bottomTaken = 0
  let best = Infinity
  let bestColumn = -1
  const add = (phase, c, p, message, i, robot) => frames.push({
    phase, activeLine: C(c), pythonLine: P(p), message,
    snapshot: { grid, column: i, topRest, bottomTaken, robot, best, bestColumn },
  })
  add('start', 'let topRest', 'top_rest = sum', `The first robot takes all of row 0; the second robot can collect ${topRest} from it at most.`, -1, null)
  for (let i = 0; i < n; i++) {
    topRest -= grid[0][i]
    const value = Math.max(topRest, bottomTaken)
    add('switch', 'topRest -= grid[0][i]', 'top_rest -= grid[0][i]', `Switch at column ${i}: top remainder ${topRest}, bottom skipped ${bottomTaken}.`, i, value)
    if (value < best) { best = value; bestColumn = i }
    add('best', 'best = Math.min', 'best = min', `Second robot gets ${value} if the switch is at column ${i}.`, i, value)
    bottomTaken += grid[1][i]
  }
  add('done', 'return best', 'return best', `Smallest second-robot total: ${best}, switching at column ${bestColumn}.`, bestColumn, best)
  return { input: grid, result: best, frames }
}
