// Pure helpers for DistanceMatrixView: how a matrix cell reads, which cells a pivot touches,
// and how a deque of grid cells reads front to back.

export const formatCell = value => (value === Infinity ? '∞' : String(value))

// Row k and column k of an n-by-n matrix, each cell once. These are the cells a pivot k rewrites.
export function pivotCells(n, k) {
  const cells = []
  for (let i = 0; i < n; i++) {
    cells.push({ row: k, col: i })
    if (i !== k) cells.push({ row: i, col: k })
  }
  return cells
}

// Front-to-back labels for a deque of [row, col] cells with their current distances.
export function dequeLabels(deque, dist) {
  return deque.map(([r, c]) => `(${r}, ${c}) at cost ${dist[r][c]}`)
}
