// Knowledge-derived SQL walkthrough. The sample table is invented for this visualization.
export const sql = `SELECT bike_number, MAX(end_time) AS last_time
FROM Bikes
GROUP BY bike_number
ORDER BY last_time DESC, bike_number ASC`

export const code = sql.split('\n').map((text, index) => ({ line: index + 1, text }))
const SQL = key => {
  const index = code.findIndex(line => line.text.includes(key))
  if (index < 0) throw new Error(`Missing SQL line: ${key}`)
  return index + 1
}

export const python = `def bikes_last_time_used(bikes):
    last = {}
    for row in bikes:
        current = last.get(row["bike_number"])
        if current is None or row["end_time"] > current:
            last[row["bike_number"]] = row["end_time"]
    rows = [{"bike_number": b, "last_time": t} for b, t in last.items()]
    return sorted(rows, key=lambda r: (r["last_time"], r["bike_number"]), reverse=True)`
const PY_LINES = python.split('\n')
const PY = key => {
  const index = PY_LINES.findIndex(line => line.includes(key))
  if (index < 0) throw new Error(`Missing Python line: ${key}`)
  return index + 1
}

const COLS = ['ride_id', 'bike_number', 'start_time', 'end_time']
const LAST_COLS = ['bike_number', 'last_time']

const frame = (phase, sqlKey, pyKey, message, columns, rows) => ({
  phase, activeLine: SQL(sqlKey), pythonLine: PY(pyKey), message, columns, rows: rows.map(row => ({ ...row })),
})

export const phases = [
  { id: 'load', label: 'Load', description: 'Read the ride records.' },
  { id: 'group', label: 'Group', description: 'Keep the latest end time seen for each bike.' },
  { id: 'done', label: 'Result', description: 'Sort bikes by latest time, newest first.' },
]

function tableRows(input, name, columns) {
  const rows = input[name]
  if (!Array.isArray(rows) || rows.length < 1 || rows.length > 12) throw new Error(`${name} needs 1 to 12 rows.`)
  for (const row of rows) {
    if (!row || typeof row !== 'object' || columns.some(column => !(column in row))) throw new Error(`${name} rows need ${columns.join(', ')}.`)
  }
  return rows.map(row => Object.fromEntries(columns.map(column => [column, row[column]])))
}

const STAMP = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with a Bikes table.')
  const rows = tableRows(input, 'Bikes', COLS)
  for (const row of rows) {
    if (!STAMP.test(row.start_time) || !STAMP.test(row.end_time)) throw new Error('Times use YYYY-MM-DD HH:MM:SS.')
    if (row.end_time < row.start_time) throw new Error('A ride cannot end before it starts.')
  }
  return { Bikes: rows }
}

export function buildTrace(input) {
  const rows = input.Bikes
  const frames = [frame('load', 'FROM Bikes', 'def ', 'Read the ride records.', COLS, rows)]
  const latest = new Map()
  for (const row of rows) {
    const current = latest.get(row.bike_number)
    if (current === undefined || row.end_time > current) latest.set(row.bike_number, row.end_time)
    const summary = [...latest.entries()].map(([bike_number, last_time]) => ({ bike_number, last_time }))
    frames.push(frame('group', 'MAX(end_time)', 'last[row', `Ride ${row.ride_id} ends at ${row.end_time}; bike ${row.bike_number} now has ${latest.get(row.bike_number)}.`, LAST_COLS, summary))
  }
  const result = [...latest.entries()]
    .map(([bike_number, last_time]) => ({ bike_number, last_time }))
    .sort((a, b) => (a.last_time < b.last_time ? 1 : a.last_time > b.last_time ? -1 : a.bike_number - b.bike_number))
  frames.push(frame('done', 'ORDER BY last_time', 'return sorted', `Return ${result.length} bikes, newest first.`, LAST_COLS, result))
  return { input, result, frames }
}
