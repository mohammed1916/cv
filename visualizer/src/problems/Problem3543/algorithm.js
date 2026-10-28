export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Use an object with n, edges, k and t, for example {"n":3,"edges":[[0,1,1],[1,2,2]],"k":2,"t":4}.')
  const { n, edges, k, t } = data
  if (!Number.isInteger(n) || n < 1 || n > 8) throw new Error('n must be an integer from 1 to 8.')
  if (!Array.isArray(edges) || edges.length > 12) throw new Error('edges must be a list of at most 12 [u, v, w] entries.')
  if (!Number.isInteger(k) || k < 0 || k > 12) throw new Error('k must be an integer from 0 to 12.')
  if (!Number.isInteger(t) || t < 1 || t > 60) throw new Error('t must be an integer from 1 to 60.')
  const seen = new Set()
  for (const e of edges) {
    if (!Array.isArray(e) || e.length !== 3) throw new Error('Each edge is [u, v, w].')
    const [u, v, w] = e
    if (!Number.isInteger(u) || !Number.isInteger(v) || u < 0 || v < 0 || u >= n || v >= n) throw new Error('Edge endpoints must be labels from 0 to n - 1.')
    if (u === v) throw new Error('Edges cannot be self-loops.')
    if (!Number.isInteger(w) || w < 1 || w > 10) throw new Error('Edge weights are integers from 1 to 10.')
    if (seen.has(`${u},${v}`)) throw new Error('Duplicate edges are not allowed.')
    seen.add(`${u},${v}`)
  }
  // Kahn's algorithm: every node must be removable, which means the graph has no cycle.
  const indeg = Array(n).fill(0)
  for (const [, v] of edges) indeg[v]++
  const queue = indeg.map((d, v) => (d === 0 ? v : -1)).filter(v => v >= 0)
  let removed = 0
  while (queue.length) {
    const u = queue.pop()
    removed++
    for (const [a, b] of edges) if (a === u && --indeg[b] === 0) queue.push(b)
  }
  if (removed !== n) throw new Error('The graph must be a directed acyclic graph.')
  return { n, edges: edges.map(e => [...e]), k, t }
}

export function buildTrace(input) {
  const { n, edges, k, t } = input
  let reach = Array.from({ length: n }, () => new Set([0]))
  const frames = [{ phase: 'start', activeLine: L('reach[v] to {0}'), layer: 0, best: null, message: 'Every node starts with one path of 0 edges and total weight 0.' }]
  for (let e = 1; e <= k; e++) {
    const next = Array.from({ length: n }, () => new Set())
    for (const [u, v, w] of edges) for (const s of reach[u]) if (s + w < t) next[v].add(s + w)
    reach = next
    const pairs = reach.reduce((count, set) => count + set.size, 0)
    frames.push({ phase: 'layer', activeLine: L('repeat k times'), layer: e, best: null, message: `${e} edge${e === 1 ? '' : 's'} used: ${pairs} (node, total) pairs are reachable with every total below t.` })
  }
  let best = -1
  for (const set of reach) for (const s of set) if (s > best) best = s
  frames.push({ phase: 'done', activeLine: L('return best'), layer: k, best, message: best === -1 ? 'No path with exactly k edges has a total below t, so the answer is -1.' : `The largest total below t is ${best}.` })
  return { input, result: best, frames }
}

export const code = `largest total below t (n, edges, k, t)
  for each node v set reach[v] to {0}, the totals of paths with 0 edges
  repeat k times
    set next[v] to an empty set for every node v
    for each edge (u, v, w)
      for each total s in reach[u]
        if s + w is less than t then add s + w to next[v]
    set reach to next
  set best to -1
  for each node v and each total s in reach[v]
    keep s in best if it is larger
  return best`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def max_weighted_k_edge_path(n, edges, k, t):
    reach = [{0} for _ in range(n)]
    for _ in range(k):
        nxt = [set() for _ in range(n)]
        for u, v, w in edges:
            for s in reach[u]:
                if s + w < t:
                    nxt[v].add(s + w)
        reach = nxt
    best = -1
    for totals in reach:
        for s in totals:
            best = max(best, s)
    return best
`
