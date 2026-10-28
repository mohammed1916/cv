export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Use an object with edges, nums and k, for example {"edges":[[0,1],[0,2]],"nums":[0,-1,-2],"k":3}.')
  const { edges, nums, k } = data
  if (!Array.isArray(nums) || nums.length < 2 || nums.length > 12) throw new Error('nums must have 2 to 12 entries.')
  const n = nums.length
  if (nums.some(v => !Number.isInteger(v) || Math.abs(v) > 20)) throw new Error('Each value is an integer from -20 to 20.')
  if (!Number.isInteger(k) || k < 1 || k > 6) throw new Error('k must be an integer from 1 to 6.')
  if (!Array.isArray(edges) || edges.length !== n - 1) throw new Error('edges must have n - 1 pairs.')
  const adj = Array.from({ length: n }, () => [])
  for (const e of edges) {
    if (!Array.isArray(e) || e.length !== 2 || !Number.isInteger(e[0]) || !Number.isInteger(e[1])) throw new Error('Each edge is a pair of node labels.')
    const [a, b] = e
    if (a < 0 || b < 0 || a >= n || b >= n || a === b) throw new Error('Edge endpoints must be different labels from 0 to n - 1.')
    adj[a].push(b)
    adj[b].push(a)
  }
  const seen = new Set([0])
  const stack = [0]
  while (stack.length) for (const w of adj[stack.pop()]) if (!seen.has(w)) { seen.add(w); stack.push(w) }
  if (seen.size !== n) throw new Error('The edges must form a tree that connects every node.')
  return { edges: edges.map(e => [...e]), nums: [...nums], k }
}

export function buildTrace(input) {
  const { edges, nums, k } = input
  const n = nums.length
  const adj = Array.from({ length: n }, () => [])
  for (const [a, b] of edges) { adj[a].push(b); adj[b].push(a) }
  const parent = Array(n).fill(-1)
  const order = [0]
  const visited = Array(n).fill(false)
  visited[0] = true
  for (let i = 0; i < order.length; i++) {
    for (const w of adj[order[i]]) if (!visited[w]) { visited[w] = true; parent[w] = order[i]; order.push(w) }
  }
  const children = Array.from({ length: n }, () => [])
  for (const v of order.slice(1)) children[parent[v]].push(v)
  // table[v][d][p]: best subtree sum when d is the distance to the nearest chosen strict ancestor (k means k or more, or none) and p is the parity of chosen strict ancestors.
  const table = Array(n).fill(null)
  const frames = [{ phase: 'start', activeLine: L('for each node v, from the bottom of the list'), node: null, best: null, message: 'Process nodes from the bottom of the tree up. Each node records its best sum for every distance and parity above it.' }]
  for (let i = order.length - 1; i >= 0; i--) {
    const v = order[i]
    const here = {}
    for (let d = 1; d <= k; d++) {
      for (let p = 0; p <= 1; p++) {
        const options = []
        for (let c = 0; c <= 1; c++) {
          if (c === 1 && d !== k) continue
          const parity = p ^ c
          let total = parity === 0 ? nums[v] : -nums[v]
          const childD = c === 1 ? 1 : Math.min(k, d + 1)
          for (const ch of children[v]) total += table[ch][`${childD},${parity}`]
          options.push(total)
        }
        here[`${d},${p}`] = Math.max(...options)
      }
    }
    table[v] = here
    frames.push({ phase: 'node', activeLine: L('for each distance d from 1 to k'), node: v, best: null, message: `Node ${v} is done. Its best sum with no inverted ancestor is ${here[`${k},0`]}.` })
  }
  const result = table[0][`${k},0`]
  frames.push({ phase: 'done', activeLine: L('return the best sum at the root'), node: 0, best: result, message: `The largest achievable sum is ${result}.` })
  return { input, result, frames }
}

export const code = `subtree inversion sum (edges, nums, k)
  root the tree at node 0 and list the nodes so that children come before parents
  for each node v, from the bottom of the list
    for each distance d from 1 to k and each parity p of inverted ancestors
      for each choice c of inverting v, where c is allowed only if d equals k
        the sign of v flips when p xor c is 1
        the children see distance 1 if c is 1, else d plus 1 capped at k
        total is the signed value of v plus the best child totals
      keep the largest total for (d, p)
  return the best sum at the root for distance k and parity 0`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def subtree_inversion_sum(edges, nums, k):
    n = len(nums)
    adj = [[] for _ in range(n)]
    for a, b in edges:
        adj[a].append(b)
        adj[b].append(a)
    parent = [-1] * n
    order = [0]
    seen = [False] * n
    seen[0] = True
    for v in order:
        for w in adj[v]:
            if not seen[w]:
                seen[w] = True
                parent[w] = v
                order.append(w)
    children = [[] for _ in range(n)]
    for v in order[1:]:
        children[parent[v]].append(v)
    table = [None] * n
    for v in reversed(order):
        here = {}
        for d in range(1, k + 1):
            for p in (0, 1):
                options = []
                for c in (0, 1):
                    if c == 1 and d != k:
                        continue
                    parity = p ^ c
                    total = nums[v] if parity == 0 else -nums[v]
                    child_d = 1 if c == 1 else min(k, d + 1)
                    for ch in children[v]:
                        total += table[ch][(child_d, parity)]
                    options.append(total)
                here[(d, p)] = max(options)
        table[v] = here
    return table[0][(k, 0)]
`
