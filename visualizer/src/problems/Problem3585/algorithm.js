export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Use an object with n, edges and queries, for example {"n":2,"edges":[[0,1,7]],"queries":[[1,0]]}.')
  const { n, edges, queries } = data
  if (!Number.isInteger(n) || n < 2 || n > 8) throw new Error('n must be an integer from 2 to 8.')
  if (!Array.isArray(edges) || edges.length !== n - 1) throw new Error('edges must have n - 1 entries.')
  const adj = Array.from({ length: n }, () => [])
  for (const e of edges) {
    if (!Array.isArray(e) || e.length !== 3 || !Number.isInteger(e[0]) || !Number.isInteger(e[1]) || e[0] < 0 || e[1] < 0 || e[0] >= n || e[1] >= n || e[0] === e[1]) throw new Error('Each edge is [u, v, w] with two different nodes from 0 to n - 1.')
    if (!Number.isInteger(e[2]) || e[2] < 1 || e[2] > 20) throw new Error('Edge weights are integers from 1 to 20.')
    adj[e[0]].push(e[1])
    adj[e[1]].push(e[0])
  }
  const reached = new Set([0])
  const stack = [0]
  while (stack.length) for (const w of adj[stack.pop()]) if (!reached.has(w)) { reached.add(w); stack.push(w) }
  if (reached.size !== n) throw new Error('edges must form a tree.')
  if (!Array.isArray(queries) || queries.length < 1 || queries.length > 6) throw new Error('queries must have 1 to 6 pairs.')
  for (const q of queries) {
    if (!Array.isArray(q) || q.length !== 2 || q.some(x => !Number.isInteger(x) || x < 0 || x >= n)) throw new Error('Each query is [u, v] with nodes from 0 to n - 1.')
  }
  return { n, edges: edges.map(e => [...e]), queries: queries.map(q => [...q]) }
}

export function buildTrace(input) {
  const { n, edges, queries } = input
  const adj = Array.from({ length: n }, () => [])
  for (const [a, b, w] of edges) { adj[a].push([b, w]); adj[b].push([a, w]) }
  const parent = Array(n).fill(-1)
  const depth = Array(n).fill(0)
  const dist = Array(n).fill(0)
  const seen = Array(n).fill(false)
  seen[0] = true
  const order = [0]
  for (let i = 0; i < order.length; i++) {
    const v = order[i]
    for (const [w, c] of adj[v]) if (!seen[w]) {
      seen[w] = true
      parent[w] = v
      depth[w] = depth[v] + 1
      dist[w] = dist[v] + c
      order.push(w)
    }
  }
  const frames = [{ phase: 'start', activeLine: L('root the tree at node 0'), query: null, median: null, message: 'Root the tree at node 0 and record each node distance from the root.' }]
  const answers = []
  for (const [u, v] of queries) {
    // Climb from u and v to their lowest common ancestor, keeping the nodes on each side.
    let a = u
    let b = v
    const upA = [u]
    const upB = [v]
    while (a !== b) {
      if (depth[a] >= depth[b]) { a = parent[a]; upA.push(a) } else { b = parent[b]; upB.push(b) }
    }
    const lca = a
    const total = dist[u] + dist[v] - 2 * dist[lca]
    const path = [...upA.map(x => [x, dist[u] - dist[x]]), ...upB.slice(0, -1).reverse().map(x => [x, (dist[u] - dist[lca]) + (dist[x] - dist[lca])])]
    const hit = path.find(([, cum]) => 2 * cum >= total)
    answers.push(hit[0])
    frames.push({ phase: 'query', activeLine: L('take the first node on the path'), query: [u, v], median: hit[0], message: `Path ${u} to ${v} has total weight ${total}. Its weighted median is node ${hit[0]}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return the answers'), query: null, median: null, message: 'Every query has its weighted median.' })
  return { input, result: answers, frames }
}

export const code = `weighted median nodes (n, edges, queries)
  root the tree at node 0 and record the distance from the root to every node
  set answers to an empty list
  for each query (u, v)
    climb from u and from v until both reach their lowest common ancestor
    list the path from u to v, with the weight from u to each node
    set total to the weight of the whole path
    take the first node on the path whose weight from u is at least half of total
    append that node to answers
  return the answers`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def weighted_medians(n, edges, queries):
    adj = [[] for _ in range(n)]
    for a, b, w in edges:
        adj[a].append((b, w))
        adj[b].append((a, w))
    parent = [-1] * n
    depth = [0] * n
    dist = [0] * n
    seen = [False] * n
    seen[0] = True
    order = [0]
    for v in order:
        for w, c in adj[v]:
            if not seen[w]:
                seen[w] = True
                parent[w] = v
                depth[w] = depth[v] + 1
                dist[w] = dist[v] + c
                order.append(w)
    answers = []
    for u, v in queries:
        a, b = u, v
        up_a = [u]
        up_b = [v]
        while a != b:
            if depth[a] >= depth[b]:
                a = parent[a]
                up_a.append(a)
            else:
                b = parent[b]
                up_b.append(b)
        lca = a
        total = dist[u] + dist[v] - 2 * dist[lca]
        path = [(x, dist[u] - dist[x]) for x in up_a]
        path += [(x, (dist[u] - dist[lca]) + (dist[x] - dist[lca])) for x in reversed(up_b[:-1])]
        for x, cum in path:
            if 2 * cum >= total:
                answers.append(x)
                break
    return answers
`
