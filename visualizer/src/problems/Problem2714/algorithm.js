const MAX_NODES = 8
const MAX_EDGES = 16
const MAX_WEIGHT = 9
const MAX_FREE = 6

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with n, edges, source, destination and k.')
  const { n, edges, source, destination, k } = input
  if (!Number.isInteger(n) || n < 1 || n > MAX_NODES) throw new Error(`n is an integer from 1 to ${MAX_NODES}.`)
  if (!Array.isArray(edges) || edges.length > MAX_EDGES) throw new Error(`edges lists at most ${MAX_EDGES} directed edges.`)
  for (const edge of edges) {
    if (!Array.isArray(edge) || edge.length !== 3 || !edge.every(x => Number.isInteger(x))) throw new Error('Each edge is [from, to, weight] with integers.')
    const [a, b, w] = edge
    if (a < 0 || a >= n || b < 0 || b >= n) throw new Error('Edge endpoints are nodes from 0 to n minus 1.')
    if (w < 0 || w > MAX_WEIGHT) throw new Error(`Edge weights are integers from 0 to ${MAX_WEIGHT}.`)
  }
  if (!Number.isInteger(source) || source < 0 || source >= n) throw new Error('source is a node from 0 to n minus 1.')
  if (!Number.isInteger(destination) || destination < 0 || destination >= n) throw new Error('destination is a node from 0 to n minus 1.')
  if (!Number.isInteger(k) || k < 0 || k > MAX_FREE) throw new Error(`k is an integer from 0 to ${MAX_FREE}.`)
  return { n, edges, source, destination, k }
}

export function buildTrace({ n, edges, source, destination, k }) {
  const INF = Infinity
  const dist = Array.from({ length: n }, () => Array(k + 1).fill(INF))
  const done = Array.from({ length: n }, () => Array(k + 1).fill(false))
  const frames = []
  const snap = extra => frames.push({
    table: dist.map(row => row.slice()),
    done: done.map(row => row.slice()),
    current: null, target: null, edge: null, ...extra,
  })
  dist[source][0] = 0
  snap({ pythonLine: P('dist[source][0] = 0'), phase: 'start', activeLine: L('set the source state'), message: `Start at node ${source} with 0 free hops used, cost 0.` })
  for (;;) {
    let best = null
    for (let v = 0; v < n; v++) {
      for (let j = 0; j <= k; j++) {
        if (!done[v][j] && dist[v][j] < INF && (best === null || dist[v][j] < dist[best[0]][best[1]])) best = [v, j]
      }
    }
    if (best === null) break
    const [v, j] = best
    const d = dist[v][j]
    done[v][j] = true
    snap({ pythonLine: P('done[v][j] = True'), phase: 'pop', activeLine: L('mark it settled'), current: [v, j], message: `Settle node ${v} with ${j} free hop${j === 1 ? '' : 's'} used at cost ${d}.` })
    edges.forEach(([a, b, w], e) => {
      if (a !== v) return
      if (d + w < dist[b][j]) dist[b][j] = d + w
      snap({ pythonLine: P('if d + w < dist[b][j]'), phase: 'pay', activeLine: L('pay the edge'), current: [v, j], target: [b, j], edge: e, message: `Pay ${w} on edge ${a} to ${b}: candidate cost ${d + w} at node ${b} with ${j} free used.` })
      if (j < k) {
        if (d < dist[b][j + 1]) dist[b][j + 1] = d
        snap({ pythonLine: P('if j < k and d'), phase: 'free', activeLine: L('use the edge for free'), current: [v, j], target: [b, j + 1], edge: e, message: `Using edge ${a} to ${b} for free keeps cost ${d} at node ${b} with ${j + 1} free used.` })
      }
    })
  }
  const answer = Math.min(...dist[destination])
  const result = answer === INF ? -1 : answer
  snap({ pythonLine: P('return -1 if'), phase: 'done', activeLine: L('return the smallest'), message: result === -1 ? `Node ${destination} cannot be reached.` : `The cheapest way uses at most ${k} free hops and costs ${result}.` })
  return { input: { n, edges, source, destination, k }, result, frames }
}

export const code = `minimum cost from source to destination using at most k free edges
  build the adjacency list
  every state (node, free hops used) starts at infinity
  set the source state (source, 0) to cost 0
  while some unsettled state has a finite cost
    take the unsettled state with the smallest cost
    mark it settled
    for each edge out of that node
      pay the edge: relax (edge target, same free count)
      if free hops remain, use the edge for free: relax (target, count plus one) at the same cost
  return the smallest finite cost at the destination, or -1 if none`.split('\n').map((text, index) => ({ line: index + 1, text }))

const L = s => {
  const i = code.findIndex(c => c.text.includes(s))
  if (i < 0) throw new Error(`Missing pseudocode line: ${s}`)
  return i + 1
}

export const python = `def min_cost_with_free_hops(n, edges, source, destination, k):
    graph = [[] for _ in range(n)]
    for a, b, w in edges:
        graph[a].append((b, w))
    INF = float("inf")
    dist = [[INF] * (k + 1) for _ in range(n)]
    done = [[False] * (k + 1) for _ in range(n)]
    dist[source][0] = 0
    while True:
        best = None
        for v in range(n):
            for j in range(k + 1):
                if not done[v][j] and dist[v][j] < INF:
                    if best is None or dist[v][j] < dist[best[0]][best[1]]:
                        best = (v, j)
        if best is None:
            break
        v, j = best
        done[v][j] = True
        d = dist[v][j]
        for b, w in graph[v]:
            if d + w < dist[b][j]:
                dist[b][j] = d + w
            if j < k and d < dist[b][j + 1]:
                dist[b][j + 1] = d
    answer = min(dist[destination])
    return -1 if answer == INF else answer
`

const P = s => {
  const i = python.split('\n').findIndex(l => l.includes(s))
  if (i < 0) throw new Error(`Missing python line: ${s}`)
  return i + 1
}
