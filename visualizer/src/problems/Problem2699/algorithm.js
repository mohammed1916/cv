const ERROR = 'Enter {"n":4,"edges":[[a,b,w],...],"source":0,"destination":3,"target":5} with 2 to 5 nodes numbered from 0, 1 to 8 undirected edges with no self-loops, and weights that are -1 (to be chosen) or 1 to 6. target is from 1 to 12.'
const INF_WEIGHT = 2000000000

export function parseInput(text) {
  const value = JSON.parse(text)
  if (!value || typeof value !== 'object' || !Array.isArray(value.edges) || !Number.isInteger(value.n)) throw new Error(ERROR)
  const { n, edges, source, destination, target } = value
  if (n < 2 || n > 5 || edges.length < 1 || edges.length > 8) throw new Error(ERROR)
  if (![source, destination].every(x => Number.isInteger(x) && x >= 0 && x < n) || !Number.isInteger(target) || target < 1 || target > 12) throw new Error(ERROR)
  const ok = edges.every(e => Array.isArray(e) && e.length === 3 && e.every(Number.isInteger) && e[0] >= 0 && e[0] < n && e[1] >= 0 && e[1] < n && e[0] !== e[1] && (e[2] === -1 || (e[2] >= 1 && e[2] <= 6)))
  if (!ok) throw new Error(ERROR)
  return { n, edges, source, destination, target }
}

export const code = `set the weight of every -1 edge to a huge value and remember which edges they are
if the shortest distance from source to destination is below target then return []
for each -1 edge in order
  set its weight to 1
  d = shortest distance from source to destination
  if d is at most target then
    set its weight to 1 + target - d
    stop searching
if the shortest distance from source to destination equals target then return the edges
otherwise return []`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

function shortest(n, list, source, destination) {
  const dist = new Array(n).fill(Infinity)
  dist[source] = 0
  const done = new Array(n).fill(false)
  for (;;) {
    let u = -1
    for (let x = 0; x < n; x++) if (!done[x] && dist[x] < Infinity && (u === -1 || dist[x] < dist[u])) u = x
    if (u === -1) break
    done[u] = true
    for (const [a, b, w] of list) {
      if (a === u && dist[u] + w < dist[b]) dist[b] = dist[u] + w
      if (b === u && dist[u] + w < dist[a]) dist[a] = dist[u] + w
    }
  }
  return dist[destination]
}

export function buildTrace({ n, edges, source, destination, target }) {
  const list = edges.map(e => [...e])
  const modifiable = []
  list.forEach((e, i) => { if (e[2] === -1) { modifiable.push(i); e[2] = INF_WEIGHT } })
  const snap = (phase, current, d, message, activeLine) => ({ phase, activeLine, current, d, edges: list.map(e => [...e]), message })
  const frames = []
  let d = shortest(n, list, source, destination)
  frames.push(snap('start', -1, d, `Give every unknown edge a huge weight, so the distance uses only the fixed edges: ${d === Infinity ? 'unreachable' : d}. The target is ${target}.`, L('set the weight of every -1 edge')))
  if (d < target) {
    frames.push(snap('done', -1, d, `The fixed edges already give ${d}, which is below ${target}, and weights can only grow it: return [].`, L('return []')))
    return { input: { n, edges, source, destination, target }, result: [], frames }
  }
  for (const i of modifiable) {
    list[i][2] = 1
    d = shortest(n, list, source, destination)
    frames.push(snap('try', i, d, `Set edge ${i} (${list[i][0]}-${list[i][1]}) to 1. The distance is now ${d}.`, L('set its weight to 1')))
    if (d <= target) {
      list[i][2] = 1 + target - d
      frames.push(snap('raise', i, d, `Raise edge ${i} to ${list[i][2]} so that a route through it is exactly ${target}.`, L('set its weight to 1 + target - d')))
      break
    }
  }
  d = shortest(n, list, source, destination)
  const result = d === target ? list : []
  frames.push(snap('done', -1, d, result.length ? `Shortest distance is ${target}: the modified edges are returned.` : `No assignment gives distance ${target}: return [].`, L('otherwise return []')))
  return { input: { n, edges, source, destination, target }, result, frames }
}

export const python = `import heapq

def modify_graph_edges(n, edges, source, destination, target):
    inf_weight = 2000000000
    edges = [list(e) for e in edges]
    modifiable = [i for i, e in enumerate(edges) if e[2] == -1]
    for i in modifiable:
        edges[i][2] = inf_weight

    def shortest():
        graph = [[] for _ in range(n)]
        for a, b, w in edges:
            graph[a].append((b, w))
            graph[b].append((a, w))
        dist = [float('inf')] * n
        dist[source] = 0
        heap = [(0, source)]
        while heap:
            d, u = heapq.heappop(heap)
            if d > dist[u]:
                continue
            for v, w in graph[u]:
                if d + w < dist[v]:
                    dist[v] = d + w
                    heapq.heappush(heap, (dist[v], v))
        return dist[destination]

    if shortest() < target:
        return []
    for i in modifiable:
        edges[i][2] = 1
        d = shortest()
        if d <= target:
            edges[i][2] = 1 + target - d
            break
    return edges if shortest() == target else []
`
