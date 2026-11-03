// LeetCode 1245: Tree Diameter. Two breadth-first searches. The first finds a farthest node from
// node 0; the second, started there, finds the farthest node from that end. Its distance is the
// diameter, counted in edges.
const MAX_NODES = 15

export const phases = [
  { id: 'setup', label: 'Tree', description: 'Build the adjacency lists.' },
  { id: 'first', label: 'First sweep', description: 'Search outward from node 0.' },
  { id: 'second', label: 'Second sweep', description: 'Search outward from the farthest node.' },
  { id: 'done', label: 'Diameter', description: 'Report the longest path.' },
]

export const code = `FUNCTION treeDiameter(n, edges)
    adj ← adjacency lists built from edges
    endA ← the farthest node from bfs(0)
    endB, dist ← bfs(endA)
    RETURN dist[endB]
FUNCTION bfs(source)
    dist ← -1 for every node; dist[source] ← 0
    queue ← [source]
    WHILE queue is not empty
        v ← pop front of queue
        FOR each neighbour w of v
            IF dist[w] = -1 THEN dist[w] ← dist[v] + 1; parent[w] ← v; push w
    RETURN node with largest dist, dist, parent`.split('\n').map((text, index) => ({ line: index + 1, text }))

const L = s => {
  const index = code.findIndex(entry => entry.text.includes(s))
  if (index < 0) throw new Error(`Missing pseudocode line: ${s}`)
  return index + 1
}

export const python = `from collections import deque


def bfs(adj, source):
    dist = [-1] * len(adj)
    parent = [-1] * len(adj)
    dist[source] = 0
    queue = deque([source])
    while queue:
        v = queue.popleft()
        for w in adj[v]:
            if dist[w] == -1:
                dist[w] = dist[v] + 1
                parent[w] = v
                queue.append(w)
    far = max(range(len(adj)), key=lambda x: dist[x])
    return far, dist, parent


def tree_diameter(n, edges):
    adj = [[] for _ in range(n)]
    for a, b in edges:
        adj[a].append(b)
        adj[b].append(a)
    end_a, _, _ = bfs(adj, 0)
    end_b, dist, _ = bfs(adj, end_a)
    return dist[end_b]


if __name__ == "__main__":
    import sys, json
    data = json.loads(sys.stdin.read())
    print(json.dumps(tree_diameter(data["n"], data["edges"])))
`

const PYTHON_LINES = python.split('\n')
const P = s => {
  const index = PYTHON_LINES.findIndex(line => line.includes(s))
  if (index < 0) throw new Error(`Missing python line: ${s}`)
  return index + 1
}

export function parseInput(text) {
  const input = typeof text === 'string' ? JSON.parse(text) : text
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with n and edges.')
  const { n, edges } = input
  if (!Number.isInteger(n) || n < 1 || n > MAX_NODES) throw new Error(`n is an integer from 1 to ${MAX_NODES}.`)
  if (!Array.isArray(edges) || edges.length !== n - 1) throw new Error('A tree on n nodes has exactly n - 1 edges.')
  for (const edge of edges) {
    if (!Array.isArray(edge) || edge.length !== 2 || !edge.every(v => Number.isInteger(v) && v >= 0 && v < n) || edge[0] === edge[1]) {
      throw new Error('Each edge is two different nodes from 0 to n - 1.')
    }
  }
  const adj = Array.from({ length: n }, () => [])
  for (const [a, b] of edges) {
    adj[a].push(b)
    adj[b].push(a)
  }
  const seen = new Set([0])
  const stack = [0]
  while (stack.length) {
    const v = stack.pop()
    for (const w of adj[v]) if (!seen.has(w)) { seen.add(w); stack.push(w) }
  }
  if (seen.size !== n) throw new Error('The edges must connect every node into one tree.')
  return { n, edges }
}

export function buildTrace({ n, edges }) {
  const frames = []
  const adj = Array.from({ length: n }, () => [])
  for (const [a, b] of edges) {
    adj[a].push(b)
    adj[b].push(a)
  }
  const emit = (phase, codeText, pyText, message, extra = {}) => frames.push({
    phase, activeLine: L(codeText), pythonLine: P(pyText), message,
    wave: null, source: null, dist: Array(n).fill(-1), current: null, far: null, path: [], ...extra,
  })

  emit('setup', 'adj ← adjacency lists built from edges', 'adj = [[] for _ in range(n)]', `Tree with ${n} node${n === 1 ? '' : 's'} and ${edges.length} edge${edges.length === 1 ? '' : 's'}.`)

  function bfs(source, wave) {
    const dist = Array(n).fill(-1)
    const parent = Array(n).fill(-1)
    dist[source] = 0
    const queue = [source]
    emit(wave, 'dist ← -1 for every node; dist[source] ← 0', 'dist[source] = 0', `Start the ${wave === 'first' ? 'first' : 'second'} sweep at node ${source}.`, { wave, source, dist: dist.slice() })
    while (queue.length) {
      const v = queue.shift()
      emit(wave, 'v ← pop front of queue', 'v = queue.popleft()', `Expand node ${v} at distance ${dist[v]}.`, { wave, source, dist: dist.slice(), current: v })
      for (const w of adj[v]) {
        if (dist[w] === -1) {
          dist[w] = dist[v] + 1
          parent[w] = v
          queue.push(w)
          emit(wave, 'IF dist[w] = -1 THEN dist[w] ← dist[v] + 1; parent[w] ← v; push w', 'if dist[w] == -1', `Node ${w} is new at distance ${dist[w]}.`, { wave, source, dist: dist.slice(), current: w })
        }
      }
    }
    let far = 0
    for (let x = 0; x < n; x += 1) if (dist[x] > dist[far]) far = x
    return { far, dist, parent }
  }

  const first = bfs(0, 'first')
  const endA = first.far
  const second = bfs(endA, 'second')
  const endB = second.far
  const diameter = second.dist[endB]
  const path = []
  for (let v = endB; v !== -1; v = second.parent[v]) path.push(v)
  emit('done', 'RETURN dist[endB]', 'return dist[end_b]', `Longest path: ${diameter} edge${diameter === 1 ? '' : 's'} from ${endA} to ${endB}.`,
    { wave: 'second', source: endA, dist: second.dist.slice(), far: endB, path, result: diameter })
  return { input: { n, edges }, result: diameter, frames }
}
