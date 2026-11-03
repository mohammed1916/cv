// Knowledge-derived SQL walkthrough. The sample tables are invented for this visualization.
export const sql = `SELECT DATE_FORMAT(d.day, '%W, %M %e, %Y') AS formatted_day
FROM Days d
ORDER BY d.day`

export const code = sql.split('\n').map((text, index) => ({ line: index + 1, text }))
const SQL = key => {
  const index = code.findIndex(line => line.text.includes(key))
  if (index < 0) throw new Error(`Missing SQL line: ${key}`)
  return index + 1
}

export const python = `def convert_date_format(days):
    dates = pd.to_datetime(days["day"]).sort_values()
    formatted = dates.apply(lambda d: f"{d:%A}, {d:%B} {d.day}, {d.year}")
    return pd.DataFrame({"formatted_day": formatted.values})`
const PY_LINES = python.split('\n')
const PY = key => {
  const index = PY_LINES.findIndex(line => line.includes(key))
  if (index < 0) throw new Error(`Missing Python line: ${key}`)
  return index + 1
}

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

const frame = (phase, sqlKey, pyKey, message, columns, rows) => ({
  phase, activeLine: SQL(sqlKey), pythonLine: PY(pyKey), message, columns, rows: rows.map(row => ({ ...row })),
})

export const phases = [
  { id: 'load', label: 'Load', description: 'Read the calendar dates.' },
  { id: 'format', label: 'Format', description: 'Build the weekday, month, day and year text for each date.' },
  { id: 'done', label: 'Result', description: 'Output the formatted dates in date order.' },
]

export const inputLabel = 'Object with a Days table (day as YYYY-MM-DD)'
export const complexity = 'O(n log n) for the date sort, with constant work per date for formatting. The visualizer caps the table at 12 rows.'

function tableRows(input, name, columns) {
  const rows = input[name]
  if (!Array.isArray(rows) || rows.length < 1 || rows.length > 12) throw new Error(`${name} needs 1 to 12 rows.`)
  for (const row of rows) {
    if (!row || typeof row !== 'object' || columns.some(column => !(column in row))) throw new Error(`${name} rows need ${columns.join(', ')}.`)
  }
  return rows.map(row => Object.fromEntries(columns.map(column => [column, row[column]])))
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with a Days table.')
  const Days = tableRows(input, 'Days', ['day'])
  for (const row of Days) {
    const date = new Date(`${row.day}T00:00:00Z`)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(row.day)) || Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== row.day) {
      throw new Error('day must be a real calendar date in YYYY-MM-DD form.')
    }
  }
  return { Days }
}

function formatDay(day) {
  const date = new Date(`${day}T00:00:00Z`)
  return `${WEEKDAYS[date.getUTCDay()]}, ${MONTHS[date.getUTCMonth()]} ${date.getUTCDate()}, ${date.getUTCFullYear()}`
}

export function buildTrace(input) {
  const days = [...input.Days].sort((a, b) => (a.day < b.day ? -1 : a.day > b.day ? 1 : 0))
  const frames = []
  frames.push(frame('load', 'FROM Days', 'def ', `Load ${days.length} calendar dates.`, ['day'], days))

  const formatted = []
  for (const row of days) {
    formatted.push({ day: row.day, formatted_day: formatDay(row.day) })
    frames.push(frame('format', 'DATE_FORMAT', 'formatted =', `${row.day} becomes "${formatDay(row.day)}".`, ['day', 'formatted_day'], formatted))
  }
  const result = formatted.map(row => ({ formatted_day: row.formatted_day }))
  frames.push(frame('done', 'ORDER BY d.day', 'return pd.DataFrame', `Return ${result.length} formatted dates.`, ['formatted_day'], result))
  return { input, result, frames }
}
