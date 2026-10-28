export function parseInput(text) {
  const input = JSON.parse(text)
  const grid = input && input.grid
  if (!Array.isArray(grid) || grid.length < 3 || grid.length > 6) throw new Error('Use {"grid": [[...], ...]} with 3 to 6 rows.')
  const width = Array.isArray(grid[0]) ? grid[0].length : 0
  if (width < 3 || width > 6) throw new Error('Each row has 3 to 6 columns.')
  if (grid.some(row => !Array.isArray(row) || row.length !== width || row.some(v => !Number.isInteger(v) || v < -9 || v > 9))) {
    throw new Error('Every row must have the same length, and each value is an integer from -9 to 9.')
  }
  return { grid }
}

export function buildTrace(input) {
  const grid = input.grid
  const m = grid.length
  const n = grid[0].length
  let best = null
  let bestCells = []
  const frames = [{ phase: 'start', activeLine: L('set best to nothing'), rows: [], cells: [], best: null, message: 'Try every choice of three rows. For each, try every way to pick one column per row with no column repeated.' }]
  for (let r1 = 0; r1 < m; r1++) {
    for (let r2 = r1 + 1; r2 < m; r2++) {
      for (let r3 = r2 + 1; r3 < m; r3++) {
        for (let c1 = 0; c1 < n; c1++) {
          for (let c2 = 0; c2 < n; c2++) {
            for (let c3 = 0; c3 < n; c3++) {
              if (new Set([c1, c2, c3]).size < 3) continue
              const total = grid[r1][c1] + grid[r2][c2] + grid[r3][c3]
              if (best === null || total > best) {
                best = total
                bestCells = [[r1, c1], [r2, c2], [r3, c3]]
              }
            }
          }
        }
        frames.push({ phase: 'rows', activeLine: L('for each choice of three rows'), rows: [r1, r2, r3], cells: bestCells, best, message: `Rows ${r1}, ${r2} and ${r3} checked. Best sum so far: ${best}.` })
      }
    }
  }
  frames.push({ phase: 'done', activeLine: L('return best'), rows: [], cells: bestCells, best, message: `Maximum sum with three rooks: ${best}.` })
  return { input, result: best, frames }
}

export const code = `maximum sum of three non-attacking rooks
  set best to nothing
  for each choice of three rows from top to bottom
    for each choice of one column per row, with all columns different
      set total to the sum of the three values
      if best is unset or total is larger then set best to total
  return best`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def max_rook_sum(grid):
    m, n = len(grid), len(grid[0])
    best = None
    for r1 in range(m):
        for r2 in range(r1 + 1, m):
            for r3 in range(r2 + 1, m):
                for c1 in range(n):
                    for c2 in range(n):
                        for c3 in range(n):
                            if len({c1, c2, c3}) < 3:
                                continue
                            total = grid[r1][c1] + grid[r2][c2] + grid[r3][c3]
                            if best is None or total > best:
                                best = total
    return best
`
