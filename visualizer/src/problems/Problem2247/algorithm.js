// LeetCode 2247: Maximum Cost of Trip With K Highways.
// dp[mask][v] is the best cost of a simple trip that visits exactly the cities in mask and ends at v.
// Parallel highways between two cities keep only the most expensive one. A trip with k highways
// visits k + 1 cities, so the answer is the best dp value over masks of size k + 1.

const MAX_CITIES = 6
const MAX_COST = 100

export function parseInput(text) {
  let input
  try { input = JSON.parse(text) } catch { throw new Error('Use an object like {"n":4,"edges":[[0,1,3]],"k":2}.') }
  const { n, edges, k } = input || {}
  if (!Number.isInteger(n) || n < 1 || n > MAX_CITIES) throw new Error(`n is 1 to ${MAX_CITIES}. The visualization caps the city count at ${MAX_CITIES}.`)
  if (!Number.isInteger(k) || k < 0) throw new Error('k is a non-negative integer.')
  if (!Array.isArray(edges)) throw new Error('edges is a list of [a, b, cost] highways.')
  for (const e of edges) {
    if (!Array.isArray(e) || e.length !== 3) throw new Error('Each highway is [a, b, cost].')
    const [a, b, cost] = e
    if (!Number.isInteger(a) || !Number.isInteger(b) || a < 0 || b < 0 || a >= n || b >= n || a === b) throw new Error('Highway endpoints must be distinct cities below n.')
    if (!Number.isInteger(cost) || Math.abs(cost) > MAX_COST) throw new Error(`Highway costs are integers from -${MAX_COST} to ${MAX_COST}.`)
  }
  return { n, edges, k }
}

export const code = `FUNCTION maxTripCost(n, edges, k)
    best[a][b] ← the largest cost among highways between a and b, for both directions
    IF k + 1 > n THEN RETURN -1
    dp[1 << v][v] ← 0 for every city v
    answer ← none
    FOR each mask in increasing order with at most k + 1 cities
        FOR each end city v in mask where dp[mask][v] is set
            IF mask has k + 1 cities THEN answer ← max(answer, dp[mask][v])
            ELSE FOR each city u not in mask with a highway from v
                dp[mask + u][u] ← max(dp[mask + u][u], dp[mask][v] + best[v][u])
    RETURN answer, or -1 when no trip exists`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def max_trip_cost(n, edges, k):
    best = [[None] * n for _ in range(n)]
    for a, b, cost in edges:
        for x, y in ((a, b), (b, a)):
            if best[x][y] is None or cost > best[x][y]:
                best[x][y] = cost
    if k + 1 > n:
        return -1
    dp = [[None] * n for _ in range(1 << n)]
    for v in range(n):
        dp[1 << v][v] = 0
    answer = None
    for mask in range(1 << n):
        size = bin(mask).count('1')
        if size > k + 1:
            continue
        for v in range(n):
            if dp[mask][v] is None:
                continue
            if size == k + 1:
                if answer is None or dp[mask][v] > answer:
                    answer = dp[mask][v]
                continue
            for u in range(n):
                if mask >> u & 1 or best[v][u] is None:
                    continue
                value = dp[mask][v] + best[v][u]
                nxt = mask | 1 << u
                if dp[nxt][u] is None or value > dp[nxt][u]:
                    dp[nxt][u] = value
    return -1 if answer is None else answer
