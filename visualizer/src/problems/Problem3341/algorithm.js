const ERROR = 'Enter {"move_time":[[...],...]} with 2 to 5 rows and 2 to 5 columns of whole numbers from 0 to 9. move_time[r][c] is the first second you may start moving into room (r, c).'

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

export const code = `minimum time to reach the bottom-right room, starting at the top-left room at time 0
arrive[r][c] = infinity for every room, and arrive[0][0] = 0
heap = [(0, 0, 0)] ordered by time
while the heap is not empty
  pop (t, r, c) with the smallest t
  if t > arrive[r][c] then continue
  if (r, c) is the bottom-right room then return t
  for each neighbouring room (nr, nc)
    start = the later of t and move_time[nr][nc]
    time = start + 1
    if time < arrive[nr][nc] then record it and push it
return arrive of the bottom-right room`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export function buildTrace({ move_time: moveTime }) {
  const rows = moveTime.length, cols = moveTime[0].length
  const arrive = Array.from({ length: rows }, () => new Array(cols).fill(Infinity))
  arrive[0][0] = 0
  const heap = [[0, 0, 0]]
  const frames = [{ phase: 'start', activeLine: L('arrive[r][c] = infinity'), cell: [0, 0], time: 0, matrix: arrive.map(r => [...r]), message: 'Start in the top-left room at time 0. Entering a room must wait until its opening time, then costs one second.' }]
  let result = -1
  const popSmallest = () => { let k = 0; for (let i = 1; i < heap.length; i++) if (heap[i][0] < heap[k][0]) k = i; return heap.splice(k, 1)[0] }
  while (heap.length) {
    const [t, r, c] = popSmallest()
    if (t > arrive[r][c]) continue
    if (r === rows - 1 && c === cols - 1) {
      result = t
      frames.push({ phase: 'done', activeLine: L('if (r, c) is the bottom-right room'), cell: [r, c], time: t, matrix: arrive.map(row => [...row]), message: `The bottom-right room is reached at time ${t}.` })
      break
    }
    frames.push({ phase: 'settle', activeLine: L('pop (t, r, c)'), cell: [r, c], time: t, matrix: arrive.map(row => [...row]), message: `Leave room (${r}, ${c}), reached at time ${t}.` })
    for (const [nr, nc] of [[r + 1, c], [r - 1, c], [r, c + 1], [r, c - 1]]) {
      if (nr < 0 || nc < 0 || nr >= rows || nc >= cols) continue
      const start = Math.max(t, moveTime[nr][nc])
      const time = start + 1
      if (time < arrive[nr][nc]) {
        arrive[nr][nc] = time
        heap.push([time, nr, nc])
        frames.push({ phase: 'relax', activeLine: L('if time < arrive[nr][nc]'), cell: [nr, nc], time, matrix: arrive.map(row => [...row]), message: `Room (${nr}, ${nc}) opens at ${moveTime[nr][nc]}, so entering starts at ${start} and arrives at ${time}.` })
      }
    }
  }
  return { input: { move_time: moveTime }, result, frames }
}

export const python = `import heapq

def minimum_time_to_last_room(move_time):
    rows = len(move_time)
    cols = len(move_time[0])
    arrive = [[float('inf')] * cols for _ in range(rows)]
    arrive[0][0] = 0
    heap = [(0, 0, 0)]
    while heap:
        t, r, c = heapq.heappop(heap)
        if t > arrive[r][c]:
            continue
        if (r, c) == (rows - 1, cols - 1):
            return t
        for nr, nc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
            if 0 <= nr < rows and 0 <= nc < cols:
                start = max(t, move_time[nr][nc])
                time = start + 1
                if time < arrive[nr][nc]:
                    arrive[nr][nc] = time
                    heapq.heappush(heap, (time, nr, nc))
    return arrive[rows - 1][cols - 1]
`
