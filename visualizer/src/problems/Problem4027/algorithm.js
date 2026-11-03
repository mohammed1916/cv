// Think of the elevator's visit order as a permutation of the requests. dp[mask][last] is the earliest time
// the elevator can have fulfilled exactly the requests in mask, ending on request last. Waiting is free and
// earlier is never worse, so keeping only the earliest time per state is enough. Moving to a new request j
// takes |floor difference| seconds, and it cannot finish before arrival_j.

const MAX_REQUESTS = 6
const MAX_FLOOR = 20
const MAX_ARRIVAL = 30
const INF = Infinity

const codeLines = [
  'dp[mask][i] is unknown for every state',
  'for each request j, its first stop costs max(distance from start, arrival)',
  'for each mask in increasing order',
  '  for each last request i with a known time t',
  '    for each request j not in mask',
  '      arrive is max(t plus the floor distance from i to j, arrival of j)',
  '      dp[mask with j][j] keeps the smaller of itself and arrive',
  'return the smallest dp[full][i]',
]

export const code = codeLines.map((text, index) => ({ line: index + 1, text }))

const L = fragment => {
  const index = codeLines.findIndex(text => text.includes(fragment))
  if (index < 0) throw new Error(`Missing pseudocode line: ${fragment}`)
  return index + 1
}

const pythonLines = [
  'def earliest_finish(start, requests):',
  '    n = len(requests)',
  "    INF = float('inf')",
  '    full = (1 << n) - 1',
  '    dp = [[INF] * n for _ in range(1 << n)]',
  '    for j, (arrival, floor) in enumerate(requests):',
  '        dp[1 << j][j] = max(abs(start - floor), arrival)',
  '    for mask in range(1, full + 1):',
  '        for i, (_, fi) in enumerate(requests):',
  '            t = dp[mask][i]',
  '            if t == INF:',
  '                continue',
  '            for j, (arrival, fj) in enumerate(requests):',
  '                if (mask >> j) & 1:',
  '                    continue',
  '                arrive = max(t + abs(fi - fj), arrival)',
  '                nm = mask | (1 << j)',
  '                if arrive < dp[nm][j]:',
  '                    dp[nm][j] = arrive',
  '    return min(dp[full])',
]

export const python = pythonLines.join('\n') + '\n'

const P = fragment => {
  const index = pythonLines.findIndex(text => text.includes(fragment))
  if (index < 0) throw new Error(`Missing python line: ${fragment}`)
  return index + 1
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with start and requests.')
  const { start, requests } = input
  if (!Number.isInteger(start) || start < 1 || start > MAX_FLOOR) throw new Error(`start is a floor from 1 to ${MAX_FLOOR}.`)
  if (!Array.isArray(requests) || requests.length < 1 || requests.length > MAX_REQUESTS) throw new Error(`requests holds 1 to ${MAX_REQUESTS} pairs.`)
  for (const r of requests) {
    if (!Array.isArray(r) || r.length !== 2 || !r.every(Number.isInteger)) throw new Error('Each request is [arrival, floor] with whole numbers.')
    const [arrival, floor] = r
    if (arrival < 0 || arrival > MAX_ARRIVAL) throw new Error(`arrival is from 0 to ${MAX_ARRIVAL}.`)
    if (floor < 1 || floor > MAX_FLOOR) throw new Error(`floor is from 1 to ${MAX_FLOOR}.`)
  }
  return { start, requests }
}

export function buildTrace({ start, requests }) {
  const n = requests.length
  const full = (1 << n) - 1
  const dp = Array.from({ length: 1 << n }, () => Array(n).fill(INF))
  const frames = []
  const show = () => dp.map(row => row.map(v => (v === INF ? null : v)))
  const snap = fields => frames.push({ mask: -1, from: -1, to: -1, arrive: null, improved: null, dp: show(), ...fields })

  snap({ phase: 'start', pythonLine: P('dp = [[INF]'), activeLine: L('dp[mask][i] is unknown'), message: `${n} request${n === 1 ? '' : 's'}; the elevator starts at floor ${start} at time 0.` })

  requests.forEach(([arrival, floor], j) => {
    dp[1 << j][j] = Math.max(Math.abs(start - floor), arrival)
    snap({ phase: 'base', pythonLine: P('dp[1 << j][j]'), activeLine: L('for each request j'), mask: 1 << j, to: j, arrive: dp[1 << j][j], improved: true, message: `Request ${j + 1} first: reach floor ${floor} and wait for time ${arrival} if needed, at time ${dp[1 << j][j]}.` })
  })

  for (let mask = 1; mask <= full; mask++) {
    for (let i = 0; i < n; i++) {
      const t = dp[mask][i]
      if (t === INF) continue
      for (let j = 0; j < n; j++) {
        if ((mask >> j) & 1) continue
        const [arrival, fj] = requests[j]
        const arrive = Math.max(t + Math.abs(requests[i][1] - fj), arrival)
        const nm = mask | (1 << j)
        const improved = arrive < dp[nm][j]
        if (improved) dp[nm][j] = arrive
        snap({ phase: improved ? 'relax' : 'keep', pythonLine: P('if arrive < dp[nm][j]'), activeLine: L('arrive is max'), mask, from: i, to: j, arrive, improved, message: `From request ${i + 1} at time ${t}, reach request ${j + 1} at time ${arrive}; ${improved ? 'store it.' : 'a faster route is already stored.'}` })
      }
    }
  }

  const best = Math.min(...dp[full])
  snap({ phase: 'done', pythonLine: P('return min(dp[full])'), activeLine: L('return the smallest'), mask: full, from: -1, to: -1, arrive: best, improved: null, message: `Earliest time to fulfil every request: ${best}.` })
  return { input: { start, requests }, result: best, frames }
}