`

const L = text => {
  const index = code.findIndex(line => line.text.includes(text))
  if (index < 0) throw new Error(`Missing pseudocode line: ${text}`)
  return index + 1
}
const P = text => {
  const index = python.split('\n').findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`Missing python line: ${text}`)
  return index + 1
}

export const phases = [
  { id: 'start', label: 'Highways', description: 'Keep the best highway between each pair of cities.' },
  { id: 'extend', label: 'Extend', description: 'Extend a trip by one highway to a new city.' },
  { id: 'record', label: 'Record', description: 'A trip with k + 1 cities is complete.' },
  { id: 'done', label: 'Result', description: 'The best complete trip.' },
]

export function buildTrace({ n, edges, k }) {
  const best = Array.from({ length: n }, () => Array(n).fill(null))
  for (const [a, b, cost] of edges) {
    for (const [x, y] of [[a, b], [b, a]]) if (best[x][y] === null || cost > best[x][y]) best[x][y] = cost
  }
  const frames = []
  const full = 1 << n
  const dp = Array.from({ length: full }, () => Array(n).fill(null))
  const parent = Array.from({ length: full }, () => Array(n).fill(null))
  const snapshotPath = (mask, v) => {
    const cities = []
    let m = mask
    let c = v
    while (c !== null && m) {
      cities.unshift(c)
      const p = parent[m][c]
      m = m & ~(1 << c)
      c = p
    }
    return cities
  }
  frames.push({ phase: 'start', activeLine: L('best[a][b] ←'), pythonLine: P('best = [[None]'), message: `Best highway table built from ${edges.length} highway${edges.length === 1 ? '' : 's'}.`, mask: 0, from: null, to: null, value: null, bestValue: null, bestPath: [], best })
  if (k + 1 > n) {
    frames.push({ phase: 'done', activeLine: L('IF k + 1 > n'), pythonLine: P('return -1'), message: `A trip with ${k} highways needs ${k + 1} cities; only ${n} exist.`, mask: 0, from: null, to: null, value: null, bestValue: null, bestPath: [], best, result: -1 })
    return { input: { n, edges, k }, result: -1, frames }
  }
  for (let v = 0; v < n; v++) dp[1 << v][v] = 0
  let answer = null
  let answerMask = 0
  let answerEnd = null
  for (let mask = 1; mask < full; mask++) {
    const size = popcount(mask)
    if (size > k + 1) continue
    for (let v = 0; v < n; v++) {
      if (dp[mask][v] === null) continue
      if (size === k + 1) {
        if (answer === null || dp[mask][v] > answer) { answer = dp[mask][v]; answerMask = mask; answerEnd = v }
        frames.push({ phase: 'record', activeLine: L('IF mask has k + 1'), pythonLine: P('if size == k + 1'), message: `Trip ending at ${v} visits ${size} cities for cost ${dp[mask][v]}. Best ${answer}.`, mask, from: v, to: null, value: dp[mask][v], bestValue: answer, bestPath: snapshotPath(answerMask, answerEnd), best })
        continue
      }
      for (let u = 0; u < n; u++) {
        if (mask & (1 << u) || best[v][u] === null) continue
        const next = mask | (1 << u)
        const value = dp[mask][v] + best[v][u]
        const improved = dp[next][u] === null || value > dp[next][u]
        if (improved) { dp[next][u] = value; parent[next][u] = v }
        frames.push({ phase: 'extend', activeLine: L(improved ? 'dp[mask + u][u] ←' : 'dp[mask + u][u] ←'), pythonLine: P(improved ? 'dp[nxt][u] = value' : 'if dp[nxt][u] is None'), message: `Trip ${v} → ${u} costs ${best[v][u]}; total ${value} ${improved ? 'is kept' : 'does not beat the stored trip'}.`, mask: next, from: v, to: u, value, bestValue: answer, bestPath: answer === null ? [] : snapshotPath(answerMask, answerEnd), best })
      }
    }
  }
  const result = answer === null ? -1 : answer
  frames.push({ phase: 'done', activeLine: L('RETURN answer'), pythonLine: P('return -1 if answer is None'), message: result === -1 ? 'No simple trip uses exactly k highways.' : `The best trip with ${k} highway${k === 1 ? '' : 's'} costs ${result}.`, mask: answerMask, from: answerEnd, to: null, value: null, bestValue: result, bestPath: answer === null ? [] : snapshotPath(answerMask, answerEnd), best, result })
  return { input: { n, edges, k }, result, frames }
}

function popcount(mask) {
  let count = 0
  for (let m = mask; m; m &= m - 1) count++
  return count
}
