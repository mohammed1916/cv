// Knowledge-derived SQL walkthrough. The sample tables are invented for this visualization.
export const sql = `-- Months 1 to 12 of 2020 are generated, each with its last day as month_end.
WITH Available AS (
  SELECT m.month, COUNT(d.driver_id) AS available
  FROM Months m
  LEFT JOIN Drivers d ON d.join_date <= m.month_end
  GROUP BY m.month
), Working AS (
  SELECT MONTH(r.requested_at) AS month, COUNT(DISTINCT a.driver_id) AS working
  FROM AcceptedRides a
  JOIN Rides r ON r.ride_id = a.ride_id
  WHERE YEAR(r.requested_at) = 2020
  GROUP BY MONTH(r.requested_at)
)
SELECT av.month,
  ROUND(IFNULL(100 * w.working / NULLIF(av.available, 0), 0), 2) AS working_percentage
FROM Available av
LEFT JOIN Working w ON w.month = av.month
ORDER BY av.month`

export const code = sql.split('\n').map((text, index) => ({ line: index + 1, text }))
const SQL = key => {
  const index = code.findIndex(line => line.text.includes(key))
  if (index < 0) throw new Error(`Missing SQL line: ${key}`)
  return index + 1
}

export const python = `def working_percentages(drivers, rides, accepted):
    ride_month = {r["ride_id"]: int(r["requested_at"][5:7]) for r in rides if r["requested_at"][:4] == "2020"}
    out = []
    for month in range(1, 13):
        month_end = f"2020-{month:02d}-{DAYS[month - 1]:02d}"
        available = sum(1 for d in drivers if d["join_date"] <= month_end)
        working = {a["driver_id"] for a in accepted if ride_month.get(a["ride_id"]) == month}
        pct = round(100 * len(working) / available, 2) if available else 0
        out.append({"month": month, "working_percentage": pct})
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

export const phases = [
  { id: 'load', label: 'Load', description: 'Read the driver and ride records.' },
  { id: 'available', label: 'Available', description: 'Count drivers who joined by each month end.' },
  { id: 'working', label: 'Working', description: 'Count distinct drivers with an accepted 2020 ride that month.' },
  { id: 'percent', label: 'Percent', description: 'Divide, and report 0 when nobody was available.' },
  { id: 'done', label: 'Result', description: 'Output one row per month.' },
]

export const inputLabel = 'Object with Drivers, Rides and AcceptedRides tables (dates as YYYY-MM-DD)'
export const complexity = 'O(D + R + A) per month for D drivers, R rides and A accepted rides. The visualizer caps each table at 12 rows.'

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
const DAYS = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]

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
  for (const driver of Drivers) if (!DATE.test(driver.join_date)) throw new Error('join_date must look like 2020-03-04.')
  for (const ride of Rides) if (!DATE.test(ride.requested_at)) throw new Error('requested_at must look like 2020-03-04.')
  const rideIds = new Set(Rides.map(ride => ride.ride_id))
  for (const accepted of AcceptedRides) if (!rideIds.has(accepted.ride_id)) throw new Error(`Accepted ride ${accepted.ride_id} is not in Rides.`)
  return { Drivers, Rides, AcceptedRides }
}

const monthEnd = month => `2020-${String(month).padStart(2, '0')}-${String(DAYS[month - 1]).padStart(2, '0')}`

export function buildTrace(input) {
  const { Drivers, Rides, AcceptedRides } = input
  const rideMonth = new Map()
  for (const ride of Rides) if (ride.requested_at.startsWith('2020-')) rideMonth.set(ride.ride_id, Number(ride.requested_at.slice(5, 7)))
  const frames = [frame('load', 'Available AS', 'def ', 'Read the driver and ride records.', ['driver_id', 'join_date'], Drivers)]

  const summary = []
  for (let month = 1; month <= 12; month++) {
    const available = Drivers.filter(driver => driver.join_date <= monthEnd(month)).length
    const working = new Set(AcceptedRides.filter(accepted => rideMonth.get(accepted.ride_id) === month).map(accepted => accepted.driver_id)).size
    const pct = available ? Math.round((100 * working / available) * 100) / 100 : 0
    const row = { month, available, working: null, working_percentage: null }
    summary.push(row)
    const columns = ['month', 'available', 'working', 'working_percentage']
    frames.push(frame('available', 'Available AS', 'available =', `${available} driver${available === 1 ? '' : 's'} joined by the end of month ${month}.`, columns, summary))
    row.working = working
    frames.push(frame('working', 'Working AS', 'working =', `${working} distinct driver${working === 1 ? '' : 's'} accepted a ride requested in month ${month}.`, columns, summary))
    row.working_percentage = pct
    frames.push(frame('percent', 'ROUND', 'pct =', available ? `${working} of ${available} is ${pct}%.` : 'Nobody was available, so the percentage is 0.', columns, summary))
  }
  const result = summary.map(row => ({ month: row.month, working_percentage: row.working_percentage }))
  frames.push(frame('done', 'ORDER BY', 'return', 'Return one row per month of 2020.', ['month', 'working_percentage'], result))
  return { input, result, frames }
}
