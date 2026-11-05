// LeetCode 2188: Minimum Time to Finish the Race.
// Step 1: for each number of consecutive laps j, cost[j] is the fastest time to run j laps on one tire, starting fresh.
// Step 2: f[i] is the best time for the first i laps. A stint of j laps ends at i, costs cost[j], and every stint
// after the first pays changeTime. f[0] is -changeTime so the first stint has no change charge.

const MAX_TIRES = 3
const MAX_LAPS = 6
const MAX_CHANGE = 10
const MAX_STINT = 17

export function parseInput(text) {
  let spec
  try { spec = JSON.parse(text) } catch { throw new Error('Use JSON like {"tires":[[2,3],[3,4]],"changeTime":5,"numLaps":4}.') }
  if (!spec || !Array.isArray(spec.tires) || !Number.isInteger(spec.changeTime) || !Number.isInteger(spec.numLaps)) throw new Error('Give tires, changeTime and numLaps.')
  if (spec.tires.length < 1 || spec.tires.length > MAX_TIRES) throw new Error(`Use 1 to ${MAX_TIRES} tire types.`)
  if (!spec.tires.every(t => Array.isArray(t) && t.length === 2 && Number.isInteger(t[0]) && Number.isInteger(t[1]) && t[0] >= 1 && t[0] <= 5 && t[1] >= 2 && t[1] <= 3)) throw new Error('Each tire is [f, r] with f from 1 to 5 and r from 2 to 3.')
  if (spec.changeTime < 1 || spec.changeTime > MAX_CHANGE) throw new Error(`changeTime is from 1 to ${MAX_CHANGE}.`)
  if (spec.numLaps < 1 || spec.numLaps > MAX_LAPS) throw new Error(`numLaps is from 1 to ${MAX_LAPS}.`)
  return { tires: spec.tires, changeTime: spec.changeTime, numLaps: spec.numLaps }
}

export const code = `FUNCTION minimumFinishTime(tires, changeTime, numLaps)
    cost ← array of length 18 filled with infinity
    FOR each tire [f, r]
        j ← 1, s ← 0, t ← f
        WHILE t <= changeTime + f
            s ← s + t
            cost[j] ← min(cost[j], s)
            t ← t * r
            j ← j + 1
    f ← array of numLaps + 1 filled with infinity
    f[0] ← -changeTime
    FOR i from 1 to numLaps
        FOR j from 1 to min(17, i)
            f[i] ← min(f[i], f[i - j] + cost[j])
        f[i] ← f[i] + changeTime
    RETURN f[numLaps]`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def minimum_finish_time(tires, change_time, num_laps):
    cost = [float("inf")] * 18
    for f, r in tires:
        j, s, t = 1, 0, f
        while t <= change_time + f:
            s += t
            cost[j] = min(cost[j], s)
            t *= r
            j += 1
    f = [float("inf")] * (num_laps + 1)
    f[0] = -change_time
    for i in range(1, num_laps + 1):
        for j in range(1, min(17, i) + 1):
            f[i] = min(f[i], f[i - j] + cost[j])
        f[i] += change_time
    return f[num_laps]
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
  { id: 'costs', label: 'Stint costs', description: 'For each stint length, find the fastest single-tire run.' },
  { id: 'dp', label: 'Lap table', description: 'f[i] is the best time to finish the first i laps.' },
  { id: 'done', label: 'Result', description: 'The best time for all laps.' },
]

export function buildTrace({ tires, changeTime, numLaps }) {
  const cost = Array(MAX_STINT + 1).fill(Infinity)
  const frames = []
  const push = (phase, i, activeLine, pythonLine, message, extra = {}) => frames.push({
    phase, index: i, activeLine, pythonLine, message, tires, changeTime, numLaps, cost: cost.slice(), f: extra.f ?? null, ...extra,
  })
  for (const [f, r] of tires) {
    let j = 1
    let s = 0
    let t = f
    while (t <= changeTime + f && j <= MAX_STINT) {
      s += t
      cost[j] = Math.min(cost[j], s)
      t *= r
      j += 1
    }
  }
  push('costs', -1, L('cost ← array of length'), P('cost = [float'), `Best single-tire times for stints of 1 to ${Math.min(numLaps, 8)} laps are filled in.`)
  const f = Array(numLaps + 1).fill(Infinity)
  f[0] = -changeTime
  for (let i = 1; i <= numLaps; i++) {
    let best = Infinity
    let from = -1
    for (let j = 1; j <= Math.min(MAX_STINT, i); j++) {
      const candidate = f[i - j] + cost[j]
      if (candidate < best) { best = candidate; from = j }
    }
    f[i] = best + changeTime
    push('dp', i, L('f[i] ← min(f[i]'), P('f[i] = min'),
      `${i} laps: the last stint is ${from} lap(s) costing ${cost[from]}, with the change charge ${changeTime}. f[${i}] = ${f[i]}.`,
      { f: f.slice(), from })
  }
  push('done', numLaps, L('RETURN f[numLaps]'), P('return f[num_laps]'), `The best time for ${numLaps} laps is ${f[numLaps]}.`, { f: f.slice() })
  return { input: { tires, changeTime, numLaps }, result: f[numLaps], frames }
}
