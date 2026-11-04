import { queryChain, updateChain } from '../../components/shared/fenwickModel.js'

export const MAX_NODES = 15
export const MAX_QUERIES = 12

const isIn = (value, low, high) => Number.isInteger(value) && value >= low && value <= high

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with n, edges and queries.')
  const { n, edges, queries } = input
  if (!isIn(n, 1, MAX_NODES)) throw new Error(`n is an integer from 1 to ${MAX_NODES} in this visualization.`)
  if (!Array.isArray(edges) || edges.length !== n - 1) throw new Error('edges must hold exactly n - 1 entries.')
  const adjacent = Array.from({ length: n + 1 }, () => [])
  const known = new Set()
  for (const edge of edges) {
    if (!Array.isArray(edge) || edge.length !== 3) throw new Error('Each edge is [u, v, w].')
    const [u, v, w] = edge
    if (!isIn(u, 1, n) || !isIn(v, 1, n) || u === v) throw new Error('Edge endpoints are two different nodes from 1 to n.')
    if (!isIn(w, 1, 10000)) throw new Error('Edge weights are integers from 1 to 10000.')
    adjacent[u].push(v)
    adjacent[v].push(u)
    known.add(`${Math.min(u, v)},${Math.max(u, v)}`)
  }
  const seen = new Set([1])
  const pending = [1]
  while (pending.length) for (const next of adjacent[pending.pop()]) if (!seen.has(next)) { seen.add(next); pending.push(next) }
  if (seen.size !== n) throw new Error('The edges must connect all nodes into one tree.')
  if (!Array.isArray(queries) || queries.length < 1 || queries.length > MAX_QUERIES) throw new Error(`queries has 1 to ${MAX_QUERIES} entries in this visualization.`)
  for (const query of queries) {
    if (!Array.isArray(query)) throw new Error('Each query is [1, u, v, w] or [2, x].')
    if (query[0] === 2 && query.length === 2) {
      if (!isIn(query[1], 1, n)) throw new Error('A distance query names a node from 1 to n.')
    } else if (query[0] === 1 && query.length === 4) {
      const [, u, v, w] = query
      if (!isIn(u, 1, n) || !isIn(v, 1, n) || !known.has(`${Math.min(u, v)},${Math.max(u, v)}`)) throw new Error('An update must name an existing edge.')
      if (!isIn(w, 1, 10000)) throw new Error('Edge weights are integers from 1 to 10000.')
    } else throw new Error('Each query is [1, u, v, w] or [2, x].')
  }
  return { n, edges, queries }
}

export const code = `store each edge in both directions
walk the tree from node 1, numbering nodes in visit order
so each subtree occupies one contiguous range of positions
measure every subtree size, from the deepest nodes back up
an edge's weight counts toward every node below it
so load each weight as a range add over the child's subtree
for each query
  if it asks for a distance
    the node's distance is a prefix sum up to its position
  otherwise find the child end of the edge
    add the weight change at the start of the child's range
    cancel the change just after the end of that range
    store the new weight
return the collected distances`.split('\n').map((text, index) => ({ line: index + 1, text }))

const L = s => {
  const index = code.findIndex(c => c.text.includes(s))
  if (index < 0) throw new Error(`Pseudocode line missing: ${s}`)
  return index + 1
}

export const python = `def tree_queries(n, edges, queries):
    graph = [[] for _ in range(n + 1)]
    for u, v, w in edges:
        graph[u].append((v, w))
        graph[v].append((u, w))
    parent = [0] * (n + 1)
    weight = [0] * (n + 1)
    tin = [0] * (n + 1)
    order = []
    stack = [1]
    while stack:
        node = stack.pop()
        order.append(node)
        tin[node] = len(order)
        for nxt, w in graph[node]:
            if nxt != parent[node]:
                parent[nxt], weight[nxt] = node, w
                stack.append(nxt)
    size = [1] * (n + 1)
    for node in reversed(order[1:]):
        size[parent[node]] += size[node]
    tree = [0] * (n + 1)

    def add(i, delta):
        while i <= n:
            tree[i] += delta
            i += i & -i

    def range_add(node, delta):
        add(tin[node], delta)
        add(tin[node] + size[node], -delta)

    for node in order[1:]:
        range_add(node, weight[node])
    answer = []
    for query in queries:
        if query[0] == 2:
            i, total = tin[query[1]], 0
            while i:
                total += tree[i]
                i -= i & -i
            answer.append(total)
        else:
            _, u, v, new = query
            child = v if parent[v] == u else u
            range_add(child, new - weight[child])
            weight[child] = new
    return answer
`

