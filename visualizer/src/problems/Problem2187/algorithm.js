// LeetCode 2187: Minimum Time to Complete Trips.
// Feasibility is monotone: if time T gives enough trips, so does any larger T. Binary search the smallest feasible T.
// For a candidate T, bus i completes floor(T / time[i]) trips.

const MAX_BUSES = 6
const MAX_TIME = 9
const MAX_TRIPS = 30

export function parseInput(text) {
  let spec
  try { spec = JSON.parse(text) } catch { throw new Error('Use JSON like {"time":[1,2,3],"totalTrips":5}.') }
  if (!spec || !Array.isArray(spec.time) || !Number.isInteger(spec.totalTrips)) throw new Error('Give a time array and an integer totalTrips.')
  if (spec.time.length < 1 || spec.time.length > MAX_BUSES) throw new Error(`Use 1 to ${MAX_BUSES} buses.`)
  if (!spec.time.every(v => Number.isInteger(v) && v >= 1 && v <= MAX_TIME)) throw new Error(`Each bus takes an integer from 1 to ${MAX_TIME} time units per trip.`)
  if (spec.totalTrips < 1 || spec.totalTrips > MAX_TRIPS) throw new Error(`totalTrips is an integer from 1 to ${MAX_TRIPS}.`)
  return { time: spec.time, totalTrips: spec.totalTrips }
}

export const code = `FUNCTION minimumTime(time, totalTrips)
    lo ← 1
    hi ← min(time) * totalTrips
    WHILE lo < hi
        mid ← floor((lo + hi) / 2)
        trips ← sum of floor(mid / time[i]) over every bus
        IF trips >= totalTrips THEN
            hi ← mid
        ELSE
            lo ← mid + 1
    RETURN lo`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def minimum_time(time, total_trips):
    lo = 1
    hi = min(time) * total_trips
    while lo < hi:
        mid = (lo + hi) // 2
        trips = sum(mid // t for t in time)
        if trips >= total_trips:
            hi = mid
        else:
            lo = mid + 1
    return lo
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
  { id: 'start', label: 'Range', description: 'The answer lies between 1 and the time for the fastest bus alone.' },
  { id: 'probe', label: 'Probe', description: 'Test the middle time: can the buses finish enough trips by then?' },
  { id: 'done', label: 'Answer', description: 'The smallest time that finishes all trips.' },
]

export function buildTrace({ time, totalTrips }) {
  let lo = 1
  let hi = Math.min(...time) * totalTrips
  const top = hi
  const frames = []
  const push = (phase, activeLine, pythonLine, message, extra = {}) => frames.push({
    phase, index: -1, activeLine, pythonLine, message, time, totalTrips, lo, hi, min: 1, max: top, ...extra,
  })
  push('start', L('lo ← 1'), P('lo = 1'), `Search times from ${lo} to ${hi}. ${hi} is always enough: the fastest bus alone finishes ${totalTrips} trips by then.`)
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2)
    const trips = time.reduce((sum, t) => sum + Math.floor(mid / t), 0)
    const ok = trips >= totalTrips
    push('probe', L('mid ← floor'), P('mid = (lo + hi)'),
      `Test time ${mid}: the buses finish ${trips} trips, ${ok ? `enough, so the answer is ${mid} or less` : `short of ${totalTrips}, so the answer is above ${mid}`}.`,
      { probe: mid, verdict: ok, trips })
    if (ok) hi = mid
    else lo = mid + 1
  }
  push('done', L('RETURN lo'), P('return lo'), `The minimum time is ${lo}.`, { lo, hi, probe: null })
  return { input: { time, totalTrips }, result: lo, frames }
}
