export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with scores and edges.')
  const { scores, edges } = input
  if (!Array.isArray(scores) || scores.length < 4 || scores.length > 8) throw new Error('scores has 4 to 8 nodes.')
  if (!scores.every(s => Number.isInteger(s) && s >= 1 && s <= 50)) throw new Error('Each score is an integer from 1 to 50.')
  const n = scores.length
  if (!Array.isArray(edges) || edges.length > 16) throw new Error('edges has at most 16 pairs.')
  const seen = new Set()
  for (const e of edges) {
    if (!Array.isArray(e) || e.length !== 2 || !e.every(v => Number.isInteger(v) && v >= 0 && v < n) || e[0] === e[1]) throw new Error('Each edge is two different nodes.')
    const key = [Math.min(...e), Math.max(...e)].join('-')
    if (seen.has(key)) throw new Error('Edges must be unique.')
    seen.add(key)
  }
  return { scores, edges }
}

export function buildTrace({ scores, edges }) {
  const n = scores.length
  const adj = Array.from({ length: n }, () => [])
  for (const [a, b] of edges) { adj[a].push(b); adj[b].push(a) }
  const frames = []
  for (const list of adj) list.sort((x, y) => scores[y] - scores[x] || x - y)
  for (const list of adj) list.splice(3)
  frames.push({ pythonLine: PL('adj = '), phase: 'setup', activeLine: CL('const adj'), edge: null, path: null, best: -1, adj: adj.map(l => [...l]), message: `Build neighbour lists and keep the three highest-scoring neighbours of each node.` })
  let best = -1
  let bestPath = null
  for (const [a, b] of edges) {
    for (const [u, v] of [[a, b], [b, a]]) {
      for (const c of adj[u]) {
        if (c === v) continue
        for (const d of adj[v]) {
          if (d === u || d === c) continue
          const total = scores[u] + scores[v] + scores[c] + scores[d]
          const improved = total > best
          if (improved) { best = total; bestPath = [c, u, v, d] }
          frames.push({ pythonLine: PL('best = max(best'), phase: 'try', activeLine: CL('const total'), edge: [u, v], path: [c, u, v, d], best, adj: adj.map(l => [...l]), message: `Path ${c} - ${u} - ${v} - ${d} scores ${total}${improved ? ', the best so far' : ''}.` })
        }
      }
    }
  }
  frames.push({ pythonLine: PL('return best'), phase: 'done', activeLine: CL('return best'), edge: null, path: bestPath, best, adj: adj.map(l => [...l]), message: best < 0 ? 'No path of four nodes exists, so return -1.' : `The best path scores ${best}.` })
  return { input: { scores, edges }, result: best, frames }
}

export const code = `function maxScoreFourNodes(scores, edges) {
  const n = scores.length;
  const adj = Array.from({ length: n }, () => []);
  for (const [a, b] of edges) {
    adj[a].push(b);
    adj[b].push(a);
  }
  for (const list of adj) {
    list.sort((x, y) => scores[y] - scores[x] || x - y);
    list.splice(3);
  }
  let best = -1;
  for (const [a, b] of edges) {
    for (const [u, v] of [[a, b], [b, a]]) {
      for (const c of adj[u]) {
        if (c === v) continue;
        for (const d of adj[v]) {
          if (d === u || d === c) continue;
          const total = scores[u] + scores[v] + scores[c] + scores[d];
          best = Math.max(best, total);
        }
      }
    }
  }
  return best;
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const CL = s => { const i = code.findIndex(c => c.text.includes(s)); if (i < 0) throw new Error(`missing ${s}`); return i + 1 }

export const python = `def max_score_four_nodes(scores, edges):
    n = len(scores)
    adj = [[] for _ in range(n)]
    for a, b in edges:
        adj[a].append(b)
        adj[b].append(a)
    for i in range(n):
        adj[i].sort(key=lambda x: (-scores[x], x))
        adj[i] = adj[i][:3]
    best = -1
    for a, b in edges:
        for u, v in ((a, b), (b, a)):
            for c in adj[u]:
                if c == v:
                    continue
                for d in adj[v]:
                    if d == u or d == c:
                        continue
                    best = max(best, scores[u] + scores[v] + scores[c] + scores[d])
    return best
`
const PY = python.split('\n')
const PL = s => { const i = PY.findIndex(l => l.includes(s)); if (i < 0) throw new Error(`missing ${s}`); return i + 1 }
