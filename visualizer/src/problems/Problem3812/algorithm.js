export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object') throw new Error('Use an object with n, edges, start and target.')
  const { n, edges, start, target } = input
  if (!Number.isInteger(n) || n < 2 || n > 12) throw new Error('n is an integer from 2 to 12.')
  if (!Array.isArray(edges) || edges.length !== n - 1) throw new Error('edges has n - 1 pairs.')
  if (!edges.every(e => Array.isArray(e) && e.length === 2 && e.every(v => Number.isInteger(v) && v >= 0 && v < n))) throw new Error('Each edge is a pair of node numbers.')
  if (typeof start !== 'string' || typeof target !== 'string' || start.length !== n || target.length !== n || !/^[01]+$/.test(start + target)) throw new Error('start and target are binary strings of length n.')
  const seen = new Set([0])
  const stack = [0]
  while (stack.length) {
    const v = stack.pop()
    for (const [a, b] of edges) {
      if (a === v && !seen.has(b)) { seen.add(b); stack.push(b) }
      if (b === v && !seen.has(a)) { seen.add(a); stack.push(a) }
    }
  }
  if (seen.size !== n) throw new Error('edges must connect every node into one tree.')
  return { n, edges, start, target }
}

export function buildTrace({ n, edges, start, target }) {
  const frames = []
  const adj = Array.from({ length: n }, () => [])
  edges.forEach(([a, b], idx) => { adj[a].push([b, idx]); adj[b].push([a, idx]) })
  const parent = Array(n).fill(-1)
  const parentEdge = Array(n).fill(-1)
  const order = [0]
  const seen = Array(n).fill(false)
  seen[0] = true
  for (let k = 0; k < order.length; k++) {
    const v = order[k]
    for (const [w, idx] of adj[v]) if (!seen[w]) { seen[w] = true; parent[w] = v; parentEdge[w] = idx; order.push(w) }
  }
  const need = Array.from({ length: n }, (_, i) => (start[i] !== target[i] ? 1 : 0))
  const chosen = []
  frames.push({ pythonLine: P('order = [0]'), phase: 'order', activeLine: C('root the tree'), at: 0, need: [...need], chosen: [], message: 'Root the tree at node 0 and visit nodes from the leaves upward.' })
  for (let k = order.length - 1; k >= 1; k--) {
    const v = order[k]
    if (need[v]) {
      chosen.push(parentEdge[v])
      need[v] ^= 1
      need[parent[v]] ^= 1
      frames.push({ pythonLine: P('chosen.append'), phase: 'leaf', activeLine: C('if the node still differs'), at: v, need: [...need], chosen: [...chosen],
        message: `Node ${v} still differs, so toggle edge ${parentEdge[v]} to its parent ${parent[v]}.` })
    } else {
      frames.push({ pythonLine: P('if need[v]'), phase: 'leaf', activeLine: C('if the node still differs'), at: v, need: [...need], chosen: [...chosen],
        message: `Node ${v} already matches its target, so edge ${parentEdge[v]} stays unused.` })
    }
  }
  const impossible = need[0] === 1
  const result = impossible ? [-1] : [...chosen].sort((a, b) => a - b)
  frames.push({ pythonLine: P('if need[0]'), phase: 'root', activeLine: C('if the root still differs'), at: 0, need: [...need], chosen: [...chosen],
    message: impossible ? 'The root still differs: the parity of mismatches is odd, so no sequence works.' : 'The root matches, so every node matches.' })
  frames.push({ pythonLine: P('return sorted'), phase: 'done', activeLine: C('return the chosen'), at: -1, need: [...need], chosen: result, message: `Answer: ${result.join(', ')}.` })
  return { input: { n, edges, start, target }, result, frames }
}

export function solve(input) {
  return buildTrace(input).result
}

export const code = `list the edge indices that turn start into target, or [-1]
  root the tree at node 0 with a breadth-first order
  mark each node whose start and target colors differ
  for each node except the root, deepest first
    if the node still differs then toggle its parent edge and flip the parent mark
  if the root still differs then return [-1]
  return the chosen edge indices in increasing order`.split('\n').map((text, index) => ({ line: index + 1, text: text.trim() }))

export const python = `def min_edge_toggles(n, edges, start, target):
    adj = [[] for _ in range(n)]
    for idx, (a, b) in enumerate(edges):
        adj[a].append((b, idx))
        adj[b].append((a, idx))
    parent = [-1] * n
    parent_edge = [-1] * n
    order = [0]
    seen = [False] * n
    seen[0] = True
    for v in order:
        for w, idx in adj[v]:
            if not seen[w]:
                seen[w] = True
                parent[w] = v
                parent_edge[w] = idx
                order.append(w)
    need = [int(start[i] != target[i]) for i in range(n)]
    chosen = []
    for v in reversed(order[1:]):
        if need[v]:
            chosen.append(parent_edge[v])
            need[v] ^= 1
            need[parent[v]] ^= 1
    if need[0]:
        return [-1]
    return sorted(chosen)
`

const PY = python.split('\n')
const CODE = code.map(c => c.text)
function P(text) { return PY.findIndex(line => line.includes(text)) + 1 }
function C(text) { return CODE.findIndex(line => line.includes(text)) + 1 }
