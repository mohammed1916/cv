export const phases = [
  { id: 'start', label: 'Start', description: 'Start with zero change at every stop.' },
  { id: 'record', label: 'Record trip', description: 'Add the passengers at pickup and subtract them at drop-off.' },
  { id: 'sweep', label: 'Sweep stops', description: 'Accumulate net changes stop by stop and compare the load with capacity.' },
  { id: 'done', label: 'Complete', description: 'Return whether the load stays within capacity everywhere.' },
]

export const code = `function fitsCapacity(capacity, trips) {
  const delta = Array(21).fill(0)
  for (const [passengers, start, end] of trips) {
    delta[start] += passengers
    delta[end] -= passengers
  }
  let load = 0
  for (let stop = 0; stop < 21; stop++) {
    load += delta[stop]
    if (load > capacity) return false
  }
  return true
}`.split('\n').map((text, index) => ({ line: index + 1, text }))

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

  push('start', 'const delta = Array(21)', `Capacity ${capacity}. Every stop starts with no net change.`, {}, 'delta = [0] * 21')
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
      push('done', 'if (load > capacity)', 'The trips cannot all be carried at once.', { stop }, 'if load > capacity')
      return { input: { capacity, trips }, result, frames }
    }
  }
  push('done', 'return true', 'Every stop stays within capacity, so all trips fit.', {}, 'return True')
  return { input: { capacity, trips }, result, frames }
}

export const inputLabel = 'JSON object with capacity and trips, each trip [passengers, start, end]'
export const complexity = 'O(t + S) time for t trips and S stops, here at most 21 stops. Extra space is O(S).'
export const examples = [
  { label: 'Fits with room', input: '{"capacity":4,"trips":[[2,0,3],[2,3,6],[1,1,5]]}' },
  { label: 'Over capacity', input: '{"capacity":2,"trips":[[2,0,3],[2,3,6],[1,1,5]]}' },
  { label: 'Exact fill', input: '{"capacity":2,"trips":[[2,0,4]]}' },
  { label: 'Single passenger trip', input: '{"capacity":1,"trips":[[1,0,1]]}' },
  { label: 'Trips touch at a stop', input: '{"capacity":3,"trips":[[3,0,2],[3,2,4]]}' },
  { label: 'Full capacity over the whole route', input: '{"capacity":10,"trips":[[10,0,20]]}' },
  { label: 'Long run: 8 trips, capacity 10', input: '{"capacity":10,"trips":[[5,0,20],[3,13,18],[5,6,15],[6,14,20],[4,12,14],[10,18,19],[8,7,16],[3,6,13]]}' },
]
