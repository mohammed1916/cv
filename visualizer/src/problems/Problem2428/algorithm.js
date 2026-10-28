export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with a grid array.')
  const { grid } = input
  if (!Array.isArray(grid) || grid.length < 3 || grid.length > 7 || !Array.isArray(grid[0]) || grid[0].length < 3 || grid[0].length > 7) throw new Error('grid must be at least 3 by 3 and at most 7 by 7.')
  const n = grid[0].length
  if (grid.some(row => !Array.isArray(row) || row.length !== n || row.some(v => !Number.isInteger(v) || v < 0 || v > 100))) throw new Error('grid must be rectangular, with integers from 0 to 100.')
  return { grid }
}

// The hourglass with top-left corner (top, left) covers the full top and bottom rows of a 3 by 3 block,
// plus the middle cell; the two middle-row corners are not part of it.
const cellsAt = (top, left) => [
  [top, left], [top, left + 1], [top, left + 2],
  [top + 1, left + 1],
  [top + 2, left], [top + 2, left + 1], [top + 2, left + 2],
]

export function buildTrace(input) {
  const { grid } = input
  let best = -1
  let bestAt = null
  const frames = [{ phase: 'start', activeLine: L('set best to nothing'), cells: [], sum: 0, best: null, at: null, message: 'Try every 3 by 3 block. Each block gives one hourglass.' }]
  for (let top = 0; top + 2 < grid.length; top++) {
    for (let left = 0; left + 2 < grid[0].length; left++) {
      const cells = cellsAt(top, left)
      const sum = cells.reduce((total, [r, c]) => total + grid[r][c], 0)
      if (sum > best) {
        best = sum
        bestAt = [top, left]
      }
      frames.push({ phase: 'scan', activeLine: L('add the seven hourglass cells'), cells, sum, best, at: [top, left], message: `Hourglass at (${top}, ${left}) sums to ${sum}. Best so far: ${best}.` })
    }
  }
  frames.push({ phase: 'done', activeLine: L('return best'), cells: bestAt ? cellsAt(...bestAt) : [], sum: best, best, at: bestAt, message: `Largest hourglass sum: ${best}.` })
  return { input, result: best, frames }
}

export const code = `maximum sum of an hourglass (grid):
  set best to nothing
  for each top row where a full hourglass fits
    for each left column where a full hourglass fits
      add the seven hourglass cells to get sum
      if best is nothing or sum is larger than best then
        set best to sum
  return best`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def max_hourglass_sum(grid):
    best = None
    for top in range(len(grid) - 2):
        for left in range(len(grid[0]) - 2):
            total = (grid[top][left] + grid[top][left + 1] + grid[top][left + 2]
                     + grid[top + 1][left + 1]
                     + grid[top + 2][left] + grid[top + 2][left + 1] + grid[top + 2][left + 2])
            if best is None or total > best:
                best = total
    return best
`
