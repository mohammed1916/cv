export const phases = [
  { id: 'start', label: 'Start', description: 'Begin at the top-left cell. A street only connects to a neighbour that has a street back.' },
  { id: 'pop', label: 'Visit cell', description: 'Take the next cell from the queue and look at the directions its street opens to.' },
  { id: 'move', label: 'Try a direction', description: 'Move into the neighbour when this street leaves toward it and that neighbour has a street back.' },
  { id: 'blocked', label: 'Blocked', description: 'The neighbour is outside the grid, already seen, or does not connect back.' },
  { id: 'found', label: 'Destination reached', description: 'The bottom-right cell was reached through connected streets.' },
  { id: 'done', label: 'Complete', description: 'Return whether the destination can be reached.' },
]

export const examples = [
  { label: 'Two streets connect', input: '{"grid":[[2,4,3],[6,5,2]]}' },
  { label: 'Dead end', input: '{"grid":[[1,2,1],[1,2,1]]}' },
  { label: 'Single cell', input: '{"grid":[[1]]}' },
  { label: "Single cell", input: "{\"grid\":[[1]]}" },
  { label: "Dead end, no path", input: "{\"grid\":[[1,1],[1,1]]}" },
  { label: "Largest grid, eight by eight", input: "{\"grid\":[[6,6,6,6,6,6,6,6],[6,6,6,6,6,6,6,6],[6,6,6,6,6,6,6,6],[6,6,6,6,6,6,6,6],[6,6,6,6,6,6,6,6],[6,6,6,6,6,6,6,6],[6,6,6,6,6,6,6,6],[6,6,6,6,6,6,6,6]]}" },
  { label: "Long run: 8 by 8 grid", input: "{\"grid\":[[5,3,2,1,3,5,6,1],[1,3,6,2,3,6,4,6],[5,3,5,1,5,3,5,6],[2,5,4,4,6,5,5,5],[3,6,5,2,1,4,5,3],[1,4,6,1,1,6,2,3],[4,1,4,2,1,5,5,4],[6,5,6,6,1,6,4,4]]}" },
]

// Each street type lists the directions it opens to, as [row step, column step].
const OPEN = {
  1: [[0, -1], [0, 1]], 2: [[-1, 0], [1, 0]], 3: [[0, -1], [1, 0]],
  4: [[0, 1], [1, 0]], 5: [[0, -1], [-1, 0]], 6: [[0, 1], [-1, 0]],
}

export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || !Array.isArray(data.grid)) throw new Error('Use an object with a grid of rows, such as {"grid":[[2,4,3],[6,5,2]]}.')
  const m = data.grid.length
  if (m < 1 || m > 8) throw new Error('grid must have 1 to 8 rows in this visualization.')
  const n = Array.isArray(data.grid[0]) ? data.grid[0].length : 0
  if (n < 1 || n > 8) throw new Error('grid must have 1 to 8 columns in this visualization.')
  if (data.grid.some(row => !Array.isArray(row) || row.length !== n)) throw new Error('Every row must have the same length.')
  if (data.grid.some(row => row.some(v => !Number.isInteger(v) || v < 1 || v > 6))) throw new Error('Each street type must be an integer from 1 to 6.')
  return { grid: data.grid }
}

