export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || !Array.isArray(data.nums) || data.nums.length < 3 || data.nums.length > 12 || data.nums.some(v => !Number.isInteger(v) || v < 1 || v > 1000)) {
    throw new Error('Use nums of 3 to 12 integers from 1 to 1000.')
  }
  const n = data.nums.length
  if (!Array.isArray(data.edges) || data.edges.length !== n - 1 || data.edges.some(e => !Array.isArray(e) || e.length !== 2 || e.some(v => !Number.isInteger(v) || v < 0 || v >= n) || e[0] === e[1])) {
    throw new Error(`Use n - 1 edges, each a pair of distinct node indices from 0 to ${n - 1}.`)
  }
  const parent = Array.from({ length: n }, (_, i) => i)
  const find = x => (parent[x] === x ? x : (parent[x] = find(parent[x])))
  for (const [a, b] of data.edges) {
    const ra = find(a), rb = find(b)
    if (ra === rb) throw new Error('The edges must form a tree with no cycle.')
    parent[ra] = rb
  }
  return { nums: data.nums, edges: data.edges }
}

export function buildTrace({ nums, edges }) {
  const n = nums.length
  const adj = Array.from({ length: n }, () => [])
  for (const [a, b] of edges) { adj[a].push(b); adj[b].push(a) }
  const parent = Array(n).fill(-1), seen = Array(n).fill(false), order = []
  seen[0] = true
  const stack = [0]
  while (stack.length) {
    const u = stack.pop()
    order.push(u)
    for (const w of adj[u]) if (!seen[w]) { seen[w] = true; parent[w] = u; stack.push(w) }
  }
  const sub = [...nums]
  for (const u of [...order].reverse()) if (parent[u] >= 0) sub[parent[u]] ^= sub[u]
  const total = sub[0]
  const isAncestor = (a, b) => {
    for (let x = b; x !== -1; x = parent[x]) if (x === a) return true
    return false
  }
  const frames = [{ phase: 'start', activeLine: L('root the tree at node'), pair: null, parts: null, score: null, best: null, sub: [...sub], total, message: `Rooted at node 0. The xor of all values is ${total}.` }]
  let best = null
  for (let u = 1; u < n; u++) {
    for (let v = u + 1; v < n; v++) {
      let parts
      if (isAncestor(u, v)) parts = [sub[v], sub[u] ^ sub[v], total ^ sub[u]]
      else if (isAncestor(v, u)) parts = [sub[u], sub[v] ^ sub[u], total ^ sub[v]]
      else parts = [sub[u], sub[v], total ^ sub[u] ^ sub[v]]
      const score = Math.max(...parts) - Math.min(...parts)
      const improved = best === null || score < best
      if (improved) best = score
      frames.push({ phase: 'pair', activeLine: L(improved ? 'if the score is less than best' : 'score is the largest'), pair: [u, v], parts, score, best, sub: [...sub], total, message: `Cut above ${u} and ${v}: parts ${parts.join(', ')}, score ${score}${improved ? ', the best so far' : ''}.` })
    }
  }
  frames.push({ phase: 'done', activeLine: L('return best'), pair: null, parts: null, score: null, best, sub: [...sub], total, result: best, message: `Minimum score: ${best}.` })
  return { input: { nums, edges }, result: best, frames }
}

export const code = `minimum score after removing two edges
  root the tree at node zero and find the xor of every subtree
  set best to infinity
  for each pair of non-root nodes u and v
    if u is an ancestor of v or v of u then
      the three parts are the lower subtree, the middle part, and the rest
    otherwise the three parts are the two subtrees and the rest of the tree
    score is the largest part xor minus the smallest part xor
    if the score is less than best then set best to score
  return best`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def minimum_score_after_removals(nums, edges):
    n = len(nums)
    adj = [[] for _ in range(n)]
    for a, b in edges:
        adj[a].append(b)
        adj[b].append(a)
    parent = [-1] * n
    seen = [False] * n
    seen[0] = True
    order = []
    stack = [0]
    while stack:
        u = stack.pop()
        order.append(u)
        for w in adj[u]:
            if not seen[w]:
                seen[w] = True
                parent[w] = u
                stack.append(w)
    sub = list(nums)
    for u in reversed(order):
        if parent[u] >= 0:
            sub[parent[u]] ^= sub[u]
    total = sub[0]

    def is_ancestor(a, b):
        while b != -1:
            if b == a:
                return True
            b = parent[b]
        return False

    best = None
    for u in range(1, n):
        for v in range(u + 1, n):
            if is_ancestor(u, v):
                parts = [sub[v], sub[u] ^ sub[v], total ^ sub[u]]
            elif is_ancestor(v, u):
                parts = [sub[u], sub[v] ^ sub[u], total ^ sub[v]]
            else:
                parts = [sub[u], sub[v], total ^ sub[u] ^ sub[v]]
            score = max(parts) - min(parts)
            if best is None or score < best:
                best = score
    return best
`
