export const MOD = 1000000007
const MAX_EDGES = 39
const LISTING_LIMIT = 4

export const code = `count odd-cost weightings of a root-to-deepest path
  link every edge into an adjacency list
  breadth-first search from node 1, recording depth and parent
    take the next node from the queue
    if it is deeper than the best so far, it becomes the deepest
    give each unseen neighbour depth + 1 and put it in the queue
  walk parents back from the deepest node to read the path
  with no edges the cost is 0, so even = 1 way and odd = 0 ways
  for each edge on the path
    weight 2 keeps the parity and weight 1 flips it
    so new even and new odd both equal even + odd, modulo 1,000,000,007
  return odd`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `from collections import deque

def assign_edge_weights(edges):
    MOD = 10**9 + 7
    graph = [[] for _ in range(len(edges) + 2)]
    for u, v in edges:
        graph[u].append(v)
        graph[v].append(u)
    depth = {1: 0}
    parent = {1: None}
    queue = deque([1])
    deepest = 1
    while queue:
        node = queue.popleft()
        if depth[node] > depth[deepest]:
            deepest = node
        for neighbour in graph[node]:
            if neighbour not in depth:
                depth[neighbour] = depth[node] + 1
                parent[neighbour] = node
                queue.append(neighbour)
    path = [deepest]
    while parent[path[-1]] is not None:
        path.append(parent[path[-1]])
    even, odd = 1, 0
    for _ in range(len(path) - 1):
        even, odd = (even + odd) % MOD, (even + odd) % MOD
    return odd
`

export const phases = [
  { id: 'build', label: 'Build', description: 'Turn the edge list into an adjacency list.' },
  { id: 'visit', label: 'Visit', description: 'Take the next node in breadth-first order.' },
  { id: 'discover', label: 'Discover', description: 'An unseen neighbour sits one level deeper.' },
  { id: 'deepest', label: 'Deepest', description: 'The search ends; any node at the last level would do.' },
  { id: 'path', label: 'Path', description: 'Follow parents back to node 1.' },
  { id: 'base', label: 'Base', description: 'An empty path has cost 0, which is even.' },
  { id: 'count', label: 'Count', description: 'Extend the path by one edge and update both parities.' },
  { id: 'done', label: 'Result', description: 'Report the odd count.' },
]

const lineOf = (lines, fragment) => {
  const index = lines.findIndex(text => text.includes(fragment))
  if (index < 0) throw new Error(`No line contains "${fragment}"`)
  return index + 1
}
const L = fragment => lineOf(code.map(c => c.text), fragment)
const PY = python.trim().split('\n')
const P = fragment => lineOf(PY, fragment)

export function parseInput(text) {
  const input = JSON.parse(text)
  const edges = input?.edges
  if (!Array.isArray(edges) || edges.length < 1 || edges.length > MAX_EDGES) throw new Error(`edges has 1 to ${MAX_EDGES} entries in this view.`)
  const n = edges.length + 1
  const links = Array.from({ length: n + 1 }, () => [])
  for (const edge of edges) {
    if (!Array.isArray(edge) || edge.length !== 2 || !edge.every(v => Number.isInteger(v) && v >= 1 && v <= n)) throw new Error(`Each edge joins two labels from 1 to ${n}.`)
    if (edge[0] === edge[1]) throw new Error('An edge joins two different nodes.')
    links[edge[0]].push(edge[1])
    links[edge[1]].push(edge[0])
  }
  const seen = new Set([1])
  const stack = [1]
  while (stack.length) for (const next of links[stack.pop()]) if (!seen.has(next)) { seen.add(next); stack.push(next) }
  if (seen.size !== n) throw new Error('The edges must connect all nodes into one tree.')
  return { edges: edges.map(edge => [...edge]) }
}

// Every weighting of the first k path edges, for the small listing in the view.
function listWeightings(k) {
  if (k > LISTING_LIMIT) return null
  const out = []
  for (let bits = 0; bits < 2 ** k; bits++) {
    const weights = Array.from({ length: k }, (_, i) => ((bits >> (k - 1 - i)) & 1) + 1)
    const cost = weights.reduce((a, b) => a + b, 0)
    out.push({ weights, cost, odd: cost % 2 === 1 })
  }
  return out
}

