export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with n and edges.')
  const { n, edges } = input
  if (!Number.isInteger(n) || n < 2 || n > 12) throw new Error('n is an integer from 2 to 12.')
  if (!Array.isArray(edges) || edges.length !== n - 1) throw new Error('A tree on n nodes has n minus 1 edges.')
  const parent = Array.from({ length: n }, (_, i) => i)
  const find = x => (parent[x] === x ? x : (parent[x] = find(parent[x])))
  for (const e of edges) {
    if (!Array.isArray(e) || e.length !== 2) throw new Error('Each edge is [u, v].')
    const [u, v] = e
    if (![u, v].every(Number.isInteger) || u < 0 || v < 0 || u >= n || v >= n || u === v) throw new Error('Edge endpoints must be distinct nodes below n.')
    if (find(u) === find(v)) throw new Error('Edges must form a tree: no cycles.')
    parent[find(u)] = find(v)
  }
  return { n, edges }
}

export const code = `endpoints of a diameter of a tree
  build adjacency lists
  dist1 = bfs distances from node 0
  a = the farthest node from 0, smallest index on ties
  dist2 = bfs distances from a
  b = the farthest node from a, smallest index on ties
  return [min(a, b), max(a, b)]`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => { const i = code.findIndex(c => c.text.includes(s)); if (i < 0) throw new Error(`missing pseudocode: ${s}`); return i + 1 }

export const python = `def diameter_endpoints(n, edges):
    graph = [[] for _ in range(n)]
    for u, v in edges:
        graph[u].append(v)
        graph[v].append(u)
    def bfs(src):
        dist = [-1] * n
        dist[src] = 0
        queue = [src]
        head = 0
        while head < len(queue):
            u = queue[head]
            head += 1
            for v in graph[u]:
                if dist[v] < 0:
                    dist[v] = dist[u] + 1
                    queue.append(v)
        return dist
    first = bfs(0)
    a = max(range(n), key=lambda v: (first[v], -v))
    second = bfs(a)
    b = max(range(n), key=lambda v: (second[v], -v))
    return sorted([a, b])`
const PY = python.split('\n')
const Q = s => { const i = PY.findIndex(l => l.includes(s)); if (i < 0) throw new Error(`missing python: ${s}`); return i + 1 }

export function buildTrace({ n, edges }) {
  const graph = Array.from({ length: n }, () => [])
  for (const [u, v] of edges) { graph[u].push(v); graph[v].push(u) }
  const frames = []
  const bfs = (src, label, lineKey, pyKey) => {
    const dist = Array(n).fill(-1)
    dist[src] = 0
    const queue = [src]
    let head = 0
    frames.push({ phase: label, dist: [...dist], queue: [...queue], current: src, source: src, pythonLine: Q(pyKey), activeLine: L(lineKey), message: `Start a breadth-first search from node ${src}.` })
    while (head < queue.length) {
      const u = queue[head++]
      for (const v of graph[u]) {
        if (dist[v] < 0) {
          dist[v] = dist[u] + 1
          queue.push(v)
        }
      }
      frames.push({ phase: label, dist: [...dist], queue: queue.slice(head), current: u, source: src, pythonLine: Q('u = queue[head]'), activeLine: L(lineKey), message: `Node ${u} is at distance ${dist[u]} from ${src}.` })
    }
    return dist
  }
  const pickFarthest = (dist, phase, lineKey, pyKey) => {
    let best = 0
    for (let v = 0; v < n; v++) if (dist[v] > dist[best]) best = v
    frames.push({ phase, dist: [...dist], queue: [], current: best, source: null, pythonLine: Q(pyKey), activeLine: L(lineKey), message: `Farthest node is ${best}, at distance ${dist[best]}.` })
    return best
  }
  const first = bfs(0, 'first', 'dist1 = bfs', 'first = bfs(0)')
  const a = pickFarthest(first, 'pickA', 'a = the farthest', 'a = max(range(n)')
  const second = bfs(a, 'second', 'dist2 = bfs', 'second = bfs(a)')
  const b = pickFarthest(second, 'pickB', 'b = the farthest', 'b = max(range(n)')
  const result = [Math.min(a, b), Math.max(a, b)]
  frames.push({ phase: 'done', dist: second, queue: [], current: b, source: a, pythonLine: Q('return sorted'), activeLine: L('return [min(a, b)'), message: `Diameter endpoints ${result[0]} and ${result[1]} are ${second[b]} edges apart.` })
  return { input: { n, edges }, result, frames }
}
