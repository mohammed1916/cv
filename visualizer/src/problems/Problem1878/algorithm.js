export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with a grid array.')
  const { grid } = input
  if (!Array.isArray(grid) || grid.length < 1 || grid.length > 6 || !Array.isArray(grid[0]) || grid[0].length < 1 || grid[0].length > 6) throw new Error('grid must be at most 6 by 6.')
  const n = grid[0].length
  if (grid.some(row => !Array.isArray(row) || row.length !== n || row.some(v => !Number.isInteger(v) || v < 0 || v > 100))) throw new Error('grid must be rectangular, with integers from 0 to 100.')
  return { grid }
}

// Sum of the rhombus border centered at (i, j) with radius r. Radius 0 is the single center cell.
function borderSum(grid, i, j, r) {
  if (r === 0) return grid[i][j]
  let total = 0
  for (let k = 0; k < r; k++) {
    total += grid[i - r + k][j + k]
    total += grid[i + k][j + r - k]
    total += grid[i + r - k][j - k]
    total += grid[i - k][j - r + k]
  }
  return total
}

export function buildTrace(input) {
  const { grid } = input
  const rows = grid.length
  const cols = grid[0].length
  let top = []
  const frames = [{ phase: 'start', activeLine: L('set top to an empty list'), cells: [], sum: null, top: [], message: 'Try every center and every radius that fits inside the grid.' }]
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      for (let r = 0; i - r >= 0 && i + r < rows && j - r >= 0 && j + r < cols; r++) {
        const sum = borderSum(grid, i, j, r)
        const cells = []
        if (r === 0) cells.push([i, j])
        else for (let k = 0; k < r; k++) cells.push([i - r + k, j + k], [i + k, j + r - k], [i + r - k, j - k], [i - k, j - r + k])
        if (!top.includes(sum)) top = [...top, sum].sort((a, b) => b - a).slice(0, 3)
        frames.push({ phase: 'rhombus', activeLine: L('keep the largest three'), cells, sum, top: [...top], message: `Rhombus at (${i}, ${j}) with radius ${r} sums to ${sum}.` })
      }
    }
  }
  frames.push({ phase: 'done', activeLine: L('return top'), cells: [], sum: null, top: [...top], message: `Biggest distinct sums: ${top.join(', ')}.` })
  return { input, result: top, frames }
}

export const code = `biggest three rhombus sums (grid):
  set top to an empty list of distinct sums
  for each center cell in the grid
    for each radius from 0 while the rhombus fits
      add up the cells on the rhombus border
      if the sum is not already in top then
        insert the sum into top and keep the largest three
  return top`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def biggest_rhombus_sums(grid):
    rows, cols = len(grid), len(grid[0])
    top = []
    for i in range(rows):
        for j in range(cols):
            r = 0
            while i - r >= 0 and i + r < rows and j - r >= 0 and j + r < cols:
                if r == 0:
                    total = grid[i][j]
                else:
                    total = 0
                    for k in range(r):
                        total += grid[i - r + k][j + k]
                        total += grid[i + k][j + r - k]
                        total += grid[i + r - k][j - k]
                        total += grid[i - k][j - r + k]
                if total not in top:
                    top = sorted(top + [total], reverse=True)[:3]
                r += 1
    return top
`
