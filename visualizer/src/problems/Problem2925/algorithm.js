export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with edges and values, such as {"edges":[[0,1]],"values":[1,2]}.')
  const { edges, values } = input
  if (!Array.isArray(values) || values.length < 2 || values.length > 10) throw new Error('values must hold 2 to 10 integers.')
  const n = values.length
  if (values.some(v => !Number.isInteger(v) || v < 1 || v > 20)) throw new Error('Each value is an integer from 1 to 20.')
  if (!Array.isArray(edges) || edges.length !== n - 1) throw new Error(`edges must hold exactly ${n - 1} pairs.`)
  const owner = Array.from({ length: n }, (_, i) => i)
  const find = x => (owner[x] === x ? x : (owner[x] = find(owner[x])))
  for (const pair of edges) {
    if (!Array.isArray(pair) || pair.length !== 2 || !pair.every(v => Number.isInteger(v) && v >= 0 && v < n) || pair[0] === pair[1]) throw new Error('Each edge is a pair [a, b] of different node numbers from 0 to n-1.')
    const a = find(pair[0]), b = find(pair[1])
    if (a === b) throw new Error('The edges must form a tree, without cycles.')
    owner[a] = b
  }
  return { edges, values }
}

export const code = `maximum score by zeroing values while every root-to-leaf path keeps a positive value
  root the tree at node 0 and order nodes so children come before parents
  for each node v from the bottom up
    if v has no children then
      set best of v to the value of v
    otherwise
      set best of v to the smaller of the value of v and the sum of best over the children of v
  return the total of all values minus best of node 0`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export function buildTrace({ edges, values }) {
  const n = values.length
  const adj = Array.from({ length: n }, () => [])
  edges.forEach(([a, b]) => { adj[a].push(b); adj[b].push(a) })
  const children = Array.from({ length: n }, () => [])
  const seen = Array(n).fill(false)
  seen[0] = true
  const order = [0]
  for (let q = 0; q < order.length; q++) {
    const p = order[q]
    for (const c of adj[p]) {
      if (seen[c]) continue
      seen[c] = true
      children[p].push(c)
      order.push(c)
    }
  }
  const best = Array(n).fill(null)
  const frames = [{ phase: 'order', activeLine: L('root the tree at node 0'), current: null, best: [...best], message: 'Root the tree at node 0. Handle every node after its children.' }]
  for (let i = order.length - 1; i >= 0; i--) {
    const v = order[i]
    if (children[v].length === 0) {
      best[v] = values[v]
      frames.push({ phase: 'leaf', activeLine: L('set best of v to the value of v'), current: v, best: [...best], message: `Leaf ${v} must keep its value ${values[v]} to stay healthy.` })
    } else {
      const sum = children[v].reduce((total, c) => total + best[c], 0)
      best[v] = Math.min(values[v], sum)
      frames.push({ phase: 'choose', activeLine: L('the smaller of'), current: v, best: [...best], message: `Node ${v}: keep it (${values[v]}) or keep its children (${sum}); the smaller cost is ${best[v]}.` })
    }
  }
  const total = values.reduce((a, b) => a + b, 0)
  const result = total - best[0]
  const toTree = id => ({ id, children: children[id].map(child => toTree(child)) })
  frames.push({ phase: 'done', activeLine: L('return the total of all values'), current: null, best: [...best], message: `Kept value is ${best[0]}, so the score is ${total} minus ${best[0]} = ${result}.` })
  return { input: { edges, values }, tree: toTree(0), values: [...values], result, frames }
}

export const python = `def max_score_after_operations(edges, values):
    n = len(values)
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
    best = [0] * n
    for current in reversed(order):
        children = [other for other in adj[current] if parent[other] == current]
        if not children:
            best[current] = values[current]
        else:
            best[current] = min(values[current], sum(best[child] for child in children))
    return sum(values) - best[0]
`
