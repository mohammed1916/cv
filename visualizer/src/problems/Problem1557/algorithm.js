export const phases = [
  { id: 'start', label: 'Start', description: 'Give every vertex an incoming-arrow count of zero.' },
  { id: 'count', label: 'Count arrows', description: 'Each directed edge adds one incoming arrow to its target vertex.' },
  { id: 'collect', label: 'Collect sources', description: 'A vertex with no incoming arrows cannot be reached from another vertex, so it must be a starting vertex.' },
  { id: 'done', label: 'Complete', description: 'Return the starting vertices in increasing order.' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object such as {"n": 3, "edges": [[0, 1], [1, 2]]}.')
  const { n, edges } = input
  if (!Number.isInteger(n) || n < 1 || n > 30) throw new Error('n is an integer from 1 to 30.')
  if (!Array.isArray(edges) || edges.length > 60) throw new Error('edges is a list of at most 60 pairs.')
  for (const edge of edges) {
    if (!Array.isArray(edge) || edge.length !== 2 || !edge.every(v => Number.isInteger(v) && v >= 0 && v < n)) throw new Error('Each edge is [from, to] with vertices from 0 to n-1.')
    if (edge[0] === edge[1]) throw new Error('An edge must join two different vertices.')
  }
  if (hasCycle(n, edges)) throw new Error('The graph must have no directed cycles.')
  return { n, edges }
}

// Kahn's check: a cycle leaves some vertices that never reach zero in-degree.
function hasCycle(n, edges) {
  const indegree = Array(n).fill(0)
  const out = Array.from({ length: n }, () => [])
  for (const [from, to] of edges) { out[from].push(to); indegree[to] += 1 }
  const queue = indegree.flatMap((d, v) => (d === 0 ? [v] : []))
  let seen = 0
  while (queue.length) {
    const v = queue.shift()
    seen += 1
    for (const w of out[v]) { indegree[w] -= 1; if (indegree[w] === 0) queue.push(w) }
  }
  return seen < n
}

export function buildTrace({ n, edges }) {
  const indegree = Array(n).fill(0)
  const snap = (edge, sources) => ({ indegree: [...indegree], edge, sources })
  const frames = [{
    phase: 'start', activeLine: L('indegree = Array(n)'), pythonLine: P('indegree = [0] * n'),
    snapshot: snap(null, []), message: `Start with ${n} vertices. Every vertex begins with no incoming arrows.`,
  }]
  for (const [from, to] of edges) {
    indegree[to] += 1
    frames.push({
      phase: 'count', activeLine: L('indegree[to] += 1'), pythonLine: P('indegree[end] += 1'),
      snapshot: snap([from, to], []),
      message: `Edge ${from} to ${to} gives vertex ${to} one incoming arrow, so it now has ${indegree[to]}.`,
    })
  }
  const result = indegree.flatMap((d, v) => (d === 0 ? [v] : []))
  frames.push({
    phase: 'collect', activeLine: L('return [...Array(n)'), pythonLine: P('return [v for v'),
    snapshot: snap(null, result),
    message: `Vertices with no incoming arrows are ${result.join(', ')}. Each must be started from, and together they reach everything.`,
  })
  frames.push({
    phase: 'done', activeLine: L('return [...Array(n)'), pythonLine: P('return [v for v'),
    snapshot: snap(null, result), message: `Return [${result.join(', ')}].`,
  })
  return { input: { n, edges }, result, frames }
}

export const code = [
  "function minVerticesToReachAll(n, edges) {",
  "  const indegree = Array(n).fill(0)",
  "  for (const [from, to] of edges) indegree[to] += 1",
  "  return [...Array(n).keys()].filter(v => indegree[v] === 0) }",
].map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1

export const python = `def min_starting_vertices(n, edges):
    indegree = [0] * n
    for start, end in edges:
        indegree[end] += 1
    return [v for v in range(n) if indegree[v] == 0]
`
