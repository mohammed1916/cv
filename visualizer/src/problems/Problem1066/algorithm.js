const CODE_TEXT = `campus bikes II minimum total distance
  let m be the number of bikes and n the number of workers
  set dp[mask] to infinity for every mask, and dp[0] to 0
  for each mask from 0 to 2 to the m minus 1, in increasing order
    if dp[mask] is infinity then continue
    let w be the number of bikes in mask, the next worker to place
    if w equals n then continue
    for each bike b that is not in mask
      candidate = dp[mask] plus the distance from worker w to bike b
      if candidate is less than dp[mask with b added] then store it
  return the smallest dp[mask] whose mask has n bits`

export const code = CODE_TEXT.split('\n').map((text, index) => ({ line: index + 1, text }))

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
  if (index < 0) throw new Error(`Missing pseudocode line: ${text}`)
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
  add('start', 'set dp[mask] to infinity', 'dp[0] = 0', `Place ${n} worker${n === 1 ? '' : 's'} on ${m} bike${m === 1 ? '' : 's'}; dp[mask] is the least cost of seating the first popcount(mask) workers on the bikes in mask.`, {})
  let result = INF
  for (let mask = 0; mask < size; mask++) {
    if (dp[mask] === INF) continue
    const w = popcount(mask)
    if (w === n) {
      result = Math.min(result, dp[mask])
      add('full', 'if w equals n then continue', 'if w == n', `Mask ${mask} uses ${n} bikes: a full assignment costing ${dp[mask]}.`, { mask })
      continue
    }
    add('mask', 'if dp[mask] is infinity then continue', 'if dp[mask] == INF', `Mask ${mask} is reachable with cost ${dp[mask]}; worker ${w} is next.`, { mask, worker: w })
    for (let b = 0; b < m; b++) {
      if (mask & (1 << b)) continue
      const candidate = dp[mask] + dist(w, b)
      const next = mask | (1 << b)
      const improved = candidate < dp[next]
      add('try', 'for each bike b that is not in mask', 'for b in range(m)', `Worker ${w} takes bike ${b}: ${dp[mask]} + ${dist(w, b)} = ${candidate}.`, { mask, worker: w, bike: b, candidate, nextMask: next })
      if (improved) {
        dp[next] = candidate
        add('store', 'if candidate is less than', 'dp[nxt] = dp[mask] + dist', `Mask ${next} now costs ${candidate}.`, { mask, worker: w, bike: b, candidate, nextMask: next })
      }
    }
  }
  add('done', 'return the smallest dp[mask]', 'return min(dp[mask]', `Minimum total distance is ${result}.`, { mask: -1, worker: -1, bike: -1, candidate: null, result })
  return { input: { workers, bikes }, result, frames }
}
