import { AuthoredUnionFind, dsuView } from '../families/collectionStories/authoredUnionFind.js'
import { wgraphState } from '../../components/shared/wgraphModel.js'

export const inputLabel = 'Object with n, edges as [u, v, weight], and k'
export const complexity = 'O(m log m) time for the sort plus near-linear union-find work, and O(n) space. The official limits are n up to 50000 and m up to 100000; the visualization caps n at 14 and m at 30.'
export const examples = [
  { label: 'Example', input: '{"n":6,"edges":[[0,1,1],[1,2,2],[0,2,3],[2,3,6],[3,4,4],[4,5,5]],"k":2}' },
  { label: 'Ties, one component', input: '{"n":4,"edges":[[0,1,6],[0,2,6],[0,3,2]],"k":1}' },
  { label: 'Edge: k equals n', input: '{"n":3,"edges":[[0,1,8],[1,2,3]],"k":3}' },
]

export const phases = [
  { id: 'start', label: 'Start', description: 'With no edges kept, every node is its own component.' },
  { id: 'zero', label: 'Enough', description: 'k already allows n components, so every edge can go.' },
  { id: 'sort', label: 'Sort', description: 'Consider the lightest edges first.' },
  { id: 'consider', label: 'Next edge', description: 'Find the two components this edge touches.' },
  { id: 'skip', label: 'Redundant', description: 'Both ends are already together, so the count cannot drop.' },
  { id: 'merge', label: 'Merge', description: 'The edge joins two components, one fewer remains.' },
  { id: 'stop', label: 'Stop', description: 'At most k components remain; heavier edges are removed.' },
  { id: 'done', label: 'Result', description: 'The last merging edge sets the answer.' },
]

export const code = `start with every node as its own component
if that is already at most k components, return 0
sort the edges by weight, lightest first
for each edge (u, v, w)
  find the components of u and v
  if they are the same component, skip this edge
  otherwise merge them, one fewer component
  if at most k components remain, return w`.split('\n').map((text, index) => ({ line: index + 1, text }))

const L = key => {
  const index = code.findIndex(line => line.text.includes(key))
  if (index < 0) throw new Error(`Missing pseudocode line: ${key}`)
  return index + 1
}

export const python = `def min_cost(n, edges, k):
    parent = list(range(n))
    size = [1] * n
    def find(node):
        while parent[node] != node:
            parent[node] = parent[parent[node]]
            node = parent[node]
        return node
    components = n
    if components <= k:
        return 0
    for u, v, w in sorted(edges, key=lambda edge: edge[2]):
        a, b = find(u), find(v)
        if a == b:
            continue
        if size[a] < size[b]:
            a, b = b, a
        parent[b] = a
        size[a] += size[b]
        components -= 1
        if components <= k:
            return w
    return 0
`
const PY_LINES = python.split('\n')
const PY = (key, occurrence = 0) => {
  const matches = PY_LINES.flatMap((line, index) => (line.includes(key) ? [index] : []))
  if (matches.length <= occurrence) throw new Error(`Missing Python line: ${key}`)
  return matches[occurrence] + 1
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with n, edges and k.')
  const { n, edges, k } = input
  if (!Number.isInteger(n) || n < 1 || n > 14) throw new Error('n is an integer from 1 to 14.')
  if (!Array.isArray(edges) || edges.length > 30) throw new Error('edges is a list of at most 30 edges.')
  if (!Number.isInteger(k) || k < 1 || k > n) throw new Error('k is an integer from 1 to n.')
  const parent = Array.from({ length: n }, (_, i) => i)
  const root = x => { while (parent[x] !== x) x = parent[x]; return x }
  for (const edge of edges) {
    if (!Array.isArray(edge) || edge.length !== 3 || !edge.every(Number.isInteger)) throw new Error('Each edge is [u, v, weight] of integers.')
    const [u, v, w] = edge
    if (u < 0 || u >= n || v < 0 || v >= n) throw new Error(`Edge endpoints are from 0 to ${n - 1}.`)
    if (u === v) throw new Error('An edge joins two different nodes.')
    if (w < 1 || w > 1e6) throw new Error('Edge weights are from 1 to 1000000.')
    parent[root(u)] = root(v)
  }
  if (new Set(parent.map((_, i) => root(i))).size !== 1) throw new Error('The graph must be connected.')
  return { n, edges: edges.map(edge => [...edge]), k }
}

const edgeName = ([u, v, w]) => `${u}-${v} (${w})`

