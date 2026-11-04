export const sql = `WITH hourly AS (
    SELECT city,
           HOUR(call_time) AS peak_calling_hour,
           COUNT(*) AS number_of_calls,
           RANK() OVER (PARTITION BY city ORDER BY COUNT(*) DESC) AS call_rank
    FROM Calls
    GROUP BY city, HOUR(call_time)
)
SELECT city, peak_calling_hour, number_of_calls
FROM hourly
WHERE call_rank = 1
ORDER BY peak_calling_hour DESC, city DESC;`

export const code = `start with no hour groups
for each call
  take the hour of day from call_time
  add one to the group (city, hour)
for each city
  rank its hours by call count, ties share a rank
for each group (city, hour)
  keep it only if it has rank 1 in its city
order the kept rows by hour, then city, both descending
return the kept rows`.split('\n').map((text, index) => ({ line: index + 1, text }))

const L = key => {
  const index = code.findIndex(line => line.text.includes(key))
  if (index < 0) throw new Error(`Missing pseudocode line: ${key}`)
  return index + 1
}

export const python = `def peak_hours(calls):
    counts = {}
    for caller_id, recipient_id, call_time, city in calls:
        hour = int(call_time[11:13])
        counts[(city, hour)] = counts.get((city, hour), 0) + 1
    most = {}
    for (city, hour), total in counts.items():
        most[city] = max(most.get(city, 0), total)
    rows = []
    for (city, hour), total in counts.items():
        if total == most[city]:
            rows.append((city, hour, total))
    rows.sort(key=lambda row: (row[1], row[0].lower()), reverse=True)
    return rows
`
const PY_LINES = python.split('\n')
const PY = key => {
  const index = PY_LINES.findIndex(line => line.includes(key))
  if (index < 0) throw new Error(`Missing Python line: ${key}`)
  return index + 1
}

export const inputLabel = 'Object with a Calls table: rows of caller_id, recipient_id, call_time and city'
export const complexity = 'O(c log c) for c calls: one pass to group, then a sort of the kept rows. The visualization caps Calls at 16 rows.'

const row = (caller_id, recipient_id, call_time, city) => ({ caller_id, recipient_id, call_time, city })
export const examples = [
  {
    label: 'Tie inside one city',
    input: JSON.stringify({ Calls: [
      row(31, 12, '2023-03-02 09:15:20', 'Oslo'),
      row(12, 31, '2023-03-09 09:47:05', 'Oslo'),
      row(40, 17, '2023-03-02 17:02:44', 'Oslo'),
      row(17, 40, '2023-04-11 17:33:10', 'Oslo'),
      row(25, 40, '2023-04-12 17:58:59', 'Oslo'),
      row(6, 9, '2023-01-20 08:05:00', 'Lima'),
      row(9, 6, '2023-01-27 08:40:31', 'Lima'),
      row(14, 6, '2023-02-01 12:11:11', 'Lima'),
      row(6, 14, '2023-02-03 21:19:48', 'Lima'),
      row(9, 14, '2023-02-08 21:50:02', 'Lima'),
    ] }),
  },
  {
    label: 'Two cities peak in the same hour',
    input: JSON.stringify({ Calls: [
      row(1, 2, '2022-07-04 06:10:00', 'Accra'),
      row(2, 1, '2022-07-05 06:20:00', 'Accra'),
      row(3, 4, '2022-07-05 19:30:00', 'Accra'),
      row(5, 6, '2022-08-14 06:45:00', 'Cairo'),
    ] }),
  },
  { label: 'Edge: no calls', input: '{"Calls":[]}' },
]

export const phases = [
  { id: 'load', label: 'Load', description: 'Start from the Calls table with no groups.' },
  { id: 'hour', label: 'Hour', description: 'Take the hour of day from the call time; the date is ignored.' },
  { id: 'count', label: 'Group', description: 'Add one to the bar for this city and hour.' },
  { id: 'rank', label: 'Rank', description: 'Rank one city\'s hours by call count.' },
  { id: 'keep', label: 'Filter', description: 'Keep only rank 1 hours, so ties all survive.' },
  { id: 'order', label: 'Order', description: 'Sort by hour, then city, both descending.' },
  { id: 'done', label: 'Result', description: 'Return the kept rows.' },
]

const TIME = /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})$/

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with a Calls table.')
  const { Calls } = input
  if (!Array.isArray(Calls) || Calls.length > 16) throw new Error('Calls is a list of at most 16 rows.')
  const keys = new Set()
  const cities = new Map()
  const rows = Calls.map(entry => {
    if (!entry || typeof entry !== 'object') throw new Error('Each row needs caller_id, recipient_id, call_time and city.')
    const { caller_id, recipient_id, call_time, city } = entry
    if (!Number.isInteger(caller_id) || !Number.isInteger(recipient_id)) throw new Error('caller_id and recipient_id are integers.')
    const match = typeof call_time === 'string' ? TIME.exec(call_time) : null
    if (!match) throw new Error('call_time looks like 2023-03-02 09:15:20.')
    const [year, month, day, hour, minute, second] = match.slice(1).map(Number)
    const date = new Date(Date.UTC(year, month - 1, day))
    if (date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day || hour > 23 || minute > 59 || second > 59) throw new Error(`${call_time} is not a real date and time.`)
    if (typeof city !== 'string' || !city.trim()) throw new Error('city is a non-empty string.')
    // MySQL's default collation compares without case, so spellings like Oslo and OSLO would be one city.
    const folded = city.toLowerCase()
    if (cities.has(folded) && cities.get(folded) !== city) throw new Error(`Use one spelling for ${city}.`)
    cities.set(folded, city)
    const key = JSON.stringify([caller_id, recipient_id, call_time])
    if (keys.has(key)) throw new Error('(caller_id, recipient_id, call_time) must be unique.')
    keys.add(key)
    return { caller_id, recipient_id, call_time, city }
  })
  return { Calls: rows }
}

