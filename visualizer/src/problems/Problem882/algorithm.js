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
  let heap = [[0, 0]]
  const settled = []
  let ans = 0
  const base = () => ({ dist: [...dist], settled: [...settled], heap: heap.map(h => [...h]), ans })
  const frames = [{ phase: 'start', ...base(), node: 0, edge: null, activeLine: 9, message: `Start Dijkstra at node 0 with distance 0. Moving along an edge with cnt new nodes costs cnt + 1 moves; budget maxMoves = ${maxMoves}.` }]
  while (heap.length) {
    heap.sort((x, y) => x[0] - y[0] || x[1] - y[1])
    const [d, u] = heap.shift()
    if (d > dist[u]) {
      frames.push({ phase: 'pop', ...base(), node: u, edge: null, activeLine: 13, message: `Pop stale entry (${d}, node ${u}); a shorter path (${dist[u]}) is already known, so skip.` })
      continue
    }
    ans += 1
    settled.push(u)
    frames.push({ phase: 'pop', ...base(), node: u, edge: null, activeLine: 15, message: `Settle node ${u} at distance ${d} (≤ ${maxMoves}? ${d <= maxMoves ? 'yes' : 'no'}). It counts as one reachable original node.` })
    for (const [v, cnt] of graph[u]) {
      const reach = Math.min(cnt, Math.max(0, maxMoves - d))
      used.set(`${u},${v}`, reach)
      const d2 = d + cnt + 1
      const better = d2 < (dist[v] === null ? maxMoves + 1 : dist[v])
      if (better) { heap.push([d2, v]); dist[v] = d2 }
      frames.push({
        phase: 'relax', ...base(), node: u, edge: [u, v], activeLine: better ? 21 : 20,
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
      phase: 'count', ...base(), node: null, edge: [u, v], activeLine: 24,
      message: `Edge ${u}-${v}: ${fromU} nodes reachable from ${u} plus ${fromV} from ${v}, capped at cnt ${cnt}: +${add}.`,
    })
  }
  frames.push({ phase: 'done', ...base(), node: null, edge: null, activeLine: 25, message: `Total reachable nodes: ${ans}.` })
  return { input: { edges, maxMoves, n }, result: ans, frames }
}

export const code = `import heapq
def reachableNodes(edges, maxMoves, n):
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
    return ans`.split('\n').map((text, index) => ({ line: index + 1, text }))
