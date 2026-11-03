export const phases = [
  { id: 'start', label: 'Start', description: 'Every land cell is a source at distance 0, and all water cells are unvisited.' },
  { id: 'inspect', label: 'Pop cell', description: 'Take the oldest cell from the queue and look at its four neighbours.' },
  { id: 'update', label: 'Reach water', description: 'An unvisited water neighbour receives one more than the current distance.' },
  { id: 'done', label: 'Result', description: 'The largest distance reached by a water cell is the answer.' },
]

const SOURCE = [
  ['head', 'function farthest_water(grid):', 'def farthest_water(grid):'],
  ['check', '  if the grid has no land or no water: return -1', '    if no land or no water: return -1'],
  ['init', '  queue = all land cells; dist = 0 there, -1 elsewhere', '    queue = deque(land); dist = [[-1] * n for _ in range(n)]'],
  ['loop', '  while queue is not empty:', '    while queue:'],
  ['pop', '    (r, c) = queue.pop_front()', '        r, c = queue.popleft()'],
  ['nb', '    for each neighbour (nr, nc) inside the grid:', '        for nr, nc in neighbours(r, c):'],
  ['set', '      if dist[nr][nc] == -1: dist[nr][nc] = dist[r][c] + 1; queue.push(nr, nc)', '            if dist[nr][nc] == -1: dist[nr][nc] = dist[r][c] + 1; queue.append((nr, nc))'],
  ['ret', '  return max of dist over water cells', '    return max(dist[r][c] for water cells)'],
]
export const code = SOURCE.map(row => row[1]).join('\n')
export const python = SOURCE.map(row => row[2]).join('\n')
export const pythonLineMap = Object.fromEntries(SOURCE.map((_, index) => [index + 1, index + 1]))
const L = Object.fromEntries(SOURCE.map((row, index) => [row[0], index + 1]))

export function parseInput(text) {
  let grid
  try { grid = JSON.parse(text) } catch { throw new Error('Enter the grid as a JSON array of rows, e.g. [[1,0],[0,0]].') }
  if (!Array.isArray(grid) || grid.length < 1 || grid.length > 6) throw new Error('Use a square grid of 1 to 6 rows.')
  const n = grid.length
  if (!grid.every(row => Array.isArray(row) && row.length === n && row.every(v => v === 0 || v === 1))) throw new Error('Every row must have the same length as the grid, with only 0 or 1 entries.')
  return grid
}

export function buildTrace(grid) {
  const n = grid.length
  const frames = []
  const dist = Array.from({ length: n }, () => Array(n).fill(-1))
  const queue = []
  let landCount = 0, waterCount = 0
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
    if (grid[r][c] === 1) { dist[r][c] = 0; queue.push([r, c]); landCount++ } else waterCount++
  }
  const snap = (extra = {}) => ({ grid, dist: dist.map(row => [...row]), current: null, queue: queue.map(q => [...q]), reached: [], best: null, ...extra })
  if (landCount === 0 || waterCount === 0) {
    frames.push({ phase: 'start', activeLine: L.check, message: landCount === 0 ? 'There is no land, so no water cell has a distance. The answer is -1.' : 'There is no water, so the answer is -1.', snapshot: snap() })
    frames.push({ phase: 'done', activeLine: L.ret, message: 'Answer: -1.', snapshot: snap() })
    return { input: grid, result: -1, frames }
  }
  frames.push({ phase: 'start', activeLine: L.init, message: `All ${landCount} land cells start the queue together at distance 0.`, snapshot: snap() })

  let head = 0
  let best = 0
  let bestCell = null
  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]]
  while (head < queue.length) {
    const [r, c] = queue[head++]
    frames.push({ phase: 'inspect', activeLine: L.pop, message: `Pop (${r},${c}) at distance ${dist[r][c]}. Look at its neighbours.`, snapshot: snap({ current: [r, c], queue: queue.slice(head).map(q => [...q]) }) })
    const reached = []
    for (const [dr, dc] of dirs) {
      const nr = r + dr, nc = c + dc
      if (nr < 0 || nc < 0 || nr >= n || nc >= n) continue
      if (dist[nr][nc] !== -1) continue
      dist[nr][nc] = dist[r][c] + 1
      queue.push([nr, nc])
      reached.push([nr, nc])
      if (dist[nr][nc] > best) { best = dist[nr][nc]; bestCell = [nr, nc] }
      frames.push({
        phase: 'update', activeLine: L.set,
        message: `Water cell (${nr},${nc}) is reached first from (${r},${c}), so its distance is ${dist[nr][nc]}.`,
        snapshot: snap({ current: [r, c], queue: queue.slice(head).map(q => [...q]), reached: [...reached], best: bestCell }),
      })
    }
  }
  frames.push({ phase: 'done', activeLine: L.ret, message: `The farthest water cell is at distance ${best}.`, snapshot: snap({ best: bestCell }) })
  return { input: grid, result: best, frames }
}
