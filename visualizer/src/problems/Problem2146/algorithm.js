// LeetCode 2146: K Highest Ranked Items Within a Price Range.
// Breadth-first search from the start over non-wall cells gives each reachable cell its distance.
// Items are cells whose price lies in [low, high]. Sort them by distance, price, row, then column,
// and return the first k.

export function parseInput(text) {
  let data
  try { data = JSON.parse(text) } catch { throw new Error('Use a JSON object with grid, pricing, start and k.') }
  const { grid, pricing, start, k } = data ?? {}
  if (!Array.isArray(grid) || grid.length < 1 || grid.length > 8) throw new Error('grid has 1 to 8 rows.')
  const cols = grid[0].length
  if (!cols || cols > 8 || grid.some(row => !Array.isArray(row) || row.length !== cols || row.some(v => !Number.isInteger(v) || v < 0 || v > 9))) {
    throw new Error('Every row has the same length (at most 8); cells are 0 (wall), 1 (empty) or a price 2 to 9.')
  }
  if (!Array.isArray(pricing) || pricing.length !== 2 || !Number.isInteger(pricing[0]) || !Number.isInteger(pricing[1]) || pricing[0] < 2 || pricing[1] < pricing[0] || pricing[1] > 9) {
    throw new Error('pricing is [low, high] with 2 <= low <= high <= 9.')
  }
  if (!Array.isArray(start) || start.length !== 2 || !Number.isInteger(start[0]) || !Number.isInteger(start[1]) || start[0] < 0 || start[1] < 0 || start[0] >= grid.length || start[1] >= cols || grid[start[0]][start[1]] === 0) {
    throw new Error('start is [row, col] on a cell that is not a wall.')
  }
  if (!Number.isInteger(k) || k < 1 || k > 20) throw new Error('k is an integer from 1 to 20.')
  return { grid, pricing, start, k }
}

export const code = `function highestRankedKItems(grid, pricing, start, k) {
  const [low, high] = pricing
  const rows = grid.length
  const cols = grid[0].length
  const dist = Array.from({ length: rows }, () => new Array(cols).fill(-1))
  const queue = [start]
  dist[start[0]][start[1]] = 0
  const found = []
  for (let head = 0; head < queue.length; head++) {
    const [r, c] = queue[head]
    const price = grid[r][c]
    if (price >= low && price <= high) found.push([dist[r][c], price, r, c])
    for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nr = r + dr
      const nc = c + dc
      if (nr < 0 || nc < 0 || nr >= rows || nc >= cols) continue
      if (grid[nr][nc] === 0 || dist[nr][nc] !== -1) continue
      dist[nr][nc] = dist[r][c] + 1
      queue.push([nr, nc])
    }
  }
  found.sort((a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2] || a[3] - b[3])
  return found.slice(0, k).map(([, , r, c]) => [r, c])
}`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `# entry: highest_ranked_k_items
from collections import deque

def highest_ranked_k_items(grid, pricing, start, k):
    low, high = pricing
    rows = len(grid)
    cols = len(grid[0])
    dist = [[-1] * cols for _ in range(rows)]
    queue = deque([tuple(start)])
    dist[start[0]][start[1]] = 0
    found = []
    while queue:
        r, c = queue.popleft()
        price = grid[r][c]
        if low <= price <= high:
            found.append((dist[r][c], price, r, c))
        for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nr = r + dr
            nc = c + dc
            if nr < 0 or nc < 0 or nr >= rows or nc >= cols:
                continue
            if grid[nr][nc] == 0 or dist[nr][nc] != -1:
                continue
            dist[nr][nc] = dist[r][c] + 1
            queue.append((nr, nc))
    found.sort()
    return [[r, c] for _, _, r, c in found[:k]]
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
  { id: 'start', label: 'Start', description: 'Begin at the start cell with distance 0.' },
  { id: 'visit', label: 'Expand', description: 'Visit the next cell in the queue and look at its neighbours.' },
  { id: 'item', label: 'Item found', description: 'A cell in the price range is a candidate, with its distance.' },
  { id: 'rank', label: 'Rank', description: 'Sort candidates by distance, then price, then row, then column.' },
  { id: 'done', label: 'Result', description: 'The first k candidates.' },
]

export function buildTrace({ grid, pricing, start, k }) {
  const frames = []
  const [low, high] = pricing
  const rows = grid.length
  const cols = grid[0].length
  const dist = Array.from({ length: rows }, () => new Array(cols).fill(-1))
  const queue = [start]
  dist[start[0]][start[1]] = 0
  const found = []
  const seen = () => queue.map(([r, c]) => [r, c])
  frames.push({ phase: 'start', activeLine: L('const queue = [start]'), pythonLine: P('queue = deque'), message: `Start at (${start[0]}, ${start[1]}).`, current: start, frontier: seen(), visited: seen(), dist: dist.map(r => [...r]), found: [], result: null })
  for (let head = 0; head < queue.length; head++) {
    const [r, c] = queue[head]
    const price = grid[r][c]
    if (price >= low && price <= high) {
      found.push([dist[r][c], price, r, c])
      frames.push({ phase: 'item', activeLine: L('found.push'), pythonLine: P('found.append'), message: `(${r}, ${c}) is an item priced ${price} at distance ${dist[r][c]}.`, current: [r, c], frontier: queue.slice(head + 1).map(([x, y]) => [x, y]), visited: seen(), dist: dist.map(x => [...x]), found: found.map(f => [...f]), result: null })
    } else {
      frames.push({ phase: 'visit', activeLine: L('const [r, c] = queue[head]'), pythonLine: P('r, c = queue.popleft()'), message: `Visit (${r}, ${c}) at distance ${dist[r][c]}.`, current: [r, c], frontier: queue.slice(head + 1).map(([x, y]) => [x, y]), visited: seen(), dist: dist.map(x => [...x]), found: found.map(f => [...f]), result: null })
    }
    for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nr = r + dr
      const nc = c + dc
      if (nr < 0 || nc < 0 || nr >= rows || nc >= cols) continue
      if (grid[nr][nc] === 0 || dist[nr][nc] !== -1) continue
      dist[nr][nc] = dist[r][c] + 1
      queue.push([nr, nc])
    }
  }
  found.sort((a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2] || a[3] - b[3])
  const result = found.slice(0, k).map(([, , r, c]) => [r, c])
  frames.push({ phase: 'rank', activeLine: L('found.sort'), pythonLine: P('found.sort()'), message: `Sorted ${found.length} candidates; keeping the first ${k}.`, current: null, frontier: [], visited: seen(), dist: dist.map(x => [...x]), found: found.map(f => [...f]), result: null })
  frames.push({ phase: 'done', activeLine: L('return found.slice'), pythonLine: P('return [[r, c]'), message: `Answer: ${result.map(([r, c]) => `(${r}, ${c})`).join(', ') || 'none'}.`, current: null, frontier: [], visited: seen(), dist: dist.map(x => [...x]), found: found.map(f => [...f]), result, done: result })
  return { input: { grid, pricing, start, k }, result, frames }
}
