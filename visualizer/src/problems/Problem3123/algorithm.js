const ERROR = 'Enter {"n":4,"edges":[[a,b,w],...]} with 2 to 6 nodes numbered from 0, 1 to 9 undirected edges with no self-loops, and weights from 1 to 6.'

export function parseInput(text) {
  const value = JSON.parse(text)
  if (!value || typeof value !== 'object' || !Number.isInteger(value.n) || !Array.isArray(value.edges)) throw new Error(ERROR)
  const { n, edges } = value
  if (n < 2 || n > 6 || edges.length < 1 || edges.length > 9) throw new Error(ERROR)
  const ok = edges.every(e => Array.isArray(e) && e.length === 3 && e.every(Number.isInteger) && e[0] >= 0 && e[0] < n && e[1] >= 0 && e[1] < n && e[0] !== e[1] && e[2] >= 1 && e[2] <= 6)
  if (!ok) throw new Error(ERROR)
  return { n, edges }
}

export const code = `find which edges lie on some shortest path from node 0 to node n-1
from_start = Dijkstra distances from node 0
from_end = Dijkstra distances from node n-1
total = from_start[n-1]
for each edge (a, b, w) in order
  on = total is reachable and (from_start[a] + w + from_end[b] = total or from_start[b] + w + from_end[a] = total)
  record on
return the recorded flags`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

function dijkstra(n, graph, source, frames, label, base) {
  const dist = new Array(n).fill(Infinity)
  dist[source] = 0
  const settled = new Array(n).fill(false)
  for (;;) {
    let u = -1
    for (let x = 0; x < n; x++) if (!settled[x] && dist[x] < Infinity && (u === -1 || dist[x] < dist[u])) u = x
    if (u === -1) break
    settled[u] = true
    for (const [v, w] of graph[u]) if (dist[u] + w < dist[v]) dist[v] = dist[u] + w
  }
  frames.push({ phase: 'distances', activeLine: L(label), decisions: base, current: -1, dist: [...dist], message: `Distances from node ${source}: [${dist.map(d => (d === Infinity ? '∞' : d)).join(', ')}].` })
  return dist
}

export function buildTrace({ n, edges }) {
  const graph = Array.from({ length: n }, () => [])
  for (const [a, b, w] of edges) { graph[a].push([b, w]); graph[b].push([a, w]) }
  const frames = [{ phase: 'start', activeLine: L('from_start = Dijkstra'), decisions: edges.map(() => null), current: -1, dist: null, message: `Run Dijkstra from node 0 and again from node ${n - 1}. An edge is on a shortest path if the two distances around it add up to the shortest total.` }]
  const fromStart = dijkstra(n, graph, 0, frames, 'from_start = Dijkstra', edges.map(() => null))
  const fromEnd = dijkstra(n, graph, n - 1, frames, 'from_end = Dijkstra', edges.map(() => null))
  const total = fromStart[n - 1]
  const decisions = []
  edges.forEach(([a, b, w], i) => {
    const on = total < Infinity && (fromStart[a] + w + fromEnd[b] === total || fromStart[b] + w + fromEnd[a] === total)
    decisions.push(on)
    frames.push({ phase: 'check', activeLine: L('on = total is reachable'), decisions: [...decisions, ...edges.slice(i + 1).map(() => null)], current: i, dist: null, message: `Edge ${i} (${a}-${b}, weight ${w}): ${total === Infinity ? 'node n-1 is unreachable' : `${fromStart[a]} + ${w} + ${fromEnd[b]} or ${fromStart[b]} + ${w} + ${fromEnd[a]} ${on ? `equals the shortest total ${total}, so it is on a shortest path` : `does not equal ${total}, so it is not`}`}.` })
  })
  frames.push({ phase: 'done', activeLine: L('return the recorded flags'), decisions: [...decisions], current: -1, dist: null, message: `Edges on some shortest path: ${decisions.filter(Boolean).length} of ${edges.length}.` })
  return { input: { n, edges }, result: decisions, frames }
}

export const python = `import heapq

def find_edges_on_shortest_paths(n, edges):
    graph = [[] for _ in range(n)]
    for a, b, w in edges:
        graph[a].append((b, w))
        graph[b].append((a, w))
    inf = float('inf')

    def dijkstra(source):
        dist = [inf] * n
        dist[source] = 0
        heap = [(0, source)]
        while heap:
            d, u = heapq.heappop(heap)
            if d > dist[u]:
                continue
            for v, w in graph[u]:
                if d + w < dist[v]:
                    dist[v] = d + w
                    heapq.heappush(heap, (dist[v], v))
        return dist

    from_start = dijkstra(0)
    from_end = dijkstra(n - 1)
    total = from_start[n - 1]
    if total == inf:
        return [False] * len(edges)
    return [
        from_start[a] + w + from_end[b] == total or from_start[b] + w + from_end[a] == total
        for a, b, w in edges
    ]
`