export function buildTrace({ grid }) {
  const m = grid.length, n = grid[0].length
  const seen = new Set(['0,0'])
  const queue = [[0, 0]]
  const snap = (extra = {}) => ({ grid, queue: queue.map(([r, c]) => `${r},${c}`), seen: [...seen], ...extra })
  const frames = [{ phase: 'start', activeLine: L('const queue = [[0, 0]]'), pythonLine: P('queue = deque'), snapshot: snap({ cell: [0, 0] }),
    message: 'Start at the top-left cell and explore connected streets breadth-first.' }]
  let result = false
  while (queue.length) {
    const [r, c] = queue.shift()
    frames.push({ phase: 'pop', activeLine: L('const [r, c] = queue.shift()'), pythonLine: P('r, c = queue.popleft()'), snapshot: snap({ cell: [r, c] }),
      message: `Visit (${r}, ${c}), a street of type ${grid[r][c]}.` })
    if (r === m - 1 && c === n - 1) {
      result = true
      frames.push({ phase: 'found', activeLine: L('if (r === m - 1'), pythonLine: P('if r == m - 1'), snapshot: snap({ cell: [r, c] }),
        message: 'The bottom-right cell is reached through connected streets.' })
      break
    }
    for (const [dr, dc] of OPEN[grid[r][c]]) {
      const nr = r + dr, nc = c + dc
      const inside = nr >= 0 && nr < m && nc >= 0 && nc < n
      const back = inside && OPEN[grid[nr][nc]].some(([a, b]) => a === -dr && b === -dc)
      if (inside && back && !seen.has(`${nr},${nc}`)) {
        seen.add(`${nr},${nc}`)
        queue.push([nr, nc])
        frames.push({ phase: 'move', activeLine: L('seen.add(nr'), pythonLine: P('seen.add((nr'), snapshot: snap({ cell: [r, c], next: [nr, nc] }),
          message: `Move from (${r}, ${c}) to (${nr}, ${nc}); both streets connect.` })
      } else {
        frames.push({ phase: 'blocked', activeLine: L('if (nr < 0'), pythonLine: P('if nr < 0'), snapshot: snap({ cell: [r, c], next: [nr, nc] }),
          message: `(${r}, ${c}) cannot move to (${nr}, ${nc}): ${!inside ? 'outside the grid' : seen.has(`${nr},${nc}`) ? 'already seen' : 'the next street does not connect back'}.` })
      }
    }
  }
  frames.push({ phase: 'done', activeLine: L('return false'), pythonLine: P('return False'), snapshot: snap({ result }),
    message: `Return ${result}.`, result })
  return { input: { grid }, result, frames }
}

export const code = `const OPEN = {
  1: [[0, -1], [0, 1]], 2: [[-1, 0], [1, 0]], 3: [[0, -1], [1, 0]],
  4: [[0, 1], [1, 0]], 5: [[0, -1], [-1, 0]], 6: [[0, 1], [-1, 0]],
}
function hasValidPath(grid) {
  const m = grid.length, n = grid[0].length
  const opens = (r, c, dr, dc) => OPEN[grid[r][c]].some(([a, b]) => a === dr && b === dc)
  const seen = new Set(['0,0'])
  const queue = [[0, 0]]
  while (queue.length > 0) {
    const [r, c] = queue.shift()
    if (r === m - 1 && c === n - 1) return true
    for (const [dr, dc] of OPEN[grid[r][c]]) {
      const nr = r + dr, nc = c + dc
      if (nr < 0 || nr >= m || nc < 0 || nc >= n) continue
      if (seen.has(nr + ',' + nc) || !opens(nr, nc, -dr, -dc)) continue
      seen.add(nr + ',' + nc)
      queue.push([nr, nc])
    }
  }
  return false
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `from collections import deque

OPEN = {
    1: [(0, -1), (0, 1)], 2: [(-1, 0), (1, 0)], 3: [(0, -1), (1, 0)],
    4: [(0, 1), (1, 0)], 5: [(0, -1), (-1, 0)], 6: [(0, 1), (-1, 0)],
}

def has_valid_path(grid):
    m, n = len(grid), len(grid[0])
    def opens(r, c, dr, dc):
        return (dr, dc) in OPEN[grid[r][c]]
    seen = {(0, 0)}
    queue = deque([(0, 0)])
    while queue:
        r, c = queue.popleft()
        if r == m - 1 and c == n - 1:
            return True
        for dr, dc in OPEN[grid[r][c]]:
            nr, nc = r + dr, c + dc
            if nr < 0 or nr >= m or nc < 0 or nc >= n:
                continue
            if (nr, nc) in seen or not opens(nr, nc, -dr, -dc):
                continue
            seen.add((nr, nc))
            queue.append((nr, nc))
    return False
`
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1
