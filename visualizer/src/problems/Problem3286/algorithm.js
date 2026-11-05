export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with grid and health.')
  const { grid, health } = input
  if (!Array.isArray(grid) || grid.length < 1 || grid.length > 6) throw new Error('grid has 1 to 6 rows.')
  const width = grid[0].length
  if (!Array.isArray(grid[0]) || width < 1 || width > 6) throw new Error('Each row has 1 to 6 cells.')
  for (const row of grid) {
    if (!Array.isArray(row) || row.length !== width || !row.every(c => c === 0 || c === 1)) throw new Error('grid cells are 0 or 1 and every row has the same length.')
  }
  if (!Number.isInteger(health) || health < 1 || health > 10) throw new Error('health is an integer from 1 to 10.')
  return { grid, health }
}

export function buildTrace({ grid, health }) {
  const m = grid.length, n = grid[0].length
  const INF = Infinity
  const cost = Array.from({ length: m }, () => Array(n).fill(INF))
  const frames = []
  const cell = (r, c) => `(${r}, ${c})`
  cost[0][0] = grid[0][0]
  frames.push({ pythonLine: PY('cost[0][0] ='), phase: 'start', activeLine: L('cost[0][0] = grid[0][0]'), at: [0, 0], cost: copy(cost), queue: [[0, 0]], message: `Start at ${cell(0, 0)} with ${grid[0][0]} unsafe cell(s) counted.` })
  // 0-1 BFS: stepping onto a 0 cell adds nothing and goes to the front; stepping onto a 1 cell adds one and goes to the back.
  const deque = [[0, 0]]
  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]]
  while (deque.length) {
    const [r, c] = deque.shift()
    frames.push({ pythonLine: PY('r, c = dq.popleft()'), phase: 'pop', activeLine: L('const [r, c] = dq.shift()'), at: [r, c], cost: copy(cost), queue: deque.map(p => [...p]), message: `Visit ${cell(r, c)} with cost ${cost[r][c]}.` })
    for (const [dr, dc] of dirs) {
      const nr = r + dr, nc = c + dc
      if (nr < 0 || nc < 0 || nr >= m || nc >= n) continue
      const next = cost[r][c] + grid[nr][nc]
      if (next >= cost[nr][nc]) continue
      cost[nr][nc] = next
      if (grid[nr][nc] === 0) {
        deque.unshift([nr, nc])
        frames.push({ pythonLine: PY('dq.appendleft'), phase: 'relax', activeLine: L('dq.unshift([nr, nc])'), at: [nr, nc], cost: copy(cost), queue: deque.map(p => [...p]), message: `Safe step to ${cell(nr, nc)}, cost stays ${next}.` })
      } else {
        deque.push([nr, nc])
        frames.push({ pythonLine: PY('dq.append((nr'), phase: 'relax', activeLine: L('dq.push([nr, nc])'), at: [nr, nc], cost: copy(cost), queue: deque.map(p => [...p]), message: `Unsafe step to ${cell(nr, nc)}, cost becomes ${next}.` })
      }
    }
  }
  const best = cost[m - 1][n - 1]
  const result = best < health
  frames.push({ pythonLine: PY('return'), phase: 'done', activeLine: L('return cost[m - 1][n - 1] < health'), at: [m - 1, n - 1], cost: copy(cost), queue: [], result, message: `Fewest unsafe cells to the target is ${best}; health ${health} ${result ? 'leaves at least 1' : 'is not enough'}.` })
  return { input: { grid, health }, result, frames }
}

function copy(table) { return table.map(row => [...row]) }

export const code = `function findSafeWalk(grid, health) {
  const m = grid.length
  const n = grid[0].length
  const cost = Array.from({ length: m }, () => Array(n).fill(Infinity))
  cost[0][0] = grid[0][0]
  const dq = [[0, 0]]
  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]]
  while (dq.length) {
    const [r, c] = dq.shift()
    for (const [dr, dc] of dirs) {
      const nr = r + dr
      const nc = c + dc
      if (nr < 0 || nc < 0 || nr >= m || nc >= n) continue
      const nxt = cost[r][c] + grid[nr][nc]
      if (nxt >= cost[nr][nc]) continue
      cost[nr][nc] = nxt
      if (grid[nr][nc] === 0) dq.unshift([nr, nc])
      else dq.push([nr, nc])
    }
  }
  return cost[m - 1][n - 1] < health
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `from collections import deque

def find_safe_walk(grid, health):
    m, n = len(grid), len(grid[0])
    INF = float("inf")
    cost = [[INF] * n for _ in range(m)]
    cost[0][0] = grid[0][0]
    dq = deque([(0, 0)])
    while dq:
        r, c = dq.popleft()
        for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nr, nc = r + dr, c + dc
            if not (0 <= nr < m and 0 <= nc < n):
                continue
            nxt = cost[r][c] + grid[nr][nc]
            if nxt >= cost[nr][nc]:
                continue
            cost[nr][nc] = nxt
            if grid[nr][nc] == 0:
                dq.appendleft((nr, nc))
            else:
                dq.append((nr, nc))
    return cost[m - 1][n - 1] < health
`
const PY = s => python.split('\n').findIndex(line => line.includes(s)) + 1
