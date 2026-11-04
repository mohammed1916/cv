// SQL walkthrough. The sample buses, passengers and capacities are invented for this visualization.
export const sql = `WITH RECURSIVE OrderedBuses AS (
  SELECT bus_id, arrival_time, capacity,
         ROW_NUMBER() OVER (ORDER BY arrival_time, bus_id) AS seq
  FROM Buses
),
Arrived AS (
  SELECT o.bus_id, o.seq, o.capacity,
         (SELECT COUNT(*) FROM Passengers p WHERE p.arrival_time <= o.arrival_time) AS arrived_cnt
  FROM OrderedBuses o
),
Boarding (seq, boarded) AS (
  SELECT 0, 0
  UNION ALL
  SELECT a.seq, LEAST(prev.boarded + a.capacity, a.arrived_cnt)
  FROM Boarding prev
  JOIN Arrived a ON a.seq = prev.seq + 1
)
SELECT a.bus_id, cur.boarded - prev.boarded AS passengers_cnt
FROM Arrived a
JOIN Boarding cur ON cur.seq = a.seq
JOIN Boarding prev ON prev.seq = a.seq - 1
ORDER BY a.bus_id`

export const code = sql.split('\n').map((text, index) => ({ line: index + 1, text }))
const SQL = key => {
  const index = code.findIndex(line => line.text.includes(key))
  if (index < 0) throw new Error(`Missing SQL line: ${key}`)
  return index + 1
}

export const python = `def passengers_per_bus(buses, passengers):
    order = buses.sort_values(["arrival_time", "bus_id"]).reset_index(drop=True)
    boarded = 0
    counts = {}
    for row in order.itertuples():
        arrived = int((passengers["arrival_time"] <= row.arrival_time).sum())
        taken = min(boarded + row.capacity, arrived)
        counts[row.bus_id] = taken - boarded
        boarded = taken
    return pd.DataFrame(sorted(counts.items()), columns=["bus_id", "passengers_cnt"])`
const PY_LINES = python.split('\n')
const PY = key => {
  const index = PY_LINES.findIndex(line => line.includes(key))
  if (index < 0) throw new Error(`Missing Python line: ${key}`)
  return index + 1
}

const frame = (phase, sqlKey, pyKey, message, columns, rows) => ({
  phase, activeLine: SQL(sqlKey), pythonLine: PY(pyKey), message, columns, rows: rows.map(row => ({ ...row })),
})

export const phases = [
  { id: 'load', label: 'Load', description: 'Read the buses and passengers.' },
  { id: 'order', label: 'Order', description: 'Sort buses by arrival time, then bus_id for a tie.' },
  { id: 'board', label: 'Board', description: 'Each bus takes the waiting passengers up to its capacity.' },
  { id: 'done', label: 'Result', description: 'Output one row per bus, ordered by bus_id.' },
]

function tableRows(input, name, columns) {
  const rows = input[name]
  if (!Array.isArray(rows) || rows.length < 1 || rows.length > 12) throw new Error(`${name} needs 1 to 12 rows.`)
  return rows.map(row => {
    if (!row || typeof row !== 'object' || columns.some(column => !(column in row))) throw new Error(`${name} rows need ${columns.join(', ')}.`)
    for (const column of columns) if (!Number.isInteger(row[column]) || row[column] < 0) throw new Error(`${name}.${column} must be a whole number of 0 or more.`)
    return Object.fromEntries(columns.map(column => [column, row[column]]))
  })
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with Buses and Passengers tables.')
  return {
    Buses: tableRows(input, 'Buses', ['bus_id', 'arrival_time', 'capacity']),
    Passengers: tableRows(input, 'Passengers', ['passenger_id', 'arrival_time']),
  }
}

export function buildTrace(input) {
  const { Buses, Passengers } = input
  const frames = [frame('load', 'WITH RECURSIVE', 'def passengers_per_bus', 'Read the buses and the passengers.', ['bus_id', 'arrival_time', 'capacity'], Buses)]
  const order = [...Buses].sort((a, b) => a.arrival_time - b.arrival_time || a.bus_id - b.bus_id)
    .map((bus, index) => ({ seq: index + 1, bus_id: bus.bus_id, arrival_time: bus.arrival_time, capacity: bus.capacity }))
  frames.push(frame('order', 'ROW_NUMBER() OVER', 'order = buses', 'Buses are processed in arrival order; equal times fall back to bus_id.', ['seq', 'bus_id', 'arrival_time', 'capacity'], order))

  let boarded = 0
  const processed = []
  for (const bus of order) {
    const arrived = Passengers.filter(passenger => passenger.arrival_time <= bus.arrival_time).length
    const taken = Math.min(boarded + bus.capacity, arrived)
    processed.push({ ...bus, arrived, passengers_cnt: taken - boarded })
    frames.push(frame('board', 'LEAST(', 'taken = min(', `${arrived} passengers have arrived; bus ${bus.bus_id} takes ${taken - boarded} of its ${bus.capacity} seats.`, ['bus_id', 'arrival_time', 'capacity', 'arrived', 'passengers_cnt'], processed))
    boarded = taken
  }
  const result = [...processed].sort((a, b) => a.bus_id - b.bus_id).map(row => ({ bus_id: row.bus_id, passengers_cnt: row.passengers_cnt }))
  frames.push(frame('done', 'ORDER BY a.bus_id', 'return pd.DataFrame', `Return ${result.length} bus rows, ordered by bus_id.`, ['bus_id', 'passengers_cnt'], result))
  return { input, result, frames }
}
