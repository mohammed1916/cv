// LeetCode 2123: Minimum Operations to Remove Adjacent Ones in Matrix.
// Ones sharing an edge form a bipartite graph (colour cells by (row + col) parity).
// Removing a minimum set of ones that breaks every edge is a minimum vertex cover,
// which equals the maximum matching (Kuhn's augmenting paths).

const MAX_SIDE = 6

export function parseInput(text) {
  let grid
  try { grid = JSON.parse(text) } catch { throw new Error('Use a JSON array of 0/1 rows, e.g. [[1,1],[1,1]].') }
  if (!Array.isArray(grid) || grid.length < 1 || grid.length > MAX_SIDE) throw new Error(`Use 1 to ${MAX_SIDE} rows. The visualization caps the grid at ${MAX_SIDE} x ${MAX_SIDE}.`)
  const cols = grid[0]?.length
  if (!cols || cols > MAX_SIDE || grid.some(row => !Array.isArray(row) || row.length !== cols || row.some(v => v !== 0 && v !== 1))) {
    throw new Error(`Every row needs the same length, at most ${MAX_SIDE}, holding only 0 or 1.`)
  }
  return { grid }
}

export const code = `function minRemovals(grid) {
  const rows = grid.length
  const cols = grid[0].length
  const matchOfWhite = new Map()
  const isOne = (r, c) => r >= 0 && c >= 0 && r < rows && c < cols && grid[r][c] === 1
  const augment = (r, c, visited) => {
    for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nr = r + dr
      const nc = c + dc
      if (!isOne(nr, nc)) continue
      const key = nr + ',' + nc
      if (visited.has(key)) continue
      visited.add(key)
      const holder = matchOfWhite.get(key)
      if (!holder || augment(holder[0], holder[1], visited)) {
        matchOfWhite.set(key, [r, c])
        return true
      }
    }
    return false
  }
  let matched = 0
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === 1 && (r + c) % 2 === 0 && augment(r, c, new Set())) matched++
    }
  }
  return matched
}`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def min_removals(grid):
    rows, cols = len(grid), len(grid[0])
    match = {}
    def augment(r, c, visited):
        for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nr, nc = r + dr, c + dc
            if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == 1 and (nr, nc) not in visited:
                visited.add((nr, nc))
                if (nr, nc) not in match or augment(*match[(nr, nc)], visited):
                    match[(nr, nc)] = (r, c)
                    return True
        return False
    matched = 0
    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == 1 and (r + c) % 2 == 0:
                if augment(r, c, set()):
                    matched += 1
    return matched
`

const L = text => {
  const index = code.findIndex(line => line.text.includes(text))
  if (index < 0) throw new Error(`Missing pseudocode line: ${text}`)
  return index + 1
}
const P = text => {
  const index = python.split('\n').findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`Missing python line: ${text}`)
  return index + 1
}

export const phases = [
  { id: 'start', label: 'Colour', description: 'Split the ones into two colour classes by parity.' },
  { id: 'pick', label: 'Pick black', description: 'Start an augmenting search from a black one.' },
  { id: 'edge', label: 'Neighbour', description: 'Look at an adjacent white one.' },
  { id: 'match', label: 'Match', description: 'Record a new matched pair.' },
  { id: 'done', label: 'Result', description: 'The matching size is the number of removals.' },
]

const isOne = (grid, r, c) => r >= 0 && c >= 0 && r < grid.length && c < grid[0].length && grid[r][c] === 1

export function buildTrace({ grid }) {
  const rows = grid.length
  const cols = grid[0].length
  const frames = []
  const matchOfWhite = new Map()
  let blackCount = 0
  let whiteCount = 0
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) if (grid[r][c] === 1) ((r + c) % 2 === 0 ? blackCount++ : whiteCount++)
  const pairs = () => [...matchOfWhite].map(([key, b]) => ({ white: key.split(',').map(Number), black: b }))
  frames.push({ phase: 'start', activeLine: L('const matchOfWhite'), pythonLine: P('match = {}'), message: `${blackCount} black and ${whiteCount} white ones; only black-white neighbours conflict.`, black: null, white: null, visited: [], pairs: [], matched: 0 })
  let matched = 0
  function augment(b, visited, depth) {
    const [r, c] = b
    for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nr = r + dr
      const nc = c + dc
      if (!isOne(grid, nr, nc)) continue
      const key = `${nr},${nc}`
      if (visited.has(key)) {
        frames.push({ phase: 'edge', activeLine: L('if (visited.has(key))'), pythonLine: P('not in visited'), message: `(${nr},${nc}) was already tried in this search.`, black: b, white: [nr, nc], visited: [...visited], pairs: pairs(), matched, depth })
        continue
      }
      visited.add(key)
      frames.push({ phase: 'edge', activeLine: L('visited.add(key)'), pythonLine: P('visited.add'), message: `Try white (${nr},${nc}) next to black (${r},${c}).`, black: b, white: [nr, nc], visited: [...visited], pairs: pairs(), matched, depth })
      const holder = matchOfWhite.get(key)
      if (!holder || augment(holder, visited, depth + 1)) {
        matchOfWhite.set(key, b)
        frames.push({ phase: 'match', activeLine: L('matchOfWhite.set(key'), pythonLine: P('match[(nr, nc)] = (r, c)'), message: `Match white (${nr},${nc}) with black (${r},${c}).`, black: b, white: [nr, nc], visited: [...visited], pairs: pairs(), matched, depth })
        return true
      }
    }
    return false
  }
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] !== 1 || (r + c) % 2 !== 0) continue
      const visited = new Set()
      frames.push({ phase: 'pick', activeLine: L('if (grid[r][c] === 1'), pythonLine: P('if grid[r][c] == 1'), message: `Search augmenting paths from black (${r},${c}).`, black: [r, c], white: null, visited: [], pairs: pairs(), matched, depth: 0 })
      if (augment([r, c], visited, 0)) matched++
    }
  }
  frames.push({ phase: 'done', activeLine: L('return matched'), pythonLine: P('return matched'), message: `Maximum matching is ${matched}, so ${matched} ones must be removed.`, black: null, white: null, visited: [], pairs: pairs(), matched, depth: 0 })
  return { input: { grid }, result: matched, frames }
}
