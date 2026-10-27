export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with n, edges, values and k.')
  const { n, edges, values, k } = input
  if (!Number.isInteger(n) || n < 2 || n > 12) throw new Error('n must be an integer from 2 to 12.')
  if (!Array.isArray(edges) || edges.length !== n - 1) throw new Error(`edges must hold exactly ${n - 1} pairs.`)
  if (!Array.isArray(values) || values.length !== n || values.some(v => !Number.isInteger(v) || v < 0 || v > 50)) throw new Error('values must hold n integers from 0 to 50.')
  if (!Number.isInteger(k) || k < 1 || k > 10) throw new Error('k must be an integer from 1 to 10.')
  if (values.reduce((a, b) => a + b, 0) % k !== 0) throw new Error('The total of values must be divisible by k.')
  const owner = Array.from({ length: n }, (_, i) => i)
  const find = x => (owner[x] === x ? x : (owner[x] = find(owner[x])))
  for (const pair of edges) {
    if (!Array.isArray(pair) || pair.length !== 2 || !pair.every(v => Number.isInteger(v) && v >= 0 && v < n) || pair[0] === pair[1]) throw new Error('Each edge is a pair [a, b] of different node numbers from 0 to n-1.')
    const a = find(pair[0]), b = find(pair[1])
    if (a === b) throw new Error('The edges must form a tree, without cycles.')
    owner[a] = b
  }
  return { n, edges, values, k }
}

export const code = `maximum number of components whose sums are all divisible by k
  root the tree at node 0 and order nodes so children come before parents
  set total of each node to its own value
  for each node v from the bottom up
    let passed be the total of v
    if the total of v is divisible by k then
      add one to the count and set passed to 0 because the edge above v is cut
    add passed to the total of the parent of v when v has a parent
  return the count`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export function buildTrace({ n, edges, values, k }) {
  const adj = Array.from({ length: n }, () => [])
  edges.forEach(([a, b]) => { adj[a].push(b); adj[b].push(a) })
  const parentOf = Array(n).fill(-1)
  const children = Array.from({ length: n }, () => [])
  const seen = Array(n).fill(false)
  seen[0] = true
  const order = [0]
  for (let q = 0; q < order.length; q++) {
    const p = order[q]
    for (const c of adj[p]) {
      if (seen[c]) continue
      seen[c] = true
      parentOf[c] = p
      children[p].push(c)
      order.push(c)
    }
  }
  const total = [...values]
  const cuts = []
  let count = 0
  const frames = [{ phase: 'start', activeLine: L('root the tree at node 0'), current: null, total: [...total], cuts: [], count, message: `Root the tree at node 0. Every cut component must sum to a multiple of ${k}.` }]
  for (let i = order.length - 1; i >= 0; i--) {
    const v = order[i]
    const divisible = total[v] % k === 0
    let passed = total[v]
    if (divisible) {
      count++
      cuts.push(v)
      passed = 0
      frames.push({ phase: 'cut', activeLine: L('add one to the count'), current: v, total: [...total], cuts: [...cuts], count, message: `Subtree of ${v} sums to ${total[v]}, divisible by ${k}. Cut above it; count is ${count}.` })
    } else {
      frames.push({ phase: 'climb', activeLine: L('add passed to the total'), current: v, total: [...total], cuts: [...cuts], count, message: `Subtree of ${v} sums to ${total[v]}, not divisible by ${k}. Pass it up.` })
    }
    if (parentOf[v] !== -1) total[parentOf[v]] += passed
  }
  const toTree = id => ({ id, children: children[id].map(child => toTree(child)) })
  frames.push({ phase: 'done', activeLine: L('return the count'), current: null, total: [...total], cuts: [...cuts], count, message: `Maximum number of components: ${count}.` })
  return { input: { n, edges, values, k }, tree: toTree(0), result: count, frames }
}

export const python = `def max_k_divisible_components(n, edges, values, k):
    adj = [[] for _ in range(n)]
    for a, b in edges:
        adj[a].append(b)
        adj[b].append(a)
    parent = [-1] * n
    seen = [False] * n
    seen[0] = True
    order = [0]
    for current in order:
        for other in adj[current]:
            if not seen[other]:
                seen[other] = True
                parent[other] = current
                order.append(other)
    total = list(values)
    count = 0
    for current in reversed(order):
        passed = total[current]
        if passed % k == 0:
            count += 1
            passed = 0
        if parent[current] != -1:
            total[parent[current]] += passed
    return count
`
