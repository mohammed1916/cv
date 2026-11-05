export const code = `function minTotalDistance(workers, bikes) {
  const n = workers.length
  const m = bikes.length
  const dp = new Array(1 << m).fill(Infinity)
  dp[0] = 0
  let best = Infinity
  for (let mask = 0; mask < 1 << m; mask++) {
    if (dp[mask] === Infinity) continue
    const w = [...mask.toString(2)].filter(c => c === '1').length
    if (w === n) {
      best = Math.min(best, dp[mask])
      continue
    }
    for (let b = 0; b < m; b++) {
      if (mask & (1 << b)) continue
      const dist = Math.abs(workers[w][0] - bikes[b][0]) + Math.abs(workers[w][1] - bikes[b][1])
      const next = mask | (1 << b)
      dp[next] = Math.min(dp[next], dp[mask] + dist)
    }
  }
  return best
}`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def min_total_distance(workers, bikes):
    n, m = len(workers), len(bikes)
    INF = float("inf")
    dp = [INF] * (1 << m)
    dp[0] = 0
    for mask in range(1 << m):
        if dp[mask] == INF:
            continue
        w = bin(mask).count("1")
        if w == n:
            continue
        for b in range(m):
            if mask >> b & 1:
                continue
            dist = abs(workers[w][0] - bikes[b][0]) + abs(workers[w][1] - bikes[b][1])
            nxt = mask | (1 << b)
            if dp[mask] + dist < dp[nxt]:
                dp[nxt] = dp[mask] + dist
    return min(dp[mask] for mask in range(1 << m) if bin(mask).count("1") == n)


if __name__ == "__main__":
    print(min_total_distance([[0, 0], [2, 1]], [[1, 2], [3, 3]]))
`

const PY_LINES = python.split('\n')
const L = text => {
  const index = code.findIndex(item => item.text.includes(text))
  if (index < 0) throw new Error(`Missing code line: ${text}`)
  return index + 1
}
const P = text => {
  const index = PY_LINES.findIndex(item => item.includes(text))
  if (index < 0) throw new Error(`Missing python line: ${text}`)
  return index + 1
}

const MAX_WORKERS = 6
const MAX_BIKES = 8
const MAX_COORD = 20

const isPoint = p => Array.isArray(p) && p.length === 2 && p.every(v => Number.isInteger(v) && v >= 0 && v <= MAX_COORD)
const popcount = mask => { let c = 0; for (let x = mask; x; x &= x - 1) c++; return c }

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with workers and bikes point lists.')
  const { workers, bikes } = input
  if (!Array.isArray(workers) || workers.length < 1 || workers.length > MAX_WORKERS) throw new Error(`Use 1 to ${MAX_WORKERS} workers.`)
  if (!Array.isArray(bikes) || bikes.length > MAX_BIKES) throw new Error(`Use at most ${MAX_BIKES} bikes.`)
  if (bikes.length < workers.length) throw new Error('There must be at least as many bikes as workers.')
  if (!workers.every(isPoint) || !bikes.every(isPoint)) throw new Error(`Each point is [x, y] with integers from 0 to ${MAX_COORD}.`)
  return { workers, bikes }
}

export function buildTrace({ workers, bikes }) {
  const n = workers.length
  const m = bikes.length
  const size = 1 << m
  const INF = Infinity
  const dp = new Array(size).fill(INF)
  dp[0] = 0
  const dist = (w, b) => Math.abs(workers[w][0] - bikes[b][0]) + Math.abs(workers[w][1] - bikes[b][1])
  const frames = []
  const state = (extra = {}) => ({ workers, bikes, n, m, dp: dp.map(v => (v === INF ? null : v)), mask: -1, worker: -1, bike: -1, candidate: null, ...extra })
  const add = (phase, line, py, message, extra) => frames.push({ phase, activeLine: L(line), pythonLine: P(py), message, ...state(extra) })
  add('start', 'const dp = new Array', 'dp[0] = 0', `Place ${n} worker${n === 1 ? '' : 's'} on ${m} bike${m === 1 ? '' : 's'}; dp[mask] is the least cost of seating the first popcount(mask) workers on the bikes in mask.`, {})
  let result = INF
  for (let mask = 0; mask < size; mask++) {
    if (dp[mask] === INF) continue
    const w = popcount(mask)
    if (w === n) {
      result = Math.min(result, dp[mask])
      add('full', 'if (w === n)', 'if w == n', `Mask ${mask} uses ${n} bikes: a full assignment costing ${dp[mask]}.`, { mask })
      continue
    }
    add('mask', 'if (dp[mask] === Infinity)', 'if dp[mask] == INF', `Mask ${mask} is reachable with cost ${dp[mask]}; worker ${w} is next.`, { mask, worker: w })
    for (let b = 0; b < m; b++) {
      if (mask & (1 << b)) continue
      const candidate = dp[mask] + dist(w, b)
      const next = mask | (1 << b)
      const improved = candidate < dp[next]
      add('try', 'for (let b = 0; b < m; b++)', 'for b in range(m)', `Worker ${w} takes bike ${b}: ${dp[mask]} + ${dist(w, b)} = ${candidate}.`, { mask, worker: w, bike: b, candidate, nextMask: next })
      if (improved) {
        dp[next] = candidate
        add('store', 'dp[next] = Math.min', 'dp[nxt] = dp[mask] + dist', `Mask ${next} now costs ${candidate}.`, { mask, worker: w, bike: b, candidate, nextMask: next })
      }
    }
  }
  add('done', 'return best', 'return min(dp[mask]', `Minimum total distance is ${result}.`, { mask: -1, worker: -1, bike: -1, candidate: null, result })
  return { input: { workers, bikes }, result, frames }
}
