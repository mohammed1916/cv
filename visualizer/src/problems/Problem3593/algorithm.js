export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Use an object with n, edges and cost, for example {"n":3,"edges":[[0,1],[0,2]],"cost":[2,1,3]}.')
  const { n, edges, cost } = data
  if (!Number.isInteger(n) || n < 2 || n > 8) throw new Error('n must be an integer from 2 to 8.')
  if (!Array.isArray(edges) || edges.length !== n - 1) throw new Error('edges must have n - 1 pairs.')
  if (!Array.isArray(cost) || cost.length !== n || cost.some(c => !Number.isInteger(c) || c < 1 || c > 9)) throw new Error('cost must have n integers from 1 to 9.')
  const adj = Array.from({ length: n }, () => [])
  for (const e of edges) {
    if (!Array.isArray(e) || e.length !== 2 || e.some(x => !Number.isInteger(x) || x < 0 || x >= n) || e[0] === e[1]) throw new Error('Each edge is a pair of different nodes from 0 to n - 1.')
    adj[e[0]].push(e[1])
    adj[e[1]].push(e[0])
  }
  const reached = new Set([0])
  const stack = [0]
  while (stack.length) for (const w of adj[stack.pop()]) if (!reached.has(w)) { reached.add(w); stack.push(w) }
  if (reached.size !== n) throw new Error('edges must form a tree.')
  return { n, edges: edges.map(e => [...e]), cost: [...cost] }
}

export function buildTrace(input) {
  const { n, edges, cost } = input
  const adj = Array.from({ length: n }, () => [])
  for (const [a, b] of edges) { adj[a].push(b); adj[b].push(a) }
  const parent = Array(n).fill(-1)
  const order = [0]
  const seen = Array(n).fill(false)
  seen[0] = true
  for (let i = 0; i < order.length; i++) {
    for (const w of adj[order[i]]) if (!seen[w]) { seen[w] = true; parent[w] = order[i]; order.push(w) }
  }
  const children = Array.from({ length: n }, () => [])
  for (const v of order.slice(1)) children[parent[v]].push(v)
  const total = Array(n).fill(0)
  let raised = 0
  const frames = [{ phase: 'start', activeLine: L('for each node v from the bottom'), node: null, raised: 0, message: 'Work from the leaves up. Each node sees the path totals of its children.' }]
  for (let i = order.length - 1; i >= 0; i--) {
    const v = order[i]
    if (children[v].length === 0) {
      total[v] = cost[v]
      frames.push({ phase: 'leaf', activeLine: L('if v is a leaf'), node: v, raised, message: `Leaf ${v} has path total ${total[v]}.` })
      continue
    }
    const target = Math.max(...children[v].map(c => total[c]))
    let lifts = 0
    for (const c of children[v]) if (total[c] < target) lifts++
    raised += lifts
    total[v] = target + cost[v]
    frames.push({ phase: 'node', activeLine: L('count the children'), node: v, raised, message: `Node ${v}: ${lifts} child${lifts === 1 ? '' : 'ren'} must be raised to ${target}. Running count: ${raised}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return the count'), node: 0, raised, message: `The minimum number of raised nodes is ${raised}.` })
  return { input, result: raised, frames }
}

export const code = `minimum increments to equalize leaf paths (n, edges, cost)
  root the tree at node 0 and list the nodes so that children come before parents
  set raised to 0
  for each node v from the bottom of the list
    if v is a leaf then set total[v] to cost[v]
    otherwise let target be the largest total among the children of v
      count the children whose total is below target and add them to raised
      set total[v] to target plus cost[v]
  return the count raised`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def min_increments_to_equalize(n, edges, cost):
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
    total = [0] * n
    raised = 0
    for v in reversed(order):
        if not children[v]:
            total[v] = cost[v]
            continue
        target = max(total[c] for c in children[v])
        raised += sum(1 for c in children[v] if total[c] < target)
        total[v] = target + cost[v]
    return raised
`
