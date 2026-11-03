// Knowledge-derived SQL walkthrough. The sample buses, passengers and boarding rule are invented for this visualization.
export const sql = `WITH Boarding AS (
  SELECT p.passenger_id,
         (SELECT MIN(b.arrival_time) FROM Buses b WHERE b.arrival_time >= p.arrival_time) AS bus_time
  FROM Passengers p
)
SELECT b.bus_id, COUNT(bd.passenger_id) AS passengers_cnt
FROM Buses b
LEFT JOIN Boarding bd ON bd.bus_time = b.arrival_time
GROUP BY b.bus_id
ORDER BY b.bus_id`

export const code = sql.split('\n').map((text, index) => ({ line: index + 1, text }))
const SQL = key => {
  const index = code.findIndex(line => line.text.includes(key))
  if (index < 0) throw new Error(`Missing SQL line: ${key}`)
  return index + 1
}

export const python = `def passengers_per_bus(buses, passengers):
    board = passengers.apply(lambda p: buses.loc[buses["arrival_time"] >= p.arrival_time, "arrival_time"].min(), axis=1)
    counts = board.value_counts()
    out = buses[["bus_id", "arrival_time"]].copy()
    out["passengers_cnt"] = out["arrival_time"].map(counts).fillna(0).astype(int)
    return out[["bus_id", "passengers_cnt"]].sort_values("bus_id")`
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
  { id: 'load', label: 'Load', description: 'Read the bus and passenger times.' },
  { id: 'board', label: 'Board', description: 'Each passenger takes the first bus at or after their arrival.' },
  { id: 'count', label: 'Count', description: 'Count the passengers who took each bus.' },
  { id: 'done', label: 'Result', description: 'Output one row per bus, ordered by bus_id.' },
]

function tableRows(input, name, columns) {
  const rows = input[name]
  if (!Array.isArray(rows) || rows.length < 1 || rows.length > 12) throw new Error(`${name} needs 1 to 12 rows.`)
  return rows.map(row => {
    if (!row || typeof row !== 'object' || columns.some(column => !(column in row))) throw new Error(`${name} rows need ${columns.join(', ')}.`)
    for (const column of columns) if (!Number.isInteger(row[column])) throw new Error(`${name}.${column} must be a whole number.`)
    return Object.fromEntries(columns.map(column => [column, row[column]]))
  })
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with Buses and Passengers tables.')
  const Buses = tableRows(input, 'Buses', ['bus_id', 'arrival_time'])
  const Passengers = tableRows(input, 'Passengers', ['passenger_id', 'arrival_time'])
  const times = new Set(Buses.map(bus => bus.arrival_time))
  if (times.size !== Buses.length) throw new Error('Bus arrival times must be distinct in this variant.')
  return { Buses, Passengers }
}

export function buildTrace(input) {
  const { Buses, Passengers } = input
  const frames = [frame('load', 'WITH Boarding', 'def passengers_per_bus', 'Read the buses and the passengers.', ['bus_id', 'arrival_time'], Buses)]
  const boarded = []
  for (const passenger of Passengers) {
    const times = Buses.map(bus => bus.arrival_time).filter(time => time >= passenger.arrival_time)
    const busTime = times.length ? Math.min(...times) : null
    boarded.push({ passenger_id: passenger.passenger_id, arrival_time: passenger.arrival_time, bus_time: busTime })
    const message = busTime === null
      ? `Passenger ${passenger.passenger_id} arrives at ${passenger.arrival_time} after every bus, so no bus is counted.`
      : `Passenger ${passenger.passenger_id} arrives at ${passenger.arrival_time} and boards the bus at ${busTime}.`
    frames.push(frame('board', 'MIN(b.arrival_time)', 'board = passengers', message, ['passenger_id', 'arrival_time', 'bus_time'], boarded))
  }
  const counted = [...Buses].sort((a, b) => a.bus_id - b.bus_id).map(bus => ({
    bus_id: bus.bus_id,
    arrival_time: bus.arrival_time,
    passengers_cnt: boarded.filter(row => row.bus_time === bus.arrival_time).length,
  }))
  frames.push(frame('count', 'GROUP BY b.bus_id', 'counts = board', 'Count the passengers attached to each bus time. A bus with none still appears.', ['bus_id', 'arrival_time', 'passengers_cnt'], counted))
  const result = counted.map(row => ({ bus_id: row.bus_id, passengers_cnt: row.passengers_cnt }))
  frames.push(frame('done', 'ORDER BY b.bus_id', 'return out', `Return ${result.length} bus rows, ordered by bus_id.`, ['bus_id', 'passengers_cnt'], result))
  return { input, result, frames }
}
