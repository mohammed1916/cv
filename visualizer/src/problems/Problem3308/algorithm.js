// Knowledge-derived teaching model written for this visualizer. Not the official statement text.
export const phases = [
  { id: 'load', label: 'Load', description: 'Read the driver and trip tables.' },
  { id: 'join', label: 'Join', description: 'Attach one trip to its driver.' },
  { id: 'group', label: 'Group', description: 'Totals for one driver are complete.' },
  { id: 'sort', label: 'Sort', description: 'Order drivers by total distance, then driver id.' },
  { id: 'rank', label: 'Rank', description: 'Give each driver its position.' },
  { id: 'output', label: 'Result', description: 'Return the ranked rows.' },
]

export const code = `SELECT RANK() OVER (ORDER BY SUM(t.distance) DESC, d.driver_id) AS rank,
  d.driver_id, d.name, SUM(t.distance) AS total_distance, AVG(t.rating) AS avg_rating
FROM Drivers d
JOIN Trips t ON t.driver_id = d.driver_id
GROUP BY d.driver_id, d.name
ORDER BY rank`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def top_drivers(drivers, trips):
    t = trips.merge(drivers, on='driver_id')
    g = t.groupby(['driver_id', 'name']).agg(total_distance=('distance', 'sum'), avg_rating=('rating', 'mean')).reset_index()
    g = g.sort_values(['total_distance', 'driver_id'], ascending=[False, True])
    g['rank'] = range(1, len(g) + 1)
    return g[['rank', 'driver_id', 'name', 'total_distance', 'avg_rating']]
`

const lookupCode = text => {
  const index = code.findIndex(line => line.text.includes(text))
  if (index < 0) throw new Error(`No SQL line contains: ${text}`)
  return index + 1
}
const lookupPython = text => {
  const index = python.split('\n').findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`No Python line contains: ${text}`)
  return index + 1
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || !Array.isArray(input.Drivers) || !Array.isArray(input.Trips)) throw new Error('Use an object with Drivers and Trips lists.')
  if (input.Drivers.length > 8 || input.Trips.length > 12) throw new Error('Use at most 8 drivers and 12 trips.')
  const driverIds = new Set()
  for (const d of input.Drivers) {
    if (!Number.isInteger(d.driver_id) || typeof d.name !== 'string' || d.name.length === 0) throw new Error('Each driver needs an integer driver_id and a name.')
    if (driverIds.has(d.driver_id)) throw new Error('driver_id values must be unique.')
    driverIds.add(d.driver_id)
  }
  for (const t of input.Trips) {
    if (!Number.isInteger(t.trip_id) || !Number.isInteger(t.driver_id) || !Number.isInteger(t.distance) || t.distance < 0) {
      throw new Error('Each trip needs integer trip_id, driver_id and a non-negative whole distance.')
    }
    if (!Number.isInteger(t.rating) || t.rating < 1 || t.rating > 5) throw new Error('rating is a whole number from 1 to 5.')
  }
  return input
}

export function buildTrace(input) {
  const driverById = new Map(input.Drivers.map(d => [d.driver_id, d]))
  const trips = [...input.Trips].sort((a, b) => a.trip_id - b.trip_id)
  const totals = new Map()
  const frames = []
  const snapshot = () => [...totals.values()].sort((a, b) => a.driver_id - b.driver_id).map(r => ({ driver_id: r.driver_id, name: r.name, total_distance: r.total_distance, trips: r.trips }))
  const push = (phase, sqlText, pyText, message, rows = snapshot()) => frames.push({
    phase, activeLine: lookupCode(sqlText), pythonLine: lookupPython(pyText), message, rows,
  })
  push('load', 'FROM Drivers d', 'trips.merge', `Load ${input.Drivers.length} drivers and ${trips.length} trips.`)
  for (const trip of trips) {
    const driver = driverById.get(trip.driver_id)
    if (!driver) {
      push('join', 'JOIN Trips t', 'trips.merge', `Trip ${trip.trip_id} has no matching driver and is dropped.`)
      continue
    }
    const row = totals.get(driver.driver_id) || { driver_id: driver.driver_id, name: driver.name, total_distance: 0, trips: 0, ratingSum: 0 }
    row.total_distance += trip.distance
    row.trips += 1
    row.ratingSum += trip.rating
    totals.set(driver.driver_id, row)
    push('join', 'JOIN Trips t', 'trips.merge', `Trip ${trip.trip_id} adds ${trip.distance} to ${driver.name}.`)
  }
  const grouped = [...totals.values()].map(r => ({ driver_id: r.driver_id, name: r.name, total_distance: r.total_distance, avg_rating: r.ratingSum / r.trips }))
  push('group', 'GROUP BY d.driver_id', 'groupby(', `Each driver now has one total and one average rating.`, grouped.map(r => ({ ...r })))
  const sorted = [...grouped].sort((a, b) => b.total_distance - a.total_distance || a.driver_id - b.driver_id)
  push('sort', 'ORDER BY SUM', 'ascending=', `Sort by total distance, highest first; ties go to the lower driver id.`, sorted.map(r => ({ ...r })))
  const result = sorted.map((r, i) => ({ rank: i + 1, driver_id: r.driver_id, name: r.name, total_distance: r.total_distance, avg_rating: r.avg_rating }))
  for (let i = 0; i < result.length; i++) {
    push('rank', 'RANK()', "g['rank']", `${result[i].name} gets rank ${result[i].rank}.`, result.slice(0, i + 1))
  }
  push('output', 'ORDER BY rank', 'return g', `Return ${result.length} ranked driver row${result.length === 1 ? '' : 's'}.`, result)
  return { input, result, frames }
}
