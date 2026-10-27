const ERROR = 'Enter {"n":5,"edges":[[u,v,w],...]} with 2 to 8 nodes numbered from 1, up to 14 undirected edges with weight 1 to 10, no self-loops, and no pair listed twice.'

export function parseInput(text) {
  const value = JSON.parse(text)
  if (!value || typeof value !== 'object' || !Number.isInteger(value.n) || !Array.isArray(value.edges)) throw new Error(ERROR)
  const { n, edges } = value
  if (n < 2 || n > 8 || edges.length > 14) throw new Error(ERROR)
  const seen = new Set()
  for (const e of edges) {
    if (!Array.isArray(e) || e.length !== 3 || !e.every(Number.isInteger)) throw new Error(ERROR)
    const [u, v, w] = e
    if (u < 1 || v < 1 || u > n || v > n || u === v || w < 1 || w > 10) throw new Error(ERROR)
    const key = u < v ? `${u},${v}` : `${v},${u}`
    if (seen.has(key)) throw new Error(ERROR)
    seen.add(key)
  }
  return { n, edges }
}

export const code = `count restricted paths from node 1 to node n, modulo 1000000007
build the undirected adjacency lists
find the shortest distance from every node to node n with Dijkstra
set ways[n] to 1
for each node u in increasing order of distance, skipping n and unreachable nodes
  ways[u] = sum of ways[v] over neighbours v with distance[v] < distance[u]
return ways[1]`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

const MOD = 1000000007

export function buildTrace({ n, edges }) {
  const graph = Array.from({ length: n + 1 }, () => [])
  for (const [u, v, w] of edges) { graph[u].push([v, w]); graph[v].push([u, w]) }
  const dist = new Array(n + 1).fill(Infinity)
  dist[n] = 0
  const settled = new Array(n + 1).fill(false)
  const ways = new Array(n + 1).fill(0)
  const snapshot = (current, phase) => ({ phase, current, dist: dist.slice(1), settled: settled.slice(1), ways: ways.slice(1) })
  const frames = [{ ...snapshot(-1, 'start'), activeLine: L('find the shortest distance'), message: `Measure distances from node ${n} with Dijkstra. Those distances decide which steps a restricted path may take.` }]
  for (;;) {
    let u = -1
    for (let x = 1; x <= n; x++) if (!settled[x] && dist[x] < Infinity && (u === -1 || dist[x] < dist[u])) u = x
    if (u === -1) break
    settled[u] = true
    const relaxed = []
    for (const [v, w] of graph[u]) if (dist[u] + w < dist[v]) { dist[v] = dist[u] + w; relaxed.push(`${v} to ${dist[v]}`) }
    frames.push({ ...snapshot(u, 'settle'), activeLine: L('find the shortest distance'), message: `Settle node ${u} at distance ${dist[u]}.${relaxed.length ? ` Its neighbours improve to: ${relaxed.join(', ')}.` : ''}` })
  }
  ways[n] = 1
  frames.push({ ...snapshot(n, 'count'), activeLine: L('set ways[n] to 1'), message: `Node ${n} has one restricted path: the empty path.` })
  const order = [...Array(n).keys()].map(i => i + 1).sort((a, b) => dist[a] - dist[b])
  for (const u of order) {
    if (u === n || dist[u] === Infinity) continue
    let total = 0
    for (const [v] of graph[u]) if (dist[v] < dist[u]) total = (total + ways[v]) % MOD
    ways[u] = total
    frames.push({ ...snapshot(u, 'count'), activeLine: L('ways[u] = sum of ways[v]'), message: `Node ${u} (distance ${dist[u]}) steps only to closer nodes, so ways[${u}] = ${total}.` })
  }
  frames.push({ ...snapshot(1, 'done'), activeLine: L('return ways[1]'), message: `Restricted paths from node 1 to node ${n}: ${ways[1]}.` })
  return { input: { n, edges }, result: ways[1], frames }
}

export const python = `import heapq

def count_restricted_paths(n, edges):
    mod = 1000000007
    graph = [[] for _ in range(n + 1)]
    for u, v, w in edges:
        graph[u].append((v, w))
        graph[v].append((u, w))
    inf = float('inf')
    dist = [inf] * (n + 1)
    dist[n] = 0
    heap = [(0, n)]
    while heap:
        d, u = heapq.heappop(heap)
        if d > dist[u]:
            continue
        for v, w in graph[u]:
            if d + w < dist[v]:
                dist[v] = d + w
                heapq.heappush(heap, (dist[v], v))
    ways = [0] * (n + 1)
    ways[n] = 1
    for u in sorted(range(1, n + 1), key=lambda x: dist[x]):
        if u == n or dist[u] == inf:
            continue
        ways[u] = sum(ways[v] for v, _ in graph[u] if dist[v] < dist[u]) % mod
    return ways[1]
`
