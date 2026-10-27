const ERROR = 'Enter {"move_time":[[...],...]} with 2 to 5 rows and 2 to 5 columns of whole numbers from 0 to 9. move_time[r][c] is the first second you may start moving into room (r, c). Moves alternate between 1 and 2 seconds, starting with 1.'

export function parseInput(text) {
  const value = JSON.parse(text)
  if (!value || typeof value !== 'object' || !Array.isArray(value.move_time)) throw new Error(ERROR)
  const grid = value.move_time
  if (grid.length < 2 || grid.length > 5 || !Array.isArray(grid[0])) throw new Error(ERROR)
  const cols = grid[0].length
  if (cols < 2 || cols > 5) throw new Error(ERROR)
  if (!grid.every(row => Array.isArray(row) && row.length === cols && row.every(v => Number.isInteger(v) && v >= 0 && v <= 9))) throw new Error(ERROR)
  return { move_time: grid }
}

export const code = `minimum time to reach the bottom-right room; moves alternate 1 second, 2 seconds, starting with 1
arrive[r][c][k] = infinity, where k = 0 means the next move takes 1 second and k = 1 means 2 seconds
arrive[0][0][0] = 0
heap = [(0, 0, 0, 0)] ordered by time
while the heap is not empty
  pop (t, r, c, k) with the smallest t
  if t > arrive[r][c][k] then continue
  if (r, c) is the bottom-right room then return t
  cost = 1 if k = 0, otherwise 2
  for each neighbouring room (nr, nc)
    start = the later of t and move_time[nr][nc]
    time = start + cost
    if time < arrive[nr][nc][1 - k] then record it and push it
return the smaller of the two arrive values of the bottom-right room`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export function buildTrace({ move_time: moveTime }) {
  const rows = moveTime.length, cols = moveTime[0].length
  const arrive = Array.from({ length: rows }, () => Array.from({ length: cols }, () => [Infinity, Infinity]))
  arrive[0][0][0] = 0
  const heap = [[0, 0, 0, 0]]
  const view = () => arrive.map(row => row.map(([a, b]) => Math.min(a, b)))
  const frames = [{ phase: 'start', activeLine: L('arrive[0][0][0] = 0'), cell: [0, 0], time: 0, next: 1, matrix: view(), message: 'Start in the top-left room at time 0. The first move takes 1 second, the next takes 2, and so on.' }]
  let result = -1
  const popSmallest = () => { let k = 0; for (let i = 1; i < heap.length; i++) if (heap[i][0] < heap[k][0]) k = i; return heap.splice(k, 1)[0] }
  while (heap.length) {
    const [t, r, c, k] = popSmallest()
    if (t > arrive[r][c][k]) continue
    if (r === rows - 1 && c === cols - 1) {
      result = t
      frames.push({ phase: 'done', activeLine: L('if (r, c) is the bottom-right room'), cell: [r, c], time: t, next: k === 0 ? 1 : 2, matrix: view(), message: `The bottom-right room is reached at time ${t}.` })
      break
    }
    const cost = k === 0 ? 1 : 2
    frames.push({ phase: 'settle', activeLine: L('pop (t, r, c, k)'), cell: [r, c], time: t, next: cost, matrix: view(), message: `Leave room (${r}, ${c}) at time ${t}; the next move takes ${cost} second(s).` })
    for (const [nr, nc] of [[r + 1, c], [r - 1, c], [r, c + 1], [r, c - 1]]) {
      if (nr < 0 || nc < 0 || nr >= rows || nc >= cols) continue
      const start = Math.max(t, moveTime[nr][nc])
      const time = start + cost
      if (time < arrive[nr][nc][1 - k]) {
        arrive[nr][nc][1 - k] = time
        heap.push([time, nr, nc, 1 - k])
        frames.push({ phase: 'relax', activeLine: L('if time < arrive[nr][nc][1 - k]'), cell: [nr, nc], time, next: 3 - cost, matrix: view(), message: `Room (${nr}, ${nc}) opens at ${moveTime[nr][nc]}, so the move starts at ${start} and arrives at ${time}.` })
      }
    }
  }
  return { input: { move_time: moveTime }, result, frames }
}

export const python = `import heapq

def minimum_time_alternating(move_time):
    rows = len(move_time)
    cols = len(move_time[0])
    inf = float('inf')
    arrive = [[[inf, inf] for _ in range(cols)] for _ in range(rows)]
    arrive[0][0][0] = 0
    heap = [(0, 0, 0, 0)]
    while heap:
        t, r, c, k = heapq.heappop(heap)
        if t > arrive[r][c][k]:
            continue
        if (r, c) == (rows - 1, cols - 1):
            return t
        cost = 1 if k == 0 else 2
        for nr, nc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
            if 0 <= nr < rows and 0 <= nc < cols:
                time = max(t, move_time[nr][nc]) + cost
                if time < arrive[nr][nc][1 - k]:
                    arrive[nr][nc][1 - k] = time
                    heapq.heappush(heap, (time, nr, nc, 1 - k))
    return min(arrive[rows - 1][cols - 1])
`
