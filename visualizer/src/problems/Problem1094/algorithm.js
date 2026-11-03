export const phases = [
  { id: 'start', label: 'Start', description: 'Start with zero change at every stop.' },
  { id: 'record', label: 'Record trip', description: 'Add the passengers at pickup and subtract them at drop-off.' },
  { id: 'sweep', label: 'Sweep stops', description: 'Accumulate net changes stop by stop and compare the load with capacity.' },
  { id: 'done', label: 'Complete', description: 'Return whether the load stays within capacity everywhere.' },
]

export const code = `fits capacity (capacity, trips):
  delta = zeros for stops 0 to 20
  for each (passengers, start, end) in trips:
    delta[start] += passengers
    delta[end] -= passengers
  load = 0
  for stop from 0 to 20:
    load += delta[stop]
    if load > capacity: return False
  return True`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def fits_capacity(capacity, trips):
    delta = [0] * 21
    for passengers, start, end in trips:
        delta[start] += passengers
        delta[end] -= passengers
    load = 0
    for stop in range(21):
        load += delta[stop]
        if load > capacity: return False
    return True
`

const STOPS = 21
const codeLine = key => code.findIndex(line => line.text.includes(key)) + 1
const pythonLine = key => python.split('\n').findIndex(line => line.includes(key)) + 1

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object such as {"capacity": 4, "trips": [[2, 0, 3]]}.')
  const { capacity, trips } = input
  if (!Number.isInteger(capacity) || capacity < 1 || capacity > 10) throw new Error('capacity must be an integer from 1 to 10.')
  if (!Array.isArray(trips) || trips.length < 1 || trips.length > 8) throw new Error('trips must hold 1 to 8 triples.')
  for (const trip of trips) {
    if (!Array.isArray(trip) || trip.length !== 3) throw new Error('Each trip is [passengers, start, end].')
    const [passengers, start, end] = trip
    if (!Number.isInteger(passengers) || passengers < 1 || passengers > 10) throw new Error('passengers must be from 1 to 10.')
    if (!Number.isInteger(start) || !Number.isInteger(end) || start < 0 || end > 20 || start >= end) throw new Error('Each trip needs 0 <= start < end <= 20.')
  }
  return { capacity, trips }
}

export function buildTrace({ capacity, trips }) {
  const frames = []
  const delta = Array(STOPS).fill(0)
  let load = 0
  let result = true
  const push = (phase, key, message, extra = {}, pyKey = key) => frames.push({
    phase,
    activeLine: codeLine(key),
    pythonLine: pythonLine(pyKey),
    message,
    state: { capacity, delta: [...delta], load, stop: null, trip: null, ...extra },
  })

  push('start', 'delta = zeros', `Capacity ${capacity}. Every stop starts with no net change.`, {}, 'delta = [0]')
  trips.forEach(([passengers, start, end], index) => {
    delta[start] += passengers
    delta[end] -= passengers
    push('record', 'delta[start] += passengers', `Trip ${index + 1}: ${passengers} passenger(s) board at stop ${start} and leave at stop ${end}.`, { trip: index })
  })

  load = 0
  for (let stop = 0; stop < STOPS; stop++) {
    load += delta[stop]
    const over = load > capacity
    push('sweep', 'load += delta[stop]', over
      ? `Stop ${stop}: load ${load} exceeds capacity ${capacity}.`
      : `Stop ${stop}: load ${load} is within capacity ${capacity}.`, { stop })
    if (over) {
      result = false
      push('done', 'if load > capacity', 'The trips cannot all be carried at once.', { stop })
      return { input: { capacity, trips }, result, frames }
    }
  }
  push('done', 'return True', 'Every stop stays within capacity, so all trips fit.')
  return { input: { capacity, trips }, result, frames }
}