const P = s => {
  const index = python.trim().split('\n').findIndex(line => line.includes(s))
  if (index < 0) throw new Error(`Python line missing: ${s}`)
  return index + 1
}

export const phases = [
  { id: 'read', label: 'Edges', description: 'Store each edge in both directions.' },
  { id: 'order', label: 'Number', description: 'Give nodes positions in visit order.' },
  { id: 'size', label: 'Sizes', description: 'Measure each subtree, which fixes its range of positions.' },
  { id: 'load', label: 'Load', description: 'Add each edge weight across its subtree range.' },
  { id: 'query', label: 'Distance', description: 'Read a prefix sum to get a distance.' },
  { id: 'update', label: 'Update', description: 'Apply a weight change across a subtree range.' },
  { id: 'done', label: 'Result', description: 'Report the distances.' },
]

export function buildTrace({ n, edges, queries }) {
  const frames = []
  const graph = Array.from({ length: n + 1 }, () => [])
  const parent = new Array(n + 1).fill(0)
  const weight = new Array(n + 1).fill(0)
  const tin = new Array(n + 1).fill(0)
  const size = new Array(n + 1).fill(1)
  const sized = new Array(n + 1).fill(false)
  const tree = new Array(n + 1).fill(0)
  const order = []
  const answers = []
  const log = queries.map(query => (query[0] === 2
    ? { name: 'distance', args: [query[1]] }
    : { name: 'setWeight', args: query.slice(1) }))
  let queryIndex = -1

  const prefix = i => { let total = 0; for (const cell of queryChain(i)) total += tree[cell]; return total }
  const push = (phase, activeLine, pythonLine, message, extra = {}) => frames.push({
    phase, activeLine, pythonLine, message,
    parent: [...parent], weight: [...weight], tin: [...tin], size: [...size], sized: [...sized], order: [...order],
    tree: tree.slice(1), dist: Array.from({ length: n }, (_, i) => prefix(i + 1)),
    answers: [...answers], log: log.map(entry => ({ ...entry })), queryIndex,
    ops: [], focus: null, range: null, cut: null, path: [], edge: null, ...extra,
  })

  push('read', L('store each edge'), P('graph = [[]'), `The tree has ${n} node${n === 1 ? '' : 's'} and ${edges.length} edge${edges.length === 1 ? '' : 's'}.`)
  for (const [u, v, w] of edges) {
    graph[u].push([v, w])
    graph[v].push([u, w])
    push('read', L('store each edge'), P('graph[v].append'), `Edge ${u} and ${v} has weight ${w}; both ends can now reach each other.`, { rawEdge: [u, v] })
  }

  const stack = [1]
  while (stack.length) {
    const node = stack.pop()
    order.push(node)
    tin[node] = order.length
    for (const [next, w] of graph[node]) {
      if (next !== parent[node]) {
        parent[next] = node
        weight[next] = w
        stack.push(next)
      }
    }
    push('order', L('walk the tree'), P('tin[node] = len(order)'), `Node ${node} is visit number ${tin[node]}. Its whole subtree will be visited before anything else.`, { focus: node })
  }
  sized[0] = true
  for (let i = order.length - 1; i >= 1; i--) {
    const node = order[i]
    sized[node] = true
    size[parent[node]] += size[node]
    push('size', L('measure every'), P('size[parent[node]] +='), `Subtree of ${node} has ${size[node]} node${size[node] === 1 ? '' : 's'}, positions ${tin[node]} to ${tin[node] + size[node] - 1}. Add that to parent ${parent[node]}.`, { focus: node, range: [tin[node], tin[node] + size[node] - 1] })
  }
  sized[1] = true

  const rangeAdd = (node, delta, phase, pseudoStart, pseudoEnd, label) => {
    const from = tin[node], past = tin[node] + size[node]
    const range = [from, past - 1]
    const startChain = updateChain(from, n)
    for (const cell of startChain) tree[cell] += delta
    push(phase, pseudoStart, P('add(tin[node], delta)'), `${label} Adding ${delta} at position ${from} raises every position from ${from} onward.`, { focus: node, range, ops: [{ type: 'update', index: from, value: delta, chain: startChain }] })
    const endChain = updateChain(past, n)
    for (const cell of endChain) tree[cell] -= delta
    push(phase, pseudoEnd, P('add(tin[node] + size[node], -delta)'), past > n
      ? `Node ${node}'s range runs to the last position, so there is nothing after it to cancel.`
      : `Adding ${-delta} at position ${past} cancels the change for everything outside node ${node}'s subtree.`, { focus: node, range, cut: past, ops: [{ type: 'update', index: past, value: -delta, chain: endChain }] })
  }

  for (const node of order.slice(1)) {
    rangeAdd(node, weight[node], 'load', L('load each weight'), L('load each weight'), `Edge ${parent[node]} to ${node} weighs ${weight[node]} and lies above all of node ${node}'s subtree.`)
  }

  const pathOf = node => {
    const path = [node]
    while (path[path.length - 1] !== 1) path.push(parent[path[path.length - 1]])
    return path.reverse()
  }

  queries.forEach((query, index) => {
    queryIndex = index
    if (query[0] === 2) {
      const x = query[1]
      const path = pathOf(x)
      const position = tin[x]
      push('query', L('if it asks'), P('i, total = tin[query[1]], 0'), `How far is node ${x} from the root? It sits at position ${position}.`, { focus: x, path })
      const chain = queryChain(position)
      const parts = chain.map(cell => ({ cell, value: tree[cell] }))
      const total = parts.reduce((sum, part) => sum + part.value, 0)
      answers.push(total)
      log[index].returned = total
      const route = path.slice(1).map(node => weight[node])
      push('query', L('prefix sum'), P('answer.append(total)'), route.length
        ? `The prefix sum gives ${total}, which matches the edges on the path: ${route.join(' + ')} = ${total}.`
        : `Node 1 is the root, so its distance is 0.`, { focus: x, path, ops: [{ type: 'query', index: position, chain, parts, total }] })
    } else {
      const [, u, v, next] = query
      const child = parent[v] === u ? v : u
      const delta = next - weight[child]
      push('update', L('find the child'), P('child = v if'), `Edge ${u} and ${v}: node ${child} is the lower end, so only its subtree changes. The weight goes from ${weight[child]} to ${next}, a change of ${delta}.`, { focus: child, range: [tin[child], tin[child] + size[child] - 1], edge: child })
      rangeAdd(child, delta, 'update', L('add the weight change'), L('cancel the change'), `The change applies to node ${child}'s subtree.`)
      weight[child] = next
      log[index].returned = null
      push('update', L('store the new weight'), P('weight[child] = new'), `Edge ${u} and ${v} now weighs ${next}.`, { focus: child, edge: child })
    }
  })
  queryIndex = queries.length - 1
  push('done', L('return the collected'), P('return answer'), answers.length ? `The distances are ${answers.join(', ')}.` : 'No query asked for a distance, so the list is empty.')

  // Children in visit order, so the drawing reads left to right like the position strip.
  const build = id => ({ id, children: order.filter(node => parent[node] === id && node !== 1).map(build) })
  return { input: { n, edges, queries }, rooted: build(1), result: answers, frames }
}
