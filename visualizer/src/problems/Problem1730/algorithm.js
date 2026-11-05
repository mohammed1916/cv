// Shortest path to food: breadth-first search from the start; the first food cell reached is the nearest.
const JS_LINES = [
  { text: 'const queue = [[startRow, startCol, 0]], seen = new Set()', py: 'queue = deque' },
  { text: 'while (queue.length > 0) {', py: 'while queue' },
  { text: 'const [r, c, d] = queue.shift()', py: 'r, c, d = queue.popleft()' },
  { text: 'if (grid[r][c] === "#") return d', py: "if grid[r][c] == '#'" },
  { text: 'for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {', py: 'for dr, dc in' },
  { text: 'const nr = r + dr, nc = c + dc', py: 'nr, nc = r + dr' },
  { text: 'if (inside(nr, nc) && grid[nr][nc] !== "X" && !seen.has(key(nr, nc))) {', py: 'if 0 <= nr < m' },
  { text: 'seen.add(key(nr, nc)); queue.push([nr, nc, d + 1])', py: 'seen.add((nr, nc))' },
  { text: '}', py: null },
  { text: '}', py: null },
  { text: 'return -1', py: 'return -1' },
]

export const code = JS_LINES.map(({ text }, i) => ({ line: i + 1, text }))

export const python = `from collections import deque

def getFood(grid):
    m, n = len(grid), len(grid[0])
    for sr in range(m):
        for sc in range(n):
            if grid[sr][sc] == '*':
                start = (sr, sc)
    queue = deque([(start[0], start[1], 0)])
    seen = {start}
    while queue:
        r, c, d = queue.popleft()
        if grid[r][c] == '#':
            return d
        for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nr, nc = r + dr, c + dc
            if 0 <= nr < m and 0 <= nc < n and grid[nr][nc] != 'X' and (nr, nc) not in seen:
                seen.add((nr, nc))
                queue.append((nr, nc, d + 1))
    return -1
`

const PY = python.split('\n')
const pyAt = needle => {
  const index = PY.findIndex(line => line.includes(needle))
  if (index < 0) throw new Error(`python line missing: ${needle}`)
  return index + 1
}
export const pythonLineMap = Object.fromEntries(JS_LINES.map((line, i) => [i + 1, pyAt(line.py ?? 'return -1')]))

export const phases = [
  { id: 'start', label: 'Start', description: 'The breadth-first search starts at the * cell.' },
  { id: 'visit', label: 'Visit', description: 'Cells are taken in order of distance; each open neighbour joins the queue once.' },
  { id: 'found', label: 'Food', description: 'The first # cell taken from the queue is the nearest food.' },
  { id: 'done', label: 'Result', description: 'The distance to the nearest food, or -1 when none can be reached.' },
]

export const examples = [
  { label: 'Food around a wall', input: '["*O#","XXO","O#O"]' },
  { label: 'Blocked off', input: '["*X#","XXO","OOO"]' },
]

export const complexity = 'O(m * n) time and O(m * n) space for an m by n grid. The visual caps the grid at 8 by 8.'

export function parseInput(text) {
  const grid = JSON.parse(text)
  if (!Array.isArray(grid) || grid.length < 1 || grid.length > 8) throw new Error('Use a JSON array of 1 to 8 rows (visual cap).')
  const n = grid[0].length
  if (n < 1 || n > 8) throw new Error('Rows have 1 to 8 cells (visual cap).')
  if (grid.some(row => typeof row !== 'string' || row.length !== n || !/^[*#OX]+$/.test(row))) throw new Error('Rows have the same length and use * # O X only.')
  const stars = grid.join('').split('*').length - 1
  if (stars !== 1) throw new Error('The grid has exactly one * cell.')
  return grid
}

export function buildTrace(grid) {
  const m = grid.length
  const n = grid[0].length
  const frames = []
  let sr = 0, sc = 0
  grid.forEach((row, r) => [...row].forEach((ch, c) => { if (ch === '*') { sr = r; sc = c } }))
  const queue = [[sr, sc, 0]]
  const seen = new Set([`${sr},${sc}`])
  const snap = extra => ({ queue: queue.map(([r, c]) => [r, c]), ...extra })
  frames.push({ phase: 'start', activeLine: 1, cell: [sr, sc], distance: 0, message: `Start at row ${sr}, column ${sc}.`, snapshot: snap({ seen: [...seen] }) })
  let result = -1
  while (queue.length) {
    const [r, c, d] = queue.shift()
    if (grid[r][c] === '#') {
      result = d
      frames.push({ phase: 'found', activeLine: 4, cell: [r, c], distance: d, message: `Food at distance ${d}.`, snapshot: snap({ seen: [...seen] }) })
      break
    }
    frames.push({ phase: 'visit', activeLine: 3, cell: [r, c], distance: d, message: `Take (${r}, ${c}) at distance ${d}.`, snapshot: snap({ seen: [...seen] }) })
    for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nr = r + dr, nc = c + dc
      if (nr >= 0 && nr < m && nc >= 0 && nc < n && grid[nr][nc] !== 'X' && !seen.has(`${nr},${nc}`)) {
        seen.add(`${nr},${nc}`)
        queue.push([nr, nc, d + 1])
      }
    }
  }
  if (result === -1) frames.push({ phase: 'done', activeLine: 11, cell: null, distance: null, result, message: 'No food can be reached.', snapshot: snap({ seen: [...seen] }) })
  else frames.push({ phase: 'done', activeLine: 4, cell: null, distance: result, result, message: `Nearest food is ${result} steps away.`, snapshot: snap({ seen: [...seen] }) })
  return { input: grid, result, frames }
}
