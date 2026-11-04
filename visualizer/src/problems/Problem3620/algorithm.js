const MAX_NODES = 10
const MAX_EDGES = 20
const MAX_COST = 1e9
const MAX_BUDGET = 5e13

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with edges, online and k.')
  const { edges, online, k } = input
  if (!Array.isArray(online) || online.length < 2 || online.length > MAX_NODES) throw new Error(`online has 2 to ${MAX_NODES} entries, one per node.`)
  if (online.some(flag => typeof flag !== 'boolean')) throw new Error('Each entry of online is true or false.')
  const n = online.length
  if (!online[0] || !online[n - 1]) throw new Error('The first and last nodes are always online.')
  if (!Array.isArray(edges) || edges.length > MAX_EDGES) throw new Error(`edges has at most ${MAX_EDGES} entries in this visualization.`)
  for (const edge of edges) {
    if (!Array.isArray(edge) || edge.length !== 3 || !edge.every(Number.isInteger)) throw new Error('Each edge is [from, to, cost] with integers.')
    const [u, v, cost] = edge
    if (u < 0 || u >= n || v < 0 || v >= n) throw new Error(`Edge endpoints are node numbers from 0 to ${n - 1}.`)
    if (u === v) throw new Error('An edge cannot start and end at the same node.')
    if (cost < 0 || cost > MAX_COST) throw new Error('Edge costs are between 0 and 1000000000.')
  }
  if (!Number.isInteger(k) || k < 0 || k > MAX_BUDGET) throw new Error('k is an integer between 0 and 50000000000000.')
  if (!isAcyclic(n, edges)) throw new Error('The edges must not form a cycle.')
  return { edges: edges.map(edge => [...edge]), online: [...online], k }
}

function isAcyclic(n, edges) {
  const indegree = Array(n).fill(0)
  for (const [, v] of edges) indegree[v]++
  const ready = []
  indegree.forEach((count, node) => { if (count === 0) ready.push(node) })
  let seen = 0
  while (ready.length) {
    const u = ready.pop()
    seen++
    for (const [from, v] of edges) if (from === u && --indegree[v] === 0) ready.push(v)
  }
  return seen === n
}

export const code = `largest cheapest edge on a route costing at most k
  drop every edge that touches an offline node
  put the nodes in topological order
  collect the distinct remaining edge costs in sorted order
  binary search those costs for the highest workable floor
    pick the middle cost as the floor and ignore edges below it
    set the first node's distance to 0 and every other to infinity
    for each node u in topological order
      if u has not been reached, skip it
      for each edge u to v at or above the floor, keep the smaller distance to v
    if the distance to the last node is at most k
      this floor works, record it and search higher
    otherwise this floor is too demanding, search lower
  return the last recorded floor, or -1 if none worked`.split('\n').map((text, index) => ({ line: index + 1, text }))

const L = key => {
  const index = code.findIndex(line => line.text.includes(key))
  if (index < 0) throw new Error(`Pseudocode line missing: ${key}`)
  return index + 1
}

export const python = `def find_max_path_score(edges, online, k):
    n = len(online)
    usable = [(u, v, c) for u, v, c in edges if online[u] and online[v]]
    out = [[] for _ in range(n)]
    indegree = [0] * n
    for u, v, c in usable:
        out[u].append((v, c))
        indegree[v] += 1
    ready = [u for u in range(n) if indegree[u] == 0]
    order = []
    while ready:
        u = ready.pop()
        order.append(u)
        for v, _ in out[u]:
            indegree[v] -= 1
            if indegree[v] == 0:
                ready.append(v)

    def cheapest(floor):
        dist = [float("inf")] * n
        dist[0] = 0
        for u in order:
            if dist[u] == float("inf"):
                continue
            for v, c in out[u]:
                if c >= floor and dist[u] + c < dist[v]:
                    dist[v] = dist[u] + c
        return dist[n - 1]

    costs = sorted({c for _, _, c in usable})
    lo, hi, best = 0, len(costs) - 1, -1
    while lo <= hi:
        mid = (lo + hi) // 2
        if cheapest(costs[mid]) <= k:
            best = costs[mid]
            lo = mid + 1
        else:
            hi = mid - 1
    return best`

