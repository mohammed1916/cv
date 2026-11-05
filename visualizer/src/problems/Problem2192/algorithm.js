// LeetCode 2192: All Ancestors of a Node in a Directed Acyclic Graph.
// Process nodes in topological order (Kahn). When node u is processed, each child v gains u and every ancestor of u.
// Ancestors are kept as sets and returned sorted, so each child list is complete before the child is processed.

const MAX_NODES = 8

export function parseInput(text) {
  let spec
  try { spec = JSON.parse(text) } catch { throw new Error('Use JSON like {"n":4,"edges":[[0,1],[1,2],[0,3]]}.') }
  if (!spec || !Number.isInteger(spec.n) || !Array.isArray(spec.edges)) throw new Error('Give an integer n and an edges array.')
  if (spec.n < 1 || spec.n > MAX_NODES) throw new Error(`Use 1 to ${MAX_NODES} nodes. The visualization caps the graph there.`)
  for (const edge of spec.edges) {
    if (!Array.isArray(edge) || edge.length !== 2 || !edge.every(v => Number.isInteger(v) && v >= 0 && v < spec.n)) throw new Error(`Each edge is a pair of nodes from 0 to ${spec.n - 1}.`)
    if (edge[0] === edge[1]) throw new Error('A self loop is a cycle.')
  }
  const indeg = Array(spec.n).fill(0)
  const adj = Array.from({ length: spec.n }, () => [])
  for (const [u, v] of spec.edges) { adj[u].push(v); indeg[v] += 1 }
  const queue = indeg.map((d, i) => (d === 0 ? i : -1)).filter(i => i >= 0)
  let seen = 0
  const q = queue.slice()
  while (q.length) { const u = q.shift(); seen++; for (const v of adj[u]) { indeg[v] -= 1; if (indeg[v] === 0) q.push(v) } }
  if (seen !== spec.n) throw new Error('The graph must be acyclic.')
  return { n: spec.n, edges: spec.edges }
}

export const code = `FUNCTION getAncestors(n, edges)
    adj ← children of each node
    indeg ← number of parents of each node
    ancestors ← n empty sets
    queue ← nodes with indeg 0
    WHILE queue is not empty
        u ← pop from queue
        FOR each child v of u
            ancestors[v] ← ancestors[v] ∪ {u} ∪ ancestors[u]
            indeg[v] ← indeg[v] - 1
            IF indeg[v] = 0 THEN push v to queue
    RETURN each ancestors[i] sorted ascending`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `from collections import deque

def get_ancestors(n, edges):
    adj = [[] for _ in range(n)]
    indeg = [0] * n
    for u, v in edges:
        adj[u].append(v)
        indeg[v] += 1
    ancestors = [set() for _ in range(n)]
    queue = deque(i for i in range(n) if indeg[i] == 0)
    while queue:
        u = queue.popleft()
        for v in adj[u]:
            ancestors[v] |= ancestors[u] | {u}
            indeg[v] -= 1
            if indeg[v] == 0:
                queue.append(v)
    return [sorted(s) for s in ancestors]
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
  { id: 'start', label: 'Sources', description: 'Nodes with no parents have no ancestors and start the queue.' },
  { id: 'process', label: 'Process', description: 'Pop a node; every child inherits it and its ancestors.' },
  { id: 'done', label: 'Result', description: 'Each node has its complete ancestor list.' },
]

export function buildTrace({ n, edges }) {
  const adj = Array.from({ length: n }, () => [])
  const indeg = Array(n).fill(0)
  for (const [u, v] of edges) { adj[u].push(v); indeg[v] += 1 }
  const ancestors = Array.from({ length: n }, () => new Set())
  const queue = []
  for (let i = 0; i < n; i++) if (indeg[i] === 0) queue.push(i)
  const processed = []
  const frames = []
  const snap = () => ancestors.map(s => [...s].sort((a, b) => a - b))
  const push = (phase, u, activeLine, pythonLine, message, extra = {}) => frames.push({
    phase, index: u, u, activeLine, pythonLine, message, n, edges, adj: adj.map(a => a.slice()), processed: processed.slice(), lists: snap(), queue: queue.slice(), ...extra,
  })
  push('start', -1, L('queue ← nodes'), P('queue = deque'), `${queue.length} source node(s) with no parents: ${queue.join(', ') || 'none'}.`)
  while (queue.length) {
    const u = queue.shift()
    processed.push(u)
    for (const v of adj[u]) {
      const before = ancestors[v].size
      ancestors[v].add(u)
      for (const a of ancestors[u]) ancestors[v].add(a)
      indeg[v] -= 1
      push('process', u, L('ancestors[v] ← ancestors[v]'), P('ancestors[v] |='),
        `Node ${u} passes ${[u, ...ancestors[u]].sort((x, y) => x - y).join(', ')} to child ${v}. Child ${v} now has ${ancestors[v].size} ancestor(s), up from ${before}.`,
        { child: v })
      if (indeg[v] === 0) { queue.push(v); push('process', u, L('IF indeg[v] = 0'), P('if indeg[v] == 0'), `Child ${v} has no unprocessed parents, so it joins the queue.`, { child: v, queued: true }) }
    }
    if (!adj[u].length) push('process', u, L('FOR each child v'), P('for v in adj[u]'), `Node ${u} has no children; nothing to pass on.`)
  }
  const result = snap()
  push('done', -1, L('RETURN each ancestors'), P('return [sorted'), 'Every node now lists its ancestors in ascending order.')
  return { input: { n, edges }, result, frames }
}
