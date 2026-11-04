const PHASES = [
  { id: 'seed', label: 'Seed', description: 'Serve one request first, after travelling from the start floor.' },
  { id: 'extend', label: 'Extend', description: 'Add one more unfinished request after a finished set.' },
  { id: 'keep', label: 'Keep', description: 'Keep the earlier of the competing arrival times.' },
  { id: 'done', label: 'Answer', description: 'Take the earliest time that finishes every request.' },
]

export const phases = PHASES

const CODE_LINES = `function earliestFinish(start, requests) {
  // earliest time at which every request is completed
  // let m be the number of requests
  const m = requests.length
  // best[mask][last] is the earliest time with exactly mask done, ending at last
  const best = Array.from({ length: 1 << m }, () => Array(m).fill(Infinity))
  // for each request i, best[1 shifted by i][i] = max(distance from start, arrival of i)
  requests.forEach(([a, f], i) => { best[1 << i][i] = Math.max(Math.abs(f - start), a) })
  // for each mask in increasing order and each last in mask
  for (let mask = 1; mask < 1 << m; mask++) {
    for (let last = 0; last < m; last++) {
      const t = best[mask][last]
      if (t === Infinity) continue
      // for each request nxt not in mask
      for (let nxt = 0; nxt < m; nxt++) {
        if (mask & (1 << nxt)) continue
        const [a, f] = requests[nxt]
        // arrive = max(best[mask][last] plus distance from last to nxt, arrival of nxt)
        const arrive = Math.max(t + Math.abs(f - requests[last][1]), a)
        // best[mask plus nxt][nxt] = the smaller of its value and arrive
        const next = mask | (1 << nxt)
        best[next][nxt] = Math.min(best[next][nxt], arrive)
      }
    }
  }
  // return the smallest best over the full mask
  return Math.min(...best[(1 << m) - 1])
}`.split('\n')

export const code = CODE_LINES.map((text, index) => ({ line: index + 1, text }))

function L(fragment) {
  const index = code.findIndex(c => c.text.includes(fragment))
  if (index < 0) throw new Error(`Missing pseudocode line: ${fragment}`)
  return index + 1
}

export const python = `def earliest_finish(start, requests):
    m = len(requests)
    INF = float('inf')
    best = [[INF] * m for _ in range(1 << m)]
    for i, (a, f) in enumerate(requests):
        best[1 << i][i] = max(abs(f - start), a)
    for mask in range(1, 1 << m):
        for last in range(m):
            t = best[mask][last]
            if t == INF:
                continue
            for nxt in range(m):
                if mask & (1 << nxt):
                    continue
                a, f = requests[nxt]
                arrive = max(t + abs(f - requests[last][1]), a)
                new = mask | (1 << nxt)
                if arrive < best[new][nxt]:
                    best[new][nxt] = arrive
    return min(best[(1 << m) - 1])
`

const PY = python.split('\n')

function P(fragment) {
  const index = PY.findIndex(line => line.includes(fragment))
  if (index < 0) throw new Error(`Missing Python line: ${fragment}`)
  return index + 1
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with start and requests.')
  const { start, requests } = input
  if (!Number.isInteger(start) || start < 0 || start > 20) throw new Error('start is a floor from 0 to 20.')
  if (!Array.isArray(requests) || requests.length < 1 || requests.length > 6) throw new Error('requests has 1 to 6 [arrival, floor] pairs.')
  for (const r of requests) {
    if (!Array.isArray(r) || r.length !== 2 || !r.every(v => Number.isInteger(v) && v >= 0 && v <= 20)) {
      throw new Error('Each request is [arrival, floor] with values from 0 to 20.')
    }
  }
  return { start, requests }
}

export function buildTrace({ start, requests }) {
  const m = requests.length
  const INF = Infinity
  const best = Array.from({ length: 1 << m }, () => Array(m).fill(INF))
  const frames = []
  const snap = () => best.map(row => row.map(v => (v === INF ? null : v)))
  const show = (mask, last, nxt, arrive, improved, phase, line, py, message) => frames.push({
    pythonLine: P(py), phase, activeLine: L(line), mask, last, nxt, arrive, improved, table: snap(), message,
  })
  frames.push({ pythonLine: P('def earliest_finish'), phase: 'seed', activeLine: L('earliest time at which'), mask: 0, last: -1, nxt: -1, arrive: null, improved: false, table: snap(), message: `Start at floor ${start} at time 0 with ${m} request${m === 1 ? '' : 's'}.` })
  requests.forEach(([a, f], i) => {
    best[1 << i][i] = Math.max(Math.abs(f - start), a)
    show(1 << i, i, i, best[1 << i][i], true, 'seed', 'for each request i', 'best[1 << i][i]', `Serve request ${i} (floor ${f}, from time ${a}) first; the earliest finish is ${best[1 << i][i]}.`)
  })
  for (let mask = 1; mask < (1 << m); mask++) {
    for (let last = 0; last < m; last++) {
      const t = best[mask][last]
      if (t === INF) continue
      for (let nxt = 0; nxt < m; nxt++) {
        if (mask & (1 << nxt)) continue
        const [a, f] = requests[nxt]
        const arrive = Math.max(t + Math.abs(f - requests[last][1]), a)
        const nm = mask | (1 << nxt)
        const improved = arrive < best[nm][nxt]
        show(mask, last, nxt, arrive, improved, 'extend', 'arrive = max', 'arrive = max', `From request ${last} at time ${t}, reach request ${nxt} at time ${arrive}${improved ? ', an improvement' : ', no gain'}.`)
        if (improved) best[nm][nxt] = arrive
      }
    }
  }
  const answer = Math.min(...best[(1 << m) - 1])
  frames.push({ pythonLine: P('return min'), phase: 'done', activeLine: L('return the smallest best'), mask: (1 << m) - 1, last: -1, nxt: -1, arrive: answer, improved: false, table: snap(), message: `Every request is completed by time ${answer}.` })
  return { input: { start, requests }, result: answer, frames }
}
