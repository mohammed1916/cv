export const phases = [
  { id: 'start', label: 'Start', description: 'Make one difference slot for every flight.' },
  { id: 'inspect', label: 'Mark', description: 'Each booking adds its seats where it starts and removes them after it ends.' },
  { id: 'update', label: 'Sweep', description: "Carry a running total from flight 1 onward to get each flight's reserved seats." },
  { id: 'done', label: 'Result', description: 'Return the reserved seats for every flight.' },
]

export const inputLabel = 'JSON object with n (1 to 40 flights) and bookings as [first, last, seats] triples'
export const complexity = 'O(bookings + n) time and O(n) space: each booking touches two difference slots, then one sweep finishes every flight.'
export const examples = [
  { label: 'Sample', input: '{"n":5,"bookings":[[2,4,10],[1,2,5],[4,5,7]]}' },
  { label: 'Single flight', input: '{"n":1,"bookings":[[1,1,5]]}' },
  { label: 'Same range adds up', input: '{"n":3,"bookings":[[1,3,4],[1,3,4]]}' },
  { label: 'Adjacent ranges do not overlap', input: '{"n":4,"bookings":[[1,2,7],[3,4,9]]}' },
  { label: 'Largest seats and last flight', input: '{"n":40,"bookings":[[40,40,1000],[1,40,1000]]}' },
  { label: 'Long run: 40 flights, 20 bookings', input: '{"n":40,"bookings":[[10,30,169],[28,30,947],[36,36,612],[3,5,374],[39,40,94],[7,36,359],[8,13,938],[34,40,71],[26,28,366],[16,29,53],[21,23,831],[18,37,766],[13,13,226],[31,40,895],[31,31,716],[30,40,175],[17,40,723],[11,18,313],[23,38,250],[25,34,595]]}' },
]

// Each line of JavaScript is paired with the Python line on the same row.
const LINES = [
  ['function flightTotals(n, bookings) {', 'def flight_totals(n, bookings):'],
  ['  const diff = Array(n + 2).fill(0)', '    diff = [0] * (n + 2)'],
  ['  for (const [first, last, seats] of bookings) {', '    for first, last, seats in bookings:'],
  ['    diff[first] += seats', '        diff[first] += seats'],
  ['    diff[last + 1] -= seats', '        diff[last + 1] -= seats'],
  ['  }', ''],
  ['  let total = 0', '    total = 0'],
  ['  const totals = []', '    totals = []'],
  ['  for (let flight = 1; flight <= n; flight++) {', '    for flight in range(1, n + 1):'],
  ['    total += diff[flight]', '        total += diff[flight]'],
  ['    totals.push(total)', '        totals.append(total)'],
  ['  }', ''],
  ['  return totals', '    return totals'],
  ['}', ''],
]
export const code = LINES.map(([js], index) => ({ line: index + 1, text: js }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1
export const python = LINES.map(([, py]) => py).join('\n')
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1

export const pythonLineMap = Object.fromEntries(code.map(({ line }) => [line, line]))

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with n and bookings.')
  const { n, bookings } = input
  if (!Number.isInteger(n) || n < 1 || n > 40) throw new Error('n must be an integer from 1 to 40.')
  if (!Array.isArray(bookings) || bookings.length < 1 || bookings.length > 20) throw new Error('Give 1 to 20 bookings.')
  bookings.forEach((booking, index) => {
    if (!Array.isArray(booking) || booking.length !== 3) throw new Error(`Booking ${index + 1} needs [first, last, seats].`)
    const [first, last, seats] = booking
    if (!Number.isInteger(first) || !Number.isInteger(last) || first < 1 || last > n || first > last) {
      throw new Error(`Booking ${index + 1}: flights must satisfy 1 ≤ first ≤ last ≤ ${n}.`)
    }
    if (!Number.isInteger(seats) || seats < 1 || seats > 1000) throw new Error(`Booking ${index + 1}: seats must be from 1 to 1000.`)
  })
  return { n, bookings: bookings.map(([first, last, seats]) => [first, last, seats]) }
}

export function buildTrace(input) {
  const { n, bookings } = input
  const diff = Array(n + 2).fill(0)
  const totals = []
  const frames = []
  const snap = (flight, focus) => ({ diff: [...diff], totals: [...totals], flight, focus })

  frames.push({
    phase: 'start', activeLine: L('const diff'), pythonLine: P('diff = [0]'),
    message: `There are ${n} flights. Make ${n + 2} difference slots, one for each flight plus two spare slots at the edges.`,
    snapshot: snap(0, []),
  })

  bookings.forEach(([first, last, seats], index) => {
    diff[first] += seats
    diff[last + 1] -= seats
    frames.push({
      phase: 'inspect', activeLine: L('diff[first] += seats'), pythonLine: P('diff[first] += seats'),
      message: `Booking ${index + 1} covers flights ${first} to ${last} with ${seats} seats. Add the seats at slot ${first} and subtract them at slot ${last + 1}.`,
      snapshot: snap(0, [first, last + 1]),
    })
  })

  let total = 0
  for (let flight = 1; flight <= n; flight++) {
    total += diff[flight]
    totals.push(total)
    frames.push({
      phase: 'update', activeLine: L('total += diff[flight]'), pythonLine: P('total += diff[flight]'),
      message: `Flight ${flight}: the running total picks up slot ${flight}, giving ${total} reserved seats.`,
      snapshot: snap(flight, [flight]),
    })
  }

  frames.push({
    phase: 'done', activeLine: L('return totals'), pythonLine: P('return totals'),
    message: `Return the totals for flights 1 to ${n}: ${totals.join(', ')}.`,
    snapshot: snap(n, []),
  })
  return { input, result: totals, frames }
}
