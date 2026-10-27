export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with n, edges and k, such as {"n":3,"edges":[[0,1,5],[1,2,3]],"k":1}.')
  const { n, edges, k } = input
  if (!Number.isInteger(n) || n < 2 || n > 10) throw new Error('n must be an integer from 2 to 10.')
  if (!Array.isArray(edges) || edges.length !== n - 1) throw new Error(`edges must hold exactly ${n - 1} triples [a, b, weight].`)
  if (!Number.isInteger(k) || k < 1 || k > 4) throw new Error('k must be an integer from 1 to 4.')
  const owner = Array.from({ length: n }, (_, i) => i)
  const find = x => (owner[x] === x ? x : (owner[x] = find(owner[x])))
  for (const triple of edges) {
    if (!Array.isArray(triple) || triple.length !== 3) throw new Error('Each edge is a triple [a, b, weight].')
    const [a, b, w] = triple
    if (![a, b].every(v => Number.isInteger(v) && v >= 0 && v < n) || a === b) throw new Error('Edge endpoints are different node numbers from 0 to n-1.')
    if (!Number.isInteger(w) || w < 1 || w > 50) throw new Error('Edge weights are integers from 1 to 50.')
    const x = find(a), y = find(b)
    if (x === y) throw new Error('The edges must form a tree, without cycles.')
    owner[x] = y
  }
  return { n, edges, k }
}

export const code = `maximum total weight of kept edges where every node keeps at most k edges
  root the tree at node 0 and order nodes so children come before parents
  for each node v from the bottom up
    set base to the sum of free over the children of v
    for each child c, gain is linked of c plus the weight of its edge minus free of c
    sort the positive gains from largest to smallest
    set free of v to base plus the top k gains
    set linked of v to base plus the top k minus 1 gains
  return free of node 0`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export function buildTrace({ n, edges, k }) {
  const adj = Array.from({ length: n }, () => [])
  edges.forEach(([a, b, w]) => { adj[a].push({ to: b, w }); adj[b].push({ to: a, w }) })
  const children = Array.from({ length: n }, () => [])
  const seen = Array(n).fill(false)
  seen[0] = true
  const order = [0]
  for (let q = 0; q < order.length; q++) {
    const p = order[q]
    for (const { to, w } of adj[p]) {
      if (seen[to]) continue
      seen[to] = true
      children[p].push({ to, w })
      order.push(to)
    }
  }
  const free = Array(n).fill(null)
  const linked = Array(n).fill(null)
  const frames = [{ phase: 'order', activeLine: L('root the tree at node 0'), current: null, free: [...free], linked: [...linked], message: `Root the tree at node 0. Each node may keep at most ${k} edges to its children.` }]
  for (let i = order.length - 1; i >= 0; i--) {
    const v = order[i]
    let base = 0
    const gains = []
    for (const { to, w } of children[v]) {
      base += free[to]
      gains.push(linked[to] + w - free[to])
    }
    const positive = gains.filter(g => g > 0).sort((a, b) => b - a)
    const takeFree = positive.slice(0, k).reduce((sum, g) => sum + g, 0)
    const takeLinked = positive.slice(0, k - 1).reduce((sum, g) => sum + g, 0)
    free[v] = base + takeFree
    linked[v] = base + takeLinked
    frames.push({ phase: 'combine', activeLine: L('set free of v to base'), current: v, free: [...free], linked: [...linked], message: `Node ${v}: free ${free[v]} (parent edge removed), linked ${linked[v]} (parent edge kept).` })
  }
  const toTree = id => ({ id, children: children[id].map(child => toTree(child.to)) })
  frames.push({ phase: 'done', activeLine: L('return free of node 0'), current: null, free: [...free], linked: [...linked], message: `Maximum total weight: ${free[0]}.` })
  return { input: { n, edges, k }, tree: toTree(0), result: free[0], frames }
}

export const python = `def maximize_edge_weight_sum(n, edges, k):
    adj = [[] for _ in range(n)]
    for a, b, w in edges:
        adj[a].append((b, w))
        adj[b].append((a, w))
    parent = [-1] * n
    seen = [False] * n
    seen[0] = True
    order = [0]
    for current in order:
        for other, w in adj[current]:
            if not seen[other]:
                seen[other] = True
                parent[other] = current
                order.append(other)
    free = [0] * n
    linked = [0] * n
    for current in reversed(order):
        base = 0
        gains = []
        for other, w in adj[current]:
            if parent[other] == current:
                base += free[other]
                gains.append(linked[other] + w - free[other])
        positive = sorted((g for g in gains if g > 0), reverse=True)
        free[current] = base + sum(positive[:k])
        linked[current] = base + sum(positive[:k - 1])
    return free[0]
`
