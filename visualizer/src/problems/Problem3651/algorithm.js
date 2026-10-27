const ERROR = 'Enter {"grid":[[...],...],"k":k} with 1 to 4 rows and 1 to 4 columns of integers from 0 to 9, and k from 0 to 2. Moving right or down costs the value of the cell entered. A teleport from a cell to any cell with a value no larger costs nothing, and at most k teleports are allowed.'

export function parseInput(text) {
  const value = JSON.parse(text)
  if (!value || typeof value !== 'object' || !Array.isArray(value.grid) || !Number.isInteger(value.k)) throw new Error(ERROR)
  const { grid, k } = value
  if (grid.length < 1 || grid.length > 4 || !Array.isArray(grid[0])) throw new Error(ERROR)
  const cols = grid[0].length
  if (cols < 1 || cols > 4) throw new Error(ERROR)
  if (!grid.every(row => Array.isArray(row) && row.length === cols && row.every(v => Number.isInteger(v) && v >= 0 && v <= 9))) throw new Error(ERROR)
  if (k < 0 || k > 2) throw new Error(ERROR)
  return { grid, k }
}

export const code = `minimum cost to reach the bottom-right cell using at most k teleports
cur[r][c] = infinity for every cell, and cur[0][0] = 0
for t from 0 to k
  for each cell (r, c) in row order, except the start
    cur[r][c] = the smallest of cur[r][c], cur[r-1][c] + grid[r][c], cur[r][c-1] + grid[r][c]
  best = the smaller of best and cur[bottom-right]
  if t = k then stop
  next[x][y] = smallest cur[i][j] over every cell (i, j) with grid[i][j] >= grid[x][y]
  cur = next
return best`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export function buildTrace({ grid, k }) {
  const rows = grid.length, cols = grid[0].length
  const inf = Infinity
  let cur = Array.from({ length: rows }, () => new Array(cols).fill(inf))
  cur[0][0] = 0
  let best = inf
  const frames = [{ phase: 'start', activeLine: L('cur[r][c] = infinity'), layer: 0, cell: [0, 0], matrix: cur.map(r => [...r]), best, message: `Layer 0 uses no teleports. Start at (0, 0) with cost 0 and find the cheapest right-and-down routes.` }]
  for (let t = 0; t <= k; t++) {
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      if (r === 0 && c === 0) continue
      const fromUp = r > 0 ? cur[r - 1][c] + grid[r][c] : inf
      const fromLeft = c > 0 ? cur[r][c - 1] + grid[r][c] : inf
      cur[r][c] = Math.min(cur[r][c], fromUp, fromLeft)
      frames.push({ phase: 'move', activeLine: L('cur[r][c] = the smallest'), layer: t, cell: [r, c], matrix: cur.map(row => [...row]), best, message: `Layer ${t}: cell (${r}, ${c}) costs ${cur[r][c]} after entering it with value ${grid[r][c]}.` })
    }
    best = Math.min(best, cur[rows - 1][cols - 1])
    if (t === k) break
    const next = Array.from({ length: rows }, () => new Array(cols).fill(inf))
    for (let x = 0; x < rows; x++) for (let y = 0; y < cols; y++) for (let i = 0; i < rows; i++) for (let j = 0; j < cols; j++) {
      if (grid[x][y] <= grid[i][j]) next[x][y] = Math.min(next[x][y], cur[i][j])
    }
    cur = next
    frames.push({ phase: 'teleport', activeLine: L('next[x][y] = smallest'), layer: t + 1, cell: null, matrix: cur.map(r => [...r]), best, message: `Teleport once more (layer ${t + 1}): each cell takes the cheapest arrival from a cell with a value at least as large, at no cost.` })
  }
  frames.push({ phase: 'done', activeLine: L('return best'), layer: -1, cell: [rows - 1, cols - 1], matrix: cur.map(r => [...r]), best, message: `Minimum cost with at most ${k} teleport(s): ${best}.` })
  return { input: { grid, k }, result: best, frames }
}

export const python = `def min_cost_with_teleports(grid, k):
    rows = len(grid)
    cols = len(grid[0])
    inf = float('inf')
    cur = [[inf] * cols for _ in range(rows)]
    cur[0][0] = 0
    best = inf
    for t in range(k + 1):
        for r in range(rows):
            for c in range(cols):
                if r == 0 and c == 0:
                    continue
                from_up = cur[r - 1][c] + grid[r][c] if r > 0 else inf
                from_left = cur[r][c - 1] + grid[r][c] if c > 0 else inf
                cur[r][c] = min(cur[r][c], from_up, from_left)
        best = min(best, cur[rows - 1][cols - 1])
        if t == k:
            break
        nxt = [[inf] * cols for _ in range(rows)]
        for x in range(rows):
            for y in range(cols):
                for i in range(rows):
                    for j in range(cols):
                        if grid[x][y] <= grid[i][j]:
                            nxt[x][y] = min(nxt[x][y], cur[i][j])
        cur = nxt
    return best
`
