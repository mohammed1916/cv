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
  // Only the three largest cells of each row can be needed: two other rooks block at most two columns.
  const candidates = grid.map(row => [...Array(n).keys()].sort((a, b) => row[b] - row[a]).slice(0, 3))
  let best = null
  let bestCells = []
  const frames = [{ phase: 'start', activeLine: L('set best to nothing'), rows: [], cells: [], best: null, message: 'Keep the three largest cells of each row. Then try every set of three rows, using only those candidates.' }]
  for (let r = 0; r < m; r++) {
    frames.push({ phase: 'top', activeLine: L('keep the three largest'), rows: [r], cells: candidates[r].map(c => [r, c]), best, message: `Row ${r} keeps columns ${candidates[r].join(', ')} as candidates.` })
  }
  for (let r1 = 0; r1 < m; r1++) {
    for (let r2 = r1 + 1; r2 < m; r2++) {
      for (let r3 = r2 + 1; r3 < m; r3++) {
        for (const c1 of candidates[r1]) {
          for (const c2 of candidates[r2]) {
            for (const c3 of candidates[r3]) {
              if (new Set([c1, c2, c3]).size < 3) continue
              const total = grid[r1][c1] + grid[r2][c2] + grid[r3][c3]
              if (best === null || total > best) {
                best = total
                bestCells = [[r1, c1], [r2, c2], [r3, c3]]
              }
            }
          }
        }
        frames.push({ phase: 'rows', activeLine: L('for each choice of three rows'), rows: [r1, r2, r3], cells: bestCells, best, message: `Rows ${r1}, ${r2} and ${r3} checked with their candidates. Best sum so far: ${best}.` })
      }
    }
  }
  frames.push({ phase: 'done', activeLine: L('return best'), rows: [], cells: bestCells, best, message: `Maximum sum with three rooks: ${best}.` })
  return { input, result: best, frames }
}

export const code = `maximum sum of three non-attacking rooks with few candidates
  for each row keep the three largest values and their columns
  set best to nothing
  for each choice of three rows from top to bottom
    for each candidate column in those rows, with all columns different
      set total to the sum of the three values
      if best is unset or total is larger then set best to total
  return best`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def max_rook_sum(grid):
    m, n = len(grid), len(grid[0])
    cand = []
    for row in grid:
        cand.append(sorted(range(n), key=lambda c: row[c], reverse=True)[:3])
    best = None
    for r1 in range(m):
        for r2 in range(r1 + 1, m):
            for r3 in range(r2 + 1, m):
                for c1 in cand[r1]:
                    for c2 in cand[r2]:
                        for c3 in cand[r3]:
                            if len({c1, c2, c3}) < 3:
                                continue
                            total = grid[r1][c1] + grid[r2][c2] + grid[r3][c3]
                            if best is None or total > best:
                                best = total
    return best
`
