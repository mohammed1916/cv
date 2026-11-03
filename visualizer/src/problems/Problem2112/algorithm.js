// Knowledge-derived SQL walkthrough. The sample tables are invented for this visualization.
export const sql = `WITH traffic AS (
  SELECT departure_airport AS airport_id, flights_count AS flights FROM Flights
  UNION ALL
  SELECT arrival_airport, flights_count FROM Flights
),
totals AS (
  SELECT airport_id, SUM(flights) AS total_traffic
  FROM traffic
  GROUP BY airport_id
)
SELECT airport_id
FROM totals
WHERE total_traffic = (SELECT MAX(total_traffic) FROM totals)
ORDER BY airport_id`

export const code = sql.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def busiest_airports(flights):
    out = flights[["departure_airport", "flights_count"]].rename(columns={"departure_airport": "airport_id"})
    back = flights[["arrival_airport", "flights_count"]].rename(columns={"arrival_airport": "airport_id"})
    totals = pd.concat([out, back]).groupby("airport_id").flights_count.sum()
    top = totals[totals == totals.max()].index
    return pd.DataFrame({"airport_id": sorted(top)})`

export const sampleText = '{"Flights":[{"departure_airport":1,"arrival_airport":2,"flights_count":10},{"departure_airport":2,"arrival_airport":3,"flights_count":5},{"departure_airport":3,"arrival_airport":1,"flights_count":7},{"departure_airport":2,"arrival_airport":1,"flights_count":4}]}'

const SQL = key => {
  const index = code.findIndex(line => line.text.includes(key))
  if (index < 0) throw new Error(`Missing SQL line: ${key}`)
  return index + 1
}
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
  { id: 'load', label: 'Load', description: 'Read the flight rows.' },
  { id: 'departures', label: 'Departures', description: 'Credit each flight to its departure airport.' },
  { id: 'arrivals', label: 'Arrivals', description: 'Credit each flight to its arrival airport too.' },
  { id: 'totals', label: 'Totals', description: 'Sum the traffic for each airport.' },
  { id: 'pick', label: 'Pick', description: 'Keep every airport that has the greatest total.' },
  { id: 'done', label: 'Result', description: 'Output the tied airports in id order.' },
]

function tableRows(input, name, columns) {
  const rows = input[name]
  if (!Array.isArray(rows) || rows.length < 1 || rows.length > 12) throw new Error(`${name} needs 1 to 12 rows.`)
  for (const row of rows) {
    if (!row || typeof row !== 'object' || columns.some(column => !(column in row))) throw new Error(`${name} rows need ${columns.join(', ')}.`)
  }
  return rows.map(row => Object.fromEntries(columns.map(column => [column, row[column]])))
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with a Flights table.')
  return { Flights: tableRows(input, 'Flights', ['departure_airport', 'arrival_airport', 'flights_count']) }
}

export function buildTrace(input) {
  const { Flights } = input
  const frames = []
  frames.push(frame('load', 'FROM Flights', 'def ', 'Read the flight rows.', ['departure_airport', 'arrival_airport', 'flights_count'], Flights))

  const departures = Flights.map(row => ({ airport_id: row.departure_airport, flights: row.flights_count }))
  frames.push(frame('departures', 'SELECT departure_airport', 'out = ', 'Each flight adds its count to the departure airport.', ['airport_id', 'flights'], departures))

  const arrivals = Flights.map(row => ({ airport_id: row.arrival_airport, flights: row.flights_count }))
  frames.push(frame('arrivals', 'UNION ALL', 'back = ', 'Each flight also adds its count to the arrival airport.', ['airport_id', 'flights'], arrivals))

  const totals = new Map()
  for (const row of [...departures, ...arrivals]) totals.set(row.airport_id, (totals.get(row.airport_id) ?? 0) + row.flights)
  const summary = [...totals.entries()].sort((a, b) => a[0] - b[0]).map(([airport_id, total_traffic]) => ({ airport_id, total_traffic }))
  frames.push(frame('totals', 'GROUP BY airport_id', 'totals = ', 'Sum the departing and arriving counts for each airport.', ['airport_id', 'total_traffic'], summary))

  const best = Math.max(...summary.map(row => row.total_traffic))
  const picked = summary.map(row => ({ ...row, is_max: row.total_traffic === best ? 'yes' : 'no' }))
  frames.push(frame('pick', 'WHERE total_traffic', 'top = ', `The greatest total is ${best}. Every airport that reaches it is kept.`, ['airport_id', 'total_traffic', 'is_max'], picked))

  const result = summary.filter(row => row.total_traffic === best).map(row => ({ airport_id: row.airport_id }))
  frames.push(frame('done', 'ORDER BY airport_id', 'return', `Return ${result.length} airport${result.length === 1 ? '' : 's'} with the greatest traffic.`, ['airport_id'], result))
  return { input, result, frames }
}
