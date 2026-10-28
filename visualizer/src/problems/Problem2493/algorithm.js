export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with n and edges.')
  const { n, edges } = input
  if (!Number.isInteger(n) || n < 1 || n > 6) throw new Error('Use between 1 and 6 nodes, labelled 1 to n.')
  if (!Array.isArray(edges) || edges.length > 15) throw new Error('edges is a list of at most 15 pairs.')
  const seen = new Set()
  for (const e of edges) {
    if (!Array.isArray(e) || e.length !== 2 || !e.every(v => Number.isInteger(v) && v >= 1 && v <= n) || e[0] === e[1]) throw new Error('Each edge joins two different nodes from 1 to n.')
    const key = e[0] < e[1] ? `${e[0]},${e[1]}` : `${e[1]},${e[0]}`
    if (seen.has(key)) throw new Error('Each undirected edge appears once.')
    seen.add(key)
  }
  return input
}

export function buildTrace({ n, edges }) {
  // Nodes are shifted to 0-based inside the trace; labels show the original 1-based numbers.
  const adj = Array.from({ length: n }, () => [])
  const shifted = edges.map(([a, b]) => [a - 1, b - 1])
  for (const [a, b] of shifted) { adj[a].push(b); adj[b].push(a) }
  // Breadth-first levels from s; an edge between two nodes on the same level means an odd cycle.
  const levels = s => {
    const dist = new Map([[s, 1]])
    const queue = [s]
    for (let head = 0; head < queue.length; head++) {
      const u = queue[head]
      for (const v of adj[u]) {
        if (!dist.has(v)) { dist.set(v, dist.get(u) + 1); queue.push(v) }
        else if (dist.get(v) === dist.get(u)) return null
      }
    }
    return dist
  }
  const frames = [{ phase: 'start', activeLine: L('set total to zero'), start: null, dist: {}, message: 'Handle each connected piece on its own; the piece values add up.' }]
  let total = 0
  const placed = new Set()
  for (let s = 0; s < n; s++) {
    if (placed.has(s)) continue
    const base = levels(s)
    if (base === null) {
      frames.push({ phase: 'conflict', activeLine: L('return -1'), start: s, dist: {}, message: `Node ${s + 1} sits on an odd cycle, so the nodes cannot be divided.` })
      return { input: { n, edges }, result: -1, frames }
    }
    let best = 0
    for (const start of base.keys()) {
      placed.add(start)
      const dist = levels(start)
      const depth = Math.max(...dist.values())
      if (depth > best) best = depth
      frames.push({ phase: 'bfs', activeLine: L('for each start'), start, dist: Object.fromEntries(dist), message: `Starting at node ${start + 1} gives ${depth} group(s).` })
    }
    total += best
    frames.push({ phase: 'piece', activeLine: L('add the best'), start: null, dist: {}, message: `This piece contributes ${best} group(s); the total is ${total}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return total'), start: null, dist: {}, message: `Maximum number of groups: ${total}.` })
  return { input: { n, edges }, result: total, frames, shifted }
}

export const code = `maximum number of groups for a graph:
  set total to zero
  for each piece of connected nodes not yet placed
    if the piece has an edge joining two nodes on the same level then return -1
    set best to zero
    for each start in the piece, measure the number of levels from it and keep the largest
    add the best count to total
  return total`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def max_groups(n, edges):
    adj = [[] for _ in range(n + 1)]
    for a, b in edges:
        adj[a].append(b)
        adj[b].append(a)

    def levels(s):
        dist = {s: 1}
        queue = [s]
        for u in queue:
            for v in adj[u]:
                if v not in dist:
                    dist[v] = dist[u] + 1
                    queue.append(v)
                elif dist[v] == dist[u]:
                    return None
        return dist

    total = 0
    placed = set()
    for s in range(1, n + 1):
        if s in placed:
            continue
        base = levels(s)
        if base is None:
            return -1
        best = 0
        for start in base:
            placed.add(start)
            best = max(best, max(levels(start).values()))
        total += best
    return total
`
