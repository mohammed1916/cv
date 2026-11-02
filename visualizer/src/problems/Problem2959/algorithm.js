export function parseInput(text) {
  const input = JSON.parse(text)
  const { n, maxDistance, roads } = input ?? {}
  if (!Number.isInteger(n) || n < 1 || n > 6) throw new Error('n is an integer from 1 to 6.')
  if (!Number.isInteger(maxDistance) || maxDistance < 0 || maxDistance > 1000) throw new Error('maxDistance is an integer from 0 to 1000.')
  if (!Array.isArray(roads) || roads.length > 15) throw new Error('roads is a list of at most 15 edges.')
  for (const road of roads) {
    if (!Array.isArray(road) || road.length !== 3) throw new Error('Each road is [u, v, w].')
    const [u, v, w] = road
    if (![u, v, w].every(Number.isInteger) || u < 0 || v < 0 || u >= n || v >= n || u === v || w < 1 || w > 1000) throw new Error('Each road joins two different branches with a weight from 1 to 1000.')
  }
  return { n, maxDistance, roads }
}

export function buildTrace({ n, maxDistance, roads }) {
  const frames = []
  const dist = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 0 : Infinity)))
  frames.push({ pythonLine: P('dist = [[INF]'), phase: 'start', activeLine: L('start with direct roads'), at: -1, open: [], mask: -1, count: 0, message: `Limit ${maxDistance} between any two open branches.` })
  for (const [u, v, w] of roads) {
    dist[u][v] = Math.min(dist[u][v], w)
    dist[v][u] = Math.min(dist[v][u], w)
  }
  for (let k = 0; k < n; k++) {
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) dist[i][j] = Math.min(dist[i][j], dist[i][k] + dist[k][j])
    frames.push({ pythonLine: P('for k in range(n)'), phase: 'floyd', activeLine: L('relax every pair through k'), at: k, open: [], mask: -1, count: 0, message: `Paths may now pass through branch ${k}.` })
  }
  let count = 0
  for (let mask = 0; mask < (1 << n); mask++) {
    const open = []
    for (let i = 0; i < n; i++) if ((mask >> i) & 1) open.push(i)
    let ok = true
    for (const a of open) for (const b of open) if (dist[a][b] > maxDistance) ok = false
    frames.push({ pythonLine: P('ok = all('), phase: 'mask', activeLine: L('check every pair'), at: -1, open, mask, ok, count, message: `Open set {${open.join(', ')}}: ${ok ? 'every pair is within the limit' : 'some pair is too far'}.` })
    if (ok) {
      count += 1
      frames.push({ pythonLine: P('count += 1'), phase: 'count', activeLine: L('count this set'), at: -1, open, mask, ok, count, message: `Count is now ${count}.` })
    }
  }
  frames.push({ pythonLine: P('return count'), phase: 'done', activeLine: L('return the count'), at: -1, open: [], mask: -1, count, message: `${count} valid set${count === 1 ? '' : 's'} of open branches.` })
  return { input: { n, maxDistance, roads }, result: count, frames }
}

export const code = `count sets of branches that can stay open
  set the distance between each pair of branches to infinity, and to 0 for the same branch
  set each road's distance to its weight when it is shorter
  for each middle branch k
    relax every pair (i, j) through k
  count = 0
  for each subset of branches, written as a bit mask
    open is the list of branches in the subset
    if every pair in open has distance at most maxDistance
      add 1 to count
  return count`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def number_of_sets(n, max_distance, roads):
    INF = float("inf")
    dist = [[INF] * n for _ in range(n)]
    for i in range(n):
        dist[i][i] = 0
    for u, v, w in roads:
        dist[u][v] = min(dist[u][v], w)
        dist[v][u] = min(dist[v][u], w)
    for k in range(n):
        for i in range(n):
            for j in range(n):
                dist[i][j] = min(dist[i][j], dist[i][k] + dist[k][j])
    count = 0
    for mask in range(1 << n):
        open_nodes = [i for i in range(n) if mask >> i & 1]
        ok = all(dist[a][b] <= max_distance for a in open_nodes for b in open_nodes)
        if ok:
            count += 1
    return count
`
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1
