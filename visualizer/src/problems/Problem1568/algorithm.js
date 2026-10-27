export function parseInput(text) {
  const grid = JSON.parse(text)
  if (!Array.isArray(grid) || grid.length < 1 || grid.length > 6) throw new Error('Use a grid of 1 to 6 rows.')
  const width = Array.isArray(grid[0]) ? grid[0].length : 0
  if (width < 1 || width > 6) throw new Error('Each row has 1 to 6 cells.')
  for (const row of grid) {
    if (!Array.isArray(row) || row.length !== width) throw new Error('Every row must have the same length.')
    if (row.some(v => v !== 0 && v !== 1)) throw new Error('Cells are 0 (water) or 1 (land).')
  }
  return grid
}

const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]]
const keyOf = (r, c) => `${r},${c}`

export function buildTrace(grid) {
  const R = grid.length
  const C = grid[0].length
  const isLand = (r, c) => r >= 0 && r < R && c >= 0 && c < C && grid[r][c] === 1
  const land = []
  for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) if (grid[r][c] === 1) land.push([r, c])
  const frames = [{ phase: 'start', activeLine: L('count the islands'), cell: null, cuts: [], message: `The grid has ${land.length} land cells.` }]
  // count the islands with a flood fill
  const seen = new Set()
  let islands = 0
  for (const [r, c] of land) {
    if (seen.has(keyOf(r, c))) continue
    islands++
    seen.add(keyOf(r, c))
    const stack = [[r, c]]
    while (stack.length) {
      const [cr, cc] = stack.pop()
      for (const [dr, dc] of DIRS) {
        const nr = cr + dr
        const nc = cc + dc
        if (isLand(nr, nc) && !seen.has(keyOf(nr, nc))) { seen.add(keyOf(nr, nc)); stack.push([nr, nc]) }
      }
    }
  }
  frames.push({ phase: 'count', activeLine: L('if there is not exactly'), cell: null, cuts: [], message: `Found ${islands} island${islands === 1 ? '' : 's'}.` })
  if (islands !== 1) {
    frames.push({ phase: 'done', activeLine: L('if there is not exactly'), cell: null, cuts: [], message: 'The land is already disconnected or empty, so the answer is 0.' })
    return { input: grid, result: 0, frames }
  }
  const disc = new Map()
  const low = new Map()
  const cuts = new Set()
  let timer = 0
  const dfs = ([r, c], parent) => {
    const k = keyOf(r, c)
    timer++
    disc.set(k, timer)
    low.set(k, timer)
    let children = 0
    frames.push({ phase: 'dfs', activeLine: L('run a DFS'), cell: [r, c], cuts: [...cuts], message: `Visit (${r}, ${c}) with discovery time ${timer}.` })
    for (const [dr, dc] of DIRS) {
      const nr = r + dr
      const nc = c + dc
      if (!isLand(nr, nc)) continue
      if (parent && parent[0] === nr && parent[1] === nc) continue
      const nk = keyOf(nr, nc)
      if (disc.has(nk)) {
        low.set(k, Math.min(low.get(k), disc.get(nk)))
      } else {
        children++
        dfs([nr, nc], [r, c])
        low.set(k, Math.min(low.get(k), low.get(nk)))
        if (parent && low.get(nk) >= disc.get(k)) cuts.add(k)
      }
    }
    if (!parent && children > 1) cuts.add(k)
  }
  dfs(land[0], null)
  const landCount = land.length
  let result
  if (cuts.size > 0) result = 1
  else if (landCount === 1) result = 1
  else result = 2
  const activeLine = cuts.size > 0 ? L('if some cell is a cut') : landCount === 1 ? L('if the island has one') : L('return 2')
  frames.push({ phase: 'done', activeLine, cell: null, cuts: [...cuts], message: `Cut cells: ${cuts.size}. The answer is ${result}.` })
  return { input: grid, result, frames }
}

export const code = `minimum days to disconnect the land of a grid
count the islands with a flood fill
if there is not exactly one island then return 0
run a DFS from one land cell that records discovery times and low values
for each cell u and child v of u, mark u when low v is at least disc u (the root needs two children)
if some cell is a cut point then return 1
if the island has one cell then return 1
return 2`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def min_days(grid):
    rows, cols = len(grid), len(grid[0])
    land = {(r, c) for r in range(rows) for c in range(cols) if grid[r][c] == 1}

    def adjacent(cell):
        r, c = cell
        for nb in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
            if nb in land:
                yield nb

    seen = set()
    islands = 0
    for start in sorted(land):
        if start in seen:
            continue
        islands += 1
        seen.add(start)
        stack = [start]
        while stack:
            cur = stack.pop()
            for nb in adjacent(cur):
                if nb not in seen:
                    seen.add(nb)
                    stack.append(nb)
    if islands != 1:
        return 0

    disc = {}
    low = {}
    cuts = set()
    timer = [0]

    def dfs(u, parent):
        timer[0] += 1
        disc[u] = low[u] = timer[0]
        children = 0
        for v in adjacent(u):
            if v == parent:
                continue
            if v in disc:
                low[u] = min(low[u], disc[v])
            else:
                children += 1
                dfs(v, u)
                low[u] = min(low[u], low[v])
                if parent is not None and low[v] >= disc[u]:
                    cuts.add(u)
        if parent is None and children > 1:
            cuts.add(u)

    dfs(min(land), None)
    if cuts:
        return 1
    if len(land) == 1:
        return 1
    return 2
`
