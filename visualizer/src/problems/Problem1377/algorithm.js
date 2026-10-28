export function parseInput(text) {
  const obj = JSON.parse(text)
  if (!obj || typeof obj !== 'object' || !Number.isInteger(obj.n) || !Array.isArray(obj.edges) || !Number.isInteger(obj.t) || !Number.isInteger(obj.target)) {
    throw new Error('Use a JSON object with integers n, t and target, and an edges array.')
  }
  const { n, edges, t, target } = obj
  if (n < 1 || n > 20) throw new Error('n must be from 1 to 20 (visualization cap).')
  if (edges.length !== n - 1) throw new Error('A tree with n vertices has n - 1 edges.')
  for (const e of edges) {
    if (!Array.isArray(e) || e.length !== 2 || !e.every(v => Number.isInteger(v) && v >= 1 && v <= n) || e[0] === e[1]) {
      throw new Error('Each edge is a pair of different vertices from 1 to n.')
    }
  }
  const adj = Array.from({ length: n + 1 }, () => [])
  for (const [a, b] of edges) { adj[a].push(b); adj[b].push(a) }
  const seen = new Set([1])
  const queue = [1]
  for (let head = 0; head < queue.length; head++) {
    for (const u of adj[queue[head]]) if (!seen.has(u)) { seen.add(u); queue.push(u) }
  }
  if (seen.size !== n) throw new Error('The edges must connect all n vertices.')
  if (t < 1 || t > 20) throw new Error('t must be from 1 to 20 (visualization cap).')
  if (target < 1 || target > n) throw new Error('target must be a vertex from 1 to n.')
  return { n, edges, t, target }
}

export function buildTrace(input) {
  const { n, edges, t, target } = input
  const adj = Array.from({ length: n + 1 }, () => [])
  for (const [a, b] of edges) { adj[a].push(b); adj[b].push(a) }
  const prob = new Array(n + 1).fill(0)
  const depth = new Array(n + 1).fill(-1)
  const parent = new Array(n + 1).fill(0)
  prob[1] = 1
  depth[1] = 0
  const queue = [1]
  const frames = [{ phase: 'start', activeLine: L('set prob[1] to 1'), vertex: 1, prob: [...prob], message: 'The frog starts at vertex 1 with probability 1.' }]
  for (let head = 0; head < queue.length; head++) {
    const v = queue[head]
    frames.push({ phase: 'visit', activeLine: L('take vertex v'), vertex: v, prob: [...prob], message: `The frog reaches vertex ${v} at time ${depth[v]} with probability ${prob[v].toFixed(4)}.` })
    const children = adj[v].filter(u => u !== parent[v])
    for (const u of children) {
      parent[u] = v
      depth[u] = depth[v] + 1
      prob[u] = prob[v] / children.length
      queue.push(u)
    }
    if (children.length > 0) {
      frames.push({ phase: 'split', activeLine: L('each child gets'), vertex: v, prob: [...prob], message: `Vertex ${v} splits its probability over ${children.length} unvisited child(ren).` })
    }
  }
  const hasChildren = adj[target].some(u => u !== parent[target])
  const counted = depth[target] === t || (depth[target] < t && !hasChildren)
  const result = counted ? prob[target] : 0
  frames.push({ phase: 'check', activeLine: L('if depth[target]'), vertex: target, prob: [...prob], message: `Vertex ${target} is reached at time ${depth[target]}, and the question asks about time ${t}.` })
  frames.push({ phase: 'done', activeLine: L(counted ? 'return prob[target]' : 'return 0'), vertex: target, prob: [...prob], message: `Probability at ${target}: ${result.toFixed(6)}.` })
  return { input, n, edges, t, target, result, frames }
}

export const code = `frog probability after t seconds, starting at vertex 1
  set prob[1] to 1 and depth[1] to 0
  queue = [1]
  while the queue is not empty do
    take vertex v from the front of the queue
    let k be the number of unvisited children of v
    each child gets prob[v] divided by k (when k is not zero) and depth[v] + 1
    add the children to the queue
  if depth[target] equals t, or depth[target] is less than t and target has no children then
    return prob[target]
  return 0`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def frog_position(n, edges, t, target):
    adj = [[] for _ in range(n + 1)]
    for a, b in edges:
        adj[a].append(b)
        adj[b].append(a)
    prob = [0.0] * (n + 1)
    depth = [-1] * (n + 1)
    parent = [0] * (n + 1)
    prob[1] = 1.0
    depth[1] = 0
    queue = [1]
    for v in queue:
        children = [u for u in adj[v] if u != parent[v]]
        for u in children:
            parent[u] = v
            depth[u] = depth[v] + 1
            prob[u] = prob[v] / len(children)
            queue.append(u)
    has_children = any(u != parent[target] for u in adj[target])
    if depth[target] == t or (depth[target] < t and not has_children):
        return prob[target]
    return 0.0
`
