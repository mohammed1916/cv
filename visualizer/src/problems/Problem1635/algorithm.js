export const sql = `with recursive months as (
  select 1 as month
  union all
  select month + 1 from months where month < 12
)
select m.month,
       (select count(*) from Drivers d
         where date_format(d.join_date, '%Y-%m') <= concat('2020-', lpad(m.month, 2, '0'))) as active_drivers,
       (select count(*) from Rides r
         join AcceptedRides a on a.ride_id = r.ride_id
         where year(r.requested_at) = 2020 and month(r.requested_at) = m.month) as accepted_rides
from months m
order by m.month`
export const code = sql.split('\n').map((text, index) => ({ line: index + 1, text }))
export const python = `def hopper_queries(drivers, rides, accepted):
    months = pd.DataFrame({'month': range(1, 13)})
    joined = accepted.merge(rides, on='ride_id')
    months['active_drivers'] = months['month'].apply(lambda m: (drivers['join_date'].str[:7] <= f'2020-{m:02d}').sum())
    months['accepted_rides'] = months['month'].apply(lambda m: (joined['requested_at'].str[:7] == f'2020-{m:02d}').sum())
    return months.sort_values('month')`
export const phases = [
  { id: 'months', label: 'Months', description: 'List months 1 through 12 of 2020.' },
  { id: 'active', label: 'Drivers', description: 'Count drivers who joined by each month end.' },
  { id: 'accepted', label: 'Rides', description: 'Count accepted rides requested in each month.' },
  { id: 'order', label: 'Order', description: 'Sort by month.' },
  { id: 'done', label: 'Result', description: 'Report one row per month, zeros included.' },
]

const sqlLine = text => {
  const hit = code.find(c => c.text.includes(text))
  if (!hit) throw new Error(`No SQL line contains "${text}".`)
  return hit.line
}
const pyLine = text => {
  const index = python.split('\n').findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`No Python line contains "${text}".`)
  return index + 1
}
const frame = (phase, sqlText, pyText, rows, output, message) => ({
  phase, activeLine: sqlLine(sqlText), pythonLine: pyLine(pyText),
  rows: rows.map(row => ({ ...row })), output: output.map(row => ({ ...row })), message,
})
const isMonth = text => typeof text === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(text)

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with Drivers, Rides and AcceptedRides lists.')
  if (!Array.isArray(input.Drivers) || input.Drivers.length > 8) throw new Error('Drivers is a list of at most 8 rows.')
  if (!Array.isArray(input.Rides) || input.Rides.length > 12) throw new Error('Rides is a list of at most 12 rows.')
  if (!Array.isArray(input.AcceptedRides) || input.AcceptedRides.length > 12) throw new Error('AcceptedRides is a list of at most 12 rows.')
  for (const d of input.Drivers) {
    if (typeof d.driver_id !== 'number' || !isMonth(d.join_date)) throw new Error('Each driver has driver_id and a YYYY-MM-DD join_date.')
  }
  for (const r of input.Rides) {
    if (typeof r.ride_id !== 'number' || typeof r.user_id !== 'number' || !isMonth(r.requested_at)) throw new Error('Each ride has ride_id, user_id and a YYYY-MM-DD requested_at.')
  }
  for (const a of input.AcceptedRides) {
    if (typeof a.ride_id !== 'number' || typeof a.driver_id !== 'number') throw new Error('Each accepted ride has ride_id and driver_id.')
  }
  return input
}

export function buildTrace(input) {
  const frames = []
  const months = Array.from({ length: 12 }, (_, i) => ({ month: i + 1 }))
  frames.push(frame('months', 'select 1 as month', 'months = pd.DataFrame', months, [], 'Build the twelve months of 2020.'))
  const withDrivers = months.map(m => {
    const key = `2020-${String(m.month).padStart(2, '0')}`
    return { month: m.month, active_drivers: input.Drivers.filter(d => d.join_date.slice(0, 7) <= key).length }
  })
  frames.push(frame('active', 'from Drivers d', "months['active_drivers'] =", withDrivers, [], 'A driver counts once the month of joining has passed or started.'))
  const requested = new Map(input.Rides.map(r => [r.ride_id, r.requested_at]))
  const accepted = input.AcceptedRides.filter(a => requested.has(a.ride_id)).map(a => requested.get(a.ride_id))
  const withRides = withDrivers.map(m => {
    const key = `2020-${String(m.month).padStart(2, '0')}`
    return { ...m, accepted_rides: accepted.filter(day => day.slice(0, 7) === key).length }
  })
  frames.push(frame('accepted', 'from Rides r', "months['accepted_rides'] =", withRides, [], 'Count accepted rides by the month they were requested, only inside 2020.'))
  const ordered = [...withRides].sort((a, b) => a.month - b.month)
  frames.push(frame('order', 'order by m.month', "sort_values('month')", ordered, [], 'Sort by month.'))
  const result = ordered.map(m => ({ ...m }))
  frames.push(frame('done', 'select m.month', 'return months', result, result, `Returned ${result.length} months.`))
  return { input, result, frames }
}
