// LeetCode 2203: Minimum Weighted Subgraph With the Required Paths.
// Both required paths end at dest, so they merge at some node p. The cheapest subgraph is the sum of three shortest
// paths: src1 to p, src2 to p, and p to dest. Run Dijkstra from src1 and src2 on the graph, and from dest on the
// reversed graph (which gives the distance from p to dest). Take the best p.

const MAX_NODES = 7
const MAX_WEIGHT = 9
const INF = Infinity

export function parseInput(text) {
  let spec
  try { spec = JSON.parse(text) } catch { throw new Error('Use JSON like {"n":4,"edges":[[0,1,2]],"src1":0,"src2":1,"dest":3}.') }
  if (!spec || !Number.isInteger(spec.n) || !Array.isArray(spec.edges)) throw new Error('Give n and edges.')
  if (spec.n < 3 || spec.n > MAX_NODES) throw new Error(`Use 3 to ${MAX_NODES} nodes in this visualization.`)
  for (const [u, v, w] of spec.edges) {
    if (![u, v, w].every(Number.isInteger) || u < 0 || v < 0 || u >= spec.n || v >= spec.n || u === v) throw new Error(`Each edge is [from, to, weight] between different nodes from 0 to ${spec.n - 1}.`)
    if (w < 1 || w > MAX_WEIGHT) throw new Error(`Edge weights are integers from 1 to ${MAX_WEIGHT}.`)
  }
  for (const key of ['src1', 'src2', 'dest']) if (!Number.isInteger(spec[key]) || spec[key] < 0 || spec[key] >= spec.n) throw new Error(`${key} must be a node from 0 to ${spec.n - 1}.`)
  return { n: spec.n, edges: spec.edges, src1: spec.src1, src2: spec.src2, dest: spec.dest }
}

export const code = `FUNCTION minimumWeight(n, edges, src1, src2, dest)
    d1 ← shortest distances from src1 on the graph
    d2 ← shortest distances from src2 on the graph
    d3 ← shortest distances to dest (Dijkstra on the reversed graph)
    best ← infinity
    FOR each node p
        best ← min(best, d1[p] + d2[p] + d3[p])
    IF best is infinity THEN RETURN -1
    RETURN best`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `import heapq

def minimum_weight(n, edges, src1, src2, dest):
    g = [[] for _ in range(n)]
    rg = [[] for _ in range(n)]
    for u, v, w in edges:
        g[u].append((v, w))
        rg[v].append((u, w))
    def dijkstra(graph, s):
        dist = [float("inf")] * n
        dist[s] = 0
        heap = [(0, s)]
        while heap:
            d, u = heapq.heappop(heap)
            if d > dist[u]:
                continue
            for v, w in graph[u]:
                if d + w < dist[v]:
                    dist[v] = d + w
                    heapq.heappush(heap, (dist[v], v))
        return dist
    d1 = dijkstra(g, src1)
    d2 = dijkstra(g, src2)
    d3 = dijkstra(rg, dest)
    best = min(d1[p] + d2[p] + d3[p] for p in range(n))
    return -1 if best == float("inf") else best
`

const L = text => {
  const index = code.findIndex(line => line.text.includes(text))
  if (index < 0) throw new Error(`Missing pseudocode line: ${text}`)
  return index + 1
}
const P = text => {
  const index = python.split('\n').findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`Missing python line: ${text}`)
  return index + 1
}

export const phases = [
  { id: 'from1', label: 'From src1', description: 'Shortest distances from the first source.' },
  { id: 'from2', label: 'From src2', description: 'Shortest distances from the second source.' },
  { id: 'toDest', label: 'To dest', description: 'Shortest distances to dest, found on the reversed graph.' },
  { id: 'meet', label: 'Meeting node', description: 'Try every node as the place where the two paths merge.' },
  { id: 'done', label: 'Result', description: 'The cheapest total.' },
]

function dijkstra(n, adj, s) {
  const dist = Array(n).fill(INF)
  dist[s] = 0
  const done = Array(n).fill(false)
  for (let round = 0; round < n; round++) {
    let u = -1
    for (let v = 0; v < n; v++) if (!done[v] && dist[v] < INF && (u < 0 || dist[v] < dist[u])) u = v
    if (u < 0) break
    done[u] = true
    for (const [v, w] of adj[u]) if (dist[u] + w < dist[v]) dist[v] = dist[u] + w
  }
  return dist
}

export function buildTrace({ n, edges, src1, src2, dest }) {
  const g = Array.from({ length: n }, () => [])
  const rg = Array.from({ length: n }, () => [])
  for (const [u, v, w] of edges) { g[u].push([v, w]); rg[v].push([u, w]) }
  const frames = []
  const d1 = dijkstra(n, g, src1)
  const d2 = dijkstra(n, g, src2)
  const d3 = dijkstra(n, rg, dest)
  const show = v => (Number.isFinite(v) ? v : null)
  const push = (phase, index, activeLine, pythonLine, message, extra = {}) => frames.push({
    phase, index, activeLine, pythonLine, message, n, edges, src1, src2, dest,
    d1: d1.map(show), d2: d2.map(show), d3: d3.map(show), best: null, ...extra,
  })
  push('from1', -1, L('d1 ← shortest'), P('d1 = dijkstra(g, src1)'), `Distances from ${src1}: ${d1.map(show).map(v => v ?? '∞').join(', ')}.`, { d1: d1.map(show), filled: 1 })
  push('from2', -1, L('d2 ← shortest'), P('d2 = dijkstra(g, src2)'), `Distances from ${src2}: ${d2.map(show).map(v => v ?? '∞').join(', ')}.`, { d2: d2.map(show), filled: 2 })
  push('toDest', -1, L('d3 ← shortest'), P('d3 = dijkstra(rg, dest)'), `Distances to ${dest} (reversed graph): ${d3.map(show).map(v => v ?? '∞').join(', ')}.`, { d3: d3.map(show), filled: 3 })
  let best = INF
  let at = -1
  for (let p = 0; p < n; p++) {
    const total = d1[p] + d2[p] + d3[p]
    if (total < best) { best = total; at = p }
    push('meet', p, L('best ← min(best'), P('best = min'),
      Number.isFinite(total) ? `Node ${p}: ${d1[p]} + ${d2[p]} + ${d3[p]} = ${total}. Best ${best}.` : `Node ${p} cannot serve both sources and reach dest.`,
      { total: Number.isFinite(total) ? total : null, best: Number.isFinite(best) ? best : null, meet: at })
  }
  const result = Number.isFinite(best) ? best : -1
  push('done', -1, L('RETURN -1'), P('return -1 if best'), result === -1 ? 'No node works, so the answer is -1.' : `The cheapest subgraph weighs ${result}, meeting at node ${at}.`, { result, meet: at })
  return { input: { n, edges, src1, src2, dest }, result, frames }
}
