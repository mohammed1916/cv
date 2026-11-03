export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with forward, backward and queries.')
  const { forward, backward, queries } = input
  if (!Array.isArray(forward) || !Array.isArray(backward) || forward.length !== backward.length) throw new Error('forward and backward have the same length n.')
  const n = forward.length
  if (n < 2 || n > 8) throw new Error('n is from 2 to 8 houses.')
  if (![...forward, ...backward].every(c => Number.isInteger(c) && c >= 1 && c <= 9)) throw new Error('Each travel cost is an integer from 1 to 9.')
  if (!Array.isArray(queries) || queries.length < 1 || queries.length > 6) throw new Error('queries lists 1 to 6 houses.')
  if (!queries.every(h => Number.isInteger(h) && h >= 0 && h < n)) throw new Error('Each query is a house from 0 to n - 1.')
  return { forward, backward, queries }
}

export function buildTrace({ forward, backward, queries }) {
  const n = forward.length
  const q = queries.length
  const INF = Infinity
  const best = Array.from({ length: n }, () => Array(q + 1).fill(INF))
  const settled = Array.from({ length: n }, () => Array(q + 1).fill(false))
  const reach = (house, done) => {
    let k = done
    while (k < q && queries[k] === house) k++
    return k
  }
  const snapshot = () => best.map(row => row.map(x => (x === INF ? null : x)))
  const frames = []
  const frame = (fields) => frames.push({ best: snapshot(), settled: settled.map(row => [...row]), ...fields })
  const startDone = reach(0, 0)
  best[0][startDone] = 0
  frame({ pythonLine: P('best[0][reach(0, 0)]'), phase: 'start', activeLine: L('start at house 0'), house: 0, done: startDone, time: 0, message: `Start at house 0 with ${startDone} query houses already visited.` })
  let answer = null
  while (true) {
    let house = -1
    let done = -1
    let time = INF
    for (let h = 0; h < n; h++) {
      for (let k = 0; k <= q; k++) {
        if (!settled[h][k] && best[h][k] < time) {
          house = h
          done = k
          time = best[h][k]
        }
      }
    }
    if (house < 0) break
    settled[house][done] = true
    frame({ pythonLine: P('settled[house][done] = True'), phase: 'pop', activeLine: L('take the unsettled state'), house, done, time, message: `Settle house ${house} after ${done} of ${q} queries at time ${time}.` })
    if (done === q) {
      answer = time
      frame({ pythonLine: P('return time'), phase: 'done', activeLine: L('return its time'), house, done, time, message: `All ${q} query houses are visited by time ${time}.` })
      break
    }
    const moves = [[(house + 1) % n, forward[house], 'forward'], [(house - 1 + n) % n, backward[house], 'backward']]
    for (const [next, cost, direction] of moves) {
      const k = reach(next, done)
      const candidate = time + cost
      if (candidate < best[next][k]) {
        best[next][k] = candidate
        frame({ pythonLine: P('best[nxt][k] = time'), phase: 'relax', activeLine: L('if the time through this move'), house: next, done: k, time: candidate, from: house, direction, message: `${direction} to house ${next} costs ${cost}; reached with ${k} queries at time ${candidate}.` })
      }
    }
  }
  return { input: { forward, backward, queries }, result: answer, frames }
}

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

export const code = `minimum time to visit the query houses in order on a cycle
  best[house][done] is the least time to stand at house with done queries visited
  start at house 0 and count the queries already reached there
  repeat while an unsettled state has a finite time
    take the unsettled state with the least time and settle it
    if all queries are visited return its time
    for the forward and the backward neighbor
      the new query count reaches queries that sit on the new house in order
      if the time through this move is smaller record it
  return -1`.split('\n').map((text, index) => ({ line: index + 1, text: text.trimEnd() }))

export const python = `def min_time_to_visit(forward, backward, queries):
    n = len(forward)
    q = len(queries)
    INF = float('inf')
    best = [[INF] * (q + 1) for _ in range(n)]
    settled = [[False] * (q + 1) for _ in range(n)]

    def reach(house, done):
        while done < q and queries[done] == house:
            done += 1
        return done

    best[0][reach(0, 0)] = 0
    while True:
        house, done, time = -1, -1, INF
        for h in range(n):
            for k in range(q + 1):
                if not settled[h][k] and best[h][k] < time:
                    house, done, time = h, k, best[h][k]
        if house < 0:
            return -1
        settled[house][done] = True
        if done == q:
            return time
        for nxt, cost in (((house + 1) % n, forward[house]), ((house - 1) % n, backward[house])):
            k = reach(nxt, done)
            if time + cost < best[nxt][k]:
                best[nxt][k] = time + cost
    return -1
`
