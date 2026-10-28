export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Use an object with n and edges, for example {"n":4,"edges":[[0,1],[1,2],[2,3]]}.')
  const { n, edges } = data
  if (!Number.isInteger(n) || n < 2 || n > 12) throw new Error('n must be an integer from 2 to 12.')
  if (!Array.isArray(edges) || edges.length < n - 1 || edges.length > n) throw new Error('A connected graph with degree at most 2 has n - 1 or n edges.')
  const seen = new Set()
  const adj = Array.from({ length: n }, () => [])
  for (const e of edges) {
    if (!Array.isArray(e) || e.length !== 2 || !Number.isInteger(e[0]) || !Number.isInteger(e[1])) throw new Error('Each edge is a pair of node labels.')
    const [a, b] = e
    if (a < 0 || b < 0 || a >= n || b >= n) throw new Error('Edge endpoints must be labels from 0 to n - 1.')
    if (a === b) throw new Error('Self-loops are not allowed.')
    const id = a < b ? `${a},${b}` : `${b},${a}`
    if (seen.has(id)) throw new Error('Repeated edges are not allowed.')
    seen.add(id)
    adj[a].push(b)
    adj[b].push(a)
  }
  if (adj.some(list => list.length > 2)) throw new Error('Every node may have at most two neighbours.')
  const reached = new Set([0])
  const stack = [0]
  while (stack.length) for (const w of adj[stack.pop()]) if (!reached.has(w)) { reached.add(w); stack.push(w) }
  if (reached.size !== n) throw new Error('The graph must be connected.')
  return { n, edges: edges.map(e => [...e]) }
}

export function buildTrace(input) {
  const { n, edges } = input
  const adj = Array.from({ length: n }, () => [])
  for (const [a, b] of edges) { adj[a].push(b); adj[b].push(a) }
  // A connected graph with degree at most two is a path (n - 1 edges) or a cycle (n edges).
  const start = edges.length === n - 1 ? adj.findIndex(list => list.length === 1) : 0
  const order = [start]
  while (order.length < n) {
    const cur = order[order.length - 1]
    order.push(adj[cur].find(w => !order.includes(w)))
  }
  const odds = []
  for (let v = 1; v <= n; v += 2) odds.push(v)
  const evens = []
  for (let v = n % 2 === 0 ? n : n - 1; v >= 2; v -= 2) evens.push(v)
  const z = [...odds, ...evens]
  const value = Array(n).fill(0)
  const frames = [{ phase: 'start', activeLine: L('walk from the start'), at: -1, message: 'Walk along the path or cycle so that the nodes are in a line, then give the values in zigzag order.' }]
  order.forEach((v, i) => {
    value[v] = z[i]
    frames.push({ phase: 'assign', activeLine: L('give the i-th node'), at: i, message: `Node ${v} on the walk gets the value ${z[i]}.` })
  })
  let result = 0
  for (const [a, b] of edges) result += value[a] * value[b]
  frames.push({ phase: 'done', activeLine: L('return total'), at: -1, message: `The sum of the edge products is ${result}.` })
  return { input, result, frames, z }
}

export const code = `maximum sum of edge values (n, edges)
  build the neighbour list of every node
  if there are n - 1 edges then start at a node with one neighbour, else start at node 0
  walk from the start, appending an unvisited neighbour each time, to get an order of n nodes
  build the sequence z with the odd values 1, 3, 5 and then the even values from the largest down to 2
  give the i-th node of the order the value z[i]
  total is the sum over all edges of the value at one end times the value at the other end
  return total`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def max_sum_edge_values(n, edges):
    adj = [[] for _ in range(n)]
    for a, b in edges:
        adj[a].append(b)
        adj[b].append(a)
    if len(edges) == n - 1:
        start = next(v for v in range(n) if len(adj[v]) == 1)
    else:
        start = 0
    order = [start]
    while len(order) < n:
        cur = order[-1]
        order.append(next(w for w in adj[cur] if w not in order))
    z = list(range(1, n + 1, 2)) + list(range(n if n % 2 == 0 else n - 1, 0, -2))
    value = [0] * n
    for i, v in enumerate(order):
        value[v] = z[i]
    return sum(value[a] * value[b] for a, b in edges)
`
