export function parseInput(text) {
  const g = JSON.parse(text)
  const err = 'Enter a DAG as an adjacency list (JSON array of arrays) with 2-10 nodes; edges go to different nodes, no duplicates, and no cycles.'
  if (!Array.isArray(g) || g.length < 2 || g.length > 10) throw new Error(err)
  g.forEach((row, u) => {
    if (!Array.isArray(row) || new Set(row).size !== row.length || !row.every(v => Number.isInteger(v) && v >= 0 && v < g.length && v !== u)) throw new Error(err)
  })
  const state = new Array(g.length).fill(0)
  const dfs = u => { state[u] = 1; for (const v of g[u]) { if (state[v] === 1 || (state[v] === 0 && dfs(v))) return true } state[u] = 2; return false }
  for (let u = 0; u < g.length; u++) if (state[u] === 0 && dfs(u)) throw new Error('The graph has a cycle; it must be a DAG.')
  return g
}
export function buildTrace(graph) {
  const target = graph.length - 1
  const result = []
  const path = [0]
  const frames = [{ phase: 'start', activeLine: 12, path: [0], u: 0, count: 0, message: `Start DFS at node 0 with path [0]; the target is node ${target}.` }]
  const dfs = u => {
    if (u === target) {
      result.push([...path])
      frames.push({ phase: 'emit', activeLine: 6, path: [...path], u, count: result.length, message: `Reached target ${target}: record path [${path.join(' -> ')}] (a copy, since path keeps changing).` })
      return
    }
    for (const v of graph[u]) {
      path.push(v)
      frames.push({ phase: 'push', activeLine: 9, path: [...path], u: v, count: result.length, message: `Follow edge ${u} -> ${v}: append ${v} to the path.` })
      dfs(v)
      path.pop()
      frames.push({ phase: 'pop', activeLine: 11, path: [...path], u, count: result.length, message: `Finished exploring ${v}: backtrack to ${u}.` })
    }
  }
  dfs(0)
  frames.push({ phase: 'done', activeLine: 13, path: [], u: -1, count: result.length, message: `${result.length} path(s) from 0 to ${target}.` })
  return { input: graph, result, frames }
}
export const code = `def allPathsSourceTarget(graph):
    target = len(graph) - 1
    res = []
    def dfs(u, path):
        if u == target:
            res.append(path[:])
            return
        for v in graph[u]:
            path.append(v)
            dfs(v, path)
            path.pop()
    dfs(0, [0])
    return res`.split('\n').map((text, index) => ({ line: index + 1, text }))
