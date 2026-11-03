const SQL = `WITH ordered AS (
  SELECT p.passenger_id, p.flight_id, p.booking_time,
    ROW_NUMBER() OVER (PARTITION BY p.flight_id ORDER BY p.booking_time) AS arrival
  FROM Passengers p
)
SELECT o.passenger_id,
  CASE WHEN o.arrival <= f.capacity THEN 'Confirmed' ELSE 'Waitlist' END AS status
FROM ordered o
JOIN Flights f ON f.flight_id = o.flight_id
ORDER BY o.passenger_id;`

const PY = `import pandas as pd

def ticket_status(flights, passengers):
    ordered = passengers.sort_values(["flight_id", "booking_time"]).copy()
    ordered["arrival"] = ordered.groupby("flight_id").cumcount() + 1
    merged = ordered.merge(flights, on="flight_id")
    merged["status"] = ["Confirmed" if a <= c else "Waitlist" for a, c in zip(merged["arrival"], merged["capacity"])]
    return merged[["passenger_id", "status"]].sort_values("passenger_id").reset_index(drop=True)
`

const snap = rows => JSON.parse(JSON.stringify(rows))
const SQL_LINES = SQL.split('\n')
const PY_LINES = PY.split('\n')
function lookup(lines, fragment, label) {
  const index = lines.findIndex(text => text.includes(fragment))
  if (index < 0) throw new Error(`${label} has no line containing "${fragment}"`)
  return index + 1
}
const sqlLine = fragment => lookup(SQL_LINES, fragment, 'SQL')
const pyLine = fragment => lookup(PY_LINES, fragment, 'Python')
const frame = (phase, sqlFragment, pyFragment, message, rows) => ({
  phase, activeLine: sqlLine(sqlFragment), pythonLine: pyLine(pyFragment), message, rows: snap(rows),
})

export const sql = SQL
export const python = PY
export const code = SQL_LINES.map((text, index) => ({ line: index + 1, text }))
export const phases = [
  { id: 'load', label: 'Bookings', description: 'Each passenger booked one seat on one flight at a time.' },
  { id: 'order', label: 'Order', description: 'Within each flight, earlier booking times come first.' },
  { id: 'label', label: 'Label', description: 'The first “capacity” bookings are confirmed; the rest wait.' },
  { id: 'done', label: 'Result', description: 'Status per passenger, by passenger id.' },
]
export const sample = {
  flights: [
    { flight_id: 1, capacity: 2 },
    { flight_id: 2, capacity: 1 },
  ],
  passengers: [
    { passenger_id: 1, flight_id: 1, booking_time: 10 },
    { passenger_id: 2, flight_id: 1, booking_time: 5 },
    { passenger_id: 3, flight_id: 1, booking_time: 7 },
    { passenger_id: 4, flight_id: 2, booking_time: 3 },
    { passenger_id: 5, flight_id: 2, booking_time: 9 },
  ],
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!Array.isArray(input.flights) || !Array.isArray(input.passengers)) throw new Error('Provide flights and passengers arrays.')
  const capacity = new Map(input.flights.map(f => [f.flight_id, f.capacity]))
  if (capacity.size !== input.flights.length) throw new Error('flight_id must be unique.')
  for (const p of input.passengers) {
    if (!capacity.has(p.flight_id)) throw new Error(`Passenger ${p.passenger_id} names an unknown flight.`)
    if (!Number.isFinite(p.booking_time)) throw new Error(`Passenger ${p.passenger_id} needs a numeric booking_time.`)
  }
  return input
}

export function buildTrace(input) {
  const { flights, passengers } = input
  const capacity = new Map(flights.map(f => [f.flight_id, f.capacity]))
  const frames = []
  frames.push(frame('load', 'FROM Passengers p', 'ordered = passengers', 'Start with every booking.', passengers.map(p => ({ passenger_id: p.passenger_id, flight_id: p.flight_id, booking_time: p.booking_time }))))
  const sorted = [...passengers].sort((a, b) => a.flight_id - b.flight_id || a.booking_time - b.booking_time)
  const arrivalCount = new Map()
  const ordered = sorted.map(p => {
    const arrival = (arrivalCount.get(p.flight_id) || 0) + 1
    arrivalCount.set(p.flight_id, arrival)
    return { passenger_id: p.passenger_id, flight_id: p.flight_id, booking_time: p.booking_time, arrival }
  })
  frames.push(frame('order', 'ROW_NUMBER() OVER', 'cumcount', 'Number bookings in time order inside each flight.', ordered))
  const labelled = ordered.map(o => ({
    passenger_id: o.passenger_id,
    status: o.arrival <= capacity.get(o.flight_id) ? 'Confirmed' : 'Waitlist',
  }))
  frames.push(frame('label', 'CASE WHEN o.arrival', 'Confirmed" if', 'Label each booking against its flight capacity.', labelled))
  const result = [...labelled].sort((a, b) => a.passenger_id - b.passenger_id)
  frames.push(frame('done', 'ORDER BY o.passenger_id', 'return merged', 'Every passenger listed by id.', result))
  return { input, result, frames }
}
