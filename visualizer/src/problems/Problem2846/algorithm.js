export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Use an object with n, edges and queries.')
  const { n, edges, queries } = data
  if (!Number.isInteger(n) || n < 2 || n > 10) throw new Error('n must be an integer from 2 to 10.')
  if (!Array.isArray(edges) || edges.length !== n - 1) throw new Error('edges must list exactly n - 1 [u, v, w] triples.')
  const adj = Array.from({ length: n }, () => [])
  for (const e of edges) {
    if (!Array.isArray(e) || e.length !== 3 || !e.every(Number.isInteger) || e[0] < 0 || e[1] < 0 || e[0] >= n || e[1] >= n || e[0] === e[1] || e[2] < 1 || e[2] > 26) {
      throw new Error('Each edge is [u, v, w] with different nodes from 0 to n-1 and weight from 1 to 26.')
    }
    adj[e[0]].push(e[1])
    adj[e[1]].push(e[0])
  }
  const seen = new Set([0])
  const queue = [0]
  for (let i = 0; i < queue.length; i++) for (const w of adj[queue[i]]) if (!seen.has(w)) { seen.add(w); queue.push(w) }
  if (seen.size !== n) throw new Error('edges must connect every node into one tree.')
  if (!Array.isArray(queries) || queries.length < 1 || queries.length > 6) throw new Error('queries must be an array of 1 to 6 [a, b] pairs.')
  for (const q of queries) {
    if (!Array.isArray(q) || q.length !== 2 || !Number.isInteger(q[0]) || !Number.isInteger(q[1]) || q[0] < 0 || q[1] < 0 || q[0] >= n || q[1] >= n) {
      throw new Error('Each query is [a, b] with nodes from 0 to n-1.')
    }
  }
  return { n, edges, queries }
}

export const code = `minimum changes so every edge on each query path has the same weight
  build the tree and root it at node zero, recording each parent, depth and parent edge weight
  let answers be an empty list
  for each query [a, b]
  collect the weights along the path from a up to the meeting point and from b up to it
  count how many times each weight appears on the path
  the path length minus the highest count is the cost
  append the cost to answers
  return answers`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export function buildTrace({ n, edges, queries }) {
  const adj = Array.from({ length: n }, () => [])
  for (const [u, v, w] of edges) { adj[u].push([v, w]); adj[v].push([u, w]) }
  const parent = Array(n).fill(-1)
  const depth = Array(n).fill(-1)
  const parentWeight = Array(n).fill(0)
  depth[0] = 0
  const order = [0]
  for (let i = 0; i < order.length; i++) {
    const u = order[i]
    for (const [w, weight] of adj[u]) {
      if (depth[w] < 0) { depth[w] = depth[u] + 1; parent[w] = u; parentWeight[w] = weight; order.push(w) }
    }
  }
  const frames = [{ phase: 'start', activeLine: L('build the tree'), weights: [], cost: null, message: 'Root the tree at node 0 so each query path can be climbed.' }]
  const answers = []
  for (const [a0, b0] of queries) {
    let x = a0
    let y = b0
    const weights = []
    while (x !== y) {
      if (depth[x] >= depth[y]) { weights.push(parentWeight[x]); x = parent[x] } else { weights.push(parentWeight[y]); y = parent[y] }
    }
    const counts = new Map()
    for (const w of weights) counts.set(w, (counts.get(w) || 0) + 1)
    const top = Math.max(0, ...counts.values())
    const cost = weights.length - top
    answers.push(cost)
    frames.push({ phase: 'query', activeLine: L('the path length minus'), weights: [...weights], cost, message: `Path ${a0} to ${b0} has ${weights.length} edge(s); keeping the most common weight leaves ${cost} change(s).` })
  }
  frames.push({ phase: 'done', activeLine: L('return answers'), weights: [], cost: null, message: `Answers: [${answers.join(', ')}].` })
  return { input: { n, edges, queries }, result: answers, frames }
}

export const python = `def equilibrium_queries(n, edges, queries):
    adj = [[] for _ in range(n)]
    for u, v, w in edges:
        adj[u].append((v, w))
        adj[v].append((u, w))
    parent = [-1] * n
    depth = [-1] * n
    parent_weight = [0] * n
    depth[0] = 0
    order = [0]
    for u in order:
        for w, weight in adj[u]:
            if depth[w] < 0:
                depth[w] = depth[u] + 1
                parent[w] = u
                parent_weight[w] = weight
                order.append(w)
    answers = []
    for a, b in queries:
        x, y = a, b
        weights = []
        while x != y:
            if depth[x] >= depth[y]:
                weights.append(parent_weight[x])
                x = parent[x]
            else:
                weights.append(parent_weight[y])
                y = parent[y]
        counts = {}
        for w in weights:
            counts[w] = counts.get(w, 0) + 1
        top = max(counts.values(), default=0)
        answers.append(len(weights) - top)
    return answers
`
