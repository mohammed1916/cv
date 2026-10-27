const ERROR = 'Enter {"grid":[[...],...]} with 2 to 5 rows and 2 to 5 columns of integers from 0 to 12, where grid[0][0] is 0. A cell value is the earliest second you may stand in that cell.'

export function parseInput(text) {
  const value = JSON.parse(text)
  if (!value || typeof value !== 'object' || !Array.isArray(value.grid)) throw new Error(ERROR)
  const { grid } = value
  if (grid.length < 2 || grid.length > 5 || !Array.isArray(grid[0])) throw new Error(ERROR)
  const cols = grid[0].length
  if (cols < 2 || cols > 5) throw new Error(ERROR)
  const ok = grid.every(row => Array.isArray(row) && row.length === cols && row.every(v => Number.isInteger(v) && v >= 0 && v <= 12))
  if (!ok || grid[0][0] !== 0) throw new Error(ERROR)
  return { grid }
}

export const code = `minimum time to reach the bottom-right cell, or -1
if grid[0][1] > 1 and grid[1][0] > 1 then return -1
best[r][c] = infinity for every cell, and best[0][0] = 0
heap = [(0, 0, 0)] holding (time, row, column)
while the heap is not empty
  pop (t, r, c) with the smallest time
  if (r, c) is the bottom-right cell then return t
  if t > best[r][c] then continue
  for each neighbour (nr, nc)
    arrive = t + 1
    if arrive < grid[nr][nc] then wait: arrive = grid[nr][nc], or one more second if its parity does not match nr + nc
    if arrive < best[nr][nc] then record it and push it
return -1`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export function buildTrace({ grid }) {
  const rows = grid.length, cols = grid[0].length
  const target = [rows - 1, cols - 1]
  const best = Array.from({ length: rows }, () => new Array(cols).fill(Infinity))
  best[0][0] = 0
  const heap = [[0, 0, 0]]
  const frames = [{ phase: 'start', activeLine: L('best[r][c] = infinity'), cell: [0, 0], time: 0, best: best.map(r => [...r]), message: 'Start at the top-left at second 0. A cell can be entered only at or after its value, and only at a time with the right parity for its position.' }]
  if (grid[0][1] > 1 && grid[1][0] > 1) {
    frames.push({ phase: 'done', activeLine: L('return -1'), cell: null, time: -1, best: best.map(r => [...r]), message: 'Both first moves need a second that is too early, so no move is possible: return -1.' })
    return { input: { grid }, result: -1, frames }
  }
  const pop = () => { let k = 0; for (let i = 1; i < heap.length; i++) if (heap[i][0] < heap[k][0]) k = i; return heap.splice(k, 1)[0] }
  let result = -1
  while (heap.length) {
    const [t, r, c] = pop()
    if (r === target[0] && c === target[1]) {
      result = t
      frames.push({ phase: 'done', activeLine: L('if (r, c) is the bottom-right cell'), cell: [r, c], time: t, best: best.map(row => [...row]), message: `Reached the bottom-right cell at second ${t}.` })
      break
    }
    if (t > best[r][c]) continue
    frames.push({ phase: 'pop', activeLine: L('pop (t, r, c)'), cell: [r, c], time: t, best: best.map(row => [...row]), message: `Expand cell (${r}, ${c}) reached at second ${t}.` })
    for (const [nr, nc] of [[r + 1, c], [r - 1, c], [r, c + 1], [r, c - 1]]) {
      if (nr < 0 || nc < 0 || nr >= rows || nc >= cols) continue
      let arrive = t + 1
      const need = grid[nr][nc]
      let waited = false
      if (arrive < need) {
        arrive = (need + nr + nc) % 2 === 0 ? need : need + 1
        waited = true
      }
      if (arrive < best[nr][nc]) {
        best[nr][nc] = arrive
        heap.push([arrive, nr, nc])
        frames.push({ phase: 'push', activeLine: L('if arrive < best[nr][nc]'), cell: [nr, nc], time: arrive, best: best.map(row => [...row]), message: `Move to (${nr}, ${nc}) at second ${arrive}${waited ? `, bouncing until its opening time ${need} with the right parity` : ''}.` })
      }
    }
  }
  if (result === -1) frames.push({ phase: 'done', activeLine: L('return -1'), cell: null, time: -1, best: best.map(r => [...r]), message: 'The bottom-right cell cannot be reached: return -1.' })
  return { input: { grid }, result, frames }
}

export const python = `import heapq

def minimum_time(grid):
    rows = len(grid)
    cols = len(grid[0])
    target = (rows - 1, cols - 1)
    if grid[0][1] > 1 and grid[1][0] > 1:
        return -1
    best = [[float('inf')] * cols for _ in range(rows)]
    best[0][0] = 0
    heap = [(0, 0, 0)]
    while heap:
        t, r, c = heapq.heappop(heap)
        if (r, c) == target:
            return t
        if t > best[r][c]:
            continue
        for nr, nc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
            if 0 <= nr < rows and 0 <= nc < cols:
                arrive = t + 1
                if arrive < grid[nr][nc]:
                    arrive = grid[nr][nc] if (grid[nr][nc] + nr + nc) % 2 == 0 else grid[nr][nc] + 1
                if arrive < best[nr][nc]:
                    best[nr][nc] = arrive
                    heapq.heappush(heap, (arrive, nr, nc))
    return -1
`
