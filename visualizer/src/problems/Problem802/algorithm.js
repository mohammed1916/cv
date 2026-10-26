export function parseInput(text) {
  const graph = JSON.parse(text)
  const n = Array.isArray(graph) ? graph.length : 0
  const ok = n >= 1 && n <= 24 && graph.every(row => Array.isArray(row) && row.length <= n && row.every(v => Number.isInteger(v) && v >= 0 && v < n) && new Set(row).size === row.length)
  if (!ok) throw new Error('Enter a JSON adjacency list of 1-24 nodes (visualization cap); graph[i] lists distinct neighbours in [0, n-1].')
  return graph.map(row => [...row])
}
export function buildTrace(graph) {
  const n = graph.length
  const outdeg = graph.map(g => g.length)
  const rev = Array.from({ length: n }, () => [])
  const safe = new Array(n).fill(false)
  const frames = []
  let queue = []
  const push = (phase, activeLine, message, extra = {}) => frames.push({ phase, activeLine, message, outdeg: [...outdeg], safe: [...safe], queue: [...queue], current: -1, parent: -1, ...extra })
  push('start', 2, 'A node is eventually safe if every path from it ends at a terminal node. Reverse the edges and peel off terminals, like Kahn topological sort.')
  for (let u = 0; u < n; u++) for (const v of graph[u]) rev[v].push(u)
  push('init', 7, 'Out-degrees are the number of unresolved out-neighbours; rev[v] lists the nodes that point to v.')
  queue = []
  for (let u = 0; u < n; u++) if (outdeg[u] === 0) queue.push(u)
  push('seed', 8, `Terminal nodes (out-degree 0) are safe by definition: queue = [${queue.join(', ')}].`)
  while (queue.length) {
    const u = queue.shift()
    safe[u] = true
    push('pop', 12, `Pop node ${u}: all of its out-neighbours are safe, so ${u} is safe.`, { current: u })
    for (const p of rev[u]) {
      outdeg[p] -= 1
      push('relax', 14, `Node ${p} points to safe node ${u}: its unresolved out-degree drops to ${outdeg[p]}.`, { current: u, parent: p })
      if (outdeg[p] === 0) {
        queue.push(p)
        push('enqueue', 16, `Node ${p} has no unresolved out-neighbours left, so it joins the queue.`, { current: u, parent: p })
      }
    }
  }
  const result = []
  for (let u = 0; u < n; u++) if (safe[u]) result.push(u)
  push('done', 17, `Nodes never reaching out-degree 0 lie on or lead into a cycle. Safe nodes: [${result.join(', ')}].`)
  return { input: graph, result, frames }
}
export const code = `def eventualSafeNodes(graph):
    n = len(graph)
    outdeg = [len(g) for g in graph]
    rev = [[] for _ in range(n)]
    for u in range(n):
        for v in graph[u]:
            rev[v].append(u)
    queue = [u for u in range(n) if outdeg[u] == 0]
    safe = [False] * n
    while queue:
        u = queue.pop(0)
        safe[u] = True
        for p in rev[u]:
            outdeg[p] -= 1
            if outdeg[p] == 0:
                queue.append(p)
    return [u for u in range(n) if safe[u]]`.split('\n').map((text, index) => ({ line: index + 1, text }))
