const ERROR = 'Enter {"n":4,"edges":[[u,v,w],...]} with 2 to 6 nodes numbered from 0, 1 to 8 directed edges with weights 1 to 6, and no self-loops.'

export function parseInput(text) {
  const value = JSON.parse(text)
  if (!value || typeof value !== 'object' || !Number.isInteger(value.n) || !Array.isArray(value.edges)) throw new Error(ERROR)
  const { n, edges } = value
  if (n < 2 || n > 6 || edges.length < 1 || edges.length > 8) throw new Error(ERROR)
  const ok = edges.every(e => Array.isArray(e) && e.length === 3 && e.every(Number.isInteger) && e[0] >= 0 && e[0] < n && e[1] >= 0 && e[1] < n && e[0] !== e[1] && e[2] >= 1 && e[2] <= 6)
  if (!ok) throw new Error(ERROR)
  return { n, edges }
}

export const code = `minimum cost from node 0 to node n-1, where any edge may be reversed once at twice its weight
arcs = empty adjacency lists
for each directed edge (u, v, w)
  add an arc u to v with cost w
  add an arc v to u with cost 2 * w (the reversed edge)
dist[0] = 0 and every other dist = infinity
heap = [(0, 0)]
while the heap is not empty
  pop (d, u) with the smallest d
  if d > dist[u] then continue
  if u is node n-1 then return d
  for each arc (u to v, c)
    if d + c < dist[v] then record it and push it
return -1`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export function buildTrace({ n, edges }) {
  const arcs = Array.from({ length: n }, () => [])
  for (const [u, v, w] of edges) { arcs[u].push({ to: v, cost: w, reversed: false }); arcs[v].push({ to: u, cost: 2 * w, reversed: true }) }
  const dist = new Array(n).fill(Infinity)
  dist[0] = 0
  const done = new Array(n).fill(false)
  const frames = [{ phase: 'start', activeLine: L('dist[0] = 0'), node: 0, dist: [...dist], done: [...done], message: 'Each edge can also be used backwards at twice its cost. Each edge is reversed at most once on a shortest path.' }]
  let result = -1
  for (;;) {
    let u = -1
    for (let x = 0; x < n; x++) if (!done[x] && dist[x] < Infinity && (u === -1 || dist[x] < dist[u])) u = x
    if (u === -1) break
    done[u] = true
    if (u === n - 1) { result = dist[u]; break }
    const notes = []
    for (const { to, cost, reversed } of arcs[u]) {
      if (dist[u] + cost < dist[to]) { dist[to] = dist[u] + cost; notes.push(`${reversed ? 'reversed' : 'forward'} arc to ${to} gives ${dist[to]}`) }
    }
    frames.push({ phase: 'settle', activeLine: L('pop (d, u)'), node: u, dist: [...dist], done: [...done], message: `Settle node ${u} at cost ${dist[u]}.${notes.length ? ` Relax: ${notes.join('; ')}.` : ''}` })
  }
  frames.push({ phase: 'done', activeLine: L('return -1'), node: n - 1, dist: [...dist], done: [...done], message: result === -1 ? 'Node n-1 cannot be reached: return -1.' : `Minimum cost to reach node ${n - 1}: ${result}.` })
  return { input: { n, edges }, result, frames }
}

export const python = `import heapq

def minimum_cost(n, edges):
    arcs = [[] for _ in range(n)]
    for u, v, w in edges:
        arcs[u].append((v, w))
        arcs[v].append((u, 2 * w))
    inf = float('inf')
    dist = [inf] * n
    dist[0] = 0
    heap = [(0, 0)]
    while heap:
        d, u = heapq.heappop(heap)
        if d > dist[u]:
            continue
        if u == n - 1:
            return d
        for v, c in arcs[u]:
            if d + c < dist[v]:
                dist[v] = d + c
                heapq.heappush(heap, (dist[v], v))
    return -1
`
