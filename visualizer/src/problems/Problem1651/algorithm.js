export const sql = `-- Windows start at months 1 to 10 of 2020 and cover the next three months.
WITH Rides2020 AS (
  SELECT MONTH(r.requested_at) AS month, a.ride_distance, a.ride_duration
  FROM AcceptedRides a
  JOIN Rides r ON r.ride_id = a.ride_id
  WHERE YEAR(r.requested_at) = 2020
)
SELECT w.start_month AS month,
  ROUND(SUM(IFNULL(x.ride_distance, 0)) / 3, 2) AS average_ride_distance,
  ROUND(SUM(IFNULL(x.ride_duration, 0)) / 3, 2) AS average_ride_duration
FROM Windows w
LEFT JOIN Rides2020 x ON x.month BETWEEN w.start_month AND w.start_month + 2
GROUP BY w.start_month
ORDER BY w.start_month`

export const code = sql.split('\n').map((text, index) => ({ line: index + 1, text }))
const SQL = key => {
  const index = code.findIndex(line => line.text.includes(key))
  if (index < 0) throw new Error(`Missing SQL line: ${key}`)
  return index + 1
}

export const python = `def window_averages(rides, accepted):
    ride_month = {r["ride_id"]: int(r["requested_at"][5:7]) for r in rides if r["requested_at"][:4] == "2020"}
    totals = {m: [0, 0] for m in range(1, 13)}
    for a in accepted:
        if a["ride_id"] in ride_month:
            totals[ride_month[a["ride_id"]]][0] += a["ride_distance"]
            totals[ride_month[a["ride_id"]]][1] += a["ride_duration"]
    out = []
    for start in range(1, 11):
        dist = sum(totals[m][0] for m in range(start, start + 3))
        dur = sum(totals[m][1] for m in range(start, start + 3))
        out.append({"month": start, "average_ride_distance": round(dist / 3, 2), "average_ride_duration": round(dur / 3, 2)})
    return out`
const PY_LINES = python.split('\n')
const PY = key => {
  const index = PY_LINES.findIndex(line => line.includes(key))
  if (index < 0) throw new Error(`Missing Python line: ${key}`)
  return index + 1
}

const frame = (phase, sqlKey, pyKey, message, columns, rows, extra = {}) => ({
  phase, activeLine: SQL(sqlKey), pythonLine: PY(pyKey), message, columns, rows: rows.map(row => ({ ...row })), ...extra,
})

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export const phases = [
  { id: 'load', label: 'Load', description: 'Attach each accepted 2020 ride to its request month.' },
  { id: 'totals', label: 'Month totals', description: 'Add distance and duration for each month.' },
  { id: 'window', label: 'Window', description: 'Sum three consecutive months and divide by 3.' },
  { id: 'done', label: 'Result', description: 'Output one row per window.' },
]

export const inputLabel = 'Object with Drivers, Rides and AcceptedRides tables (dates as YYYY-MM-DD)'
export const complexity = 'O(R + A) to total the rides, then O(1) per window with 12 monthly totals. The visualizer caps each table at 12 rows.'

const sample = {
  Drivers: [
    { driver_id: 3, join_date: '2019-11-04' },
    { driver_id: 12, join_date: '2020-02-20' },
    { driver_id: 7, join_date: '2020-05-01' },
    { driver_id: 20, join_date: '2020-05-30' },
    { driver_id: 9, join_date: '2021-01-08' },
  ],
  Rides: [
    { ride_id: 101, user_id: 4, requested_at: '2020-01-15' },
    { ride_id: 102, user_id: 8, requested_at: '2020-02-03' },
    { ride_id: 103, user_id: 5, requested_at: '2020-03-02' },
    { ride_id: 104, user_id: 6, requested_at: '2020-05-10' },
    { ride_id: 105, user_id: 2, requested_at: '2020-05-12' },
    { ride_id: 106, user_id: 1, requested_at: '2020-09-30' },
    { ride_id: 107, user_id: 3, requested_at: '2021-01-02' },
  ],
  AcceptedRides: [
    { ride_id: 101, driver_id: 3, ride_distance: 40, ride_duration: 20 },
    { ride_id: 102, driver_id: 3, ride_distance: 12, ride_duration: 9 },
    { ride_id: 103, driver_id: 12, ride_distance: 55, ride_duration: 30 },
    { ride_id: 104, driver_id: 7, ride_distance: 8, ride_duration: 5 },
    { ride_id: 105, driver_id: 7, ride_distance: 70, ride_duration: 44 },
    { ride_id: 106, driver_id: 20, ride_distance: 33, ride_duration: 18 },
  ],
}

