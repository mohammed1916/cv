export function parseInput(text) {
  const edges = JSON.parse(text)
  const n = Array.isArray(edges) ? edges.length : 0
  if (n < 3 || n > 1000 || edges.some(e => !Array.isArray(e) || e.length !== 2 || !Number.isInteger(e[0]) || !Number.isInteger(e[1]) || e[0] < 1 || e[1] < 1 || e[0] > n || e[1] > n || e[0] === e[1])) throw new Error('Enter a JSON array of n edges [u, v] with 1 ≤ u, v ≤ n, n ≥ 3 and no self-loops.')
  return edges
}

// Find the node with two parents (if any). With no cycle, remove the second such edge; otherwise remove the
// first one if removing it breaks the cycle, or the second one as the cycle-closing edge.
export function buildTrace(edges) {
  const n = edges.length
  const parent = Array(n + 1).fill(null)
  let first = null, second = null
  const frames = [{ phase: 'start', index: -1, candidates: [], removed: null, activeLine: 2, message: 'Find a node with two incoming edges, if one exists.' }]
  edges.forEach((e, i) => {
    const [, v] = e
    if (parent[v] !== null) {
      first = parent[v]
      second = i
      frames.push({ phase: 'conflict', index: i, candidates: [first, second], removed: null, activeLine: 5, message: `Node ${v} has two parents: edges ${first} and ${second}.` })
    } else parent[v] = i
  })
  const dsu = Array.from({ length: n + 1 }, (_, i) => i)
  const find = x => (dsu[x] === x ? x : (dsu[x] = find(dsu[x])))
  let cycleEdge = null
  for (let i = 0; i < n; i++) {
    if (i === second) continue
    const [u, v] = edges[i]
    const ru = find(u), rv = find(v)
    if (ru === rv) { cycleEdge = i; frames.push({ phase: 'cycle', index: i, candidates: [first, second], removed: null, activeLine: 9, message: `Edge ${i} closes a cycle.` }); break }
    dsu[ru] = rv
    frames.push({ phase: 'union', index: i, candidates: [first, second], removed: null, activeLine: 7, message: `Edge ${i} joins ${u} and ${v}; no cycle.` })
  }
  let removed
  if (second === null) removed = cycleEdge
  else if (cycleEdge === null) removed = second
  else removed = first
  const result = edges[removed]
  frames.push({ phase: 'done', index: removed, candidates: [first, second], removed, result, activeLine: 12, message: `Remove edge ${removed} [${result.join(', ')}].` })
  return { input: edges, result, removed, frames }
}

export const code = `def findRedundantDirectedConnection(edges):
    parent = [None] * (len(edges) + 1)
    first = second = None
    for i, (u, v) in enumerate(edges):
        if parent[v] is not None:
            first, second = parent[v], i
        else: parent[v] = i
    dsu = list(range(len(edges) + 1))
    cycle = None
    for i, (u, v) in enumerate(edges):
        if i == second: continue
        if find(dsu, u) == find(dsu, v): cycle = i; break
        dsu[find(dsu, u)] = find(dsu, v)
    if second is None: return edges[cycle]
    if cycle is None: return edges[second]
    return edges[first]`.split('\n').map((text, index) => ({ line: index + 1, text }))
