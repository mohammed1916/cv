const ERROR = 'Enter {"grid":[[...],...]} as a square of 2 to 6 rows and columns with 0 for empty and 1 for a thief, and at least one thief.'

export function parseInput(text) {
  const value = JSON.parse(text)
  if (!value || typeof value !== 'object' || !Array.isArray(value.grid)) throw new Error(ERROR)
  const { grid } = value
  const n = grid.length
  if (n < 2 || n > 6) throw new Error(ERROR)
  const ok = grid.every(row => Array.isArray(row) && row.length === n && row.every(v => v === 0 || v === 1))
  if (!ok || !grid.some(row => row.includes(1))) throw new Error(ERROR)
  return { grid }
}

export const code = `find the largest safeness that some path from top-left to bottom-right keeps
dist = distance from each cell to its nearest thief, by multi-source BFS
best[r][c] = -1 for every cell, and best[0][0] = dist[0][0]
heap = [(dist[0][0], 0, 0)] ordered by largest safeness
while the heap is not empty
  pop (s, r, c) with the largest s
  if (r, c) is the bottom-right cell then return s
  if s < best[r][c] then continue
  for each neighbour (nr, nc)
    candidate = the smaller of s and dist[nr][nc]
    if candidate > best[nr][nc] then record it and push it
return best[n-1][n-1]`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

const MOVES = [[1, 0], [-1, 0], [0, 1], [0, -1]]

export function buildTrace({ grid }) {
  const n = grid.length
  const dist = Array.from({ length: n }, () => new Array(n).fill(-1))
  const queue = []
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (grid[r][c] === 1) { dist[r][c] = 0; queue.push([r, c]) }
  const frames = [{ phase: 'bfs', activeLine: L('multi-source BFS'), cell: null, dist: dist.map(row => [...row]), best: null, message: 'Spread outward from every thief at once. Each cell records how many steps it is from the nearest thief.' }]
  for (let head = 0; head < queue.length; head++) {
    const [r, c] = queue[head]
    for (const [dr, dc] of MOVES) {
      const nr = r + dr, nc = c + dc
      if (nr >= 0 && nc >= 0 && nr < n && nc < n && dist[nr][nc] === -1) { dist[nr][nc] = dist[r][c] + 1; queue.push([nr, nc]) }
    }
    frames.push({ phase: 'bfs', activeLine: L('multi-source BFS'), cell: [r, c], dist: dist.map(row => [...row]), best: null, message: `BFS reaches cell (${r}, ${c}) and gives its neighbours the next distance.` })
  }
  const best = Array.from({ length: n }, () => new Array(n).fill(-1))
  best[0][0] = dist[0][0]
  const heap = [[dist[0][0], 0, 0]]
  let result = -1
  const popLargest = () => { let k = 0; for (let i = 1; i < heap.length; i++) if (heap[i][0] > heap[k][0]) k = i; return heap.splice(k, 1)[0] }
  while (heap.length) {
    const [s, r, c] = popLargest()
    if (r === n - 1 && c === n - 1) {
      result = s
      frames.push({ phase: 'done', activeLine: L('if (r, c) is the bottom-right cell'), cell: [r, c], dist: dist.map(row => [...row]), best: best.map(row => [...row]), message: `The bottom-right cell is reached with safeness ${s}, the largest possible.` })
      break
    }
    if (s < best[r][c]) continue
    frames.push({ phase: 'search', activeLine: L('pop (s, r, c)'), cell: [r, c], dist: dist.map(row => [...row]), best: best.map(row => [...row]), message: `Expand cell (${r}, ${c}) with safeness ${s} so far.` })
    for (const [dr, dc] of MOVES) {
      const nr = r + dr, nc = c + dc
      if (nr < 0 || nc < 0 || nr >= n || nc >= n) continue
      const candidate = Math.min(s, dist[nr][nc])
      if (candidate > best[nr][nc]) {
        best[nr][nc] = candidate
        heap.push([candidate, nr, nc])
        frames.push({ phase: 'search', activeLine: L('if candidate > best'), cell: [nr, nc], dist: dist.map(row => [...row]), best: best.map(row => [...row]), message: `Reach (${nr}, ${nc}) with safeness ${candidate}, the smaller of ${s} and its distance ${dist[nr][nc]}.` })
      }
    }
  }
  return { input: { grid }, result, frames }
}

export const python = `import heapq
from collections import deque

def maximum_safeness(grid):
    n = len(grid)
    dist = [[-1] * n for _ in range(n)]
    queue = deque()
    for r in range(n):
        for c in range(n):
            if grid[r][c] == 1:
                dist[r][c] = 0
                queue.append((r, c))
    while queue:
        r, c = queue.popleft()
        for nr, nc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
            if 0 <= nr < n and 0 <= nc < n and dist[nr][nc] == -1:
                dist[nr][nc] = dist[r][c] + 1
                queue.append((nr, nc))
    best = [[-1] * n for _ in range(n)]
    best[0][0] = dist[0][0]
    heap = [(-dist[0][0], 0, 0)]
    while heap:
        neg, r, c = heapq.heappop(heap)
        s = -neg
        if (r, c) == (n - 1, n - 1):
            return s
        if s < best[r][c]:
            continue
        for nr, nc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
            if 0 <= nr < n and 0 <= nc < n:
                candidate = min(s, dist[nr][nc])
                if candidate > best[nr][nc]:
                    best[nr][nc] = candidate
                    heapq.heappush(heap, (-candidate, nr, nc))
    return best[n - 1][n - 1]
`
