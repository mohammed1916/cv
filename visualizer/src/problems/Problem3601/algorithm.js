// Knowledge-derived draft: the rule is the author's own reading of the table task, not copied from an official statement.
// Rule: split trips at a date. Early trips are before it, late trips are on or after it. Efficiency is total km
// divided by total fuel per period. Report drivers whose efficiency rose, with the gain rounded to 2 decimals.
const numbered = list => list.map((text, index) => ({ line: index + 1, text }))
const COLS = ['driver_id', 'name', 'improvement']
const PERIOD_COLS = ['driver_id', 'name', 'early_kmpl', 'late_kmpl']

export const code = numbered([
  'WITH split AS (',
  '  SELECT driver_id,',
  "    SUM(CASE WHEN trip_date < :split THEN distance_km END) AS early_km,",
  "    SUM(CASE WHEN trip_date < :split THEN fuel_used END) AS early_fuel,",
  "    SUM(CASE WHEN trip_date >= :split THEN distance_km END) AS late_km,",
  "    SUM(CASE WHEN trip_date >= :split THEN fuel_used END) AS late_fuel",
  '  FROM trips GROUP BY driver_id',
  ')',
  'SELECT d.driver_id, d.name, ROUND(late_km / late_fuel - early_km / early_fuel, 2) AS improvement',
  'FROM split s JOIN drivers d USING (driver_id)',
  'WHERE early_fuel > 0 AND late_fuel > 0 AND late_km / late_fuel > early_km / early_fuel',
  'ORDER BY improvement DESC, d.name',
])

export const python = `import pandas as pd
def efficiency_gain(drivers, trips, split):
    t = trips.assign(late=trips.trip_date >= split)
    g = t.groupby(["driver_id", "late"])[["distance_km", "fuel_used"]].sum()
    eff = (g.distance_km / g.fuel_used).unstack("late")
    eff = eff.dropna()
    eff["improvement"] = (eff[True] - eff[False]).round(2)
    out = eff[eff.improvement > 0].reset_index().merge(drivers, on="driver_id")
    out = out.sort_values(["improvement", "name"], ascending=[False, True])
    return out[["driver_id", "name", "improvement"]]
`

const pyLines = numbered(python.split('\n'))

export const SAMPLE_TEXT = '{"split":"2024-07-01","drivers":[{"driver_id":1,"name":"Ana"},{"driver_id":2,"name":"Ben"},{"driver_id":3,"name":"Cleo"},{"driver_id":4,"name":"Dee"}],"trips":[{"trip_id":1,"driver_id":1,"trip_date":"2024-06-10","distance_km":100,"fuel_used":10},{"trip_id":2,"driver_id":1,"trip_date":"2024-07-05","distance_km":120,"fuel_used":8},{"trip_id":3,"driver_id":2,"trip_date":"2024-06-01","distance_km":100,"fuel_used":5},{"trip_id":4,"driver_id":2,"trip_date":"2024-07-01","distance_km":60,"fuel_used":5},{"trip_id":5,"driver_id":2,"trip_date":"2024-07-20","distance_km":40,"fuel_used":3},{"trip_id":6,"driver_id":3,"trip_date":"2024-05-03","distance_km":80,"fuel_used":4},{"trip_id":7,"driver_id":4,"trip_date":"2024-06-20","distance_km":50,"fuel_used":5},{"trip_id":8,"driver_id":4,"trip_date":"2024-07-10","distance_km":100,"fuel_used":5}]}'

function lineOf(list, fragment, label) {
  const hit = list.find(row => row.text.includes(fragment))
  if (!hit) throw new Error(`${label} line missing: ${fragment}`)
  return hit.line
}

function frame(phase, sql, py, message, columns, rows) {
  return { phase, activeLine: lineOf(code, sql, 'SQL'), pythonLine: lineOf(pyLines, py, 'Python'), message, columns, rows: rows.map(row => ({ ...row })) }
}

const round2 = x => Math.round(x * 100) / 100
const kmpl = (km, fuel) => round2(km / fuel)

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || !Array.isArray(input.drivers) || !Array.isArray(input.trips) || !/^\d{4}-\d{2}-\d{2}$/.test(input.split)) {
    throw new Error('Use drivers, trips and an ISO split date.')
  }
  for (const t of input.trips) {
    if (!(t.distance_km > 0) || !(t.fuel_used > 0)) throw new Error('Each trip needs positive distance_km and fuel_used.')
  }
  return input
}

export function buildTrace(input) {
  const { drivers, trips, split } = input
  const frames = [frame('load', 'WITH split AS (', 'def efficiency_gain', `Load ${trips.length} trips and split at ${split}.`, ['trip_id', 'driver_id', 'trip_date', 'distance_km', 'fuel_used'], trips)]
  const found = []
  const summary = []
  for (const d of drivers) {
    const mine = trips.filter(t => t.driver_id === d.driver_id)
    const early = mine.filter(t => t.trip_date < split)
    const late = mine.filter(t => t.trip_date >= split)
    const sum = (list, key) => list.reduce((acc, t) => acc + t[key], 0)
    const earlyEff = early.length ? kmpl(sum(early, 'distance_km'), sum(early, 'fuel_used')) : null
    const lateEff = late.length ? kmpl(sum(late, 'distance_km'), sum(late, 'fuel_used')) : null
    summary.push({ driver_id: d.driver_id, name: d.name, early_kmpl: earlyEff ?? 'n/a', late_kmpl: lateEff ?? 'n/a' })
    frames.push(frame('periods', 'SUM(CASE WHEN trip_date < :split', 'late=trips.trip_date >= split', `${d.name}: early ${earlyEff ?? 'none'}, late ${lateEff ?? 'none'} km per litre.`, PERIOD_COLS, summary))
    if (earlyEff === null || lateEff === null) {
      frames.push(frame('skip', 'WHERE early_fuel > 0 AND late_fuel > 0', 'eff = eff.dropna()', `${d.name} needs trips in both periods.`, COLS, found))
      continue
    }
    const gain = round2(lateEff - earlyEff)
    if (gain > 0) {
      found.push({ driver_id: d.driver_id, name: d.name, improvement: gain })
      frames.push(frame('compare', 'late_km / late_fuel > early_km / early_fuel', 'improvement > 0', `${d.name} gained ${gain} km per litre.`, COLS, found))
    } else {
      frames.push(frame('skip', 'late_km / late_fuel > early_km / early_fuel', 'improvement > 0', `${d.name} did not improve (${gain}).`, COLS, found))
    }
  }
  const rows = [...found].sort((a, b) => b.improvement - a.improvement || a.name.localeCompare(b.name))
  frames.push(frame('order', 'ORDER BY improvement DESC', 'sort_values', 'Sort by gain, then by name.', COLS, rows))
  frames.push(frame('done', 'SELECT d.driver_id, d.name', 'return out[["driver_id"', `Result has ${rows.length} row(s).`, COLS, rows))
  return { input: { drivers, trips, split }, result: rows, frames }
}
