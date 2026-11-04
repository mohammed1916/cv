// Teaching model written for this visualizer. Each driver is scored separately for every fuel type.
export const phases = [
  { id: 'load', label: 'Load', description: 'Read the drivers, vehicles and trips.' },
  { id: 'join', label: 'Join', description: 'Attach each trip to its vehicle, driver and fuel type.' },
  { id: 'group', label: 'Group', description: 'Totals and average rating for one driver and one fuel type.' },
  { id: 'pick', label: 'Pick', description: 'Within a fuel type, the best rating, then distance, then fewest accidents.' },
  { id: 'output', label: 'Result', description: 'Return one row per fuel type, ordered by fuel_type.' },
]

export const code = `WITH per_driver AS (
  SELECT v.fuel_type, v.driver_id,
    ROUND(AVG(t.rating), 2) AS rating,
    SUM(t.distance) AS distance
  FROM Trips t
  JOIN Vehicles v ON v.vehicle_id = t.vehicle_id
  GROUP BY v.fuel_type, v.driver_id
),
ranked AS (
  SELECT p.fuel_type, p.driver_id, p.rating, p.distance,
    ROW_NUMBER() OVER (PARTITION BY p.fuel_type
                       ORDER BY p.rating DESC, p.distance DESC, d.accidents, p.driver_id) AS pick
  FROM per_driver p
  JOIN Drivers d ON d.driver_id = p.driver_id
)
SELECT fuel_type, driver_id, rating, distance
FROM ranked
WHERE pick = 1
ORDER BY fuel_type`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def top_performing_driver(drivers, vehicles, trips):
    t = trips.merge(vehicles, on='vehicle_id')
    g = t.groupby(['fuel_type', 'driver_id'], as_index=False).agg(rating=('rating', 'mean'), distance=('distance', 'sum'))
    g['rating'] = g['rating'].round(2)
    g = g.merge(drivers[['driver_id', 'accidents']], on='driver_id')
    g = g.sort_values(['fuel_type', 'rating', 'distance', 'accidents', 'driver_id'], ascending=[True, False, False, True, True])
    return g.groupby('fuel_type', as_index=False).head(1)[['fuel_type', 'driver_id', 'rating', 'distance']]
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
  if (!input || !Array.isArray(input.Drivers) || !Array.isArray(input.Vehicles) || !Array.isArray(input.Trips)) throw new Error('Use an object with Drivers, Vehicles and Trips lists.')
  if (input.Drivers.length > 6 || input.Vehicles.length > 8 || input.Trips.length > 12) throw new Error('Use at most 6 drivers, 8 vehicles and 12 trips.')
  const driverIds = new Set()
  for (const d of input.Drivers) {
    if (!Number.isInteger(d.driver_id) || typeof d.name !== 'string' || !Number.isInteger(d.accidents) || d.accidents < 0) throw new Error('Each driver needs an integer driver_id, a name and a non-negative accidents count.')
    if (driverIds.has(d.driver_id)) throw new Error('driver_id values must be unique.')
    driverIds.add(d.driver_id)
  }
  const vehicleIds = new Set()
  for (const v of input.Vehicles) {
    if (!Number.isInteger(v.vehicle_id) || !Number.isInteger(v.driver_id) || typeof v.fuel_type !== 'string' || v.fuel_type.length === 0) throw new Error('Each vehicle needs integer vehicle_id and driver_id and a fuel_type.')
    if (vehicleIds.has(v.vehicle_id)) throw new Error('vehicle_id values must be unique.')
    vehicleIds.add(v.vehicle_id)
  }
  for (const t of input.Trips) {
    if (!Number.isInteger(t.trip_id) || !Number.isInteger(t.vehicle_id) || !Number.isInteger(t.distance) || t.distance < 0) {
      throw new Error('Each trip needs integer trip_id and vehicle_id and a non-negative whole distance.')
    }
    if (!Number.isInteger(t.rating) || t.rating < 1 || t.rating > 5) throw new Error('rating is a whole number from 1 to 5.')
  }
  return input
}

const round2 = x => Math.round(x * 100) / 100

export function buildTrace(input) {
  const vehicleById = new Map(input.Vehicles.map(v => [v.vehicle_id, v]))
  const driverById = new Map(input.Drivers.map(d => [d.driver_id, d]))
  const trips = [...input.Trips].sort((a, b) => a.trip_id - b.trip_id)
  const groups = new Map()
  const frames = []
  const snapshot = () => [...groups.values()].map(g => ({ fuel_type: g.fuel_type, driver_id: g.driver_id, rating: round2(g.ratingSum / g.count), distance: g.distance }))
  const push = (phase, sqlText, pyText, message, rows = snapshot(), extra = {}) => frames.push({
    phase, activeLine: lookupCode(sqlText), pythonLine: lookupPython(pyText), message, rows, ...extra,
  })
  push('load', 'FROM Trips t', 'trips.merge', `Load ${input.Drivers.length} drivers, ${input.Vehicles.length} vehicles and ${trips.length} trips.`, [])
  for (const trip of trips) {
    const vehicle = vehicleById.get(trip.vehicle_id)
    if (!vehicle) {
      push('join', 'JOIN Vehicles v', 'trips.merge', `Trip ${trip.trip_id} uses vehicle ${trip.vehicle_id}, which is not listed, so it is dropped.`)
      continue
    }
    const key = `${vehicle.fuel_type}|${vehicle.driver_id}`
    const g = groups.get(key) || { fuel_type: vehicle.fuel_type, driver_id: vehicle.driver_id, count: 0, ratingSum: 0, distance: 0 }
    g.count += 1
    g.ratingSum += trip.rating
    g.distance += trip.distance
    groups.set(key, g)
    push('join', 'JOIN Vehicles v', 'trips.merge', `Trip ${trip.trip_id} is ${vehicle.fuel_type} for driver ${vehicle.driver_id}, rating ${trip.rating}, distance ${trip.distance}.`, snapshot(), { current: key })
  }
  push('group', 'GROUP BY v.fuel_type', 'groupby(', 'Each fuel type and driver now has one rounded average rating and one total distance.', snapshot())
  const byFuel = new Map()
  for (const row of snapshot()) {
    if (!byFuel.has(row.fuel_type)) byFuel.set(row.fuel_type, [])
    byFuel.get(row.fuel_type).push(row)
  }
  const picks = []
  for (const fuel of [...byFuel.keys()].sort()) {
    const ordered = byFuel.get(fuel).slice().sort((a, b) => b.rating - a.rating || b.distance - a.distance || driverById.get(a.driver_id).accidents - driverById.get(b.driver_id).accidents || a.driver_id - b.driver_id)
    const top = ordered[0]
    picks.push({ fuel_type: fuel, driver_id: top.driver_id, rating: top.rating, distance: top.distance })
    push('pick', 'ROW_NUMBER()', "g.sort_values(['fuel_type'", `${fuel}: driver ${top.driver_id} ranks first with rating ${top.rating.toFixed(2)} and distance ${top.distance}.`, picks.map(p => ({ ...p })), { current: `${fuel}|${top.driver_id}`, fuel })
  }
  const result = picks.map(p => ({ ...p }))
  push('output', 'ORDER BY fuel_type', 'groupby(', `Return ${result.length} fuel type row${result.length === 1 ? '' : 's'}.`, result)
  return { input, result, frames }
}
