export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || !Array.isArray(input.grid) || input.grid.length < 1 || input.grid.length > 6) throw new Error('Use an object with grid: 1 to 6 rows.')
  const width = Array.isArray(input.grid[0]) ? input.grid[0].length : 0
  if (width < 1 || width > 6) throw new Error('Each row has 1 to 6 values.')
  if (input.grid.some(row => !Array.isArray(row) || row.length !== width || row.some(v => !Number.isInteger(v) || v < 1 || v > 6))) throw new Error('Every row has the same length, and each cell is an integer from 1 to 6.')
  if (input.grid.length * width < 2) throw new Error('The grid needs at least two cells.')
  return { grid: input.grid }
}

export function buildTrace(input) {
  const { grid } = input
  const m = grid.length
  const n = grid[0].length
  const total = grid.reduce((sum, row) => sum + row.reduce((a, b) => a + b, 0), 0)
  const frames = [{ phase: 'start', activeLine: L('set total to the sum'), cut: null, acc: 0, total, message: `Total of all cells is ${total}.` }]
  let above = 0
  for (let r = 0; r <= m - 2; r++) {
    above += grid[r].reduce((a, b) => a + b, 0)
    const hit = 2 * above === total
    frames.push({ phase: 'row', activeLine: L('add the sum of row r'), cut: { kind: 'row', index: r }, acc: above, total, message: `Horizontal cut after row ${r}: top ${above}, bottom ${total - above}.` })
    if (hit) return finish(true, { kind: 'row', index: r })
  }
  let left = 0
  for (let c = 0; c <= n - 2; c++) {
    left += grid.reduce((sum, row) => sum + row[c], 0)
    const hit = 2 * left === total
    frames.push({ phase: 'col', activeLine: L('add the sum of column c'), cut: { kind: 'col', index: c }, acc: left, total, message: `Vertical cut after column ${c}: left ${left}, right ${total - left}.` })
    if (hit) return finish(true, { kind: 'col', index: c })
  }
  return finish(false, null)

  function finish(result, cut) {
    frames.push({ phase: 'done', activeLine: L('return false'), cut, acc: null, total, result, message: result ? 'A straight cut splits the grid into equal sums.' : 'No straight cut gives equal sums.' })
    return { input, result, frames }
  }
}

export const code = `can one straight cut split the grid into two equal sums
  set total to the sum of every cell
  set above to 0
  for each row r from 0 to m minus 2 do
    add the sum of row r to above
    if 2 times above equals total then return true
  set left to 0
  for each column c from 0 to n minus 2 do
    add the sum of column c to left
    if 2 times left equals total then return true
  return false`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def can_partition_grid(grid):
    m, n = len(grid), len(grid[0])
    total = sum(sum(row) for row in grid)
    above = 0
    for r in range(m - 1):
        above += sum(grid[r])
        if 2 * above == total:
            return True
    left = 0
    for c in range(n - 1):
        left += sum(grid[r][c] for r in range(m))
        if 2 * left == total:
            return True
    return False
`
