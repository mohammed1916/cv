import { TracedHeap, heapView } from '../../components/shared/heapModel.js'
export function parseInput(text) {
  const obj = JSON.parse(text)
  if (!obj || typeof obj !== 'object' || !Array.isArray(obj.edges) || !Number.isInteger(obj.maxMoves) || !Number.isInteger(obj.n)) {
    throw new Error('Enter JSON like {"edges": [[u, v, cnt], ...], "maxMoves": 6, "n": 4}.')
  }
  const { edges, maxMoves, n } = obj
  if (n < 1 || n > 12) throw new Error('n must be between 1 and 12 (visualization cap).')
  if (maxMoves < 0 || maxMoves > 1000000000) throw new Error('maxMoves must be between 0 and 1,000,000,000.')
  if (edges.length > 30) throw new Error('At most 30 edges (visualization cap).')
  const seen = new Set()
  for (const e of edges) {
    if (!Array.isArray(e) || e.length !== 3 || e.some(x => !Number.isInteger(x))) throw new Error('Every edge must be [u, v, cnt].')
    const [u, v, cnt] = e
    if (u < 0 || v < 0 || u >= n || v >= n || u >= v) throw new Error('Edges need 0 ≤ u < v < n.')
    if (cnt < 0 || cnt > 10000) throw new Error('cnt must be between 0 and 10,000.')
    if (seen.has(`${u},${v}`)) throw new Error('Duplicate edges are not allowed.')
    seen.add(`${u},${v}`)
  }
  return { edges: edges.map(e => [...e]), maxMoves, n }
}

export function buildTrace({ edges, maxMoves, n }) {
  const graph = Array.from({ length: n }, () => [])
  for (const [u, v, cnt] of edges) { graph[u].push([v, cnt]); graph[v].push([u, cnt]) }
  const dist = Array(n).fill(null)
  dist[0] = 0
  const used = new Map()
  const heap = new TracedHeap((x, y) => x[0] - y[0] || x[1] - y[1], { format: ([d, u]) => `${u}:${d}` })
  heap.push([0, 0])
  const settled = []
  let ans = 0
  const base = () => ({ dist: [...dist], settled: [...settled], heap: heap.data.map(h => [...h]), heapState: heapView(heap, { title: 'Priority queue (root = fewest moves; entries are node:moves)' }).heap, ans })
  const frames = [{ phase: 'start', pythonLine: 11, ...base(), node: 0, edge: null, activeLine: L('build the graph'), message: `Start Dijkstra at node 0 with distance 0. Moving along an edge with cnt new nodes costs cnt + 1 moves; budget maxMoves = ${maxMoves}.` }]
  while (heap.size) {
    const [d, u] = heap.pop()
    if (d > dist[u]) {
      frames.push({ phase: 'pop', pythonLine: 16, ...base(), ops: [{ type: 'stale', node: u, dist: d, best: dist[u] }], node: u, edge: null, activeLine: L('is more than dist[u]'), message: `Pop stale entry (${d}, node ${u}); a shorter path (${dist[u]}) is already known, so skip.` })
      continue
    }
    ans += 1
    settled.push(u)
    frames.push({ phase: 'pop', pythonLine: 17, ...base(), ops: [{ type: 'pop', node: u, dist: d }], node: u, edge: null, activeLine: L('count u as reachable'), message: `Settle node ${u} at distance ${d} (≤ ${maxMoves}? ${d <= maxMoves ? 'yes' : 'no'}). It counts as one reachable original node.` })
    for (const [v, cnt] of graph[u]) {
      const reach = Math.min(cnt, Math.max(0, maxMoves - d))
      used.set(`${u},${v}`, reach)
      const d2 = d + cnt + 1
      const better = d2 < (dist[v] === null ? maxMoves + 1 : dist[v])
      const old = dist[v] === null ? Infinity : dist[v]
      if (better) { heap.push([d2, v]); dist[v] = d2 }
      frames.push({
        phase: 'relax', pythonLine: better ? 23 : 22, ...base(), ops: [!better && old === Infinity ? { text: `Edge ${u}-${v}: ${d} + ${cnt + 1} = ${d2} exceeds the budget of ${maxMoves} moves, so ${v} is not reachable this way and dist[${v}] stays ∞.` } : { type: 'relax', u, v, w: cnt + 1, base: d, candidate: d2, old, result: better ? 'improved' : 'kept' }], node: u, edge: [u, v], activeLine: better ? L('set dist[v] = d2') : L('otherwise, keep dist[v]'),
        message: `Edge ${u}-${v} (cnt ${cnt}): from ${u} we can walk ${reach} of its subdivision nodes (min(cnt, maxMoves - ${d})). ` +
          (better ? `Reaching ${v} costs ${d2} ≤ ${maxMoves}, so dist[${v}] = ${d2} and it is queued.` : `Reaching ${v} would cost ${d2}, not an improvement within budget.`),
      })
    }
  }
  for (const [u, v, cnt] of edges) {
    const fromU = used.get(`${u},${v}`) ?? 0
    const fromV = used.get(`${v},${u}`) ?? 0
    const add = Math.min(cnt, fromU + fromV)
    ans += add
    frames.push({
      phase: 'count', pythonLine: 26, ...base(), node: null, edge: [u, v], activeLine: L('add min(cnt'),
      message: `Edge ${u}-${v}: ${fromU} nodes reachable from ${u} plus ${fromV} from ${v}, capped at cnt ${cnt}: +${add}.`,
    })
  }
  frames.push({ phase: 'done', pythonLine: 27, ...base(), node: null, edge: null, activeLine: L('return ans'), message: `Total reachable nodes: ${ans}.` })
  return { input: { edges, maxMoves, n }, result: ans, frames }
}

export const code = `build the graph: each edge (u, v, cnt) links u and v both ways
let dist[0] = 0, and every other dist be unknown
put (0, 0) into the heap, as (moves, node)
let ans = 0
while the heap is not empty, do
  take the entry (d, u) with the fewest moves from the heap
  if d is more than dist[u], this entry is stale: skip it
  otherwise, count u as reachable: ans = ans + 1
  for each edge (v, cnt) out of u, do
    let reach be min(cnt, maxMoves - d), the subdivision nodes walkable from u
    let d2 be d + cnt + 1
    if d2 is less than dist[v] (or maxMoves + 1 if unknown), set dist[v] = d2 and push (d2, v)
    otherwise, keep dist[v]
for each original edge (u, v, cnt), do
  add min(cnt, used from u + used from v) to ans
return ans`.split('\n').map((text, index) => ({ line: index + 1, text }))

const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `import heapq


def reachable_nodes(edges, maxMoves, n):
    graph = [[] for _ in range(n)]
    for u, v, cnt in edges:
        graph[u].append((v, cnt))
        graph[v].append((u, cnt))
    dist = {0: 0}
    used = {}
    heap = [(0, 0)]
    ans = 0
    while heap:
        d, u = heapq.heappop(heap)
        if d > dist[u]:
            continue
        ans += 1
        for v, cnt in graph[u]:
            reach = min(cnt, maxMoves - d)
            used[(u, v)] = reach
            d2 = d + cnt + 1
            if d2 < dist.get(v, maxMoves + 1):
                heapq.heappush(heap, (d2, v))
                dist[v] = d2
    for u, v, cnt in edges:
        ans += min(cnt, used.get((u, v), 0) + used.get((v, u), 0))
    return ans
`
