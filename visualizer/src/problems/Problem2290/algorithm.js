import { dequeLabels } from '../../components/shared/distanceMatrixModel.js'

const DIRS = [[0, 1], [0, -1], [1, 0], [-1, 0]]

export function parseInput(text) {
  const grid = JSON.parse(text)
  const err = 'Enter a grid as a JSON array of rows: 1 to 6 rows of equal length (1 to 6 columns), every cell 0 (empty) or 1 (obstacle), with the top-left and bottom-right cells empty.'
  if (!Array.isArray(grid) || grid.length < 1 || grid.length > 6) throw new Error(err)
  const width = Array.isArray(grid[0]) ? grid[0].length : 0
  if (width < 1 || width > 6) throw new Error(err)
  if (!grid.every(row => Array.isArray(row) && row.length === width && row.every(v => v === 0 || v === 1))) throw new Error(err)
  if (grid[0][0] !== 0 || grid.at(-1)[width - 1] !== 0) throw new Error(err)
  return grid
}

export function buildTrace(grid) {
  const m = grid.length
  const n = grid[0].length
  const dist = Array.from({ length: m }, () => Array(n).fill(Infinity))
  dist[0][0] = 0
  const deque = [[0, 0]]
  const snapshot = () => dist.map(row => [...row])
  const frames = [{ phase: 'start', activeLine: L('set dist'), cell: [0, 0], matrix: snapshot(), queue: dequeLabels(deque, dist), message: 'Start at the top-left cell with 0 obstacles removed. Stepping onto an empty cell costs 0; stepping onto an obstacle costs 1.' }]
  while (deque.length) {
    const [r, c] = deque.shift()
    frames.push({ phase: 'pop', activeLine: L('remove the front cell'), cell: [r, c], matrix: snapshot(), queue: dequeLabels(deque, dist), message: `Take (${r}, ${c}) from the front; obstacles removed to reach it: ${dist[r][c]}.` })
    for (const [dr, dc] of DIRS) {
      const nr = r + dr
      const nc = c + dc
      if (nr < 0 || nc < 0 || nr >= m || nc >= n) continue
      const cost = grid[nr][nc]
      if (dist[r][c] + cost < dist[nr][nc]) {
        dist[nr][nc] = dist[r][c] + cost
        if (cost === 0) deque.unshift([nr, nc]); else deque.push([nr, nc])
        frames.push({ phase: 'relax', activeLine: L(cost === 0 ? 'if cost is 0 then' : 'otherwise put'), cell: [nr, nc], matrix: snapshot(), queue: dequeLabels(deque, dist), message: `Step to (${nr}, ${nc}) ${cost === 0 ? '(empty, cost 0)' : '(obstacle, cost 1)'}: new count ${dist[nr][nc]}, added to the ${cost === 0 ? 'front' : 'back'}.` })
      }
    }
  }
  const result = dist[m - 1][n - 1]
  frames.push({ phase: 'done', activeLine: L('return dist'), cell: [m - 1, n - 1], matrix: snapshot(), queue: [], message: `Fewest obstacles to remove: ${result}.` })
  return { input: grid, result, frames }
}

export const code = `minimum obstacles to remove to reach the bottom-right cell
  set dist to infinity for every cell, and dist[0][0] to 0
  put cell (0, 0) into a deque
  while the deque is not empty
    remove the front cell (r, c)
    for each direction with step (dr, dc)
      let (nr, nc) be the neighbour of (r, c) in that direction
      if (nr, nc) is outside the grid then continue
      cost is 1 if (nr, nc) is an obstacle, otherwise 0
      if dist[r][c] + cost < dist[nr][nc] then
        set dist[nr][nc] to dist[r][c] + cost
        if cost is 0 then put (nr, nc) at the front
        otherwise put (nr, nc) at the back
  return dist[m-1][n-1]`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `from collections import deque

def min_obstacle_removal(grid):
    m, n = len(grid), len(grid[0])
    dirs = [(0, 1), (0, -1), (1, 0), (-1, 0)]
    dist = [[float('inf')] * n for _ in range(m)]
    dist[0][0] = 0
    dq = deque([(0, 0)])
    while dq:
        r, c = dq.popleft()
        for dr, dc in dirs:
            nr, nc = r + dr, c + dc
            if nr < 0 or nc < 0 or nr >= m or nc >= n:
                continue
            cost = grid[nr][nc]
            if dist[r][c] + cost < dist[nr][nc]:
                dist[nr][nc] = dist[r][c] + cost
                if cost == 0:
                    dq.appendleft((nr, nc))
                else:
                    dq.append((nr, nc))
    return dist[m - 1][n - 1]
`
