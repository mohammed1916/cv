export function parseInput(text) {
  const g = JSON.parse(text)
  const n = Array.isArray(g) ? g.length : 0
  if (n < 1 || n > 7) throw new Error('Enter a JSON adjacency list for 1-7 nodes (visualization cap: 7 nodes, 896 BFS states).')
  for (let i = 0; i < n; i++) {
    if (!Array.isArray(g[i]) || g[i].some(v => !Number.isInteger(v) || v < 0 || v >= n || v === i) || new Set(g[i]).size !== g[i].length) throw new Error(`Neighbours of node ${i} must be distinct node numbers in 0..${n - 1}, excluding the node itself.`)
    for (const v of g[i]) if (!g[v].includes(i)) throw new Error(`Graph must be undirected: ${i} lists ${v} but ${v} does not list ${i}.`)
  }
  const seen = new Set([0]); const st = [0]
  while (st.length) { const u = st.pop(); for (const v of g[u]) if (!seen.has(v)) { seen.add(v); st.push(v) } }
  if (seen.size !== n) throw new Error('Graph must be connected.')
  return g
}
const bits = (mask, n) => mask.toString(2).padStart(n, '0')
export function buildTrace(graph) {
  const n = graph.length
  const full = (1 << n) - 1
  const queue = [], seen = new Set()
  for (let i = 0; i < n; i++) { queue.push([1 << i, i, 0]); seen.add((1 << i) * 8 + i) }
  let head = 0
  const frames = []
  const push = (phase, activeLine, message, extra = {}) => frames.push({ phase, activeLine, message, mask: 0, node: -1, dist: 0, queueLen: queue.length - head, queueHead: queue.slice(head, head + 6).map(([m, v, d]) => `${bits(m, n)}@${v}:${d}`), seenCount: seen.size, ...extra })
  push('start', 5, `Every node is a possible start: seed the queue with the ${n} states (mask with only that node, node, distance 0). A state is (set of nodes visited, node we stand on).`)
  while (head < queue.length) {
    const [mask, node, dist] = queue[head++]
    if (mask === full) {
      push('found', 8, `State mask ${bits(mask, n)} has every node visited after ${dist} edge${dist === 1 ? '' : 's'}. BFS reaches states in order of distance, so ${dist} is the minimum.`, { mask, node, dist })
      push('done', 8, `Shortest path length: ${dist}.`, { mask, node, dist })
      return { input: graph.map(r => [...r]), result: dist, frames }
    }
    push('pop', 7, `Pop state (mask ${bits(mask, n)}, node ${node}) at distance ${dist}; ${n - bits(mask, n).replace(/0/g, '').length} node(s) still unvisited.`, { mask, node, dist })
    for (const nxt of graph[node]) {
      const nm = mask | (1 << nxt)
      if (!seen.has(nm * 8 + nxt)) {
        seen.add(nm * 8 + nxt); queue.push([nm, nxt, dist + 1])
        push('push', 13, `Move to ${nxt}: new state (mask ${bits(nm, n)}, node ${nxt}) at distance ${dist + 1}; enqueue it.`, { mask: nm, node: nxt, dist: dist + 1, from: node })
      } else push('skip', 11, `Move to ${nxt} gives state (mask ${bits(nm, n)}, node ${nxt}) which was already seen at an equal or shorter distance: skip.`, { mask, node, dist, from: node })
    }
  }
  push('done', 14, 'Queue exhausted (only possible for an empty graph): return 0.')
  return { input: graph.map(r => [...r]), result: 0, frames }
}
export const code = `def shortestPathLength(graph):
    n = len(graph)
    full = (1 << n) - 1
    queue = deque((1 << i, i, 0) for i in range(n))
    seen = {(1 << i, i) for i in range(n)}
    while queue:
        mask, node, dist = queue.popleft()
        if mask == full: return dist
        for nxt in graph[node]:
            nm = mask | (1 << nxt)
            if (nm, nxt) not in seen:
                seen.add((nm, nxt))
                queue.append((nm, nxt, dist + 1))
    return 0`.split('\n').map((text, index) => ({ line: index + 1, text }))
