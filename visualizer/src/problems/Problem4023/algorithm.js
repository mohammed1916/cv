export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with start and floors.')
  const { start, floors } = input
  if (!Number.isInteger(start) || start < 1 || start > 1000) throw new Error('start is a floor from 1 to 1000.')
  if (!Array.isArray(floors) || floors.length < 1 || floors.length > 8) throw new Error('floors lists 1 to 8 requested floors.')
  if (!floors.every(f => Number.isInteger(f) && f >= 1 && f <= 1000)) throw new Error('Each requested floor is an integer from 1 to 1000.')
  return { start, floors: [...new Set(floors)].sort((a, b) => a - b) }
}

const lineOf = (list, text) => {
  const i = list.findIndex(c => c.text.includes(text))
  if (i < 0) throw new Error(`Missing pseudocode line: ${text}`)
  return i + 1
}

// The visited floors always form one interval containing start. The cost of a move is its
// length times the number of requests still waiting outside the interval, which sums to the
// total of first-visit times.
export function buildTrace({ start, floors }) {
  const frames = []
  const L = t => lineOf(code, t)
  const P = t => lineOf(PY, t)
  const pts = [...new Set([...floors, start])].sort((a, b) => a - b)
  const n = pts.length
  const s = pts.indexOf(start)
  const requested = new Set(floors)
  const w = pts.map(p => (requested.has(p) && p !== start ? 1 : 0))
  const total = w.reduce((a, b) => a + b, 0)
  const dp = Array.from({ length: n }, () => Array.from({ length: n }, () => [Infinity, Infinity]))
  dp[s][s][0] = 0
  dp[s][s][1] = 0
  const snapshot = () => {
    const out = []
    for (let i = 0; i < n; i++) for (let j = i; j < n; j++) for (let side = 0; side < 2; side++) {
      if (dp[i][j][side] !== Infinity) out.push({ i, j, side, cost: dp[i][j][side] })
    }
    return out
  }
  frames.push({ phase: 'start', activeLine: L('dp at start'), pythonLine: P('dp[s][s][0]'), pts, start, interval: [s, s], side: null, cost: 0, pending: total, states: snapshot(), result: null, message: `Begin at floor ${start}. ${total} request${total === 1 ? '' : 's'} still waiting.` })

  for (let size = 1; size < n; size++) {
    for (let i = 0; i + size - 1 < n; i++) {
      const j = i + size - 1
      if (!(i <= s && s <= j)) continue
      const inside = w.slice(i, j + 1).reduce((a, b) => a + b, 0)
      const outside = total - inside
      for (let side = 0; side < 2; side++) {
        const cost = dp[i][j][side]
        if (cost === Infinity) continue
        const pos = side === 0 ? pts[i] : pts[j]
        frames.push({ phase: 'expand', activeLine: L('for each interval'), pythonLine: P('for i in range(n - size + 1)'), pts, start, interval: [i, j], side, cost, pending: outside, states: snapshot(), result: null, message: `Interval ${pts[i]}..${pts[j]} ending at ${pos} costs ${cost} so far, with ${outside} request${outside === 1 ? '' : 's'} waiting outside.` })
        if (i > 0) {
          const next = cost + Math.abs(pos - pts[i - 1]) * outside
          if (next < dp[i - 1][j][0]) dp[i - 1][j][0] = next
        }
        if (j < n - 1) {
          const next = cost + Math.abs(pos - pts[j + 1]) * outside
          if (next < dp[i][j + 1][1]) dp[i][j + 1][1] = next
        }
      }
    }
  }
  const result = Math.min(dp[0][n - 1][0], dp[0][n - 1][1])
  frames.push({ phase: 'done', activeLine: L('return the least'), pythonLine: P('return min('), pts, start, interval: [0, n - 1], side: null, cost: result, pending: 0, states: snapshot(), result, message: `The least total of first-visit times is ${result}.` })
  return { input: { start, floors }, result, frames }
}

export const code = `least total of first-visit times when starting at start
pts = sorted distinct floors together with start
weight is 1 for each requested floor other than start
dp at start: the interval [start, start] costs 0 at either end
for each interval, grown from the smallest outward
  for each end of the interval with a finite cost
    extend the interval by one point on the left or right
    cost grows by distance moved times weight still waiting outside
return the least cost over both ends of the full interval`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def minimum_total_wait(start, floors):
    pts = sorted(set(floors) | {start})
    n = len(pts)
    s = pts.index(start)
    requested = set(floors)
    w = [1 if (p in requested and p != start) else 0 for p in pts]
    total = sum(w)
    INF = float('inf')
    dp = [[[INF, INF] for _ in range(n)] for _ in range(n)]
    dp[s][s][0] = dp[s][s][1] = 0
    for size in range(1, n):
        for i in range(n - size + 1):
            j = i + size - 1
            if not (i <= s <= j):
                continue
            outside = total - sum(w[i:j + 1])
            for side in (0, 1):
                cost = dp[i][j][side]
                if cost == INF:
                    continue
                pos = pts[i] if side == 0 else pts[j]
                if i > 0:
                    dp[i - 1][j][0] = min(dp[i - 1][j][0], cost + abs(pos - pts[i - 1]) * outside)
                if j < n - 1:
                    dp[i][j + 1][1] = min(dp[i][j + 1][1], cost + abs(pos - pts[j + 1]) * outside)
    return min(dp[0][n - 1])
`
const PY = python.split('\n').map((text, index) => ({ line: index + 1, text }))
