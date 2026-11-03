export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object such as {"weights": [4, 2, 3], "days": 2}.')
  const { weights, days } = input
  if (!Array.isArray(weights) || weights.length < 1 || weights.length > 12 || !weights.every(v => Number.isInteger(v) && v >= 1 && v <= 100)) throw new Error('weights is a list of 1 to 12 integers from 1 to 100.')
  if (!Number.isInteger(days) || days < 1 || days > weights.length) throw new Error('days must be an integer from 1 to the number of packages.')
  return { weights, days }
}

// Greedy packing: fill each day until the next package would exceed the capacity.
function packDays(weights, capacity) {
  const loads = [0]
  for (const w of weights) {
    if (loads[loads.length - 1] + w > capacity) loads.push(0)
    loads[loads.length - 1] += w
  }
  return loads
}

export function buildTrace({ weights, days }) {
  let lo = Math.max(...weights)
  let hi = weights.reduce((a, b) => a + b, 0)
  const frames = [{ phase: 'start', activeLine: L('lo, hi ='), pythonLine: P('lo, hi ='), message: `Capacity must be at least ${lo} (the heaviest package) and at most ${hi} (everything in one day).`, state: { lo, hi, mid: null, loads: [], needed: null, feasible: null } }]

  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2)
    const loads = packDays(weights, mid)
    const needed = loads.length
    frames.push({ phase: 'probe', activeLine: L('loads = pack'), pythonLine: P('needed, load = 1, 0'), message: `Test capacity ${mid}: greedy packing needs ${needed} day(s) against a limit of ${days}.`, state: { lo, hi, mid, loads, needed, feasible: null } })
    if (needed <= days) {
      hi = mid
      frames.push({ phase: 'narrow', activeLine: L('hi = mid'), pythonLine: P('hi = mid'), message: `${mid} is feasible, so the answer is ${mid} or smaller. Keep the lower half.`, state: { lo, hi, mid, loads, needed, feasible: true } })
    } else {
      lo = mid + 1
      frames.push({ phase: 'narrow', activeLine: L('lo = mid + 1'), pythonLine: P('lo = mid + 1'), message: `${mid} is too small. Raise the lower bound to ${lo}.`, state: { lo, hi, mid, loads, needed, feasible: false } })
    }
  }

  frames.push({ phase: 'done', activeLine: L('return lo'), pythonLine: P('return lo'), message: `The bounds meet at ${lo}, the least feasible capacity.`, state: { lo, hi, mid: null, loads: packDays(weights, lo), needed: null, feasible: null } })
  return { input: { weights, days }, result: lo, frames }
}

export const code = `ship within days (weights, days):
  lo = heaviest package, hi = total weight
  while lo < hi:
    mid = (lo + hi) // 2
    fill days greedily with capacity mid and count the days needed
    if days needed <= days:
      hi = mid
    else:
      lo = mid + 1
  return lo`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1

export const python = `def ship_within_days(weights, days):
    lo, hi = max(weights), sum(weights)
    while lo < hi:
        mid = (lo + hi) // 2
        needed, load = 1, 0
        for w in weights:
            if load + w > mid:
                needed += 1
                load = 0
            load += w
        if needed <= days:
            hi = mid
        else:
            lo = mid + 1
    return lo
`
