export function parseInput(text) {
  const data = JSON.parse(text)
  const bad = () => new Error('Enter JSON {"grid": [[0/1,...],...], "hits": [[r,c],...]}: grid up to 8x8 and up to 16 distinct hits (visualization caps), each hit inside the grid.')
  if (!data || typeof data !== 'object' || !Array.isArray(data.grid) || !Array.isArray(data.hits)) throw bad()
  const { grid, hits } = data
  const R = grid.length, C = R ? grid[0].length : 0
  if (R < 1 || R > 8 || C < 1 || C > 8 || hits.length > 16) throw bad()
  if (!grid.every(row => Array.isArray(row) && row.length === C && row.every(v => v === 0 || v === 1))) throw bad()
  const seen = new Set()
  for (const h of hits) {
    if (!Array.isArray(h) || h.length !== 2 || !Number.isInteger(h[0]) || !Number.isInteger(h[1]) || h[0] < 0 || h[0] >= R || h[1] < 0 || h[1] >= C || seen.has(h.join(','))) throw bad()
    seen.add(h.join(','))
  }
  return { grid: grid.map(r => [...r]), hits: hits.map(h => [...h]) }
}
export function buildTrace({ grid, hits }) {
  const R = grid.length, C = grid[0].length, top = R * C
  const g = grid.map(r => [...r])
  const parent = Array.from({ length: top + 1 }, (_, i) => i)
  const size = new Array(top + 1).fill(1)
  const find = x => { while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x] } return x }
  const union = (a, b) => {
    let x = find(a), y = find(b)
    if (x === y) return
    if (size[x] < size[y]) [x, y] = [y, x]
    parent[y] = x; size[x] += size[y]
  }
  const res = new Array(hits.length).fill(0)
  const frames = []
  const push = (phase, activeLine, message, extra = {}) => frames.push({
    phase, activeLine, message, g: g.map(r => [...r]), res: [...res], cell: null, hitIndex: -1,
    attached: g.map((row, r) => row.map((v, c) => v === 1 && find(r * C + c) === find(top))), ...extra,
  })
  push('start', L('let R and C'), 'Falling bricks are hard to undo, so work backwards: remove every hit brick first, then add them back in reverse order.')
  for (const [r, c] of hits) g[r][c] -= 1
  push('remove', L('subtract 1'), 'Subtract 1 from each hit cell. A hit on a real brick becomes 0; a hit on an empty cell becomes -1 so it is not restored later.')
  for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) {
    if (g[r][c] !== 1) continue
    if (r === 0) union(r * C + c, top)
    if (r > 0 && g[r - 1][c] === 1) union(r * C + c, (r - 1) * C + c)
    if (c > 0 && g[r][c - 1] === 1) union(r * C + c, r * C + c - 1)
  }
  push('build', L('for each cell (r, c)'), `Union all remaining bricks. Bricks sharing the ceiling node's set (green) are stable: ${size[find(top)] - 1} of them.`)
  for (let i = hits.length - 1; i >= 0; i--) {
    const [r, c] = hits[i]
    g[r][c] += 1
    if (g[r][c] !== 1) {
      push('skip', L('set res[i] to 0'), `Hit ${i} at (${r}, ${c}) was an empty cell, so nothing fell: res[${i}] = 0.`, { cell: [r, c], hitIndex: i })
      continue
    }
    const before = size[find(top)]
    push('restore', L('add 1 to g'), `Undo hit ${i}: put the brick back at (${r}, ${c}). Stable bricks before: ${before - 1}.`, { cell: [r, c], hitIndex: i })
    if (r === 0) union(r * C + c, top)
    for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nr = r + dr, nc = c + dc
      if (nr >= 0 && nr < R && nc >= 0 && nc < C && g[nr][nc] === 1) union(r * C + c, nr * C + nc)
    }
    const after = size[find(top)]
    res[i] = Math.max(0, after - before - 1)
    push('merge', L('set res[i] to max'), `Merge with neighbours: stable bricks now ${after - 1}. The brick itself does not count as fallen, so res[${i}] = max(0, ${after} - ${before} - 1) = ${res[i]}.`, { cell: [r, c], hitIndex: i })
  }
  push('done', L('return res'), `Bricks dropped per hit: [${res.join(', ')}].`)
  return { input: { grid, hits }, result: res, frames }
}
export const code = `let R and C be the number of rows and columns, and top be the ceiling node R * C
copy grid into g, then subtract 1 from g at each hit cell
set up union-find over the cells and the ceiling node top
for each cell (r, c) with g[r][c] equal to 1
  if r is 0, union the cell with top
  if the cell above is 1, union the cell with it
  if the cell to the left is 1, union the cell with it
set res to a list of zeros, one per hit
for hit i from the last hit back to the first
  add 1 to g at the cell of hit i
  if g at that cell is not 1, set res[i] to 0 and move to the previous hit
  remember the size of the ceiling component as before
  if the cell is in row 0, union the cell with top
  union the cell with each neighbour that is 1
  set res[i] to max(0, the new ceiling size - before - 1)
return res`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def hit_bricks(grid, hits):
    R, C = len(grid), len(grid[0])
    g = [row[:] for row in grid]
    for r, c in hits:
        g[r][c] -= 1
    top = R * C
    parent = list(range(top + 1))
    size = [1] * (top + 1)
    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x
    def union(a, b):
        x, y = find(a), find(b)
        if x != y:
            if size[x] < size[y]:
                x, y = y, x
            parent[y] = x
            size[x] += size[y]
    for r in range(R):
        for c in range(C):
            if g[r][c] == 1:
                if r == 0:
                    union(c, top)
                if r > 0 and g[r - 1][c] == 1:
                    union(r * C + c, (r - 1) * C + c)
                if c > 0 and g[r][c - 1] == 1:
                    union(r * C + c, r * C + c - 1)
    res = [0] * len(hits)
    for i in range(len(hits) - 1, -1, -1):
        r, c = hits[i]
        g[r][c] += 1
        if g[r][c] != 1:
            continue
        before = size[find(top)]
        if r == 0:
            union(r * C + c, top)
        for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nr, nc = r + dr, c + dc
            if 0 <= nr < R and 0 <= nc < C and g[nr][nc] == 1:
                union(r * C + c, nr * C + nc)
        after = size[find(top)]
        res[i] = max(0, after - before - 1)
    return res
`
