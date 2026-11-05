// LeetCode 1914: each layer is a ring of cells. Rotating a ring by k moves every value k places along the ring, so take k modulo the ring length.
const SOURCE = [
  "function rotateGrid(grid, k) {",
  "  const m = grid.length, n = grid[0].length",
  "  const g = grid.map(row => [...row])",
  "  for (let layer = 0; layer < Math.min(m, n) / 2; layer++) {",
  "    const cells = ringCells(m, n, layer)",
  "    const shift = k % cells.length",
  "    const values = cells.map(([r, c]) => g[r][c])",
  "    cells.forEach(([r, c], j) => { g[r][c] = values[(j + shift) % cells.length] })",
  "  }",
  "  return g",
  "}",
]

export const code = SOURCE.map((text, index) => ({ line: index + 1, text }))

export const python = `def rotate_grid(grid, k):
    m, n = len(grid), len(grid[0])
    layers = min(m, n) // 2
    for layer in range(layers):
        top, bottom, left, right = layer, m - 1 - layer, layer, n - 1 - layer
        cells = [(top, c) for c in range(left, right)]
        cells += [(r, right) for r in range(top, bottom)]
        cells += [(bottom, c) for c in range(right, left, -1)]
        cells += [(r, left) for r in range(bottom, top, -1)]
        shift = k % len(cells)
        values = [grid[r][c] for r, c in cells]
        for j, (r, c) in enumerate(cells):
            grid[r][c] = values[(j + shift) % len(cells)]
    return grid
`

const L = text => { const i = SOURCE.findIndex(line => line.includes(text)); if (i < 0) throw new Error(`no code line: ${text}`); return i + 1 }
const P = text => { const i = python.split('\n').findIndex(line => line.includes(text)); if (i < 0) throw new Error(`no python line: ${text}`); return i + 1 }

export const phases = [
  { id: 'layer', label: 'Each layer', description: 'Read the ring, shift it, and write it back.' },
  { id: 'done', label: 'Result', description: 'Grid after k rotations.' },
]

export function ringCells(m, n, layer) {
  const top = layer, bottom = m - 1 - layer, left = layer, right = n - 1 - layer
  const cells = []
  for (let c = left; c < right; c++) cells.push([top, c])
  for (let r = top; r < bottom; r++) cells.push([r, right])
  for (let c = right; c > left; c--) cells.push([bottom, c])
  for (let r = bottom; r > top; r--) cells.push([r, left])
  return cells
}

export function parseInput(text) {
  let input
  try { input = JSON.parse(text) } catch { throw new Error('Enter JSON like {"grid":[[1,2],[3,4]],"k":1}.') }
  const { grid, k } = input || {}
  if (!Array.isArray(grid) || grid.length < 2 || grid.length % 2 || grid.length > 6) throw new Error('grid has an even number of rows from 2 to 6.')
  const n = grid[0].length
  if (n < 2 || n % 2 || n > 6 || !grid.every(row => Array.isArray(row) && row.length === n && row.every(Number.isInteger))) throw new Error('grid is rectangular with even sides from 2 to 6.')
  if (!Number.isInteger(k) || k < 0 || k > 1000) throw new Error('k is an integer from 0 to 1000.')
  return { grid, k }
}

export function buildTrace({ grid, k }) {
  const m = grid.length, n = grid[0].length
  const g = grid.map(row => [...row])
  const frames = []
  const layers = Math.min(m, n) / 2
  for (let layer = 0; layer < layers; layer++) {
    const cells = ringCells(m, n, layer)
    const shift = k % cells.length
    const values = cells.map(([r, c]) => g[r][c])
    cells.forEach(([r, c], j) => { g[r][c] = values[(j + shift) % cells.length] })
    frames.push({ phase: 'layer', activeLine: L('g[r][c] = values'), pythonLine: P('grid[r][c] = values'), message: `Layer ${layer}: a ring of ${cells.length} cells rotated by ${shift}.`, layer, cells, grid: g.map(row => [...row]), shift })
  }
  frames.push({ phase: 'done', activeLine: L('return g'), pythonLine: P('return g'), message: 'All layers rotated.', layer: -1, cells: [], grid: g.map(row => [...row]), shift: null, result: g })
  return { input: { grid, k }, result: g, frames }
}
