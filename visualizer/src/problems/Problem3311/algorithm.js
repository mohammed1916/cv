export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with n and edges.')
  const { n, edges } = input
  if (!Number.isInteger(n) || n < 2 || n > 16) throw new Error('n is an integer from 2 to 16 for the visualization.')
  if (!Array.isArray(edges) || edges.length < 1 || edges.length > 40) throw new Error('edges is a list of 1 to 40 pairs.')
  for (const edge of edges) {
    if (!Array.isArray(edge) || edge.length !== 2 || !edge.every(v => Number.isInteger(v) && v >= 0 && v < n)) throw new Error('Each edge is a pair of node ids from 0 to n minus 1.')
  }
  return { n, edges }
}

function distances(adj, source) {
  const dist = Array(adj.length).fill(-1)
  dist[source] = 0
  const queue = [source]
  for (let head = 0; head < queue.length; head++) {
    const v = queue[head]
    for (const w of adj[v]) if (dist[w] < 0) { dist[w] = dist[v] + 1; queue.push(w) }
  }
  return dist
}

export function buildTrace({ n, edges }) {
  const adj = Array.from({ length: n }, () => [])
  for (const [u, v] of edges) { adj[u].push(v); adj[v].push(u) }
  const frames = []
  const pos = new Map()
  const at = new Map()
  const place = (node, r, c) => { pos.set(node, [r, c]); at.set(`${r},${c}`, node) }
  const cells = () => [...pos].map(([node, [r, c]]) => ({ node, r, c }))
  const frame = (phase, line, py, message, focus = null) => frames.push({ phase, activeLine: L(line), pythonLine: P(py), message, cells: cells(), focus })

  const isPath = edges.length === n - 1 && adj.every(list => list.length <= 2)
  if (isPath) {
    const start = adj.findIndex(list => list.length === 1)
    const line = [start]
    place(start, 0, 0)
    let prev = -1
    let cur = start
    for (;;) {
      const next = adj[cur].find(w => w !== prev)
      if (next === undefined) break
      prev = cur; cur = next
      line.push(cur); place(cur, 0, line.length - 1)
    }
    frame('row', 'walk the line', 'walk', `The edges form one path, so one row of ${n} cells is the whole layout.`)
    frame('done', 'return the grid', 'return', `Result: one row ${line.join(', ')}.`)
    return { input: { n, edges }, result: [line], frames }
  }

  const corner = adj.findIndex(list => list.length === 2)
  if (corner < 0) throw new Error('No corner was found, so these edges cannot be a grid.')
  const [B, C] = adj[corner]
  const dB = distances(adj, B)
  const dC = distances(adj, C)
  place(corner, 0, 0)
  frame('start', 'pick a corner', 'corner', `Node ${corner} has two neighbours, so it is a corner. Call its neighbours ${B} (row direction) and ${C} (column direction).`, [0, 0])

  let cur = corner
  let c = 0
  for (;;) {
    const next = adj[cur].filter(x => !pos.has(x) && dC[x] === dC[cur] + 1)
    if (next.length !== 1) break
    cur = next[0]; c += 1; place(cur, 0, c)
    frame('row', 'walk the top row', 'row', `Node ${cur} is one step further from ${C}, so it continues the top row at column ${c}.`, [0, c])
  }

  cur = corner
  let r = 0
  for (;;) {
    const next = adj[cur].filter(x => !pos.has(x) && dB[x] === dB[cur] + 1)
    if (next.length !== 1) break
    cur = next[0]; r += 1; place(cur, r, 0)
    frame('column', 'walk the first column', 'column', `Node ${cur} is one step further from ${B}, so it starts row ${r}.`, [r, 0])
  }

  const rows = r + 1
  const cols = c + 1
  if (rows * cols !== n) throw new Error('The top row and first column do not account for every node.')
  for (let i = 1; i < rows; i++) {
    for (let j = 1; j < cols; j++) {
      const up = at.get(`${i - 1},${j}`)
      const left = at.get(`${i},${j - 1}`)
      const options = adj[up].filter(x => !pos.has(x) && adj[left].includes(x))
      if (options.length !== 1) throw new Error('The edges do not form a grid.')
      place(options[0], i, j)
      frame('fill', 'fill the cell', 'fill', `Cell (${i}, ${j}) is the one unplaced node touching both its upper and left neighbours.`, [i, j])
    }
  }

  const grid = Array.from({ length: rows }, (_, i) => Array.from({ length: cols }, (_, j) => at.get(`${i},${j}`)))
  if (edges.length !== rows * (cols - 1) + cols * (rows - 1)) throw new Error('The edge count does not match a grid of this shape.')
  for (const [u, v] of edges) {
    const [ru, cu] = pos.get(u)
    const [rv, cv] = pos.get(v)
    if (Math.abs(ru - rv) + Math.abs(cu - cv) !== 1) throw new Error('The edges do not form a grid.')
  }
  frame('check', 'check every edge', 'check', `All ${n} nodes are placed and every edge joins neighbouring cells.`)
  frame('done', 'return the grid', 'return', `Result: ${rows} by ${cols}.`)
  return { input: { n, edges }, result: grid, frames }
}

export const code = `build the adjacency lists
if the edges form one path, walk the line and return it as one row
pick a corner: a node with two neighbours
walk the top row away from the second neighbour
walk the first column away from the first neighbour
for each remaining cell, fill the cell with the unplaced node touching its upper and left cells
check every edge, then return the grid`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `from collections import deque

def bfs(adj, source):
    dist = [-1] * len(adj)
    dist[source] = 0
    queue = deque([source])
    while queue:
        v = queue.popleft()
        for w in adj[v]:
            if dist[w] < 0:
                dist[w] = dist[v] + 1
                queue.append(w)
    return dist

def construct_grid(n, edges):
    adj = [[] for _ in range(n)]
    for u, v in edges:
        adj[u].append(v)
        adj[v].append(u)
    if len(edges) == n - 1 and max(len(a) for a in adj) <= 2:
        return [walk_line(adj)]  # one path is a one-row grid
    corner = next(v for v in range(n) if len(adj[v]) == 2)  # corner
    b, c = adj[corner]
    dist_b, dist_c = bfs(adj, b), bfs(adj, c)
    row, pos = [corner], {corner}
    cur = corner
    while True:  # row
        nxt = [x for x in adj[cur] if x not in pos and dist_c[x] == dist_c[cur] + 1]
        if len(nxt) != 1:
            break
        cur = nxt[0]; row.append(cur); pos.add(cur)
    col = [corner]
    cur = corner
    while True:  # column
        nxt = [x for x in adj[cur] if x not in pos and dist_b[x] == dist_b[cur] + 1]
        if len(nxt) != 1:
            break
        cur = nxt[0]; col.append(cur); pos.add(cur)
    grid = [[None] * len(row) for _ in col]
    for j, v in enumerate(row):
        grid[0][j] = v
    for i, v in enumerate(col):
        grid[i][0] = v
    for i in range(1, len(col)):
        for j in range(1, len(row)):  # fill
            grid[i][j] = next(x for x in adj[grid[i - 1][j]] if x not in pos and x in adj[grid[i][j - 1]])
            pos.add(grid[i][j])
    return grid  # check, then return the grid
`
const P = s => python.split('\n').findIndex(t => t.includes(s)) + 1
