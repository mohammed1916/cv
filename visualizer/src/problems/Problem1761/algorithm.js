export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Use an object with n and edges.')
  const { n, edges } = data
  if (!Number.isInteger(n) || n < 3 || n > 10) throw new Error('n must be an integer from 3 to 10.')
  if (!Array.isArray(edges) || edges.length > 25) throw new Error('edges must be an array of at most 25 pairs.')
  const seen = new Set()
  for (const edge of edges) {
    if (!Array.isArray(edge) || edge.length !== 2 || !edge.every(v => Number.isInteger(v) && v >= 1 && v <= n)) throw new Error(`Each edge is a pair of nodes from 1 to ${n}.`)
    const [a, b] = edge
    if (a === b) throw new Error('An edge cannot join a node to itself.')
    const key = Math.min(a, b) + ',' + Math.max(a, b)
    if (seen.has(key)) throw new Error('Each pair of nodes may be joined by at most one edge.')
    seen.add(key)
  }
  return { n, edges }
}

export function buildTrace({ n, edges }) {
  const adj = Array.from({ length: n + 1 }, () => Array(n + 1).fill(false))
  const deg = Array(n + 1).fill(0)
  for (const [a, b] of edges) {
    adj[a][b] = adj[b][a] = true
    deg[a]++
    deg[b]++
  }
  const frames = []
  let best = null
  let bestTrio = null
  frames.push({ phase: 'start', activeLine: L('build an adjacency table'), trio: null, degree: null, best, bestTrio, message: 'Count each node degree from the edges.' })
  for (let a = 1; a <= n; a++) {
    for (let b = a + 1; b <= n; b++) {
      for (let c = b + 1; c <= n; c++) {
        if (adj[a][b] && adj[b][c] && adj[a][c]) {
          const degree = deg[a] + deg[b] + deg[c] - 6
          if (best === null || degree < best) {
            best = degree
            bestTrio = [a, b, c]
          }
          frames.push({ phase: 'trio', activeLine: L('set degree to'), trio: [a, b, c], degree, best, bestTrio, message: `Trio ${a}, ${b}, ${c} is connected with degree ${degree}.` })
        } else {
          frames.push({ phase: 'check', activeLine: L('if a, b and c are all connected'), trio: [a, b, c], degree: null, best, bestTrio, message: `${a}, ${b}, ${c} is not a connected trio.` })
        }
      }
    }
  }
  frames.push({ phase: 'done', activeLine: L('return best, or -1'), trio: null, degree: null, best, bestTrio, message: best === null ? 'No connected trio exists.' : `Minimum degree: ${best}.` })
  return { input: { n, edges }, result: best === null ? -1 : best, frames }
}

export const code = `minimum degree of a connected trio
  build an adjacency table and count the degree of each node
  set best to nothing
  for each triple of nodes a less than b less than c do
    if a, b and c are all connected to each other then
      set degree to deg[a] + deg[b] + deg[c] - 6
      if best is nothing or degree is less than best then
        set best to degree
  return best, or -1 if best is nothing`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => { const i = code.findIndex(c => c.text.includes(s)); if (i < 0) throw new Error('missing code line: ' + s); return i + 1 }

export const python = `def min_trio_degree(n, edges):
    adj = [[False] * (n + 1) for _ in range(n + 1)]
    deg = [0] * (n + 1)
    for a, b in edges:
        adj[a][b] = True
        adj[b][a] = True
        deg[a] += 1
        deg[b] += 1
    best = None
    for a in range(1, n + 1):
        for b in range(a + 1, n + 1):
            for c in range(b + 1, n + 1):
                if adj[a][b] and adj[b][c] and adj[a][c]:
                    degree = deg[a] + deg[b] + deg[c] - 6
                    if best is None or degree < best:
                        best = degree
    return -1 if best is None else best
`
