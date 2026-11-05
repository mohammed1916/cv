// LeetCode 2204: Distance to a Cycle in Undirected Graph.
// The graph is connected with exactly one cycle. Peel off leaves repeatedly: what remains is the cycle.
// Then a multi-source BFS from every cycle node gives each node its distance to the nearest cycle node.

const MAX_NODES = 9

export function parseInput(text) {
  let spec
  try { spec = JSON.parse(text) } catch { throw new Error('Use JSON like {"n":5,"edges":[[0,1],[1,2],[2,0],[2,3],[3,4]]}.') }
  if (!spec || !Number.isInteger(spec.n) || !Array.isArray(spec.edges)) throw new Error('Give n and edges.')
  if (spec.n < 3 || spec.n > MAX_NODES) throw new Error(`Use 3 to ${MAX_NODES} nodes in this visualization.`)
  if (spec.edges.length !== spec.n) throw new Error('A connected graph with one cycle has exactly n edges.')
  const seen = new Set()
  for (const [u, v] of spec.edges) {
    if (![u, v].every(Number.isInteger) || u < 0 || v < 0 || u >= spec.n || v >= spec.n || u === v) throw new Error(`Each edge joins two different nodes from 0 to ${spec.n - 1}.`)
    const key = u < v ? `${u},${v}` : `${v},${u}`
    if (seen.has(key)) throw new Error('Edges must be unique.')
    seen.add(key)
  }
  // Connectivity check.
  const adj = Array.from({ length: spec.n }, () => [])
  for (const [u, v] of spec.edges) { adj[u].push(v); adj[v].push(u) }
  const reach = new Set([0]); const q = [0]
  while (q.length) { const u = q.shift(); for (const v of adj[u]) if (!reach.has(v)) { reach.add(v); q.push(v) } }
  if (reach.size !== spec.n) throw new Error('The graph must be connected.')
  return { n: spec.n, edges: spec.edges }
}

export const code = `FUNCTION distanceToCycle(n, edges)
    adj ← neighbours of each node
    degree ← number of neighbours of each node
    removed ← all false
    queue ← every node with degree 1
    WHILE queue is not empty
        u ← pop from queue
        removed[u] ← true
        FOR each neighbour v of u not removed
            degree[v] ← degree[v] - 1
            IF degree[v] = 1 THEN push v to queue
    dist ← infinity for every node
    cycle nodes (not removed) start the BFS with distance 0
    BFS outward from every cycle node, setting dist to the first distance found
    RETURN dist`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `from collections import deque

def distance_to_cycle(n, edges):
    adj = [[] for _ in range(n)]
    degree = [0] * n
    for u, v in edges:
        adj[u].append(v)
        adj[v].append(u)
        degree[u] += 1
        degree[v] += 1
    removed = [False] * n
    queue = deque(i for i in range(n) if degree[i] == 1)
    while queue:
        u = queue.popleft()
        removed[u] = True
        for v in adj[u]:
            if not removed[v]:
                degree[v] -= 1
                if degree[v] == 1:
                    queue.append(v)
    dist = [-1] * n
    queue = deque()
    for i in range(n):
        if not removed[i]:
            dist[i] = 0
            queue.append(i)
    while queue:
        u = queue.popleft()
        for v in adj[u]:
            if dist[v] == -1:
                dist[v] = dist[u] + 1
                queue.append(v)
    return dist
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
  { id: 'peel', label: 'Peel leaves', description: 'Remove dangling tree parts; the cycle is what survives.' },
  { id: 'cycle', label: 'Cycle', description: 'The nodes left over form the cycle.' },
  { id: 'bfs', label: 'Distances', description: 'Spread outward from the cycle, one step at a time.' },
  { id: 'done', label: 'Result', description: 'Each node and its distance to the cycle.' },
]

export function buildTrace({ n, edges }) {
  const adj = Array.from({ length: n }, () => [])
  const degree = Array(n).fill(0)
  for (const [u, v] of edges) { adj[u].push(v); adj[v].push(u); degree[u]++; degree[v]++ }
  const removed = Array(n).fill(false)
  const frames = []
  const dist = Array(n).fill(-1)
  const push = (phase, u, activeLine, pythonLine, message, extra = {}) => frames.push({
    phase, index: u, activeLine, pythonLine, message, n, edges, removed: removed.slice(), dist: dist.slice(), ...extra,
  })
  push('peel', -1, L('degree ← number'), P('degree[u] += 1'), `Degrees are counted. Nodes with degree 1 are leaves that can be peeled.`)
  const queue = []
  for (let i = 0; i < n; i++) if (degree[i] === 1) queue.push(i)
  while (queue.length) {
    const u = queue.shift()
    removed[u] = true
    push('peel', u, L('removed[u] ← true'), P('removed[u] = True'), `Peel leaf ${u}.`)
    for (const v of adj[u]) {
      if (removed[v]) continue
      degree[v] -= 1
      if (degree[v] === 1) { queue.push(v); push('peel', v, L('IF degree[v] = 1'), P('if degree[v] == 1'), `Node ${v} is now a leaf and joins the peel.`) }
    }
  }
  const cycle = []
  for (let i = 0; i < n; i++) if (!removed[i]) { dist[i] = 0; cycle.push(i) }
  push('cycle', -1, L('cycle nodes'), P('dist[i] = 0'), `The cycle is ${cycle.join(', ')}; their distance is 0.`, { cycle })
  const bfs = cycle.slice()
  while (bfs.length) {
    const u = bfs.shift()
    for (const v of adj[u]) {
      if (dist[v] === -1) {
        dist[v] = dist[u] + 1
        bfs.push(v)
        push('bfs', v, L('BFS outward'), P('dist[v] = dist[u] + 1'), `Node ${v} is one step from node ${u}, so its distance is ${dist[v]}.`, { from: u })
      }
    }
  }
  push('done', -1, L('RETURN dist'), P('return dist'), `Distances to the cycle: ${dist.join(', ')}.`, { result: dist.slice() })
  return { input: { n, edges }, result: dist.slice(), frames }
}
