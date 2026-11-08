// Count connected city subsets by their largest pairwise distance (the diameter of the subset).
const JS_LINES = [
  { text: 'const dist = allPairsDistances(n, edges)', py: 'dist = [bfs' },
  { text: 'const counts = new Array(n - 1).fill(0)', py: 'counts = [0]' },
  { text: 'for (let mask = 1; mask < 1 << n; mask++) {', py: 'for mask in range' },
  { text: 'const nodes = members(mask)', py: 'nodes = [i' },
  { text: 'if (nodes.length < 2 || !isConnected(nodes, mask)) continue', py: 'if len(nodes) < 2' },
  { text: 'const d = Math.max(...nodes.flatMap(a => nodes.map(b => dist[a][b])))', py: 'd = max(' },
  { text: 'counts[d - 1]++', py: 'counts[d - 1] += 1' },
  { text: '}', py: null },
  { text: 'return counts', py: 'return counts' },
]

export const code = JS_LINES.map(({ text }, i) => ({ line: i + 1, text }))

export const python = `def countSubgraphsForEachDiameter(n, edges):
    adj = [[] for _ in range(n)]
    for u, v in edges:
        adj[u - 1].append(v - 1)
        adj[v - 1].append(u - 1)
    dist = [bfs(adj, s) for s in range(n)]
    counts = [0] * (n - 1)
    for mask in range(1, 1 << n):
        nodes = [i for i in range(n) if mask >> i & 1]
        if len(nodes) < 2 or not connected(nodes, mask, adj):
            continue
        d = max(dist[a][b] for a in nodes for b in nodes)
        counts[d - 1] += 1
    return counts

def bfs(adj, s):
    d = [-1] * len(adj)
    d[s] = 0
    queue = [s]
    for x in queue:
        for y in adj[x]:
            if d[y] < 0:
                d[y] = d[x] + 1
                queue.append(y)
    return d

def connected(nodes, mask, adj):
    seen = {nodes[0]}
    stack = [nodes[0]]
    while stack:
        x = stack.pop()
        for y in adj[x]:
            if mask >> y & 1 and y not in seen:
                seen.add(y)
                stack.append(y)
    return len(seen) == len(nodes)
`

const PY = python.split('\n')
const pyAt = needle => {
  const index = PY.findIndex(line => line.includes(needle))
  if (index < 0) throw new Error(`python line missing: ${needle}`)
  return index + 1
}
export const pythonLineMap = Object.fromEntries(JS_LINES.map((line, i) => [i + 1, pyAt(line.py ?? 'return counts')]))

export const phases = [
  { id: 'start', label: 'Start', description: 'Compute the distance between every pair of cities in the tree.' },
  { id: 'subset', label: 'Subset', description: 'A subset of cities counts only if it is connected inside the tree.' },
  { id: 'count', label: 'Count', description: 'The largest distance inside the subset is its diameter; count it.' },
  { id: 'done', label: 'Result', description: 'counts[d-1] holds the number of subsets whose diameter is d.' },
]

export const examples = [
  { label: 'Path of four cities', input: '{"n":4,"edges":[[1,2],[2,3],[3,4]]}' },
  { label: 'Two cities', input: '{"n":2,"edges":[[2,1]]}' },
  { label: 'Branch at city one', input: '{"n":3,"edges":[[3,1],[1,2]]}' },
    { label: "Star of four cities", input: "{\"n\":4,\"edges\":[[1,2],[1,3],[1,4]]}" },
    { label: "Two equal branches", input: "{\"n\":5,\"edges\":[[1,2],[1,3],[2,4],[2,5]]}" },
    { label: "Path of ten cities", input: "{\"n\":10,\"edges\":[[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,8],[8,9],[9,10]]}" },
    { label: "Long run: random tree of ten", input: "{\"n\":10,\"edges\":[[1,2],[1,3],[1,4],[2,5],[1,6],[4,7],[5,8],[6,9],[8,10]]}" },
]

export const complexity = 'O(2^n * n^2) time for n cities, with n up to 15 in the statement. The visual caps n at 10 so every connected subset gets its own frame.'

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object') throw new Error('Use an object with n and edges.')
  const { n, edges } = input
  if (!Number.isInteger(n) || n < 2 || n > 10) throw new Error('n is an integer from 2 to 10 (visual cap).')
  if (!Array.isArray(edges) || edges.length !== n - 1) throw new Error('edges has exactly n-1 pairs.')
  const parent = Array.from({ length: n + 1 }, (_, i) => i)
  const find = x => (parent[x] === x ? x : (parent[x] = find(parent[x])))
  for (const edge of edges) {
    if (!Array.isArray(edge) || edge.length !== 2) throw new Error('Each edge is a pair of cities.')
    const [u, v] = edge
    if (!Number.isInteger(u) || !Number.isInteger(v) || u < 1 || v < 1 || u > n || v > n || u === v) throw new Error('Cities are numbered 1 to n.')
    if (find(u) === find(v)) throw new Error('The edges must form a tree.')
    parent[find(u)] = find(v)
  }
  return { n, edges }
}

export function allPairsDistances(n, edges) {
  const adj = Array.from({ length: n }, () => [])
  for (const [u, v] of edges) {
    adj[u - 1].push(v - 1)
    adj[v - 1].push(u - 1)
  }
  return Array.from({ length: n }, (_, s) => {
    const d = new Array(n).fill(-1)
    d[s] = 0
    const queue = [s]
    for (let q = 0; q < queue.length; q++) {
      const x = queue[q]
      for (const y of adj[x]) if (d[y] < 0) { d[y] = d[x] + 1; queue.push(y) }
    }
    return d
  })
}

export function buildTrace({ n, edges }) {
  const dist = allPairsDistances(n, edges)
  const adj = Array.from({ length: n }, () => [])
  for (const [u, v] of edges) { adj[u - 1].push(v - 1); adj[v - 1].push(u - 1) }
  const counts = new Array(n - 1).fill(0)
  const frames = []
  const snap = extra => ({ counts: [...counts], ...extra })
  frames.push({ phase: 'start', activeLine: 1, subset: [], message: 'Distances between all city pairs are computed.', snapshot: snap({}) })
  for (let mask = 1; mask < 1 << n; mask++) {
    const nodes = []
    for (let i = 0; i < n; i++) if (mask >> i & 1) nodes.push(i)
    if (nodes.length < 2 || !isConnected(nodes, mask, adj)) continue
    const d = Math.max(...nodes.flatMap(a => nodes.map(b => dist[a][b])))
    frames.push({ phase: 'subset', activeLine: 5, subset: nodes, diameter: d, message: `Cities {${nodes.map(x => x + 1).join(', ')}} form a connected subset.`, snapshot: snap({ diameter: null }) })
    counts[d - 1]++
    frames.push({ phase: 'count', activeLine: 7, subset: nodes, diameter: d, message: `Largest distance is ${d}: counts[${d - 1}] becomes ${counts[d - 1]}.`, snapshot: snap({ diameter: d }) })
  }
  frames.push({ phase: 'done', activeLine: 9, subset: [], result: counts, message: 'All connected subsets are counted by diameter.', snapshot: snap({ result: counts }) })
  return { input: { n, edges }, result: counts, frames }
}

function isConnected(nodes, mask, adj) {
  const seen = new Set([nodes[0]])
  const stack = [nodes[0]]
  while (stack.length) {
    const x = stack.pop()
    for (const y of adj[x]) if ((mask >> y & 1) && !seen.has(y)) { seen.add(y); stack.push(y) }
  }
  return seen.size === nodes.length
}
