// SQL walkthrough. The sample tables are invented for this visualization.
export const sql = `SELECT
SUM(CASE WHEN DAYOFWEEK(submit_date) IN (1, 7) THEN 1 ELSE 0 END) AS weekend_cnt,
SUM(CASE WHEN DAYOFWEEK(submit_date) BETWEEN 2 AND 6 THEN 1 ELSE 0 END) AS working_cnt
FROM Tasks`

export const code = sql.split('\n').map((text, index) => ({ line: index + 1, text }))
const SQL = key => {
  const index = code.findIndex(line => line.text.includes(key))
  if (index < 0) throw new Error(`Missing SQL line: ${key}`)
  return index + 1
}

export const python = `def weekend_and_working(tasks):
    dates = pd.to_datetime(tasks["submit_date"])
    is_weekend = dates.dt.dayofweek >= 5
    return pd.DataFrame({"weekend_cnt": [int(is_weekend.sum())], "working_cnt": [int((~is_weekend).sum())]})`
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
  { id: 'load', label: 'Load', description: 'Read the task submissions.' },
  { id: 'classify', label: 'Weekday', description: 'Find the weekday of each submission.' },
  { id: 'done', label: 'Result', description: 'Return the two counts.' },
]

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const COLUMNS = ['task_id', 'assignee_id', 'submit_date']

export function parseInput(text) {
  const input = JSON.parse(text)
  const rows = input && Array.isArray(input.Tasks) ? input.Tasks : null
  if (!rows || rows.length < 1 || rows.length > 30) throw new Error('Tasks needs 1 to 30 rows.')
  for (const row of rows) {
    if (!row || typeof row !== 'object' || COLUMNS.some(column => !(column in row))) throw new Error(`Tasks rows need ${COLUMNS.join(', ')}.`)
    if (!Number.isInteger(row.task_id) || !Number.isInteger(row.assignee_id)) throw new Error('task_id and assignee_id must be integers.')
    if (!/^\d{4}-\d{2}-\d{2}$/.test(row.submit_date) || Number.isNaN(Date.parse(`${row.submit_date}T00:00:00Z`))) throw new Error('submit_date must be a real YYYY-MM-DD date.')
  }
  return { Tasks: rows.map(row => Object.fromEntries(COLUMNS.map(column => [column, row[column]]))) }
}

export function buildTrace(input) {
  const { Tasks } = input
  const frames = [frame('load', 'FROM Tasks', 'def ', 'Read one row per task submission.', COLUMNS, Tasks)]
  const classColumns = ['task_id', 'submit_date', 'weekday', 'kind']
  const classified = []
  let weekend = 0
  let working = 0
  for (const row of Tasks) {
    const day = new Date(`${row.submit_date}T00:00:00Z`).getUTCDay()
    const isWeekend = day === 0 || day === 6
    if (isWeekend) {
      weekend += 1
    } else {
      working += 1
    }
    classified.push({ task_id: row.task_id, submit_date: row.submit_date, weekday: DAYS[day], kind: isWeekend ? 'weekend' : 'working' })
    frames.push(frame('classify', isWeekend ? 'IN (1, 7)' : 'BETWEEN 2 AND 6', 'is_weekend = ', `${row.submit_date} is a ${DAYS[day]}, so it counts as ${isWeekend ? 'weekend' : 'working'}.`, classColumns, classified))
  }
  const result = [{ weekend_cnt: weekend, working_cnt: working }]
  frames.push(frame('done', 'AS working_cnt', 'return', `Return weekend ${weekend} and working ${working}.`, ['weekend_cnt', 'working_cnt'], result))
  return { input, result, frames }
}
