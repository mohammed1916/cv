// Knowledge-derived teaching model. The sample tables are invented for this visualization.
const COLS = ['user_id', 'steps_count', 'steps_date']
const DAY_MS = 86400000

export function snap(rows) {
  return rows.map(row => ({ ...row }))
}

export function lineOf(lines, text) {
  const index = lines.findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`Missing code line for: ${text}`)
  return index + 1
}

export function requireRows(input, name, columns) {
  const rows = input?.[name]
  if (!Array.isArray(rows) || rows.length === 0 || rows.length > 12) throw new Error(`${name} must be a list of 1 to 12 rows.`)
  rows.forEach((row, index) => {
    if (!row || typeof row !== 'object' || Array.isArray(row)) throw new Error(`${name} row ${index + 1} must be an object.`)
    columns.forEach(column => { if (!(column in row)) throw new Error(`${name} row ${index + 1} needs ${column}.`) })
  })
  return rows
}

export const sql = `WITH windows AS (
  SELECT user_id, steps_date,
         SUM(steps_count) OVER w AS window_steps,
         COUNT(*) OVER w AS window_rows
  FROM Steps
  WINDOW w AS (PARTITION BY user_id ORDER BY steps_date
               RANGE BETWEEN INTERVAL 2 DAY PRECEDING AND CURRENT ROW)
)
SELECT user_id, steps_date, ROUND(window_steps / 3, 2) AS average_steps
FROM windows
WHERE window_rows = 3
ORDER BY user_id, steps_date`
const sqlLines = sql.split('\n')
export const code = sqlLines.map((text, index) => ({ line: index + 1, text }))
export const python = `import pandas as pd

def rolling_average_steps(steps):
    dated = steps.assign(steps_date=pd.to_datetime(steps["steps_date"]))
    rolled = dated.set_index("steps_date").groupby("user_id")["steps_count"].rolling("3D")
    stats = pd.DataFrame({"window_steps": rolled.sum(), "window_rows": rolled.count()}).reset_index()
    kept = stats[stats["window_rows"] == 3].copy()
    kept["average_steps"] = (kept["window_steps"] / 3).round(2)
    return kept[["user_id", "steps_date", "average_steps"]].sort_values(["user_id", "steps_date"])`
const pyLines = python.split('\n')
const L = text => lineOf(sqlLines, text)
const P = text => lineOf(pyLines, text)

export const phases = [
  { id: 'load', label: 'Load', description: 'Read the step counts by user and date.' },
  { id: 'window', label: 'Window', description: 'For each row, count the rows of the same user in the two earlier days and the day itself.' },
  { id: 'qualify', label: 'Qualify', description: 'Keep only windows where all three calendar days have a row.' },
  { id: 'average', label: 'Average', description: 'Divide the window total by three and round to two decimals.' },
  { id: 'order', label: 'Order', description: 'Sort by user and date.' },
  { id: 'done', label: 'Result', description: 'Return the averages.' },
]

const day = iso => Date.UTC(Number(iso.slice(0, 4)), Number(iso.slice(5, 7)) - 1, Number(iso.slice(8, 10))) / DAY_MS
const total = rows => rows.reduce((sum, row) => sum + row.steps_count, 0)

export function parseInput(text) {
  const input = JSON.parse(text)
  const rows = requireRows(input, 'Steps', COLS)
  const seen = new Set()
  rows.forEach((row, index) => {
    if (!Number.isInteger(row.steps_count) || row.steps_count < 0) throw new Error(`Steps row ${index + 1} needs a whole-number steps_count.`)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(row.steps_date)) throw new Error(`Steps row ${index + 1} needs a steps_date such as 2026-01-31.`)
    const key = `${row.user_id}|${row.steps_date}`
    if (seen.has(key)) throw new Error(`Steps row ${index + 1} repeats a user and date.`)
    seen.add(key)
  })
  return input
}

export function buildTrace(input) {
  const rows = input.Steps
  const frames = []
  const add = (phase, sqlText, pyText, message, columns, data) => frames.push({ phase, activeLine: L(sqlText), pythonLine: P(pyText), message, columns, rows: snap(data) })
  add('load', 'FROM Steps', 'def rolling', `Read ${rows.length} step rows.`, COLS, rows)
  const sorted = rows
    .map(row => ({ user_id: row.user_id, steps_count: row.steps_count, steps_date: row.steps_date }))
    .sort((a, b) => a.user_id - b.user_id || day(a.steps_date) - day(b.steps_date))
  const windowed = sorted.map(row => {
    const inWindow = sorted.filter(other => other.user_id === row.user_id
      && day(other.steps_date) <= day(row.steps_date) && day(other.steps_date) >= day(row.steps_date) - 2)
    return { ...row, window_steps: total(inWindow), window_rows: inWindow.length }
  })
  add('window', 'WINDOW w AS', 'dated = ', 'Count each user’s rows in the window of this day and the two days before.', ['user_id', 'steps_date', 'steps_count', 'window_rows'], windowed)
  const kept = windowed.filter(row => row.window_rows === 3)
  add('qualify', 'WHERE window_rows', 'rolled = ', `${kept.length} windows have a row on all three consecutive days.`, ['user_id', 'steps_date', 'window_steps', 'window_rows'], kept)
  const averages = kept.map(row => ({ user_id: row.user_id, steps_date: row.steps_date, average_steps: Number((row.window_steps / 3).toFixed(2)) }))
  add('average', 'ROUND(window_steps', 'kept["average_steps"]', 'Divide each window total by three and round to two decimals.', ['user_id', 'steps_date', 'average_steps'], averages)
  const result = averages.slice().sort((a, b) => a.user_id - b.user_id || day(a.steps_date) - day(b.steps_date))
  add('order', 'ORDER BY user_id', 'return kept', 'Sort the averages by user and date.', ['user_id', 'steps_date', 'average_steps'], result)
  add('done', 'ROUND(window_steps', 'return kept', 'Return one row per qualifying date.', ['user_id', 'steps_date', 'average_steps'], result)
  return { input, result, frames }
}