export function buildTrace({ edges }) {
  const frames = []
  const n = edges.length + 1
  const graph = Array.from({ length: n + 1 }, () => [])
  for (const [u, v] of edges) { graph[u].push(v); graph[v].push(u) }

  const makeTree = (id, from) => ({ id, children: graph[id].filter(next => next !== from).map(next => makeTree(next, id)) })
  const tree = makeTree(1, 0)

  const depth = { 1: 0 }
  const parent = { 1: null }
  const visited = []
  let queue = [1]
  let deepest = 1
  let path = [], candidates = [], dp = null, edgeAt = 0, even = null, odd = null, listing = null, filling = null
  const emit = fields => frames.push({
    depth: { ...depth }, visited: [...visited], queue: [...queue], deepest, candidates, path: [...path], dp, edgeAt, even, odd, listing, filling,
    current: null, neighbour: null, ...fields,
  })

  emit({ phase: 'build', activeLine: L('link every edge'), pythonLine: P('for u, v in edges'), message: `Link ${edges.length} edge${edges.length === 1 ? '' : 's'} so every node knows its neighbours. Node 1 waits in the queue.` })

  while (queue.length) {
    const node = queue[0]
    queue = queue.slice(1)
    visited.push(node)
    emit({ phase: 'visit', activeLine: L('take the next node'), pythonLine: P('queue.popleft()'), current: node, message: `Visit node ${node} at depth ${depth[node]}.` })
    if (depth[node] > depth[deepest]) {
      deepest = node
      emit({ phase: 'visit', activeLine: L('it becomes the deepest'), pythonLine: P('deepest = node'), current: node, message: `Depth ${depth[node]} beats the best so far, so node ${node} is the deepest seen.` })
    }
    for (const neighbour of graph[node]) {
      if (neighbour in depth) continue
      depth[neighbour] = depth[node] + 1
      parent[neighbour] = node
      queue = [...queue, neighbour]
      emit({ phase: 'discover', activeLine: L('each unseen neighbour'), pythonLine: P('queue.append(neighbour)'), current: node, neighbour, message: `Node ${neighbour} is new: depth ${depth[neighbour]}, reached from node ${node}.` })
    }
  }

  const d = depth[deepest]
  candidates = Object.keys(depth).map(Number).filter(id => depth[id] === d)
  path = [deepest]
  emit({ phase: 'deepest', activeLine: L('walk parents back'), pythonLine: P('path = [deepest]'), message: candidates.length > 1
    ? `The tree is ${d} level${d === 1 ? '' : 's'} deep. Nodes ${candidates.join(', ')} are all that deep; each path has ${d} edge${d === 1 ? '' : 's'}, so the count is the same. Use node ${deepest}.`
    : `The tree is ${d} level${d === 1 ? '' : 's'} deep and node ${deepest} is the only node that deep.` })
  while (parent[path.at(-1)] !== null) {
    path = [...path, parent[path.at(-1)]]
    emit({ phase: 'path', activeLine: L('walk parents back'), pythonLine: P('path.append(parent'), message: `Step up to node ${path.at(-1)}. Path has ${path.length - 1} edge${path.length === 2 ? '' : 's'}.` })
  }

  const table = [[1, ...Array(d).fill(null)], [0, ...Array(d).fill(null)]]
  const labels = { rows: ['even', 'odd'], columns: Array.from({ length: d + 1 }, (_, k) => `${k} edges`) }
  const snapshot = () => table.map(row => [...row])
  const recurrence = 'each new count = even + odd of the column to the left, modulo 1,000,000,007 (row 0 is even, row 1 is odd).'
  even = 1
  odd = 0
  listing = listWeightings(0)
  dp = { shape: 'grid', values: snapshot(), target: [0, 0], sources: [], labels, why: 'with no edges the cost is 0, which is even.' }
  emit({ phase: 'base', activeLine: L('with no edges'), pythonLine: P('even, odd = 1, 0'), filling: 'even', message: 'With no edges yet the cost is 0: one even way, no odd ways.' })

  for (let k = 1; k <= d; k++) {
    const next = (even + odd) % MOD
    edgeAt = k
    listing = listWeightings(k)
    table[0][k] = next
    filling = 'even'
    dp = { shape: 'grid', values: snapshot(), target: [0, k], labels, recurrence, why: 'an even total comes from an even total with weight 2, or an odd total with weight 1.',
      sources: [{ cell: [0, k - 1], note: 'was even, weight 2 keeps it' }, { cell: [1, k - 1], note: 'was odd, weight 1 flips it' }] }
    emit({ phase: 'count', activeLine: L('weight 2 keeps'), pythonLine: P('even, odd = (even + odd)'), even: next, message: `Edge ${k}: even totals = ${even} + ${odd} = ${next}${even + odd >= MOD ? ' after the modulo' : ''}.` })
    table[1][k] = next
    filling = 'odd'
    dp = { shape: 'grid', values: snapshot(), target: [1, k], labels, recurrence, why: 'an odd total comes from an odd total with weight 2, or an even total with weight 1.',
      sources: [{ cell: [1, k - 1], note: 'was odd, weight 2 keeps it' }, { cell: [0, k - 1], note: 'was even, weight 1 flips it' }] }
    emit({ phase: 'count', activeLine: L('so new even and new odd'), pythonLine: P('even, odd = (even + odd)'), even: next, message: `Edge ${k}: odd totals = ${odd} + ${even} = ${next}${even + odd >= MOD ? ' after the modulo' : ''}.` })
    even = next
    odd = next
  }

  emit({ phase: 'done', activeLine: L('return odd'), pythonLine: P('return odd'), edgeAt: d, message: `Return ${odd}. The first ${d - 1} edge${d === 2 ? ' is' : 's are'} free and the last one is forced, so this is 2^${d - 1} modulo 1,000,000,007.` })
  return { input: { edges }, result: odd, tree, frames }
}
