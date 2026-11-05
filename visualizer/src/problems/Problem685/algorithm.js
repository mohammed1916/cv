export function parseInput(text) {
  const edges = JSON.parse(text)
  if (!Array.isArray(edges) || edges.length < 3 || edges.length > 20) throw new Error('Enter 3–20 edges as JSON pairs [u, v] over nodes 1 to n, where n is the number of edges.')
  const n = edges.length
  for (const edge of edges) {
    if (!Array.isArray(edge) || edge.length !== 2 || !edge.every(v => Number.isInteger(v) && v >= 1 && v <= n)) throw new Error(`Each edge must join two nodes from 1 to ${n}.`)
    if (edge[0] === edge[1]) throw new Error('Self-loops are not allowed.')
  }
  return edges
}

// First find a node with two incoming edges (if any). Then union-find over all edges, skipping the second of
// those two; a cycle that remains means the first of them must go, otherwise the second one closes the cycle.
export function buildTrace(edges) {
  const n = edges.length
  const parentOf = Array(n + 1).fill(0)
  let first = null, second = null
  const frames = [{ phase: 'start', dsu: Array.from({ length: n }, (_, i) => i + 1), edge: null, candidates: null, activeLine: L('const parentOf = Array'), pythonLine: P('parent = [0]'), message: 'Look for a node that has two parents.' }]
  for (const [u, v] of edges) {
    if (parentOf[v] !== 0) {
      first = [parentOf[v], v]
      second = [u, v]
      frames.push({ phase: 'twoParents', dsu: Array.from({ length: n }, (_, i) => i + 1), edge: [u, v], candidates: [first, second], activeLine: L('first = [parentOf[v], v]'), pythonLine: P('first = [parent[v], v]'), message: `Node ${v} has two parents: ${first[0]} and ${u}.` })
    } else parentOf[v] = u
  }
  const root = Array.from({ length: n + 1 }, (_, i) => i)
  const find = x => (root[x] === x ? x : (root[x] = find(root[x])))
  const snapshot = () => Array.from({ length: n }, (_, i) => find(i + 1))
  let result = null
  for (const [u, v] of edges) {
    if (second && u === second[0] && v === second[1]) {
      frames.push({ phase: 'skip', dsu: snapshot(), edge: [u, v], candidates: second ? [first, second] : null, activeLine: L('if (second && u === second[0]'), pythonLine: P('if second and'), message: `Skip ${u} → ${v} for now; it is the second candidate.` })
      continue
    }
    const ru = find(u), rv = find(v)
    if (ru === rv) {
      result = first ?? [u, v]
      frames.push({ phase: 'cycle', dsu: snapshot(), edge: [u, v], candidates: second ? [first, second] : null, result, activeLine: L('if (ru === rv)'), pythonLine: P('if ru == rv'), message: `${u} → ${v} closes a cycle, so ${result[0]} → ${result[1]} is the edge to remove.` })
      break
    }
    root[rv] = ru
    frames.push({ phase: 'union', dsu: snapshot(), edge: [u, v], candidates: second ? [first, second] : null, activeLine: L('root[rv] = ru'), pythonLine: P('root[rv] = ru'), message: `Join ${u} and ${v} without a cycle.` })
  }
  if (result === null) result = second
  frames.push({ phase: 'done', dsu: snapshot(), edge: null, candidates: null, result, activeLine: L('return second'), pythonLine: P('return second'), message: `Remove ${result[0]} → ${result[1]}.` })
  return { input: edges, result, frames }
}

const SOURCE = `function findRedundantDirectedConnection(edges) {
  const n = edges.length
  const parentOf = Array(n + 1).fill(0)
  let first = null
  let second = null
  for (const [u, v] of edges) {
    if (parentOf[v] !== 0) {
      first = [parentOf[v], v]
      second = [u, v]
    } else {
      parentOf[v] = u
    }
  }
  const root = Array.from({ length: n + 1 }, (_, i) => i)
  const find = x => (root[x] === x ? x : (root[x] = find(root[x])))
  for (const [u, v] of edges) {
    if (second && u === second[0] && v === second[1]) continue
    const ru = find(u)
    const rv = find(v)
    if (ru === rv) return first ?? [u, v]
    root[rv] = ru
  }
  return second
}`
export const code = SOURCE.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def find_redundant_directed_connection(edges):
    n = len(edges)
    parent = [0] * (n + 1)
    first = second = None
    for u, v in edges:
        if parent[v] != 0:
            first = [parent[v], v]
            second = [u, v]
        else:
            parent[v] = u
    root = list(range(n + 1))

    def find(x):
        while root[x] != x:
            x = root[x]
        return x

    for u, v in edges:
        if second and u == second[0] and v == second[1]:
            continue
        ru, rv = find(u), find(v)
        if ru == rv:
            return first if first else [u, v]
        root[rv] = ru
    return second`
const P = s => python.split('\n').findIndex(t => t.includes(s)) + 1
