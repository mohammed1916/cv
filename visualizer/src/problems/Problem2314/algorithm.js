// SQL walkthrough. The sample table is invented for this visualization.
export const sql = `WITH ranked AS (
SELECT city_id, day, degree,
ROW_NUMBER() OVER (PARTITION BY city_id ORDER BY degree DESC, day ASC) AS rn
FROM Weather
)
SELECT city_id, day, degree
FROM ranked
WHERE rn = 1
ORDER BY city_id`

export const code = sql.split('\n').map((text, index) => ({ line: index + 1, text }))
const SQL = key => {
  const index = code.findIndex(line => line.text.includes(key))
  if (index < 0) throw new Error(`Missing SQL line: ${key}`)
  return index + 1
}

export const python = `def hottest_day(weather):
    ranked = weather.sort_values(["city_id", "degree", "day"], ascending=[True, False, True])
    ranked["rn"] = ranked.groupby("city_id").cumcount() + 1
    top = ranked[ranked["rn"] == 1]
    return top[["city_id", "day", "degree"]]`
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
  { id: 'load', label: 'Load', description: 'Read the daily readings.' },
  { id: 'rank', label: 'Rank', description: 'Rank each city readings from hottest to coolest.' },
  { id: 'pick', label: 'Pick', description: 'Keep row number 1 for each city.' },
  { id: 'done', label: 'Result', description: 'Return one row per city.' },
]

const COLUMNS = ['city_id', 'day', 'degree']

export function parseInput(text) {
  const input = JSON.parse(text)
  const rows = input && Array.isArray(input.Weather) ? input.Weather : null
  if (!rows || rows.length < 1 || rows.length > 30) throw new Error('Weather needs 1 to 30 rows.')
  for (const row of rows) {
    if (!row || typeof row !== 'object' || COLUMNS.some(column => !(column in row))) throw new Error(`Weather rows need ${COLUMNS.join(', ')}.`)
    if (!Number.isInteger(row.city_id) || !Number.isInteger(row.degree)) throw new Error('city_id and degree must be integers.')
    if (!/^\d{4}-\d{2}-\d{2}$/.test(row.day)) throw new Error('day must be YYYY-MM-DD.')
  }
  return { Weather: rows.map(row => Object.fromEntries(COLUMNS.map(column => [column, row[column]]))) }
}

export function buildTrace(input) {
  const { Weather } = input
  const frames = [frame('load', 'FROM Weather', 'def ', 'Read the daily readings. Their order in the table does not matter.', COLUMNS, Weather)]
  const rankColumns = ['city_id', 'day', 'degree', 'rn']
  const ranked = []
  const cities = [...new Set(Weather.map(row => row.city_id))].sort((a, b) => a - b)
  for (const city of cities) {
    const readings = Weather.filter(row => row.city_id === city)
      .sort((a, b) => b.degree - a.degree || (a.day < b.day ? -1 : a.day > b.day ? 1 : 0))
    readings.forEach((row, index) => ranked.push({ city_id: city, day: row.day, degree: row.degree, rn: index + 1 }))
    frames.push(frame('rank', 'ROW_NUMBER()', 'ranked["rn"]', `City ${city}: highest degree ${readings[0].degree} on ${readings[0].day}. Ties go to the earlier day.`, rankColumns, ranked))
  }
  const picked = ranked.filter(row => row.rn === 1)
  frames.push(frame('pick', 'WHERE rn = 1', 'top = ', 'Keep row number 1 for each city.', rankColumns, picked))
  const result = picked.map(row => ({ city_id: row.city_id, day: row.day, degree: row.degree }))
  frames.push(frame('done', 'ORDER BY city_id', 'return', `Return ${result.length} cities.`, COLUMNS, result))
  return { input, result, frames }
}
