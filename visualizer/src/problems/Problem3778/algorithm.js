export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with n and edges.')
  const { n, edges } = input
  if (!Number.isInteger(n) || n < 2 || n > 8) throw new Error('n is an integer from 2 to 8.')
  if (!Array.isArray(edges) || edges.length < n - 1 || edges.length > 16) throw new Error('edges lists 1 to 16 triples.')
  const seen = new Set()
  for (const e of edges) {
    if (!Array.isArray(e) || e.length !== 3) throw new Error('Each edge is [u, v, weight].')
    const [u, v, w] = e
    if (![u, v, w].every(Number.isInteger) || u < 0 || v < 0 || u >= n || v >= n || u === v) throw new Error('Edge endpoints must be distinct nodes below n.')
    if (w < 1 || w > 1000) throw new Error('Edge weights are integers from 1 to 1000.')
    const key = u < v ? `${u},${v}` : `${v},${u}`
    if (seen.has(key)) throw new Error('The graph is simple: no repeated pair.')
    seen.add(key)
  }
  const parent = Array.from({ length: n }, (_, i) => i)
  const find = x => (parent[x] === x ? x : (parent[x] = find(parent[x])))
  for (const [u, v] of edges) parent[find(u)] = find(v)
  if (new Set(Array.from({ length: n }, (_, i) => find(i))).size !== 1) throw new Error('The graph must be connected.')
  return { n, edges }
}

export const code = `minimum cost excluding one maximum edge
  build an undirected adjacency list with weights
  state (v, 0) means no edge has been waived yet; (v, 1) means one edge has been waived
  dist[0][0] = 0, every other state is infinity
  repeat
    pick the unfinished state with the smallest dist
    if none is left, stop
    mark that state finished
    for each neighbour v with weight w
      if the state has no waived edge yet
        relax (v, 0) with dist + w
        relax (v, 1) with dist, waiving this edge at no cost
      else
        relax (v, 1) with dist + w
  return min(dist[n-1][0], dist[n-1][1])`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => { const i = code.findIndex(c => c.text.includes(s)); if (i < 0) throw new Error(`missing pseudocode: ${s}`); return i + 1 }

export const python = `def min_cost_excluding_max_edge(n, edges):
    graph = [[] for _ in range(n)]
    for u, v, w in edges:
        graph[u].append((v, w))
        graph[v].append((u, w))
    INF = float('inf')
    dist = [[INF, INF] for _ in range(n)]
    dist[0][0] = 0
    done = [[False, False] for _ in range(n)]
    while True:
        node, flag, best = -1, -1, INF
        for v in range(n):
            for f in range(2):
                if not done[v][f] and dist[v][f] < best:
                    node, flag, best = v, f, dist[v][f]
        if node == -1:
            break
        done[node][flag] = True
        for v, w in graph[node]:
            if flag == 0:
                options = [(0, best + w), (1, best)]
            else:
                options = [(1, best + w)]
            for f, d in options:
                if d < dist[v][f]:
                    dist[v][f] = d
    return min(dist[n - 1])`
const PY = python.split('\n')
const Q = s => { const i = PY.findIndex(l => l.includes(s)); if (i < 0) throw new Error(`missing python: ${s}`); return i + 1 }

export function buildTrace({ n, edges }) {
  const graph = Array.from({ length: n }, () => [])
  for (const [u, v, w] of edges) {
    graph[u].push([v, w])
    graph[v].push([u, w])
  }
  const INF = Infinity
  const dist = Array.from({ length: n }, () => [INF, INF])
  const done = Array.from({ length: n }, () => [false, false])
  dist[0][0] = 0
  const frames = []
  const snap = (phase, extra) => ({
    phase,
    dist: dist.map(row => row.map(d => (d === INF ? null : d))),
    done: done.map(row => row.map(Boolean)),
    edges: edges.map(([u, v, w]) => ({ u, v, w })),
    ...extra,
  })
  frames.push(snap('start', { pythonLine: Q('dist[0][0] = 0'), activeLine: L('dist[0][0] = 0'), node: 0, flag: 0, message: 'Start at node 0 with no waived edge; every other state is unknown.' }))
  for (;;) {
    let node = -1, flag = -1, best = INF
    for (let v = 0; v < n; v++) for (let f = 0; f < 2; f++) {
      if (!done[v][f] && dist[v][f] < best) { node = v; flag = f; best = dist[v][f] }
    }
    if (node === -1) break
    done[node][flag] = true
    frames.push(snap('pop', { pythonLine: Q('done[node][flag] = True'), activeLine: L('mark that state finished'), node, flag, message: `Settle state (${node}, ${flag}) at cost ${best}.` }))
    for (const [v, w] of graph[node]) {
      const options = flag === 0 ? [[0, best + w], [1, best]] : [[1, best + w]]
      for (const [f, d] of options) {
        const improved = d < dist[v][f]
        if (improved) dist[v][f] = d
        const via = flag === 0 && f === 1 ? 'waive this edge for free' : 'pay the edge weight'
        frames.push(snap('relax', { pythonLine: Q('if d < dist[v][f]'), activeLine: L(f === 1 && flag === 0 ? 'relax (v, 1) with dist, waiving' : (flag === 0 ? 'relax (v, 0)' : 'relax (v, 1) with dist + w')), node: v, flag: f, improved, message: `${via} to reach (${v}, ${f}) with ${d}${improved ? ', improved' : ', no change'}.` }))
      }
    }
  }
  const result = Math.min(dist[n - 1][0], dist[n - 1][1])
  frames.push(snap('done', { pythonLine: Q('return min(dist'), activeLine: L('return min(dist'), node: n - 1, flag: -1, message: `Cheapest path cost after excluding one maximum edge: ${result}.` }))
  return { input: { n, edges }, result, frames }
}
