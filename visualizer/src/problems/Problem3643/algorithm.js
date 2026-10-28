export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with grid, x, y, and k.')
  const { grid, x, y, k } = input
  if (!Array.isArray(grid) || grid.length < 1 || grid.length > 8 || !Array.isArray(grid[0]) || grid[0].length < 1 || grid[0].length > 8) throw new Error('grid must be a non-empty matrix of at most 8 by 8.')
  const m = grid.length
  const n = grid[0].length
  if (grid.some(row => !Array.isArray(row) || row.length !== n || row.some(v => !Number.isInteger(v) || v < 1 || v > 100))) throw new Error('grid must be rectangular, with integers from 1 to 100.')
  if (!Number.isInteger(k) || k < 1 || k > Math.min(m, n)) throw new Error('k must be an integer from 1 to the smaller grid side.')
  if (!Number.isInteger(x) || x < 0 || x > m - k) throw new Error('x must put the square inside the grid.')
  if (!Number.isInteger(y) || y < 0 || y > n - k) throw new Error('y must put the square inside the grid.')
  return { grid, x, y, k }
}

const copy = grid => grid.map(row => [...row])

export function buildTrace(input) {
  const { x, y, k } = input
  const grid = copy(input.grid)
  const frames = [{ phase: 'start', activeLine: L('set top to x'), grid: copy(grid), top: -1, bottom: -1, message: `Flip the ${k} by ${k} square whose top-left corner is (${x}, ${y}).` }]
  let top = x
  let bottom = x + k - 1
  while (top < bottom) {
    for (let col = y; col < y + k; col++) {
      const held = grid[top][col]
      grid[top][col] = grid[bottom][col]
      grid[bottom][col] = held
    }
    frames.push({ phase: 'swap', activeLine: L('swap each pair'), grid: copy(grid), top, bottom, message: `Swap rows ${top} and ${bottom} across columns ${y} to ${y + k - 1}.` })
    top += 1
    bottom -= 1
  }
  frames.push({ phase: 'done', activeLine: L('return grid'), grid: copy(grid), top: -1, bottom: -1, message: 'Every row of the square now sits at its mirror position.' })
  return { input, result: grid, frames }
}

export const code = `flip square submatrix vertically (grid, x, y, k):
  set top to x
  set bottom to x plus k minus 1
  repeat while top is less than bottom
    swap each pair of cells in rows top and bottom from column y to column y plus k minus 1
    move top down by one and bottom up by one
  return grid`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def flip_square_submatrix(grid, x, y, k):
    result = [row[:] for row in grid]
    top = x
    bottom = x + k - 1
    while top < bottom:
        for col in range(y, y + k):
            result[top][col], result[bottom][col] = result[bottom][col], result[top][col]
        top += 1
        bottom -= 1
    return result
`
