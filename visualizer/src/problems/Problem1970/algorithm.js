// LeetCode 1970: a crossing exists on a given day when land connects the top row to the bottom row. Binary search the largest day with a crossing, checking each day with a breadth-first search.
const SOURCE = [
  "function latestDayToCross(row, col, cells) {",
  "  // canCross(day): flood the first day cells, then breadth-first search the land from the top row",
  "  let lo = 0, hi = cells.length",
  "  while (lo < hi) {",
  "    const mid = Math.floor((lo + hi + 1) / 2)",
  "    if (canCross(mid)) lo = mid",
  "    else hi = mid - 1",
  "  }",
  "  return lo",
  "}",
]

export const code = SOURCE.map((text, index) => ({ line: index + 1, text }))

export const python = `from collections import deque

def latest_day_to_cross(row, col, cells):
    def can_cross(day):
        water = [[False] * col for _ in range(row)]
        for r, c in cells[:day]:
            water[r - 1][c - 1] = True
        queue = deque((0, c) for c in range(col) if not water[0][c])
        seen = [[False] * col for _ in range(row)]
        for r, c in queue:
            seen[r][c] = True
        while queue:
            r, c = queue.popleft()
            if r == row - 1:
                return True
            for nr, nc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
                if 0 <= nr < row and 0 <= nc < col and not water[nr][nc] and not seen[nr][nc]:
                    seen[nr][nc] = True
                    queue.append((nr, nc))
        return False
    lo, hi = 0, len(cells)
    while lo < hi:
        mid = (lo + hi + 1) // 2
        if can_cross(mid):
            lo = mid
        else:
            hi = mid - 1
    return lo
`

const L = text => { const i = SOURCE.findIndex(line => line.includes(text)); if (i < 0) throw new Error(`no code line: ${text}`); return i + 1 }
const P = text => { const i = python.split('\n').findIndex(line => line.includes(text)); if (i < 0) throw new Error(`no python line: ${text}`); return i + 1 }

export const phases = [
  { id: 'probe', label: 'Probe day', description: 'Test whether land still crosses on the middle day.' },
  { id: 'done', label: 'Result', description: 'Last day with a crossing.' },
]

export function parseInput(text) {
  let input
  try { input = JSON.parse(text) } catch { throw new Error('Enter JSON like {"row":3,"col":3,"cells":[[1,1],[2,2]]}.') }
  const { row, col, cells } = input || {}
  if (!Number.isInteger(row) || !Number.isInteger(col) || row < 2 || col < 2 || row > 6 || col > 6) throw new Error('row and col are integers from 2 to 6.')
  if (!Array.isArray(cells) || cells.length < 1 || cells.length > 20) throw new Error('cells holds 1 to 20 positions.')
  const seen = new Set()
  for (const cell of cells) {
    if (!Array.isArray(cell) || cell.length !== 2 || !Number.isInteger(cell[0]) || !Number.isInteger(cell[1]) || cell[0] < 1 || cell[0] > row || cell[1] < 1 || cell[1] > col) throw new Error('Each cell is [row, col] inside the grid, 1-based.')
    const key = cell.join(',')
    if (seen.has(key)) throw new Error('Cells must be distinct.')
    seen.add(key)
  }
  return { row, col, cells }
}

function crossingPath(row, col, cells, day) {
  const water = Array.from({ length: row }, () => new Array(col).fill(false))
  for (const [r, c] of cells.slice(0, day)) water[r - 1][c - 1] = true
  const seen = Array.from({ length: row }, () => new Array(col).fill(false))
  const queue = []
  for (let c = 0; c < col; c++) if (!water[0][c]) { seen[0][c] = true; queue.push([0, c]) }
  const reached = []
  let head = 0
  while (head < queue.length) {
    const [r, c] = queue[head++]
    reached.push([r, c])
    if (r === row - 1) return { ok: true, reached }
    for (const [nr, nc] of [[r + 1, c], [r - 1, c], [r, c + 1], [r, c - 1]]) {
      if (nr >= 0 && nr < row && nc >= 0 && nc < col && !water[nr][nc] && !seen[nr][nc]) { seen[nr][nc] = true; queue.push([nr, nc]) }
    }
  }
  return { ok: false, reached }
}

export function buildTrace({ row, col, cells }) {
  const frames = []
  let lo = 0, hi = cells.length
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1
    const { ok, reached } = crossingPath(row, col, cells, mid)
    frames.push({ phase: 'probe', activeLine: L(ok ? 'if (canCross(mid)) lo' : 'else hi = mid - 1'), pythonLine: P(ok ? 'lo = mid' : 'hi = mid - 1'), message: ok ? `Day ${mid}: land still crosses, so the answer is at least ${mid}.` : `Day ${mid}: no crossing, so the answer is below ${mid}.`, lo, hi, mid, verdict: ok, day: mid, water: cells.slice(0, mid), reached })
    if (ok) lo = mid
    else hi = mid - 1
  }
  frames.push({ phase: 'done', activeLine: L('return lo'), pythonLine: P('return lo'), message: `Last day with a crossing: ${lo}.`, lo, hi, mid: null, verdict: null, day: lo, water: cells.slice(0, lo), reached: [], result: lo })
  return { input: { row, col, cells }, result: lo, frames }
}
