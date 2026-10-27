export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Use an object with edges, bob and amount.')
  const { edges, bob, amount } = data
  if (!Array.isArray(amount) || amount.length < 2 || amount.length > 12) throw new Error('amount must have 2 to 12 entries.')
  if (amount.some(v => !Number.isInteger(v) || v % 2 !== 0 || v < -10000 || v > 10000)) throw new Error('Each amount is an even integer from -10000 to 10000.')
  const n = amount.length
  if (!Array.isArray(edges) || edges.length !== n - 1) throw new Error('edges must list exactly n - 1 pairs for a tree.')
  const adj = Array.from({ length: n }, () => [])
  for (const e of edges) {
    if (!Array.isArray(e) || e.length !== 2 || !Number.isInteger(e[0]) || !Number.isInteger(e[1]) || e[0] < 0 || e[1] < 0 || e[0] >= n || e[1] >= n || e[0] === e[1]) {
      throw new Error('Each edge is a pair of different nodes from 0 to n-1.')
    }
    adj[e[0]].push(e[1])
    adj[e[1]].push(e[0])
  }
  const seen = new Set([0])
  const queue = [0]
  for (let i = 0; i < queue.length; i++) for (const w of adj[queue[i]]) if (!seen.has(w)) { seen.add(w); queue.push(w) }
  if (seen.size !== n) throw new Error('edges must connect every node into one tree.')
  if (!Number.isInteger(bob) || bob < 0 || bob >= n) throw new Error('bob must be a node from 0 to n-1.')
  return { edges, bob, amount }
}

export const code = `maximum net income Alice can earn on a path from node zero to a leaf
  build the tree and set each parent and depth by a search from node zero
  walk from bob up to zero and record when bob reaches each node on his path
  bobTime of a node is the steps from bob to it, or unset if bob never reaches it
  run a search from node zero for Alice, with her time equal to the depth
  gain amount of u if Alice arrives first, half if they arrive together, and zero if Bob arrived first
  if u is a leaf other than node zero then compare its total with the best
  return the best total`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export function buildTrace({ edges, bob, amount }) {
  const n = amount.length
  const adj = Array.from({ length: n }, () => [])
  for (const [u, v] of edges) { adj[u].push(v); adj[v].push(u) }
  const parent = Array(n).fill(-1)
  const depth = Array(n).fill(-1)
  depth[0] = 0
  const order = [0]
  for (let i = 0; i < order.length; i++) {
    const u = order[i]
    for (const w of adj[u]) if (depth[w] < 0) { depth[w] = depth[u] + 1; parent[w] = u; order.push(w) }
  }
  const bobTime = Array(n).fill(Infinity)
  for (let u = bob; u !== -1; u = parent[u]) bobTime[u] = depth[bob] - depth[u]
  const frames = [{ phase: 'start', activeLine: L('build the tree'), node: -1, bobTime: [...bobTime], best: null, message: `Bob starts at ${bob} and walks toward node 0.` }]
  let best = null
  const visit = (u, from, income) => {
    const t = depth[u]
    let gain
    let who
    if (t < bobTime[u]) { gain = amount[u]; who = 'Alice first' } else if (t === bobTime[u]) { gain = amount[u] / 2; who = 'together, halved' } else { gain = 0; who = 'Bob first' }
    const total = income + gain
    frames.push({ phase: 'alice', activeLine: L('gain amount of u'), node: u, bobTime: [...bobTime], best, message: `Node ${u} at time ${t}: ${who}; income ${total}.` })
    const kids = adj[u].filter(w => w !== from)
    if (u !== 0 && kids.length === 0) {
      best = best === null ? total : Math.max(best, total)
      frames.push({ phase: 'leaf', activeLine: L('if u is a leaf'), node: u, bobTime: [...bobTime], best, message: `Leaf ${u} gives total ${total}; best is ${best}.` })
    }
    for (const w of kids) visit(w, u, total)
  }
  visit(0, -1, 0)
  frames.push({ phase: 'done', activeLine: L('return the best total'), node: -1, bobTime: [...bobTime], best, message: `Best total: ${best}.` })
  return { input: { edges, bob, amount }, bobTime, result: best, frames }
}

export const python = `def most_profitable_path(edges, bob, amount):
    n = len(amount)
    adj = [[] for _ in range(n)]
    for u, v in edges:
        adj[u].append(v)
        adj[v].append(u)
    parent = [-1] * n
    depth = [-1] * n
    depth[0] = 0
    order = [0]
    for u in order:
        for w in adj[u]:
            if depth[w] < 0:
                depth[w] = depth[u] + 1
                parent[w] = u
                order.append(w)
    bob_time = [float('inf')] * n
    u = bob
    while u != -1:
        bob_time[u] = depth[bob] - depth[u]
        u = parent[u]
    best = None
    stack = [(0, -1, 0)]
    while stack:
        u, from_node, income = stack.pop()
        t = depth[u]
        if t < bob_time[u]:
            gain = amount[u]
        elif t == bob_time[u]:
            gain = amount[u] / 2
        else:
            gain = 0
        total = income + gain
        kids = [w for w in adj[u] if w != from_node]
        if u != 0 and not kids:
            best = total if best is None else max(best, total)
        for w in kids:
            stack.append((w, u, total))
    return best
`