const PY_LINES = python.split('\n')
const PY = key => {
  const index = PY_LINES.findIndex(line => line.includes(key))
  if (index < 0) throw new Error(`Python line missing: ${key}`)
  return index + 1
}

export const phases = [
  { id: 'start', label: 'Start', description: 'The whole network as given.' },
  { id: 'filter', label: 'Offline', description: 'Edges touching an offline node can never be used.' },
  { id: 'order', label: 'Order', description: 'A topological order lets each node be finished before its successors.' },
  { id: 'costs', label: 'Candidates', description: 'The answer must equal one of the remaining edge costs.' },
  { id: 'probe', label: 'Floor', description: 'Try one cost as the minimum allowed edge.' },
  { id: 'visit', label: 'Visit', description: 'Take the next node in topological order.' },
  { id: 'relax', label: 'Relax', description: 'Offer a cheaper total cost to a successor.' },
  { id: 'verdict', label: 'Verdict', description: 'Compare the cheapest total cost with the budget k.' },
  { id: 'narrow', label: 'Narrow', description: 'Halve the remaining candidates.' },
  { id: 'done', label: 'Result', description: 'Report the highest floor that worked.' },
]

// Walk the recorded best incoming edges back from the last node.
function pathEdges(via, edges, n) {
  const picked = []
  let node = n - 1
  while (via[node] !== -1) {
    picked.push(via[node])
    node = edges[via[node]][0]
  }
  return picked
}

