const ERROR = 'Enter {"n":3,"edges":[[a,b,p],...],"start":0,"end":2} with 2 to 6 nodes numbered from 0, up to 8 undirected edges with probabilities from 0 to 1, no self-loops, and start and end on nodes that exist.'

export function parseInput(text) {
  const value = JSON.parse(text)
  if (!value || typeof value !== 'object' || !Number.isInteger(value.n) || !Array.isArray(value.edges) || !Number.isInteger(value.start) || !Number.isInteger(value.end)) throw new Error(ERROR)
  const { n, edges, start, end } = value
  if (n < 2 || n > 6 || edges.length > 8 || start < 0 || start >= n || end < 0 || end >= n) throw new Error(ERROR)
  const ok = edges.every(e => Array.isArray(e) && e.length === 3 && Number.isInteger(e[0]) && Number.isInteger(e[1]) && typeof e[2] === 'number' && e[0] >= 0 && e[0] < n && e[1] >= 0 && e[1] < n && e[0] !== e[1] && e[2] >= 0 && e[2] <= 1)
  if (!ok) throw new Error(ERROR)
  return { n, edges, start, end }
}

export const code = `maximum probability of a path from start to end
best = 0 for every node, and best[start] = 1
heap = [(1, start)] ordered by largest probability
while the heap is not empty
  pop (p, u) with the largest p
  if p < best[u] then continue
  for each edge (u, v, q)
    candidate = p * q
    if candidate > best[v] then record it and push it
return best[end]`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export function buildTrace({ n, edges, start, end }) {
  const graph = Array.from({ length: n }, () => [])
  for (const [a, b, q] of edges) { graph[a].push([b, q]); graph[b].push([a, q]) }
  const best = new Array(n).fill(0)
  best[start] = 1
  const settled = new Array(n).fill(false)
  const frames = [{ phase: 'start', activeLine: L('best = 0 for every node'), node: start, best: [...best], settled: [...settled], message: `Start at node ${start} with probability 1. Multiplying along a path can only lower the probability, so the most likely node is expanded first.` }]
  for (;;) {
    let u = -1
    for (let x = 0; x < n; x++) if (!settled[x] && best[x] > 0 && (u === -1 || best[x] > best[u])) u = x
    if (u === -1) break
    settled[u] = true
    if (u === end) break
    const notes = []
    for (const [v, q] of graph[u]) {
      const candidate = best[u] * q
      if (candidate > best[v]) { best[v] = candidate; notes.push(`node ${v} improves to ${candidate}`) }
    }
    frames.push({ phase: 'settle', activeLine: L('pop (p, u)'), node: u, best: [...best], settled: [...settled], message: `Settle node ${u} with probability ${best[u]}.${notes.length ? ` Neighbours: ${notes.join('; ')}.` : ''}` })
  }
  const result = best[end]
  frames.push({ phase: 'done', activeLine: L('return best[end]'), node: end, best: [...best], settled: [...settled], message: `Maximum probability from ${start} to ${end}: ${result}.` })
  return { input: { n, edges, start, end }, result, frames }
}

export const python = `import heapq

def max_probability(n, edges, start, end):
    graph = [[] for _ in range(n)]
    for a, b, q in edges:
        graph[a].append((b, q))
        graph[b].append((a, q))
    best = [0.0] * n
    best[start] = 1.0
    heap = [(-1.0, start)]
    while heap:
        neg, u = heapq.heappop(heap)
        p = -neg
        if p < best[u]:
            continue
        for v, q in graph[u]:
            candidate = p * q
            if candidate > best[v]:
                best[v] = candidate
                heapq.heappush(heap, (-candidate, v))
    return best[end]
`