export function buildTrace({ n, edges, k }) {
  const frames = []
  const labels = Array.from({ length: n }, (_, i) => i)
  const dsu = new AuthoredUnionFind(n)
  const order = edges.map((edge, index) => ({ edge, index })).sort((a, b) => a.edge[2] - b.edge[2])
  const status = {} // Edge index -> 'merged' | 'redundant' | 'removed'.
  const edgeStates = () => Object.fromEntries(Object.entries(status).map(([index, state]) => [index, state === 'merged' ? 'chosen' : 'rejected']))
  const componentsNow = () => {
    const members = new Map()
    for (let node = 0; node < n; node++) {
      const root = dsu.rootOf(node)
      if (!members.has(root)) members.set(root, { members: [], cost: 0 })
      members.get(root).members.push(node)
    }
    edges.forEach(([u, , w], index) => {
      if (status[index] === 'merged' || status[index] === 'redundant') {
        const entry = members.get(dsu.rootOf(u))
        entry.cost = Math.max(entry.cost, w)
      }
    })
    return [...members.values()]
  }
  const push = (phase, activeLine, pythonLine, message, { active = -1, ops = [], sorted = true, answer = null, roots = null } = {}) => {
    const states = edgeStates()
    if (active >= 0) states[active] = 'active'
    frames.push({
      phase, activeLine, pythonLine, message, active, answer, roots,
      k, count: dsu.count, sorted,
      ledger: order.map(({ edge, index }) => ({ index, u: edge[0], v: edge[1], w: edge[2], status: status[index] ?? (index === active ? 'active' : 'waiting') })),
      components: componentsNow(),
      ...wgraphState({
        labels, edges, edgeStates: states, ops, title: 'The graph, by what happened to each edge',
        chosen: edges.flatMap((edge, index) => (status[index] === 'merged' ? [edgeName(edge)] : [])),
        rejected: edges.flatMap((edge, index) => (status[index] === 'redundant' || status[index] === 'removed' ? [edgeName(edge)] : [])),
      }),
      ...dsuView(dsu, labels),
    })
  }

  push('start', L('start with every'), PY('components = n'), `Keeping no edges leaves ${n} component${n === 1 ? '' : 's'}, each costing 0. The limit is ${k}.`, { sorted: false })
  if (dsu.count <= k) {
    edges.forEach((_, index) => { status[index] = 'removed' })
    push('zero', L('if that is already'), PY('if components <= k'), `${n} components is within the limit of ${k}, so every edge can be removed.`, { sorted: false, answer: 0 })
    push('done', L('if that is already'), PY('return 0'), 'Every component is a lone node with cost 0, so the answer is 0.', { sorted: false, answer: 0 })
    return { input: { n, edges, k }, result: 0, frames }
  }

  push('sort', L('sort the edges'), PY('for u, v, w in sorted'), `Too many components, so edges must stay. The lightest first: ${order.map(({ edge }) => edge[2]).join(', ')}. Keeping a heavier one early could only raise the cost.`)
  for (const { edge, index } of order) {
    const [u, v, w] = edge
    const rootA = dsu.find(u)
    const rootB = dsu.find(v)
    push('consider', L('find the components'), PY('a, b = find(u)'), `Edge ${u}-${v} with weight ${w}: node ${u} is in the set rooted at ${rootA}, node ${v} in the one rooted at ${rootB}.`, { active: index, ops: [], roots: [rootA, rootB] })
    if (rootA === rootB) {
      status[index] = 'redundant'
      push('skip', L('if they are the same'), PY('continue'), `Both ends are already connected, so this edge cannot lower the count of ${dsu.count}.`, {
        ops: [{ type: 'edge', u, v, w, decision: 'rejected', reason: 'both ends are already connected.' }],
      })
      continue
    }
    dsu.union(rootA, rootB)
    // union() re-finds both roots; those lookups change nothing, so only the merge itself is shown.
    dsu.ops = dsu.ops.filter(op => op.type === 'union')
    status[index] = 'merged'
    push('merge', L('otherwise merge'), PY('components -= 1'), `Keep ${u}-${v}: two components become one, leaving ${dsu.count}.`, {
      ops: [{ type: 'edge', u, v, w, decision: 'chosen', reason: 'it joins two different components.' }],
    })
    if (dsu.count <= k) {
      order.forEach(({ index: other }) => { if (!status[other]) status[other] = 'removed' })
      const removed = order.filter(({ index: other }) => status[other] === 'removed').map(({ edge: e }) => e[2])
      push('stop', L('if at most k'), PY('if components <= k', 1), `${dsu.count} components meets the limit of ${k}${removed.length ? `, so the unused edges (weights ${removed.join(', ')}) are removed` : ''}. Nothing heavier than ${w} remains.`, { answer: w })
      push('done', L('if at most k'), PY('return w'), `The answer is ${w}: fewer kept edges would leave more than ${k} components.`, { answer: w })
      return { input: { n, edges, k }, result: w, frames }
    }
  }
  throw new Error('A connected graph always reaches the component limit.')
}