export function buildTrace({ edges, online, k }) {
  const n = online.length
  const frames = []
  const isUsable = edges.map(([u, v]) => online[u] && online[v])
  const out = Array.from({ length: n }, () => [])
  const indegree = Array(n).fill(0)
  edges.forEach(([u, v, c], index) => {
    if (!isUsable[index]) return
    out[u].push({ v, c, index })
    indegree[v]++
  })
  const ready = []
  for (let u = 0; u < n; u++) if (indegree[u] === 0) ready.push(u)
  const order = []
  while (ready.length) {
    const u = ready.pop()
    order.push(u)
    for (const { v } of out[u]) if (--indegree[v] === 0) ready.push(v)
  }
  const costs = [...new Set(edges.filter((_, index) => isUsable[index]).map(edge => edge[2]))].sort((a, b) => a - b)

  const ladder = costs.map(() => 'untested')
  const probes = []
  let lo = 0
  let hi = costs.length - 1
  let mid = -1
  let best = -1
  let bestPath = []
  let floor = null
  let dist = Array(n).fill(Infinity)
  let via = Array(n).fill(-1)
  let visitedOrder = -1

  const rolesFor = (extra = {}) => edges.map((edge, index) => {
    if (extra.path?.includes(index)) return 'path'
    if (extra.edge === index) return 'active'
    if (!extra.showAll && !isUsable[index]) return 'offline'
    if (floor !== null && edge[2] < floor) return 'below'
    return 'open'
  })
  const push = (phase, codeKey, pyKey, message, extra = {}) => frames.push({
    phase, activeLine: L(codeKey), pythonLine: PY(pyKey), message,
    roles: rolesFor(extra), dist: [...dist], via: [...via], node: extra.node ?? -1, edge: extra.edge ?? -1,
    order: extra.showOrder === false ? [] : [...order], visited: visitedOrder, costs: extra.showCosts === false ? [] : [...costs],
    ladder: [...ladder], lo, hi, mid, floor, best, probes: probes.map(row => ({ ...row })),
    offer: extra.offer ?? null, sinkCost: extra.sinkCost ?? null,
  })

  push('start', 'largest cheapest edge', 'def find_max_path_score', `${n} nodes and ${edges.length} edges, with a budget of k = ${k}.`, { showAll: true, showOrder: false, showCosts: false })
  const cut = edges.length - isUsable.filter(Boolean).length
  push('filter', 'drop every edge', 'usable = [', cut ? `${cut} edge${cut === 1 ? '' : 's'} touch an offline node and can never carry a route.` : 'Every node is online, so no edge is dropped.', { showOrder: false, showCosts: false })
  push('order', 'put the nodes in topological', 'order.append(u)', `Process nodes in the order ${order.join(', ')}: every edge goes from an earlier node to a later one.`, { showCosts: false })
  push('costs', 'collect the distinct', 'costs = sorted', costs.length ? `Candidate floors: ${costs.join(', ')}. A route's score is one of its own edge costs, so nothing else needs testing.` : 'No usable edge remains, so there are no candidates.')

  while (lo <= hi) {
    mid = (lo + hi) >> 1
    floor = costs[mid]
    dist = Array(n).fill(Infinity)
    via = Array(n).fill(-1)
    visitedOrder = -1
    push('probe', 'pick the middle cost', 'mid = (lo + hi) // 2', `Try floor ${floor}: can a route use only edges of cost ${floor} or more and still stay within ${k}?`)
    dist[0] = 0
    push('probe', "set the first node's distance", 'dist[0] = 0', 'Start at node 0 with cost 0; everything else is unreached.', { node: 0 })
    for (let position = 0; position < order.length; position++) {
      const u = order[position]
      visitedOrder = position
      if (dist[u] === Infinity) {
        push('visit', 'if u has not been reached', 'continue', `Node ${u} cannot be reached with this floor, so it offers nothing.`, { node: u })
        continue
      }
      push('visit', 'for each node u in topological', 'for u in order', `Node ${u} is final at cost ${dist[u]}: all edges into it have been handled.`, { node: u })
      for (const { v, c, index } of out[u]) {
        if (c < floor) continue
        const offer = dist[u] + c
        const old = dist[v]
        const improved = offer < old
        if (improved) {
          dist[v] = offer
          via[v] = index
        }
        const oldText = old === Infinity ? '∞' : old
        push('relax', 'for each edge u to v', improved ? 'dist[v] = dist[u] + c' : 'if c >= floor and', improved
          ? `${dist[u]} + ${c} = ${offer} beats ${oldText}, so node ${v} now costs ${offer}.`
          : `${dist[u]} + ${c} = ${offer} does not beat ${oldText}; node ${v} keeps its cost.`, { node: u, edge: index, offer: { from: u, to: v, value: offer, old, improved } })
      }
    }
    visitedOrder = order.length
    const sinkCost = dist[n - 1]
    const works = sinkCost <= k
    const path = sinkCost === Infinity ? [] : pathEdges(via, edges, n)
    probes.push({ floor, cheapest: sinkCost === Infinity ? '∞' : sinkCost, budget: k, verdict: works ? 'works' : 'too demanding' })
    push('verdict', 'if the distance to the last', 'if cheapest(costs[mid]) <= k', sinkCost === Infinity
      ? `With floor ${floor}, the last node cannot be reached at all.`
      : `With floor ${floor}, the cheapest route costs ${sinkCost}, which is ${works ? `within` : `over`} the budget of ${k}.`, { path, sinkCost })
    if (works) {
      best = floor
      bestPath = path
      for (let i = 0; i <= mid; i++) ladder[i] = 'works'
      lo = mid + 1
      push('narrow', 'this floor works', 'lo = mid + 1', `Floor ${floor} works, and every lower floor would too. Search only higher.`, { path, sinkCost })
    } else {
      for (let i = mid; i < costs.length; i++) ladder[i] = 'too high'
      hi = mid - 1
      push('narrow', 'otherwise this floor', 'hi = mid - 1', `Floor ${floor} fails. A higher floor removes even more edges, so it would fail too. Search only lower.`, { path, sinkCost })
    }
  }

  mid = -1
  floor = best === -1 ? null : best
  push('done', 'return the last recorded', 'return best', best === -1
    ? 'No floor works: no online route stays within the budget. Return -1.'
    : `The highest floor that works is ${best}. Return ${best}.`, { path: bestPath })
  return { input: { edges, online, k }, result: best, frames }
}
