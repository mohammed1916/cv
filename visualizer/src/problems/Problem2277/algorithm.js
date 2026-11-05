// LeetCode 2277: Closest Node to Path in Tree.
// For a query [start, end, node]: BFS from start gives parent links, which trace the unique start-to-end path.
// BFS from node gives distances; in a tree the path vertex nearest to node is unique.

const MAX_NODES = 10
const MAX_QUERIES = 4

export function parseInput(text) {
  let input
  try { input = JSON.parse(text) } catch { throw new Error('Use an object like {"n":5,"edges":[[0,1]],"queries":[[0,3,4]]}.') }
  const { n, edges, queries } = input || {}
  if (!Number.isInteger(n) || n < 2 || n > MAX_NODES) throw new Error(`n is 2 to ${MAX_NODES}. The visualization caps the tree at ${MAX_NODES} nodes.`)
  if (!Array.isArray(edges) || edges.length !== n - 1) throw new Error(`A tree on ${n} nodes needs exactly ${n - 1} edges.`)
  const adj = Array.from({ length: n }, () => [])
  for (const e of edges) {
    if (!Array.isArray(e) || e.length !== 2 || !e.every(v => Number.isInteger(v) && v >= 0 && v < n) || e[0] === e[1]) throw new Error('Each edge is [a, b] with distinct nodes below n.')
    adj[e[0]].push(e[1])
    adj[e[1]].push(e[0])
  }
  const seen = new Set([0])
  const stack = [0]
  while (stack.length) for (const w of adj[stack.pop()]) if (!seen.has(w)) { seen.add(w); stack.push(w) }
  if (seen.size !== n) throw new Error('The edges must connect every node into one tree.')
  if (!Array.isArray(queries) || queries.length < 1 || queries.length > MAX_QUERIES) throw new Error(`Use 1 to ${MAX_QUERIES} queries.`)
  for (const q of queries) {
    if (!Array.isArray(q) || q.length !== 3 || !q.every(v => Number.isInteger(v) && v >= 0 && v < n)) throw new Error('Each query is [start, end, node] with nodes below n.')
  }
  return { n, edges, queries }
}

export const code = `function closestNodes(n, edges, queries) {
  const adj = Array.from({ length: n }, () => []);
  for (const [a, b] of edges) {
    adj[a].push(b);
    adj[b].push(a);
  }
  const bfs = src => {
    const dist = Array(n).fill(-1);
    const parent = Array(n).fill(-1);
    dist[src] = 0;
    const queue = [src];
    for (let h = 0; h < queue.length; h++) {
      const u = queue[h];
      for (const w of adj[u]) {
        if (dist[w] < 0) {
          dist[w] = dist[u] + 1;
          parent[w] = u;
          queue.push(w);
        }
      }
    }
    return { dist, parent };
  };
  return queries.map(([s, e, x]) => {
    const { parent } = bfs(s);
    const path = [];
    for (let v = e; ; v = parent[v]) {
      path.push(v);
      if (v === s) break;
    }
    const { dist: distX } = bfs(x);
    return path.reduce((best, v) => (distX[v] < distX[best] ? v : best));
  });
}`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `from collections import deque

def closest_nodes(n, edges, queries):
    adj = [[] for _ in range(n)]
    for a, b in edges:
        adj[a].append(b)
        adj[b].append(a)
    def bfs(src):
        dist = [-1] * n
        parent = [-1] * n
        dist[src] = 0
        q = deque([src])
        while q:
            u = q.popleft()
            for w in adj[u]:
                if dist[w] < 0:
                    dist[w] = dist[u] + 1
                    parent[w] = u
                    q.append(w)
        return dist, parent
    answers = []
    for s, e, x in queries:
        _, parent = bfs(s)
        path = []
        v = e
        while True:
            path.append(v)
            if v == s:
                break
            v = parent[v]
        dist_x, _ = bfs(x)
        answers.append(min(path, key=lambda v: dist_x[v]))
    return answers
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
  { id: 'start', label: 'Adjacency', description: 'Build the tree as adjacency lists.' },
  { id: 'path', label: 'Path', description: 'Trace the start-to-end path with BFS parents.' },
  { id: 'distance', label: 'Distances', description: 'Measure every node from the query node.' },
  { id: 'pick', label: 'Pick', description: 'Choose the path vertex nearest to the query node.' },
  { id: 'done', label: 'Result', description: 'The answers for all queries.' },
]

function bfs(adj, src) {
  const n = adj.length
  const dist = Array(n).fill(-1)
  const parent = Array(n).fill(-1)
  dist[src] = 0
  const queue = [src]
  for (let head = 0; head < queue.length; head++) {
    const u = queue[head]
    for (const w of adj[u]) {
      if (dist[w] < 0) { dist[w] = dist[u] + 1; parent[w] = u; queue.push(w) }
    }
  }
  return { dist, parent }
}

export function buildTrace({ n, edges, queries }) {
  const adj = Array.from({ length: n }, () => [])
  for (const [a, b] of edges) { adj[a].push(b); adj[b].push(a) }
  const frames = []
  const answers = []
  frames.push({ phase: 'start', activeLine: L('const adj = Array.from'), pythonLine: P('adj = [[] for _ in range(n)]'), message: `Tree with ${n} nodes and ${edges.length} edges.`, query: -1, s: null, e: null, x: null, path: [], distX: [], best: null, answers: [] })
  queries.forEach(([s, e, x], q) => {
    const { parent } = bfs(adj, s)
    const path = []
    for (let v = e; ; v = parent[v]) { path.push(v); if (v === s) break }
    frames.push({ phase: 'path', activeLine: L('const path = []'), pythonLine: P('path = []'), message: `Query ${q}: path ${path.slice().reverse().join(' → ')}.`, query: q, s, e, x, path: path.slice().reverse(), distX: [], best: null, answers: answers.slice() })
    const { dist } = bfs(adj, x)
    frames.push({ phase: 'distance', activeLine: L('const { dist: distX }'), pythonLine: P('dist_x, _ = bfs(x)'), message: `Distances from node ${x}: ${dist.join(', ')}.`, query: q, s, e, x, path: path.slice().reverse(), distX: dist.slice(), best: null, answers: answers.slice() })
    let best = path[0]
    for (const v of path) if (dist[v] < dist[best]) best = v
    answers.push(best)
    frames.push({ phase: 'pick', activeLine: L('return path.reduce'), pythonLine: P('answers.append(min('), message: `Closest path vertex to ${x} is ${best} (distance ${dist[best]}).`, query: q, s, e, x, path: path.slice().reverse(), distX: dist.slice(), best, answers: answers.slice() })
  })
  frames.push({ phase: 'done', activeLine: L('return queries.map'), pythonLine: P('return answers'), message: `Answers: [${answers.join(', ')}].`, query: -1, s: null, e: null, x: null, path: [], distX: [], best: null, answers: answers.slice() })
  return { input: { n, edges, queries }, result: answers, frames }
}
