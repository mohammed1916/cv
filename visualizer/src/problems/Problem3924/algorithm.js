export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || !Number.isInteger(data.n) || !Array.isArray(data.edges)) throw new Error('Use {"n": n, "edges": [[u, v, w], ...], "source": s, "target": t, "k": k}.')
  const { n, edges, source, target, k } = data
  if (n < 1 || n > 8) throw new Error('n is an integer from 1 to 8 for the visualization.')
  if (edges.length > 10) throw new Error('Use at most 10 edges.')
  for (const e of edges) {
    if (!Array.isArray(e) || e.length !== 3) throw new Error('Each edge is [u, v, w].')
    const [u, v, w] = e
    if (![u, v].every(x => Number.isInteger(x) && x >= 0 && x < n)) throw new Error('Edge endpoints must be node labels from 0 to n-1.')
    if (!Number.isInteger(w) || w < 1 || w > 6) throw new Error('Edge weights are integers from 1 to 6 for the visualization.')
  }
  if (![source, target].every(x => Number.isInteger(x) && x >= 0 && x < n)) throw new Error('source and target must be nodes from 0 to n-1.')
  if (!Number.isInteger(k) || k < 0 || k > edges.length) throw new Error('k is an integer from 0 to edges.length.')
  return { n, edges, source, target, k }
}

// Fewest heavy edges (weight above t) needed to reach each node, found with a 0-1 search.
function fewestHeavy(n, adj, source, t) {
  const dist = Array(n).fill(null)
  dist[source] = 0
  const deque = [source]
  while (deque.length) {
    const u = deque.shift()
    for (const [v, w] of adj[u]) {
      const cost = w > t ? 1 : 0
      const candidate = dist[u] + cost
      if (dist[v] === null || candidate < dist[v]) {
        dist[v] = candidate
        if (cost) deque.push(v)
        else deque.unshift(v)
      }
    }
  }
  return dist
}

export function buildTrace(input) {
  const { n, edges, source, target, k } = input
  const adj = Array.from({ length: n }, () => [])
  for (const [u, v, w] of edges) { adj[u].push([v, w]); adj[v].push([u, w]) }
  const candidates = [...new Set([0, ...edges.map(e => e[2])])].sort((a, b) => a - b)
  const frames = [{ phase: 'start', activeLine: L('let candidates be'), t: null, dist: Array(n).fill(null), candidates, found: null, result: null, message: `Candidate thresholds: ${candidates.join(', ')}. Try them from the smallest.` }]
  for (const t of candidates) {
    const dist = fewestHeavy(n, adj, source, t)
    frames.push({ phase: 'try', activeLine: L('run a 0-1 search'), t, dist, candidates, found: null, result: null, message: `Threshold ${t}: the target needs ${dist[target] === null ? 'no path' : dist[target] + ' heavy edge(s)'}, allowed ${k}.` })
    if (dist[target] !== null && dist[target] <= k) {
      frames.push({ phase: 'found', activeLine: L('return t'), t, dist, candidates, found: t, result: t, message: `Threshold ${t} works, so it is the answer.` })
      return { input, result: t, frames }
    }
  }
  frames.push({ phase: 'none', activeLine: L('return -1'), t: null, dist: Array(n).fill(null), candidates, found: null, result: -1, message: 'No threshold gives a path with at most k heavy edges, so the answer is -1.' })
  return { input, result: -1, frames }
}

export const code = `minimum threshold for a path with at most k heavy edges
  let candidates be 0 and every edge weight, sorted
  for each threshold t in candidates
    let dist be the fewest heavy edges to reach each node
    run a 0-1 search from source where an edge is heavy if its weight is above t
    if dist of target is at most k then
      return t
  return -1`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def minimum_threshold_path(n, edges, source, target, k):
    from collections import deque
    adj = [[] for _ in range(n)]
    for u, v, w in edges:
        adj[u].append((v, w))
        adj[v].append((u, w))
    candidates = sorted({0} | {w for _, _, w in edges})
    for t in candidates:
        dist = [None] * n
        dist[source] = 0
        dq = deque([source])
        while dq:
            u = dq.popleft()
            for v, w in adj[u]:
                cost = 1 if w > t else 0
                if dist[v] is None or dist[u] + cost < dist[v]:
                    dist[v] = dist[u] + cost
                    if cost:
                        dq.append(v)
                    else:
                        dq.appendleft(v)
        if dist[target] is not None and dist[target] <= k:
            return t
    return -1
`
