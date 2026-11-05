export function parseInput(text) {
  const rows = JSON.parse(text)
  if (!Array.isArray(rows) || rows.length < 1 || rows.length > 10) throw new Error('Use 1 to 10 rows.')
  const width = rows[0]?.length ?? 0
  if (width < 1 || width > 10 || rows.some(row => typeof row !== 'string' || row.length !== width || !/^[01]+$/.test(row))) {
    throw new Error('Each row is a string of 0s and 1s, all the same length (at most 10).')
  }
  return rows
}

const MOVES = [[-1, 0], [1, 0], [0, -1], [0, 1]]
// The eight symmetries of the square grid: four rotations, each with and without a reflection.
const SYMMETRIES = [
  ([r, c]) => [r, c], ([r, c]) => [r, -c], ([r, c]) => [-r, c], ([r, c]) => [-r, -c],
  ([r, c]) => [c, r], ([r, c]) => [c, -r], ([r, c]) => [-c, r], ([r, c]) => [-c, -r],
]

// The smallest key among the island's symmetric copies, each moved to the origin.
export function canonicalShape(cells) {
  let best = null
  for (const symmetry of SYMMETRIES) {
    const moved = cells.map(symmetry)
    const minR = Math.min(...moved.map(([r]) => r))
    const minC = Math.min(...moved.map(([, c]) => c))
    const key = moved.map(([r, c]) => `${r - minR},${c - minC}`).sort().join(';')
    if (best === null || key < best) best = key
  }
  return best
}

export function buildTrace(rows) {
  const height = rows.length, width = rows[0].length
  const grid = rows.map(row => [...row].map(Number))
  const land = (r, c) => r >= 0 && c >= 0 && r < height && c < width && grid[r][c] === 1
  const seen = Array.from({ length: height }, () => Array(width).fill(false))
  const shapes = new Set()
  const frames = [{ phase: 'start', pythonLine: 4, activeLine: L('shapes = empty set'), cell: null, island: [], shapes: 0, message: 'Scan the grid. Each unseen land cell starts an island.' }]
  for (let r = 0; r < height; r++) {
    for (let c = 0; c < width; c++) {
      if (!land(r, c) || seen[r][c]) continue
      const island = []
      const explore = (y, x) => {
        seen[y][x] = true
        island.push([y, x])
        frames.push({ phase: 'explore', pythonLine: 23, activeLine: L('append (r, c) to island'), cell: [y, x], island: [...island], shapes: shapes.size, message: `Collect (${y + 1}, ${x + 1}) into this island.` })
        for (const [dy, dx] of MOVES) {
          if (land(y + dy, x + dx) && !seen[y + dy][x + dx]) explore(y + dy, x + dx)
        }
      }
      explore(r, c)
      const key = canonicalShape(island)
      const isNew = !shapes.has(key)
      shapes.add(key)
      frames.push({ phase: isNew ? 'new' : 'repeat', pythonLine: 34, activeLine: L('shapes.add('), cell: [r, c], island: [...island], shapes: shapes.size, key, message: isNew ? 'A shape not seen before, once every rotation and reflection of it is considered.' : 'Same shape as an earlier island once rotations and reflections are allowed.' })
    }
  }
  frames.push({ phase: 'done', pythonLine: 35, activeLine: L('return the number of shapes'), cell: null, island: [], shapes: shapes.size, message: `${shapes.size} distinct shape(s) up to rotation and reflection.` })
  return { input: rows, grid, result: shapes.size, frames }
}

export const code = `function numDistinctIslands2(grid) {
  const seen = new Set()
  const shapes = new Set() // shapes = empty set
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[0].length; c++) {
      if (grid[r][c] === 1 && !seen.has(r + ',' + c)) {
        const island = []
        explore(r, c, island) // collect the connected land into island
        shapes.add(canonicalKey(island)) // shapes.add(canonical key of island)
      }
    }
  }
  return shapes.size // return the number of shapes
}
function explore(r, c, island) {
  seen.add(r + ',' + c)
  island.push([r, c]) // append (r, c) to island
  for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
    const nr = r + dr, nc = c + dc
    if (isLand(nr, nc) && !seen.has(nr + ',' + nc)) explore(nr, nc, island)
  }
}
function canonicalKey(island) {
  let best = null
  for (const sym of SYMMETRIES) { // each of the 8 rotations and reflections
    const moved = island.map(sym)
    const minR = Math.min(...moved.map(([r]) => r)), minC = Math.min(...moved.map(([, c]) => c))
    const key = moved.map(([r, c]) => (r - minR) + ',' + (c - minC)).sort().join(';')
    if (best === null || key < best) best = key
  }
  return best // return the smallest string
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def number_of_distinct_islands2(grid):
    height, width = len(grid), len(grid[0])
    seen = set()
    shapes = set()
    symmetries = [
        lambda r, c: (r, c), lambda r, c: (r, -c), lambda r, c: (-r, c), lambda r, c: (-r, -c),
        lambda r, c: (c, r), lambda r, c: (c, -r), lambda r, c: (-c, r), lambda r, c: (-c, -r),
    ]

    def canonical(cells):
        best = None
        for sym in symmetries:
            moved = [sym(r, c) for r, c in cells]
            min_r = min(r for r, _ in moved)
            min_c = min(c for _, c in moved)
            key = ';'.join(sorted(f'{r - min_r},{c - min_c}' for r, c in moved))
            if best is None or key < best:
                best = key
        return best

    def explore(r, c, island):
        seen.add((r, c))
        island.append((r, c))
        for dr, dc in ((-1, 0), (1, 0), (0, -1), (0, 1)):
            nr, nc = r + dr, c + dc
            if 0 <= nr < height and 0 <= nc < width and grid[nr][nc] == '1' and (nr, nc) not in seen:
                explore(nr, nc, island)

    for r in range(height):
        for c in range(width):
            if grid[r][c] == '1' and (r, c) not in seen:
                island = []
                explore(r, c, island)
                shapes.add(canonical(island))
    return len(shapes)`
