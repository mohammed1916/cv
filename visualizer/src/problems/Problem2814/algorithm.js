// LeetCode 2814: Minimum Time Takes to Reach Destination Without Drowning (draft rules).
// Symbols: S start, D destination, * water source, X stone, . empty.
// Minute m: water spreads one cell first, then the traveler steps.
// Water never enters X or D. A cell is usable to leave at minute m only if its flood time is greater than m.

const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]]
const CELL = /^[SD.*X]+$/

export function parseInput(text) {
  const grid = JSON.parse(text)
  if (!Array.isArray(grid) || grid.length < 1 || grid.length > 8) throw new Error('Use a list of 1 to 8 row strings.')
  const width = grid[0]?.length
  if (!grid.every(row => typeof row === 'string' && row.length >= 1 && row.length <= 8 && row.length === width && CELL.test(row))) {
    throw new Error('Every row needs the same width of 1 to 8 characters from S . * X D.')
  }
  const flat = grid.join('')
  if ([...flat].filter(c => c === 'S').length !== 1 || [...flat].filter(c => c === 'D').length !== 1) {
    throw new Error('The grid needs exactly one S and one D.')
  }
  return grid
}

function floodTimes(grid) {
  const flood = grid.map(row => [...row].map(() => Infinity))
  const queue = []
  grid.forEach((row, r) => [...row].forEach((ch, c) => { if (ch === '*') { flood[r][c] = 0; queue.push([r, c]) } }))
  for (let h = 0; h < queue.length; h++) {
    const [r, c] = queue[h]
    for (const [dr, dc] of DIRS) {
      const nr = r + dr, nc = c + dc
      if (nr < 0 || nc < 0 || nr >= grid.length || nc >= grid[0].length) continue
      if (grid[nr][nc] === 'X' || grid[nr][nc] === 'D' || flood[nr][nc] !== Infinity) continue
      flood[nr][nc] = flood[r][c] + 1
      queue.push([nr, nc])
    }
  }
  return flood
}

const CODE_TEXT = [
  'safe travel time from S to D',
  '  flood time of each cell is the BFS distance from every * (never through X or D)',
  '  queue ← [(S, minute 0)]; best[S] ← 0',
  '  WHILE queue is not empty',
  '    pop (cell, t) from the front of the queue',
  '    IF cell is D THEN return t',
  '    FOR each neighbour d of cell',
  '      IF d is X THEN continue',
  '      arrive ← t + 1',
  '      IF flood time of cell ≤ arrive THEN the water drowns the traveler; continue',
  '      IF flood time of d ≤ arrive THEN d is flooded; continue',
  '      IF d not yet reached THEN best[d] ← arrive; push (d, arrive)',
  '  return -1',
]

export const code = CODE_TEXT.map((text, index) => ({ line: index + 1, text }))

const L = s => {
  const index = code.findIndex(c => c.text.includes(s))
  if (index < 0) throw new Error(`Missing pseudocode line: ${s}`)
  return index + 1
}

const PYTHON_TEXT = `from collections import deque

INF = float('inf')

def minimum_time(grid):
    rows, cols = len(grid), len(grid[0])
    flood = [[INF] * cols for _ in range(rows)]
    queue = deque()
    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == '*':
                flood[r][c] = 0
                queue.append((r, c))
    while queue:
        r, c = queue.popleft()
        for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nr, nc = r + dr, c + dc
            if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] not in 'XD' and flood[nr][nc] == INF:
                flood[nr][nc] = flood[r][c] + 1
                queue.append((nr, nc))
    start = next((r, c) for r in range(rows) for c in range(cols) if grid[r][c] == 'S')
    best = [[INF] * cols for _ in range(rows)]
    best[start[0]][start[1]] = 0
    queue = deque([(start[0], start[1], 0)])
    while queue:
        r, c, t = queue.popleft()
        if grid[r][c] == 'D':
            return t
        for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nr, nc = r + dr, c + dc
            if not (0 <= nr < rows and 0 <= nc < cols) or grid[nr][nc] == 'X':
                continue
            arrive = t + 1
            if flood[r][c] <= arrive or flood[nr][nc] <= arrive:
                continue
            if best[nr][nc] == INF:
                best[nr][nc] = arrive
                queue.append((nr, nc, arrive))
    return -1
`

