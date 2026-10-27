const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]]

function countIslands(grid) {
  const seen = grid.map(r => r.map(() => false))
  let count = 0
  for (let r = 0; r < grid.length; r++) for (let c = 0; c < grid[0].length; c++) {
    if (!grid[r][c] || seen[r][c]) continue
    count++
    const st = [[r, c]]; seen[r][c] = true
    while (st.length) {
      const [y, x] = st.pop()
      for (const [dy, dx] of DIRS) {
        const ny = y + dy, nx = x + dx
        if (ny >= 0 && ny < grid.length && nx >= 0 && nx < grid[0].length && grid[ny][nx] && !seen[ny][nx]) { seen[ny][nx] = true; st.push([ny, nx]) }
      }
    }
  }
  return count
}

export function parseInput(text) {
  const grid = JSON.parse(text)
  if (!Array.isArray(grid) || grid.length < 2 || grid.length > 12) throw new Error('Enter a JSON grid of 2 to 12 rows (the visualization caps the grid at 12x12).')
  const n = grid[0]?.length
  if (grid.some(r => !Array.isArray(r) || r.length !== n || r.some(v => v !== 0 && v !== 1))) throw new Error('Every row must have the same length and contain only 0 and 1.')
  if (n < 2 || n > 12) throw new Error('Rows must have 2 to 12 columns.')
  if (countIslands(grid) !== 2) throw new Error('The grid must contain exactly two 4-directionally connected islands.')
  return grid
}

// Cell codes: 0 water, 1 unvisited land, 2 first island, -k water reached in BFS layer k.
export function buildTrace(input) {
  const rows = input.length, cols = input[0].length
  const grid = input.map(r => [...r])
  const snap = () => grid.map(r => [...r])
  const frames = [{ phase: 'start', activeLine: L('Scan the grid for the first land cell'), grid: snap(), flips: 0, cell: null, message: 'Two islands exist. Mark the first one, then grow it outward one ring of water at a time.' }]
  const frontier = []
  const dfs = (r, c) => {
    if (r < 0 || r >= rows || c < 0 || c >= cols || grid[r][c] !== 1) return
    grid[r][c] = 2
    frontier.push([r, c])
    frames.push({ phase: 'flood', activeLine: L('mark (r, c) as part of the first island'), grid: snap(), flips: 0, cell: [r, c], message: `DFS marks (${r}, ${c}) as part of the first island and adds it to the BFS frontier.` })
    for (const [dr, dc] of DIRS) dfs(r + dr, c + dc)
  }
  let start = null
  for (let r = 0; r < rows && !start; r++) for (let c = 0; c < cols; c++) if (grid[r][c]) { start = [r, c]; break }
  dfs(...start)
  let flips = 0
  let current = frontier
  let result = -1
  outer: while (current.length) {
    const nxt = []
    for (const [r, c] of current) {
      for (const [dr, dc] of DIRS) {
        const nr = r + dr, nc = c + dc
        if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue
        if (grid[nr][nc] === 1) {
          result = flips
          frames.push({ phase: 'found', activeLine: L('if (nr, nc) is land of the second island'), grid: snap(), flips, cell: [nr, nc], message: `(${nr}, ${nc}) belongs to the second island and touches the frontier at layer ${flips}: ${flips} water cells must be flipped.` })
          break outer
        }
        if (grid[nr][nc] === 0) {
          grid[nr][nc] = -(flips + 1)
          nxt.push([nr, nc])
          frames.push({ phase: 'expand', activeLine: L('if (nr, nc) is unvisited water'), grid: snap(), flips, cell: [nr, nc], message: `Water (${nr}, ${nc}) is adjacent to the island: it would be flipped as bridge cell number ${flips + 1}.` })
        }
      }
    }
    current = nxt
    flips++
  }
  frames.push({ phase: 'done', activeLine: L('return flips'), grid: snap(), flips: result, cell: null, message: `Shortest bridge needs ${result} flipped cell(s). BFS layers give the minimum because every layer extends all frontier cells simultaneously.` })
  return { input: input.map(r => [...r]), result, frames }
}

export const code = `Scan the grid for the first land cell, and flood-fill its island with DFS
DFS(r, c): if (r, c) is outside the grid or not unvisited land, return
  mark (r, c) as part of the first island and add it to the frontier
  call DFS on each of the 4 neighbours of (r, c)
Set flips to 0; the frontier now holds the cells of the first island
while the frontier is not empty
  let nxt be an empty list
  for each cell (r, c) in the frontier and each of its 4 neighbours (nr, nc)
    if (nr, nc) is outside the grid, skip it
    if (nr, nc) is land of the second island, return flips
    if (nr, nc) is unvisited water, mark it visited and add it to nxt
  set frontier to nxt and add one to flips`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def shortest_bridge(grid):
    rows, cols = len(grid), len(grid[0])
    grid = [list(row) for row in grid]
    frontier = []
    def dfs(r, c):
        if not (0 <= r < rows and 0 <= c < cols) or grid[r][c] != 1:
            return
        grid[r][c] = 2
        frontier.append((r, c))
        for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            dfs(r + dr, c + dc)
    start = next((r, c) for r in range(rows) for c in range(cols) if grid[r][c] == 1)
    dfs(*start)
    flips = 0
    while frontier:
        nxt = []
        for r, c in frontier:
            for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                nr, nc = r + dr, c + dc
                if 0 <= nr < rows and 0 <= nc < cols:
                    if grid[nr][nc] == 1:
                        return flips
                    if grid[nr][nc] == 0:
                        grid[nr][nc] = 2
                        nxt.append((nr, nc))
        frontier = nxt
        flips += 1`
