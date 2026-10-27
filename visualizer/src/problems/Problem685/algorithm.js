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

export const code = `give every node no parent and clear the conflict pair
for each edge (u, v) in input order
  if v already has a parent then record the earlier parent edge and this later edge as the conflict
  otherwise set the parent of v to u
set up union-find with every node in its own set
for each edge (u, v) in input order, skipping the later conflicting edge
  if u and v are already in the same set then return the earlier parent edge when there is a conflict, otherwise (u, v)
  otherwise join the sets of u and v
return the later conflicting edge`.split('\n').map((text, index) => ({ line: index + 1, text }))

// Family line 4 ends either the parent-conflict pass (no cycle: remove the later edge) or the cycle pass.
export function familyLine(frame) {
  if (frame.activeLine === 4) return frame.message.startsWith('Skipping') ? 9 : 7
  return ({ 1: 1, 3: 3, 5: 9 })[frame.activeLine] ?? frame.activeLine
}

export const python = `def find_redundant_directed_connection(edges):
    n = len(edges)
    parent = [0] * (n + 1)
    earlier = later = None
    later_index = -1
    for index, (u, v) in enumerate(edges):
        if parent[v] != 0:
            earlier = [parent[v], v]
            later = [u, v]
            later_index = index
        else:
            parent[v] = u
    root = list(range(n + 1))

    def find(x):
        while root[x] != x:
            root[x] = root[root[x]]
            x = root[x]
        return x

    for index, (u, v) in enumerate(edges):
        if index == later_index:
            continue
        ru, rv = find(u), find(v)
        if ru == rv:
            return earlier if earlier is not None else [u, v]
        root[rv] = ru
    return later`
