const SQL = `WITH november AS (
  SELECT country_id, weather_state
  FROM Weather
  WHERE day BETWEEN '2019-11-01' AND '2019-11-30'
),
averages AS (
  SELECT country_id, AVG(weather_state) AS avg_state
  FROM november
  GROUP BY country_id
)
SELECT c.country_name,
  CASE WHEN a.avg_state <= 15 THEN 'Cold'
       WHEN a.avg_state >= 25 THEN 'Hot'
       ELSE 'Warm' END AS weather_type
FROM averages a
JOIN Countries c ON c.country_id = a.country_id
ORDER BY c.country_name;`

const PY = `import pandas as pd

def classify(avg):
    if avg <= 15:
        return "Cold"
    if avg >= 25:
        return "Hot"
    return "Warm"

def weather_type(countries, weather):
    nov = weather[weather["day"].between("2019-11-01", "2019-11-30")]
    averages = nov.groupby("country_id", as_index=False)["weather_state"].mean()
    averages["weather_type"] = averages["weather_state"].apply(classify)
    out = averages.merge(countries, on="country_id")
    return out[["country_name", "weather_type"]].sort_values("country_name")
`

const snap = rows => JSON.parse(JSON.stringify(rows))
const SQL_LINES = SQL.split('\n')
const PY_LINES = PY.split('\n')
function lookup(lines, fragment, label) {
  const index = lines.findIndex(text => text.includes(fragment))
  if (index < 0) throw new Error(`${label} has no line containing "${fragment}"`)
  return index + 1
}
const sqlLine = fragment => lookup(SQL_LINES, fragment, 'SQL')
const pyLine = fragment => lookup(PY_LINES, fragment, 'Python')
const frame = (phase, sqlFragment, pyFragment, message, rows) => ({
  phase, activeLine: sqlLine(sqlFragment), pythonLine: pyLine(pyFragment), message, rows: snap(rows),
})

export const sql = SQL
export const python = PY
export const code = SQL_LINES.map((text, index) => ({ line: index + 1, text }))
export const phases = [
  { id: 'filter', label: 'Filter', description: 'Keep only readings dated in November 2019.' },
  { id: 'average', label: 'Average', description: 'Average the kept readings for each country.' },
  { id: 'classify', label: 'Label', description: 'Cold at 15 or below, Hot at 25 or above, Warm otherwise.' },
  { id: 'done', label: 'Result', description: 'Countries listed by name.' },
]
export const sample = {
  countries: [
    { country_id: 2, country_name: 'USA' },
    { country_id: 3, country_name: 'Australia' },
    { country_id: 7, country_name: 'Peru' },
    { country_id: 5, country_name: 'China' },
  ],
  weather: [
    { country_id: 2, weather_state: 15, day: '2019-11-01' },
    { country_id: 2, weather_state: 20, day: '2019-11-10' },
    { country_id: 3, weather_state: 30, day: '2019-11-05' },
    { country_id: 3, weather_state: 28, day: '2019-11-06' },
    { country_id: 3, weather_state: 27, day: '2019-11-20' },
    { country_id: 7, weather_state: 5, day: '2019-11-03' },
    { country_id: 7, weather_state: 10, day: '2019-11-04' },
    { country_id: 7, weather_state: 40, day: '2019-12-01' },
    { country_id: 5, weather_state: 30, day: '2019-10-31' },
  ],
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!Array.isArray(input.countries) || !Array.isArray(input.weather)) throw new Error('Provide countries and weather arrays.')
  const ids = new Set(input.countries.map(c => c.country_id))
  for (const w of input.weather) {
    if (!ids.has(w.country_id)) throw new Error(`Reading names unknown country ${w.country_id}.`)
  }
  return input
}

function label(average) {
  if (average <= 15) return 'Cold'
  if (average >= 25) return 'Hot'
  return 'Warm'
}

export function buildTrace(input) {
  const { countries, weather } = input
  const names = new Map(countries.map(c => [c.country_id, c.country_name]))
  const frames = []
  const kept = []
  for (const w of weather) {
    const inNovember = w.day >= '2019-11-01' && w.day <= '2019-11-30'
    if (inNovember) kept.push(w)
    frames.push(frame('filter', 'WHERE day BETWEEN', 'nov = weather[', inNovember ? `${w.day} is in November: keep ${w.weather_state}.` : `${w.day} is outside November: skip it.`, kept))
  }
  const sums = new Map()
  for (const w of kept) {
    if (!sums.has(w.country_id)) sums.set(w.country_id, { sum: 0, count: 0 })
    const s = sums.get(w.country_id)
    s.sum += w.weather_state
    s.count += 1
  }
  const averages = [...sums.entries()]
    .map(([id, s]) => ({ country_id: id, country_name: names.get(id), avg_state: Math.round((s.sum / s.count) * 100) / 100 }))
    .sort((a, b) => (a.country_name < b.country_name ? -1 : a.country_name > b.country_name ? 1 : 0))
  frames.push(frame('average', 'AVG(weather_state)', 'averages = nov', 'Average the kept readings for each country that has any.', averages))
  const result = []
  for (const a of averages) {
    result.push({ country_name: a.country_name, weather_type: label(a.avg_state) })
    frames.push(frame('classify', 'CASE WHEN', 'averages["weather_type"]', `${a.country_name} averages ${a.avg_state}: ${label(a.avg_state)}.`, result))
  }
  frames.push(frame('done', 'ORDER BY c.country_name', 'return out', 'Countries listed by name.', result))
  return { input, result, frames }
}
