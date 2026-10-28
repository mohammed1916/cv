export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || !Number.isInteger(input.n) || !Array.isArray(input.edges) || !Array.isArray(input.group)) throw new Error('Use a JSON object with n, edges and group.')
  const { n, edges, group } = input
  if (n < 1 || n > 12) throw new Error('n must be an integer from 1 to 12 (visualization cap).')
  if (edges.length !== n - 1 || group.length !== n) throw new Error('edges needs n - 1 pairs and group needs n labels.')
  if (edges.some(e => !Array.isArray(e) || e.length !== 2 || !Number.isInteger(e[0]) || !Number.isInteger(e[1]) || e[0] < 0 || e[1] < 0 || e[0] >= n || e[1] >= n || e[0] === e[1])) throw new Error('Each edge joins two different nodes from 0 to n - 1.')
  if (group.some(g => !Number.isInteger(g) || g < 1 || g > 20)) throw new Error('group labels are integers from 1 to 20.')
  const adj = Array.from({ length: n }, () => [])
  for (const [u, v] of edges) { adj[u].push(v); adj[v].push(u) }
  const seen = new Set([0])
  const queue = [0]
  for (let h = 0; h < queue.length; h++) for (const y of adj[queue[h]]) if (!seen.has(y)) { seen.add(y); queue.push(y) }
  if (seen.size !== n) throw new Error('edges must form a tree.')
  return input
}

export function buildTrace(input) {
  const { n, edges, group } = input
  const adj = Array.from({ length: n }, () => [])
  for (const [u, v] of edges) { adj[u].push(v); adj[v].push(u) }
  const dist = []
  const frames = []
  for (let s = 0; s < n; s++) {
    const d = Array(n).fill(-1)
    d[s] = 0
    const queue = [s]
    for (let h = 0; h < queue.length; h++) {
      const x = queue[h]
      for (const y of adj[x]) if (d[y] < 0) { d[y] = d[x] + 1; queue.push(y) }
    }
    dist.push(d)
    frames.push({ phase: 'bfs', activeLine: L('find distance from s'), source: s, pair: null, total: 0, message: `Distances from node ${s} are found by breadth-first search.` })
  }
  let total = 0
  for (let u = 0; u < n; u++) {
    for (let v = u + 1; v < n; v++) {
      if (group[u] !== group[v]) continue
      total += dist[u][v]
      frames.push({ phase: 'pair', activeLine: L('add dist(u, v)'), source: -1, pair: [u, v], total, message: `Nodes ${u} and ${v} share group ${group[u]} and are ${dist[u][v]} edge(s) apart. Total: ${total}.` })
    }
  }
  frames.push({ phase: 'done', activeLine: L('return total'), source: -1, pair: null, total, message: `Total interaction cost: ${total}.` })
  return { input, result: total, frames, dist }
}

export const code = `total interaction cost (n, edges, group):
  build adjacency lists from the edges
  for each start node s
    find distance from s to every node by breadth-first search
  total = 0
  for each pair of nodes u < v
    if group[u] equals group[v] then add dist(u, v) to total
  return total`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def total_sum_of_interaction_cost_in_tree_groups(n, edges, group):
    from collections import deque
    adj = [[] for _ in range(n)]
    for u, v in edges:
        adj[u].append(v)
        adj[v].append(u)
    dist = []
    for s in range(n):
        d = [-1] * n
        d[s] = 0
        q = deque([s])
        while q:
            x = q.popleft()
            for y in adj[x]:
                if d[y] < 0:
                    d[y] = d[x] + 1
                    q.append(y)
        dist.append(d)
    total = 0
    for u in range(n):
        for v in range(u + 1, n):
            if group[u] == group[v]:
                total += dist[u][v]
    return total
`