export const examples = [{ label: 'Sample', input: JSON.stringify(sample) }]

const DATE = /^\d{4}-\d{2}-\d{2}$/

function tableRows(input, name, columns) {
  const rows = input[name]
  if (!Array.isArray(rows) || rows.length < 1 || rows.length > 12) throw new Error(`${name} needs 1 to 12 rows.`)
  return rows.map(row => {
    if (!row || typeof row !== 'object' || columns.some(column => !(column in row))) throw new Error(`${name} rows need ${columns.join(', ')}.`)
    return Object.fromEntries(columns.map(column => [column, row[column]]))
  })
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with Drivers, Rides and AcceptedRides tables.')
  const Drivers = tableRows(input, 'Drivers', ['driver_id', 'join_date'])
  const Rides = tableRows(input, 'Rides', ['ride_id', 'user_id', 'requested_at'])
  const AcceptedRides = tableRows(input, 'AcceptedRides', ['ride_id', 'driver_id', 'ride_distance', 'ride_duration'])
  for (const ride of Rides) if (!DATE.test(ride.requested_at)) throw new Error('requested_at must look like 2020-03-04.')
  const rideIds = new Set(Rides.map(ride => ride.ride_id))
  for (const accepted of AcceptedRides) if (!rideIds.has(accepted.ride_id)) throw new Error(`Accepted ride ${accepted.ride_id} is not in Rides.`)
  return { Drivers, Rides, AcceptedRides }
}

const avg = total => Math.round((total / 3) * 100) / 100

export function buildTrace(input) {
  const { Rides, AcceptedRides } = input
  const rideMonth = new Map()
  for (const ride of Rides) if (ride.requested_at.startsWith('2020-')) rideMonth.set(ride.ride_id, Number(ride.requested_at.slice(5, 7)))

  const counted = AcceptedRides.filter(accepted => rideMonth.has(accepted.ride_id))
    .map(accepted => ({ ride_id: accepted.ride_id, month: rideMonth.get(accepted.ride_id), ride_distance: accepted.ride_distance, ride_duration: accepted.ride_duration }))
  const frames = [frame('load', 'WITH Rides2020', 'def ', 'Attach each accepted 2020 ride to the month it was requested.', ['ride_id', 'month', 'ride_distance', 'ride_duration'], counted)]

  const totals = Array.from({ length: 12 }, (_, index) => ({ month: index + 1, ride_distance: 0, ride_duration: 0 }))
  for (const row of counted) {
    totals[row.month - 1].ride_distance += row.ride_distance
    totals[row.month - 1].ride_duration += row.ride_duration
  }
  frames.push(frame('totals', 'WITH Rides2020', 'totals =', 'Add up distance and duration for each request month. Months without rides stay at 0.', ['month', 'ride_distance', 'ride_duration'], totals))

  const summary = []
  for (let start = 1; start <= 10; start++) {
    const window = totals.filter(row => row.month >= start && row.month <= start + 2)
    const dist = window.reduce((sum, row) => sum + row.ride_distance, 0)
    const dur = window.reduce((sum, row) => sum + row.ride_duration, 0)
    summary.push({ month: start, average_ride_distance: avg(dist), average_ride_duration: avg(dur) })
    frames.push(frame('window', 'BETWEEN', 'dist =', `Window ${MONTHS[start - 1]} to ${MONTHS[start + 1]}: distance ${dist} and duration ${dur}, divided by 3.`, ['month', 'average_ride_distance', 'average_ride_duration'], summary, { windowStart: start }))
  }
  const result = summary.map(row => ({ ...row }))
  frames.push(frame('done', 'ORDER BY', 'return', 'Return one row for each of the ten windows.', ['month', 'average_ride_distance', 'average_ride_duration'], result))
  return { input, result, frames }
}
