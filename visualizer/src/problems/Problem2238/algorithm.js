// Knowledge-derived SQL walkthrough. The ride rows are invented for this visualization.
export const sql = `SELECT d.driver_id, COUNT(r.ride_id) AS cnt
FROM (SELECT DISTINCT driver_id FROM Rides) AS d
LEFT JOIN Rides AS r ON r.passenger_id = d.driver_id
GROUP BY d.driver_id
ORDER BY d.driver_id`

export const code = sql.split('\n').map((text, index) => ({ line: index + 1, text }))
const SQL = key => {
  const index = code.findIndex(line => line.text.includes(key))
  if (index < 0) throw new Error(`Missing SQL line: ${key}`)
  return index + 1
}

export const python = `import pandas as pd

def passenger_counts(rides):
    drivers = sorted(set(rides.driver_id))
    counts = rides.passenger_id.value_counts()
    return [{"driver_id": d, "cnt": int(counts.get(d, 0))} for d in drivers]`
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
  { id: 'load', label: 'Load', description: 'Read the ride rows.' },
  { id: 'drivers', label: 'Drivers', description: 'Collect every person who appears as a driver.' },
  { id: 'count', label: 'Count', description: 'Count the rides in which each driver was a passenger.' },
  { id: 'done', label: 'Result', description: 'Return each driver with the count, including zeros.' },
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
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with a Rides table.')
  return { Rides: tableRows(input, 'Rides', ['ride_id', 'driver_id', 'passenger_id']) }
}

export function buildTrace(input) {
  const { Rides } = input
  const frames = []
  frames.push(frame('load', 'FROM (SELECT', 'def ', `Load ${Rides.length} rides.`, ['ride_id', 'driver_id', 'passenger_id'], Rides))

  const drivers = [...new Set(Rides.map(row => row.driver_id))].sort((a, b) => a - b)
  frames.push(frame('drivers', 'SELECT DISTINCT driver_id', 'drivers =', `Found ${drivers.length} distinct drivers.`, ['driver_id'], drivers.map(driver_id => ({ driver_id }))))

  const result = []
  const table = []
  for (const driver of drivers) {
    const cnt = Rides.filter(row => row.passenger_id === driver).length
    result.push({ driver_id: driver, cnt })
    table.push({ driver_id: driver, cnt })
    frames.push(frame('count', 'LEFT JOIN Rides', 'counts =', `Driver ${driver} was a passenger on ${cnt} ride${cnt === 1 ? '' : 's'}.`, ['driver_id', 'cnt'], table))
  }

  frames.push(frame('done', 'ORDER BY', 'return [', `Return ${result.length} driver${result.length === 1 ? '' : 's'}.`, ['driver_id', 'cnt'], result))
  return { input, result, frames }
}
