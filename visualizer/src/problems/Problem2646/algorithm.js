export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with n, edges, price and trips.')
  const { n, edges, price, trips } = input
  if (!Number.isInteger(n) || n < 2 || n > 8) throw new Error('n must be an integer from 2 to 8.')
  if (!Array.isArray(edges) || edges.length !== n - 1) throw new Error('A tree on n nodes needs n - 1 edges.')
  const parentOf = Array.from({ length: n }, (_, i) => i)
  const find = x => (parentOf[x] === x ? x : (parentOf[x] = find(parentOf[x])))
  for (const e of edges) {
    if (!Array.isArray(e) || e.length !== 2 || e.some(x => !Number.isInteger(x) || x < 0 || x >= n)) throw new Error('Each edge joins two nodes from 0 to n-1.')
    if (find(e[0]) === find(e[1])) throw new Error('The edges must form a tree without cycles.')
    parentOf[find(e[0])] = find(e[1])
  }
  if (!Array.isArray(price) || price.length !== n || price.some(p => !Number.isInteger(p) || p < 2 || p > 20 || p % 2 !== 0)) {
    throw new Error('price has one even integer from 2 to 20 per node, so halving stays whole.')
  }
  if (!Array.isArray(trips) || trips.length < 1 || trips.length > 4) throw new Error('Give 1 to 4 trips.')
  for (const t of trips) {
    if (!Array.isArray(t) || t.length !== 2 || t.some(x => !Number.isInteger(x) || x < 0 || x >= n)) throw new Error('Each trip is a pair of nodes from 0 to n-1.')
  }
  return { n, edges, price, trips }
}

export function buildTrace({ n, edges, price, trips }) {
  const adjacency = Array.from({ length: n }, () => [])
  for (const [a, b] of edges) { adjacency[a].push(b); adjacency[b].push(a) }
  const parent = Array(n).fill(-1)
  const level = Array(n).fill(0)
  const seen = Array(n).fill(false)
  seen[0] = true
  const order = [0]
  for (const v of order) {
    for (const w of adjacency[v]) if (!seen[w]) { seen[w] = true; parent[w] = v; level[w] = level[v] + 1; order.push(w) }
  }
  const children = Array.from({ length: n }, () => [])
  for (const v of order.slice(1)) children[parent[v]].push(v)
  const frames = []
  const count = Array(n).fill(0)
  const tree = id => ({ id, children: children[id].map(tree) })
  frames.push({ phase: 'root', activeLine: L('root the tree at node 0'), node: 0, path: [], keep: null, halve: null, message: 'Root the tree at node 0 and record parents and levels.' })
  trips.forEach(([s, t], ti) => {
    const path = []
    let a = s, b = t
    while (a !== b) {
      if (level[a] >= level[b]) { path.push(a); count[a]++; a = parent[a] } else { path.push(b); count[b]++; b = parent[b] }
    }
    path.push(a); count[a]++
    frames.push({ phase: 'trip', activeLine: L('walk the path from s to t'), node: a, path: [...path], keep: null, halve: null, message: `Trip ${ti} from ${s} to ${t} uses nodes ${path.join(', ')}.` })
  })
  const keep = Array(n).fill(0)
  const halve = Array(n).fill(0)
  for (const v of [...order].reverse()) {
    keep[v] = count[v] * price[v] + children[v].reduce((sum, c) => sum + Math.min(keep[c], halve[c]), 0)
    halve[v] = (count[v] * price[v]) / 2 + children[v].reduce((sum, c) => sum + keep[c], 0)
    frames.push({ phase: 'dp', activeLine: L('set keep to'), node: v, path: [], keep: keep[v], halve: halve[v], message: `Node ${v}: keep ${keep[v]}, halve ${halve[v]}.` })
  }
  const result = Math.min(keep[0], halve[0])
  frames.push({ phase: 'done', activeLine: L('return the smaller'), node: -1, path: [], keep: keep[0], halve: halve[0], message: `Minimum total price: ${result}.` })
  return { input: { n, edges, price, trips }, root: tree(0), result, frames }
}

export const code = `minimum total price after halving some non-adjacent nodes
  root the tree at node 0 and record parents and an order from the root down
  set count of every node to 0
  for each trip (s, t)
    walk the path from s to t and add one to the count of each node on it
  for each node v in reverse order, children before parents
    set keep to count of v times price of v plus the sum of the smaller of keep and halve over children
    set halve to count of v times half its price plus the sum of keep over children
  return the smaller of keep and halve at node 0`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def min_total_price(n, edges, price, trips):
    adjacency = [[] for _ in range(n)]
    for a, b in edges:
        adjacency[a].append(b)
        adjacency[b].append(a)
    parent = [-1] * n
    level = [0] * n
    seen = [False] * n
    seen[0] = True
    order = [0]
    for v in order:
        for w in adjacency[v]:
            if not seen[w]:
                seen[w] = True
                parent[w] = v
                level[w] = level[v] + 1
                order.append(w)
    children = [[] for _ in range(n)]
    for v in order[1:]:
        children[parent[v]].append(v)
    count = [0] * n
    for s, t in trips:
        a, b = s, t
        while a != b:
            if level[a] >= level[b]:
                count[a] += 1
                a = parent[a]
            else:
                count[b] += 1
                b = parent[b]
        count[a] += 1
    keep = [0] * n
    halve = [0] * n
    for v in reversed(order):
        keep[v] = count[v] * price[v] + sum(min(keep[c], halve[c]) for c in children[v])
        halve[v] = count[v] * price[v] // 2 + sum(keep[c] for c in children[v])
    return min(keep[0], halve[0])
`
