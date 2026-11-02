const MOVES = [[1, 0], [-1, 0], [0, 1], [0, -1]]
const INF = Number.POSITIVE_INFINITY
const SAFE_WAIT = 1000000000

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with a grid.')
  const { grid } = input
  if (!Array.isArray(grid) || grid.length < 2 || grid.length > 6 || !grid.every(row => Array.isArray(row) && row.length === grid[0].length)) throw new Error('grid is a rectangle of 2 to 6 rows.')
  if (grid[0].length < 2 || grid[0].length > 6) throw new Error('grid has 2 to 6 columns.')
  if (!grid.every(row => row.every(v => v === 0 || v === 1 || v === 2))) throw new Error('Cells are 0 grass, 1 fire or 2 wall.')
  const m = grid.length
  const n = grid[0].length
  if (grid[0][0] !== 0 || grid[m - 1][n - 1] !== 0) throw new Error('The start and the safehouse are grass.')
  return { grid }
}

export function buildTrace({ grid }) {
  const m = grid.length
  const n = grid[0].length
  const frames = []
  const fire = grid.map(row => row.map(() => INF))
  const queue = []
  for (let r = 0; r < m; r++) {
    for (let c = 0; c < n; c++) {
      if (grid[r][c] === 1) {
        fire[r][c] = 0
        queue.push([r, c])
      }
    }
  }
  frames.push({ pythonLine: P('fire = [[INF] * n for _ in range(m)]'), phase: 'fire', activeLine: L('fire time'), at: [-1, -1], lo: -1, hi: -1, t: -1, message: `Fire starts in ${queue.length} cell${queue.length === 1 ? '' : 's'}.` })
  for (let head = 0; head < queue.length; head++) {
    const [r, c] = queue[head]
    for (const [dr, dc] of MOVES) {
      const nr = r + dr
      const nc = c + dc
      if (nr < 0 || nr >= m || nc < 0 || nc >= n || grid[nr][nc] !== 0 || fire[nr][nc] !== INF) continue
      fire[nr][nc] = fire[r][c] + 1
      queue.push([nr, nc])
      frames.push({ pythonLine: P('fire[nr][nc] = fire[r][c] + 1'), phase: 'fire', activeLine: L('spread fire'), at: [nr, nc], lo: -1, hi: -1, t: -1, message: `Fire reaches (${nr}, ${nc}) at minute ${fire[nr][nc]}.` })
    }
  }

  function canWait(t) {
    if (fire[0][0] <= t) return false
    const seen = grid.map(row => row.map(() => false))
    seen[0][0] = true
    const walk = [[0, 0, 0]]
    for (let head = 0; head < walk.length; head++) {
      const [r, c, d] = walk[head]
      if (r === m - 1 && c === n - 1) return true
      for (const [dr, dc] of MOVES) {
        const nr = r + dr
        const nc = c + dc
        if (nr < 0 || nr >= m || nc < 0 || nc >= n || grid[nr][nc] === 2 || seen[nr][nc]) continue
        const arrive = t + d + 1
        const isSafehouse = nr === m - 1 && nc === n - 1
        const ok = isSafehouse ? arrive <= fire[nr][nc] : arrive < fire[nr][nc]
        if (!ok) continue
        seen[nr][nc] = true
        walk.push([nr, nc, d + 1])
      }
    }
    return false
  }

  if (!canWait(0)) {
    frames.push({ pythonLine: P('return -1'), phase: 'done', activeLine: L('return -1'), at: [-1, -1], lo: -1, hi: -1, t: -1, message: 'The person cannot reach the safehouse even without waiting.' })
    return { input: { grid }, result: -1, frames }
  }
  if (canWait(m * n + 1)) {
    frames.push({ pythonLine: P('return 10 ** 9'), phase: 'done', activeLine: L('return 10'), at: [-1, -1], lo: -1, hi: -1, t: -1, message: 'Any wait keeps the route safe, so the answer is 1000000000.' })
    return { input: { grid }, result: SAFE_WAIT, frames }
  }
  let lo = 0
  let hi = m * n
  frames.push({ pythonLine: P('lo, hi = 0, m * n'), phase: 'search', activeLine: L('binary search'), at: [-1, -1], lo, hi, t: -1, message: `Search the largest wait in [${lo}, ${hi}].` })
  while (lo < hi) {
    const mid = Math.floor((lo + hi + 1) / 2)
    const ok = canWait(mid)
    frames.push({ pythonLine: P('mid = (lo + hi + 1) // 2'), phase: 'search', activeLine: L('try the middle wait'), at: [-1, -1], lo, hi, t: mid, message: `Waiting ${mid} minutes ${ok ? 'works' : 'fails'}.` })
    if (ok) lo = mid
    else hi = mid - 1
  }
  frames.push({ pythonLine: P('return lo'), phase: 'done', activeLine: L('return the largest'), at: [-1, -1], lo, hi: lo, t: -1, message: `The largest safe wait is ${lo} minutes.` })
  return { input: { grid }, result: lo, frames }
}

export const code = `escape the spreading fire
  run a breadth-first search from every fire cell to get the minute each cell burns
  check(t) waits t minutes, then walks from the start
  a cell is entered only if the person arrives before its fire, or at the same minute at the safehouse
  if check(0) fails then return -1
  if check(m * n + 1) passes then return 10 to the power 9
  binary search the largest t with check(t) true
  return that t`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `from collections import deque

def max_wait(grid):
    m, n = len(grid), len(grid[0])
    INF = float('inf')
    fire = [[INF] * n for _ in range(m)]
    queue = deque()
    for r in range(m):
        for c in range(n):
            if grid[r][c] == 1:
                fire[r][c] = 0
                queue.append((r, c))
    while queue:
        r, c = queue.popleft()
        for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nr, nc = r + dr, c + dc
            if 0 <= nr < m and 0 <= nc < n and grid[nr][nc] == 0 and fire[nr][nc] == INF:
                fire[nr][nc] = fire[r][c] + 1
                queue.append((nr, nc))

    def can_wait(t):
        if fire[0][0] <= t:
            return False
        seen = [[False] * n for _ in range(m)]
        seen[0][0] = True
        walk = deque([(0, 0, 0)])
        while walk:
            r, c, d = walk.popleft()
            if (r, c) == (m - 1, n - 1):
                return True
            for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                nr, nc = r + dr, c + dc
                if 0 <= nr < m and 0 <= nc < n and grid[nr][nc] != 2 and not seen[nr][nc]:
                    arrive = t + d + 1
                    if (nr, nc) == (m - 1, n - 1):
                        ok = arrive <= fire[nr][nc]
                    else:
                        ok = arrive < fire[nr][nc]
                    if ok:
                        seen[nr][nc] = True
                        walk.append((nr, nc, d + 1))
        return False

    if not can_wait(0):
        return -1
    if can_wait(m * n + 1):
        return 10 ** 9
    lo, hi = 0, m * n
    while lo < hi:
        mid = (lo + hi + 1) // 2
        if can_wait(mid):
            lo = mid
        else:
            hi = mid - 1
    return lo
`
const PY_LINES = python.split('\n')
const P = s => PY_LINES.findIndex(line => line.includes(s)) + 1
