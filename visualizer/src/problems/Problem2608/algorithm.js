export function parseInput(text) {
  const input = JSON.parse(text)
  const { n, edges } = input ?? {}
  if (!Number.isInteger(n) || n < 2 || n > 10) throw new Error('n is an integer from 2 to 10.')
  if (!Array.isArray(edges) || edges.length > 15) throw new Error('edges is a list of at most 15 pairs.')
  const seen = new Set()
  for (const e of edges) {
    if (!Array.isArray(e) || e.length !== 2 || e.some(v => !Number.isInteger(v) || v < 0 || v >= n)) throw new Error('Each edge is a pair of node numbers below n.')
    if (e[0] === e[1]) throw new Error('Edges cannot join a node to itself.')
    const k = e[0] < e[1] ? `${e[0]}-${e[1]}` : `${e[1]}-${e[0]}`
    if (seen.has(k)) throw new Error('Edges cannot repeat.')
    seen.add(k)
  }
  return { n, edges }
}

export function buildTrace(input) {
  const { n, edges } = input
  const adj = Array.from({ length: n }, () => [])
  for (const [u, v] of edges) {
    adj[u].push(v)
    adj[v].push(u)
  }
  let best = Infinity
  const frames = [{ phase: 'start', activeLine: L('set best to infinity'), source: null, current: null, reached: [], tags: {}, best: null, message: 'No cycle found yet.' }]
  const tags = {}
  for (let s = 0; s < n; s++) {
    const dist = Array(n).fill(-1)
    const parent = Array(n).fill(-1)
    dist[s] = 0
    const queue = [s]
    frames.push({ phase: 'source', activeLine: L('run a breadth first search'), source: s, current: s, reached: [s], tags: { ...tags }, best: best === Infinity ? null : best, message: `Search from node ${s}.` })
    for (let head = 0; head < queue.length; head++) {
      const u = queue[head]
      for (const v of adj[u]) {
        if (dist[v] === -1) {
          dist[v] = dist[u] + 1
          parent[v] = u
          queue.push(v)
        } else if (v !== parent[u]) {
          const candidate = dist[u] + dist[v] + 1
          const improved = candidate < best
          if (improved) best = candidate
          frames.push({ phase: improved ? 'better' : 'edge', activeLine: L(improved ? 'if candidate is less than best' : 'set candidate to'), source: s, current: u, reached: [...queue], tags: { ...tags }, best: best === Infinity ? null : best, message: improved ? `Edge ${u}-${v} closes a cycle of length ${candidate}. Best: ${best}.` : `Edge ${u}-${v} closes a walk of length ${candidate}, which is not shorter.` })
        }
      }
    }
    frames.push({ phase: 'done-source', activeLine: L('for each start node'), source: s, current: null, reached: [...queue], tags: { ...tags }, best: best === Infinity ? null : best, message: `Finished the search from node ${s}.` })
  }
  const result = best === Infinity ? -1 : best
  frames.push({ phase: 'done', activeLine: L('best is still infinity'), source: null, current: null, reached: [], tags: {}, best: result, message: `Shortest cycle length: ${result}.` })
  return { input, result, frames }
}

export const code = `length of the shortest cycle in an undirected graph, or minus one if there is none
  set best to infinity
  for each start node s
    run a breadth first search from s, recording the distance and parent of each node
    for each edge from a node u to a node v that is already reached and is not u's parent
      set candidate to distance of u plus distance of v plus one
      if candidate is less than best then set best to candidate
  if best is still infinity then return minus one
  return best`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def shortest_cycle(n, edges):
    adj = [[] for _ in range(n)]
    for u, v in edges:
        adj[u].append(v)
        adj[v].append(u)
    best = float('inf')
    for s in range(n):
        dist = [-1] * n
        parent = [-1] * n
        dist[s] = 0
        queue = [s]
        head = 0
        while head < len(queue):
            u = queue[head]
            head += 1
            for v in adj[u]:
                if dist[v] == -1:
                    dist[v] = dist[u] + 1
                    parent[v] = u
                    queue.append(v)
                elif v != parent[u]:
                    best = min(best, dist[u] + dist[v] + 1)
    return -1 if best == float('inf') else best
`
