const ERROR = 'Enter {"heights":[[...],...]} with 1 to 5 rows and 1 to 5 columns of integers from 1 to 9.'

export function parseInput(text) {
  const value = JSON.parse(text)
  if (!value || typeof value !== 'object' || !Array.isArray(value.heights)) throw new Error(ERROR)
  const { heights } = value
  if (heights.length < 1 || heights.length > 5 || !Array.isArray(heights[0])) throw new Error(ERROR)
  const cols = heights[0].length
  if (cols < 1 || cols > 5) throw new Error(ERROR)
  if (!heights.every(row => Array.isArray(row) && row.length === cols && row.every(v => Number.isInteger(v) && v >= 1 && v <= 9))) throw new Error(ERROR)
  return { heights }
}

export const code = `minimum effort to walk from the top-left cell to the bottom-right cell
effort[r][c] = infinity for every cell, and effort[0][0] = 0
heap = [(0, 0, 0)] ordered by effort
while the heap is not empty
  pop (e, r, c) with the smallest e
  if e > effort[r][c] then continue
  if (r, c) is the bottom-right cell then return e
  for each neighbour (nr, nc)
    step = the larger of e and |heights[nr][nc] - heights[r][c]|
    if step < effort[nr][nc] then record it and push it
return effort of the bottom-right cell`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export function buildTrace({ heights }) {
  const rows = heights.length, cols = heights[0].length
  const effort = Array.from({ length: rows }, () => new Array(cols).fill(Infinity))
  effort[0][0] = 0
  const heap = [[0, 0, 0]]
  const frames = [{ phase: 'start', activeLine: L('effort[r][c] = infinity'), cell: [0, 0], value: 0, matrix: effort.map(r => [...r]), message: 'Each move costs the height difference between cells. A path’s effort is its largest single step, so the goal is to keep every step small.' }]
  let result = 0
  const popSmallest = () => { let k = 0; for (let i = 1; i < heap.length; i++) if (heap[i][0] < heap[k][0]) k = i; return heap.splice(k, 1)[0] }
  while (heap.length) {
    const [e, r, c] = popSmallest()
    if (e > effort[r][c]) continue
    if (r === rows - 1 && c === cols - 1) {
      result = e
      frames.push({ phase: 'done', activeLine: L('if (r, c) is the bottom-right cell'), cell: [r, c], value: e, matrix: effort.map(row => [...row]), message: `Reached the bottom-right cell with effort ${e}.` })
      break
    }
    frames.push({ phase: 'settle', activeLine: L('pop (e, r, c)'), cell: [r, c], value: e, matrix: effort.map(row => [...row]), message: `Expand cell (${r}, ${c}) with effort ${e} so far.` })
    for (const [nr, nc] of [[r + 1, c], [r - 1, c], [r, c + 1], [r, c - 1]]) {
      if (nr < 0 || nc < 0 || nr >= rows || nc >= cols) continue
      const step = Math.max(e, Math.abs(heights[nr][nc] - heights[r][c]))
      if (step < effort[nr][nc]) {
        effort[nr][nc] = step
        heap.push([step, nr, nc])
        frames.push({ phase: 'relax', activeLine: L('if step < effort[nr][nc]'), cell: [nr, nc], value: step, matrix: effort.map(row => [...row]), message: `Step to (${nr}, ${nc}): height ${heights[r][c]} to ${heights[nr][nc]}, so the path effort becomes ${step}.` })
      }
    }
  }
  return { input: { heights }, result, frames }
}

export const python = `import heapq

def minimum_effort_path(heights):
    rows = len(heights)
    cols = len(heights[0])
    effort = [[float('inf')] * cols for _ in range(rows)]
    effort[0][0] = 0
    heap = [(0, 0, 0)]
    while heap:
        e, r, c = heapq.heappop(heap)
        if e > effort[r][c]:
            continue
        if (r, c) == (rows - 1, cols - 1):
            return e
        for nr, nc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
            if 0 <= nr < rows and 0 <= nc < cols:
                step = max(e, abs(heights[nr][nc] - heights[r][c]))
                if step < effort[nr][nc]:
                    effort[nr][nc] = step
                    heapq.heappush(heap, (step, nr, nc))
    return effort[rows - 1][cols - 1]
`