export const python = PYTHON_TEXT

const P = s => {
  const index = PYTHON_TEXT.split('\n').findIndex(line => line.includes(s))
  if (index < 0) throw new Error(`Missing python line: ${s}`)
  return index + 1
}

export const phases = [
  { id: 'flood', label: 'Flood map', description: 'Water spreads one cell per minute from every *.' },
  { id: 'pop', label: 'Traveler', description: 'Take the next cell from the queue.' },
  { id: 'blocked', label: 'Blocked', description: 'The water wins this step.' },
  { id: 'enqueue', label: 'Reach', description: 'A new cell is reachable at this minute.' },
  { id: 'found', label: 'Arrive', description: 'The traveler reached D.' },
  { id: 'done', label: 'Result', description: 'Report the time or -1.' },
]

export function buildTrace(grid) {
  const flood = floodTimes(grid)
  const rows = grid.length, cols = grid[0].length
  const find = ch => { for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) if (grid[r][c] === ch) return [r, c]; return null }
  const start = find('S'), goal = find('D')
  const best = grid.map(row => [...row].map(() => Infinity))
  best[start[0]][start[1]] = 0
  const queue = [[start[0], start[1], 0]]
  const frames = []
  const snap = (extra) => ({ minute: extra.minute, reached: best.map(row => row.map(v => v !== Infinity)), ...extra })
  frames.push(snap({ phase: 'flood', activeLine: L('flood time of each cell'), pythonLine: P('flood = [[INF]'), cell: null, blocked: null, minute: 0, ok: null, message: 'Water spreads from every * one cell per minute.' }))
  let result = -1
  for (let h = 0; h < queue.length && result < 0; h++) {
    const [r, c, t] = queue[h]
    frames.push(snap({ phase: 'pop', activeLine: L('pop (cell, t)'), pythonLine: P('r, c, t = queue.popleft()'), cell: [r, c], blocked: null, minute: t, ok: null, message: `At minute ${t} the traveler is on row ${r}, column ${c}.` }))
    if (grid[r][c] === 'D') {
      result = t
      frames.push(snap({ phase: 'found', activeLine: L('IF cell is D'), pythonLine: P("if grid[r][c] == 'D'"), cell: [r, c], blocked: null, minute: t, ok: true, message: `The traveler reaches D at minute ${t}.` }))
      break
    }
    for (const [dr, dc] of DIRS) {
      const nr = r + dr, nc = c + dc
      if (nr < 0 || nc < 0 || nr >= rows || nc >= cols) continue
      if (grid[nr][nc] === 'X') continue
      const arrive = t + 1
      if (flood[r][c] <= arrive) {
        frames.push(snap({ phase: 'blocked', activeLine: L('the water drowns the traveler'), pythonLine: P('if flood[r][c] <= arrive or'), cell: [r, c], blocked: [nr, nc], minute: arrive, ok: false, message: `Water reaches (${r}, ${c}) by minute ${arrive}; the traveler cannot leave.` }))
        continue
      }
      if (flood[nr][nc] <= arrive) {
        frames.push(snap({ phase: 'blocked', activeLine: L('d is flooded'), pythonLine: P('if flood[r][c] <= arrive or'), cell: [r, c], blocked: [nr, nc], minute: arrive, ok: false, message: `(${nr}, ${nc}) is flooded by minute ${arrive}.` }))
        continue
      }
      if (best[nr][nc] === Infinity) {
        best[nr][nc] = arrive
        queue.push([nr, nc, arrive])
        frames.push(snap({ phase: 'enqueue', activeLine: L('IF d not yet reached'), pythonLine: P('best[nr][nc] = arrive'), cell: [r, c], blocked: [nr, nc], minute: arrive, ok: true, message: `(${nr}, ${nc}) is safe at minute ${arrive}; queue it.` }))
      }
    }
  }
  frames.push(snap({ phase: 'done', activeLine: L('return -1'), pythonLine: P('return -1'), cell: null, blocked: null, minute: result < 0 ? 0 : result, ok: result >= 0, message: result >= 0 ? `Shortest safe time is ${result}.` : 'The traveler cannot reach D safely.' }))
  return { input: grid, result, flood, frames }
}
