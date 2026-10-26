export function parseInput(text) {
  const g = JSON.parse(text)
  const err = 'Enter an adjacency list (JSON array of arrays) for 1-20 nodes: no self-loops, no duplicate neighbours, and every edge listed in both directions.'
  if (!Array.isArray(g) || g.length < 1 || g.length > 20) throw new Error(err)
  g.forEach((row, u) => {
    if (!Array.isArray(row) || new Set(row).size !== row.length) throw new Error(err)
    row.forEach(v => {
      if (!Number.isInteger(v) || v < 0 || v >= g.length || v === u || !g[v] || !Array.isArray(g[v]) || !g[v].includes(u)) throw new Error(err)
    })
  })
  return g
}
export function buildTrace(graph) {
  const n = graph.length
  const color = new Array(n).fill(-1)
  const snap = (extra) => ({ color: [...color], ...extra })
  const frames = [snap({ phase: 'start', activeLine: 3, u: -1, v: -1, queue: [], message: 'No node is coloured yet. Colours alternate 0/1 along every edge.' })]
  let result = true
  outer: for (let s = 0; s < n; s++) {
    if (color[s] !== -1) continue
    color[s] = 0
    const queue = [s]
    frames.push(snap({ phase: 'seed', activeLine: 7, u: s, v: -1, queue: [...queue], message: `Node ${s} starts a new component; give it colour 0.` }))
    for (let qi = 0; qi < queue.length; qi++) {
      const u = queue[qi]
      for (const v of graph[u]) {
        if (color[v] === -1) {
          color[v] = 1 - color[u]
          queue.push(v)
          frames.push(snap({ phase: 'color', activeLine: 12, u, v, queue: [...queue], message: `Node ${v} is unseen, so it takes the opposite colour ${color[v]} of node ${u} and joins the queue.` }))
        } else if (color[v] === color[u]) {
          result = false
          frames.push(snap({ phase: 'conflict', activeLine: 15, u, v, queue: [...queue], message: `Edge ${u}-${v} joins two nodes of colour ${color[u]}: the graph contains an odd cycle, so it is not bipartite.` }))
          break outer
        } else {
          frames.push(snap({ phase: 'ok', activeLine: 14, u, v, queue: [...queue], message: `Node ${v} already has colour ${color[v]}, different from node ${u}; the edge is consistent.` }))
        }
      }
    }
  }
  frames.push(snap({ phase: 'done', activeLine: result ? 16 : 15, u: -1, v: -1, queue: [], message: result ? 'Every edge joins different colours: bipartite.' : 'Not bipartite.' }))
  return { input: graph, result, frames }
}
export const code = `def isBipartite(graph):
    n = len(graph)
    color = [-1] * n
    for s in range(n):
        if color[s] != -1:
            continue
        color[s] = 0
        queue = [s]
        for u in queue:
            for v in graph[u]:
                if color[v] == -1:
                    color[v] = 1 - color[u]
                    queue.append(v)
                elif color[v] == color[u]:
                    return False
    return True`.split('\n').map((text, index) => ({ line: index + 1, text }))