const compareCity = (a, b) => {
  const x = a.toLowerCase(), y = b.toLowerCase()
  return x < y ? -1 : x > y ? 1 : 0
}
const pad = hour => String(hour).padStart(2, '0')
export const hourOf = callTime => Number(callTime.slice(11, 13))
export const OUTPUT_COLUMNS = ['city', 'peak_calling_hour', 'number_of_calls']
export const CALL_COLUMNS = ['caller_id', 'recipient_id', 'call_time', 'city', 'hour']

export function buildTrace(input) {
  const { Calls } = input
  const frames = []
  const groups = new Map() // Insertion order, like the Python dict.
  const shownCalls = Calls.map(call => ({ ...call, hour: '' }))
  const output = []
  const ranked = new Map()
  const decided = new Map()
  const groupKey = (city, hour) => `${city}\u0000${hour}`
  const snapshot = () => [...groups.values()].map(group => ({
    ...group, rank: ranked.get(groupKey(group.city, group.hour)) ?? null, kept: decided.get(groupKey(group.city, group.hour)) ?? null,
  }))
  const push = (phase, activeLine, pythonLine, message, extra = {}) => frames.push({
    phase, activeLine, pythonLine, message, activeRow: -1, activeGroup: null, activeCity: null,
    calls: shownCalls.map(call => ({ ...call })), groups: snapshot(), output: output.map(entry => ({ ...entry })), ...extra,
  })

  push('load', L('start with no'), PY('counts = {}'), Calls.length ? `Calls has ${Calls.length} rows and no group exists yet.` : 'Calls has no rows, so there is nothing to group.')
  Calls.forEach((call, index) => {
    const hour = hourOf(call.call_time)
    shownCalls[index].hour = hour
    push('hour', L('take the hour'), PY('hour = int'), `${call.call_time} falls in hour ${pad(hour)}. The date is dropped, so different days share an hour.`, { activeRow: index })
    const key = groupKey(call.city, hour)
    const previous = groups.get(key)?.count ?? 0
    groups.set(key, { city: call.city, hour, count: previous + 1 })
    push('count', L('add one to'), PY('counts[(city, hour)]'), `${call.city} at ${pad(hour)}:00 goes from ${previous} to ${previous + 1} call${previous === 0 ? '' : 's'}.`, { activeRow: index, activeGroup: { city: call.city, hour } })
  })

  const cities = [...new Set([...groups.values()].map(group => group.city))]
  for (const city of cities) {
    const own = [...groups.values()].filter(group => group.city === city).sort((a, b) => b.count - a.count)
    own.forEach(group => {
      const rank = 1 + own.filter(other => other.count > group.count).length
      ranked.set(groupKey(city, group.hour), rank)
    })
    const top = own.filter(group => group.count === own[0].count)
    push('rank', L('rank its hours'), PY('most[city] ='), `${city}: the most calls in any hour is ${own[0].count}, reached at ${top.map(group => `${pad(group.hour)}:00`).join(' and ')}${top.length > 1 ? ', a tie that shares rank 1' : ''}.`, { activeCity: city })
  }

  const kept = []
  for (const group of groups.values()) {
    const key = groupKey(group.city, group.hour)
    const rank = ranked.get(key)
    decided.set(key, rank === 1)
    const entry = { city: group.city, peak_calling_hour: group.hour, number_of_calls: group.count }
    if (rank === 1) {
      kept.push(entry)
      output.push(entry)
    }
    push('keep', L('keep it only'), rank === 1 ? PY('rows.append') : PY('if total == most'), rank === 1
      ? `${group.city} at ${pad(group.hour)}:00 has rank 1, so it stays.`
      : `${group.city} at ${pad(group.hour)}:00 has rank ${rank}, below this city's peak, so it is dropped.`, { activeGroup: { city: group.city, hour: group.hour } })
  }

  const sorted = [...kept].sort((a, b) => b.peak_calling_hour - a.peak_calling_hour || compareCity(b.city, a.city))
  output.length = 0
  output.push(...sorted)
  const sameHour = sorted.some((entry, index) => index > 0 && sorted[index - 1].peak_calling_hour === entry.peak_calling_hour)
  push('order', L('order the kept'), PY('rows.sort'), sorted.length
    ? `Later hours come first${sameHour ? '; rows sharing an hour then go by city name, Z towards A' : ''}.`
    : 'No rows to order.')
  push('done', L('return the kept'), PY('return rows'), `Return ${sorted.length} row${sorted.length === 1 ? '' : 's'}.`)
  return { input, result: sorted, frames }
}
