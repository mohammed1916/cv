const SQL = `WITH counts AS (
  SELECT flight_id, COUNT(passenger_id) AS pax
  FROM Passengers
  GROUP BY flight_id
)
SELECT f.flight_id,
  LEAST(COALESCE(c.pax, 0), f.capacity) AS booked_cnt,
  GREATEST(COALESCE(c.pax, 0) - f.capacity, 0) AS waitlist_cnt
FROM Flights f
LEFT JOIN counts c ON c.flight_id = f.flight_id
ORDER BY f.flight_id;`

const PY = `import pandas as pd

def flight_occupancy(flights, passengers):
    pax = passengers.groupby("flight_id").size().rename("pax").reset_index()
    merged = flights.merge(pax, on="flight_id", how="left").fillna({"pax": 0})
    merged["booked_cnt"] = merged[["pax", "capacity"]].min(axis=1)
    merged["waitlist_cnt"] = (merged["pax"] - merged["capacity"]).clip(lower=0)
    return merged[["flight_id", "booked_cnt", "waitlist_cnt"]].sort_values("flight_id")
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
  { id: 'load', label: 'Flights', description: 'Each flight has a seat capacity.' },
  { id: 'count', label: 'Count', description: 'Count the passengers booked on each flight.' },
  { id: 'split', label: 'Split', description: 'Seats fill first; the excess goes to the waitlist.' },
  { id: 'done', label: 'Result', description: 'One row per flight, including flights with no passengers.' },
]
export const sample = {
  flights: [
    { flight_id: 1, capacity: 2 },
    { flight_id: 2, capacity: 5 },
    { flight_id: 3, capacity: 1 },
  ],
  passengers: [
    { passenger_id: 101, flight_id: 1 },
    { passenger_id: 102, flight_id: 1 },
    { passenger_id: 103, flight_id: 1 },
    { passenger_id: 104, flight_id: 3 },
  ],
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!Array.isArray(input.flights) || !Array.isArray(input.passengers)) throw new Error('Provide flights and passengers arrays.')
  const ids = new Set(input.flights.map(f => f.flight_id))
  if (ids.size !== input.flights.length) throw new Error('flight_id must be unique.')
  for (const f of input.flights) {
    if (!Number.isInteger(f.capacity) || f.capacity < 0) throw new Error(`Flight ${f.flight_id} needs a whole-number capacity.`)
  }
  for (const p of input.passengers) {
    if (!ids.has(p.flight_id)) throw new Error(`Passenger ${p.passenger_id} names an unknown flight.`)
  }
  return input
}

export function buildTrace(input) {
  const { flights, passengers } = input
  const frames = []
  frames.push(frame('load', 'FROM Flights f', 'flights.merge', 'Start with every flight and its capacity.', flights.map(f => ({ flight_id: f.flight_id, capacity: f.capacity }))))
  const counts = new Map(flights.map(f => [f.flight_id, 0]))
  for (const p of passengers) counts.set(p.flight_id, counts.get(p.flight_id) + 1)
  const counted = flights.map(f => ({ flight_id: f.flight_id, capacity: f.capacity, pax: counts.get(f.flight_id) }))
  frames.push(frame('count', 'COUNT(passenger_id)', 'groupby("flight_id").size()', 'Count passengers per flight; missing flights count as zero.', counted))
  const result = counted.map(c => ({
    flight_id: c.flight_id,
    booked_cnt: Math.min(c.pax, c.capacity),
    waitlist_cnt: Math.max(c.pax - c.capacity, 0),
  }))
  frames.push(frame('split', 'LEAST(COALESCE', 'booked_cnt', 'Seats fill up to capacity; the rest wait.', result))
  result.sort((a, b) => a.flight_id - b.flight_id)
  frames.push(frame('done', 'ORDER BY f.flight_id', 'return merged', 'Every flight listed in flight order.', result))
  return { input, result, frames }
}
