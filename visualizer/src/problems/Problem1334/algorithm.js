import { pivotCells } from '../../components/shared/distanceMatrixModel.js'

export function parseInput(text) {
  const v = JSON.parse(text)
  const err = 'Enter {"n":4,"edges":[[0,1,3],[1,2,1]],"threshold":4}: 2 to 8 cities, at most 12 edges [a,b,w] with 0 <= a,b < n, a != b, 1 <= w <= 10, no city pair repeated, and 0 <= threshold <= 30.'
  if (!v || typeof v !== 'object' || !Array.isArray(v.edges)) throw new Error(err)
  const { n, edges, threshold } = v
  if (![n, threshold].every(Number.isInteger) || n < 2 || n > 8 || threshold < 0 || threshold > 30 || edges.length > 12) throw new Error(err)
  const seen = new Set()
  for (const e of edges) {
    if (!Array.isArray(e) || e.length !== 3 || !e.every(Number.isInteger)) throw new Error(err)
    const [a, b, w] = e
    const key = a < b ? `${a},${b}` : `${b},${a}`
    if (a < 0 || b < 0 || a >= n || b >= n || a === b || w < 1 || w > 10 || seen.has(key)) throw new Error(err)
    seen.add(key)
  }
  return { n, edges, threshold }
}

const counts = (dist, n, threshold) => Array.from({ length: n }, (_, i) => dist[i].filter((d, j) => j !== i && d <= threshold).length)

export function buildTrace({ n, edges, threshold }) {
  const dist = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 0 : Infinity)))
  for (const [a, b, w] of edges) { dist[a][b] = w; dist[b][a] = w }
  const snapshot = () => dist.map(row => [...row])
  const frames = [{ phase: 'start', activeLine: L('set dist[i][j] to 0'), cell: null, highlighted: [], matrix: snapshot(), queue: [], k: -1, message: `Direct distances only: 0 on the diagonal, the edge weight for each edge, infinity otherwise. Threshold is ${threshold}.` }]
  for (let k = 0; k < n; k++) {
    frames.push({ phase: 'pivot', activeLine: L('for each intermediate city k'), cell: null, highlighted: pivotCells(n, k), matrix: snapshot(), queue: [], k, message: `City ${k} may now be used as a stepping stone: every route i to k to j is checked against the direct distance.` })
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
      const via = dist[i][k] + dist[k][j]
      if (via < dist[i][j]) {
        dist[i][j] = via
        frames.push({ phase: 'relax', activeLine: L('set dist[i][j] to dist[i][k] + dist[k][j]'), cell: null, highlighted: pivotCells(n, k), matrix: snapshot(), queue: [], k, target: [i, j], message: `Through ${k}, city ${i} reaches ${j} in ${via}.` })
      }
    }
  }
  const per = counts(dist, n, threshold)
  let best = -1
  let bestCount = Infinity
  for (let i = 0; i < n; i++) {
    if (best < 0 || per[i] <= bestCount) { best = i; bestCount = per[i] }
    frames.push({ phase: 'count', activeLine: L('count the cities j'), cell: null, highlighted: [], matrix: snapshot(), queue: per.slice(0, i + 1).map((c, x) => `city ${x}: ${c} within ${threshold}`), k: -1, best, message: `City ${i} has ${per[i]} neighbour(s) within ${threshold}. Best so far: city ${best} with ${bestCount}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return best'), cell: null, highlighted: [], matrix: snapshot(), queue: per.map((c, x) => `city ${x}: ${c} within ${threshold}`), k: -1, best, message: `City ${best} has the fewest neighbours within ${threshold}; a tie goes to the larger index.` })
  return { input: { n, edges, threshold }, result: best, frames }
}

export const code = `city with the fewest neighbours within the threshold
  set dist[i][j] to 0 when i = j, the edge weight for each edge in both directions, and infinity otherwise
  for each intermediate city k from 0 to n-1
    for each start city i and end city j
      if dist[i][k] + dist[k][j] < dist[i][j] then
        set dist[i][j] to dist[i][k] + dist[k][j]
  set best to nothing
  for each city i from 0 to n-1
    count the cities j not equal to i with dist[i][j] <= threshold
    if best is nothing or count <= best count then
      set best to i and best count to count
  return best`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def find_the_city(n, edges, threshold):
    INF = float('inf')
    dist = [[0 if i == j else INF for j in range(n)] for i in range(n)]
    for a, b, w in edges:
        dist[a][b] = w
        dist[b][a] = w
    for k in range(n):
        for i in range(n):
            for j in range(n):
                if dist[i][k] + dist[k][j] < dist[i][j]:
                    dist[i][j] = dist[i][k] + dist[k][j]
    best, best_count = -1, INF
    for i in range(n):
        count = sum(1 for j in range(n) if j != i and dist[i][j] <= threshold)
        if best < 0 or count <= best_count:
            best, best_count = i, count
    return best
`
