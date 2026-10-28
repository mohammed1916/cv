export function parseInput(text) {
  const data = JSON.parse(text)
  const { max_time: maxTime, edges, passing_fees: fees } = data ?? {}
  if (!Number.isInteger(maxTime) || maxTime < 1 || maxTime > 8) throw new Error('max_time must be an integer from 1 to 8.')
  if (!Array.isArray(fees) || fees.length < 2 || fees.length > 4 || fees.some(f => !Number.isInteger(f) || f < 1 || f > 9)) {
    throw new Error('passing_fees must be 2 to 4 integers, each from 1 to 9.')
  }
  const n = fees.length
  if (!Array.isArray(edges) || edges.length < 1 || edges.length > 6) throw new Error('edges must be 1 to 6 triples [x, y, time].')
  for (const e of edges) {
    if (!Array.isArray(e) || e.length !== 3) throw new Error('Each edge is [x, y, time].')
    const [x, y, w] = e
    if (![x, y].every(v => Number.isInteger(v) && v >= 0 && v < n) || x === y) throw new Error('Edge ends must be different cities from 0 to n - 1.')
    if (!Number.isInteger(w) || w < 1 || w > 4) throw new Error('Edge times are integers from 1 to 4.')
  }
  return { max_time: maxTime, edges, passing_fees: fees }
}

export const code = `minimum cost to reach the last city in time(max_time, edges, passing_fees)
  n = number of cities
  cost[t][v] = infinity for every time t from 0 to max_time and every city v
  cost[0][0] = passing_fees[0]
  for t from 1 to max_time
    for each edge (x, y, w) with w at most t
      for each direction u to v in (x to y) and (y to x)
        if cost[t - w][u] is finite then cost[t][v] = min(cost[t][v], cost[t - w][u] + passing_fees[v])
  best = the smallest cost[t][n - 1] over all t
  return best, or -1 if best is infinite`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

// Each state is an exact arrival time at a city, so the answer is the cheapest arrival at the last city by any time.
export function buildTrace({ max_time: maxTime, edges, passing_fees: fees }) {
  const n = fees.length
  const cost = Array.from({ length: maxTime + 1 }, () => Array(n).fill(Infinity))
  cost[0][0] = fees[0]
  const show = () => cost.map(row => row.map(v => (Number.isFinite(v) ? v : '∞')))
  const frames = [{ phase: 'start', cell: [0, 0], table: show(), activeLine: L('cost[0][0] = passing_fees[0]'), message: `Start in city 0 at time 0 with fee ${fees[0]}.` }]
  for (let t = 1; t <= maxTime; t++) {
    for (const [x, y, w] of edges) {
      if (w > t) continue
      for (const [u, v] of [[x, y], [y, x]]) {
        if (!Number.isFinite(cost[t - w][u])) continue
        const candidate = cost[t - w][u] + fees[v]
        if (candidate < cost[t][v]) {
          cost[t][v] = candidate
          frames.push({ phase: 'relax', cell: [t, v], table: show(), activeLine: L('cost[t][v] = min'), message: `Reach city ${v} at time ${t} from city ${u} for a total fee of ${candidate}.` })
        }
      }
    }
  }
  let best = Infinity
  for (let t = 0; t <= maxTime; t++) best = Math.min(best, cost[t][n - 1])
  const result = Number.isFinite(best) ? best : -1
  frames.push({ phase: 'done', cell: null, table: show(), activeLine: L('return best, or -1'), message: result === -1 ? 'The last city cannot be reached in time.' : `Cheapest arrival at city ${n - 1}: ${result}.` })
  return { input: { max_time: maxTime, edges, passing_fees: fees }, result, frames }
}

export const python = `def min_cost_in_time(max_time, edges, passing_fees):
    n = len(passing_fees)
    INF = float('inf')
    cost = [[INF] * n for _ in range(max_time + 1)]
    cost[0][0] = passing_fees[0]
    for t in range(1, max_time + 1):
        for x, y, w in edges:
            if w > t:
                continue
            for u, v in ((x, y), (y, x)):
                if cost[t - w][u] < INF:
                    cost[t][v] = min(cost[t][v], cost[t - w][u] + passing_fees[v])
    best = min(cost[t][n - 1] for t in range(max_time + 1))
    return -1 if best == INF else best
`
