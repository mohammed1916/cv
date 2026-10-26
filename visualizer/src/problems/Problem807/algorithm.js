export function parseInput(text) {
  const grid = JSON.parse(text)
  const n = Array.isArray(grid) ? grid.length : 0
  if (n < 1 || n > 8 || !grid.every(row => Array.isArray(row) && row.length === n && row.every(v => Number.isInteger(v) && v >= 0 && v <= 100))) throw new Error('Enter a JSON n x n grid with 1 <= n <= 8 (visualization cap) and heights between 0 and 100.')
  return grid.map(r => [...r])
}
export function buildTrace(grid) {
  const n = grid.length
  const rowMax = grid.map(r => Math.max(...r))
  const colMax = grid[0].map((_, c) => Math.max(...grid.map(r => r[c])))
  const frames = []
  const push = (phase, activeLine, message, extra = {}) => frames.push({ phase, activeLine, message, rowMax: null, colMax: null, cell: null, total: 0, raised: grid.map(r => r.map(() => null)), ...extra })
  push('start', 1, 'The skyline seen from each side is the row / column maximum. A building can grow until it would change one of them.')
  push('rows', 2, `Row maxima (skyline from east/west): [${rowMax.join(', ')}].`, { rowMax })
  push('cols', 3, `Column maxima (skyline from north/south): [${colMax.join(', ')}].`, { rowMax, colMax })
  let total = 0
  const raised = grid.map(r => r.map(() => null))
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
    const cap = Math.min(rowMax[r], colMax[c])
    const gain = cap - grid[r][c]
    total += gain
    raised[r][c] = cap
    frames.push({ phase: 'cell', activeLine: 7, rowMax, colMax, cell: [r, c], total, raised: raised.map(x => [...x]), message: `Cell (${r}, ${c}) = ${grid[r][c]}: cap = min(row ${rowMax[r]}, col ${colMax[c]}) = ${cap}, so add ${gain}. Total ${total}.` })
  }
  frames.push({ phase: 'done', activeLine: 8, rowMax, colMax, cell: null, total, raised, message: `Maximum total increase: ${total}.` })
  return { input: grid, result: total, frames }
}
export const code = `def maxIncreaseKeepingSkyline(grid):
    rowMax = [max(row) for row in grid]
    colMax = [max(col) for col in zip(*grid)]
    total = 0
    for r in range(len(grid)):
        for c in range(len(grid[0])):
            total += min(rowMax[r], colMax[c]) - grid[r][c]
    return total`.split('\n').map((text, index) => ({ line: index + 1, text }))
