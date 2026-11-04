// Teaching version of the query. The sample tables are invented for this visualization.
const SQL = `WITH ordered AS (
  SELECT user_id, visit_date,
         LEAD(visit_date) OVER (PARTITION BY user_id ORDER BY visit_date) AS next_visit
  FROM UserVisits
),
windows AS (
  SELECT user_id, DATEDIFF(COALESCE(next_visit, '2021-01-01'), visit_date) AS window_days
  FROM ordered
)
SELECT user_id, MAX(window_days) AS biggest_window
FROM windows
GROUP BY user_id
ORDER BY user_id`

const PANDAS = `import pandas as pd

END = pd.Timestamp("2021-01-01")

def biggest_windows(visits):
    dated = visits.assign(visit_date=pd.to_datetime(visits["visit_date"]))
    ordered = dated.sort_values(["user_id", "visit_date"])
    next_visit = ordered.groupby("user_id")["visit_date"].shift(-1).fillna(END)
    ordered = ordered.assign(window_days=(next_visit - ordered["visit_date"]).dt.days)
    return (ordered.groupby("user_id", as_index=False)["window_days"].max()
                   .rename(columns={"window_days": "biggest_window"}))`

const SQL_LINES = SQL.split('\n')
const PY_LINES = PANDAS.split('\n')

const DAY = 86400000
const END = '2021-01-01'
const DATE_TEXT = /^\d{4}-\d{2}-\d{2}$/

function lineOf(lines, text) {
  const index = lines.findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`Missing line: ${text}`)
  return index + 1
}

const dayNumber = text => Date.parse(`${text}T00:00:00Z`) / DAY

export const sql = SQL
export const python = PANDAS
export const code = SQL_LINES.map((text, index) => ({ line: index + 1, text }))

const frame = (phase, sqlText, pyText, message, columns, rows) => ({
  phase,
  activeLine: lineOf(SQL_LINES, sqlText),
  pythonLine: lineOf(PY_LINES, pyText),
  message,
  columns: [...columns],
  rows: rows.map(row => ({ ...row })),
})

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || !Array.isArray(input.UserVisits) || input.UserVisits.length > 12) throw new Error('Use a UserVisits list of at most 12 rows.')
  const UserVisits = input.UserVisits.map(row => {
    if (!row || !Number.isInteger(row.user_id) || typeof row.visit_date !== 'string' || !DATE_TEXT.test(row.visit_date) || Number.isNaN(dayNumber(row.visit_date))) {
      throw new Error('Each visit needs an integer user_id and a visit_date written as YYYY-MM-DD.')
    }
    if (row.visit_date > END) throw new Error('Visits must be on or before 2021-01-01, the end of the observation window.')
    return { user_id: row.user_id, visit_date: row.visit_date }
  })
  return { UserVisits }
}

export function buildTrace({ UserVisits }) {
  const visitColumns = ['user_id', 'visit_date']
  const windowColumns = ['user_id', 'visit_date', 'window_days']
  const resultColumns = ['user_id', 'biggest_window']
  const frames = [frame('load', 'FROM UserVisits', 'def biggest_windows', `Read ${UserVisits.length} visits.`, visitColumns, UserVisits)]
  const sorted = [...UserVisits].sort((a, b) => a.user_id - b.user_id || (a.visit_date < b.visit_date ? -1 : a.visit_date > b.visit_date ? 1 : 0))
  const windows = []
  sorted.forEach((visit, index) => {
    const next = sorted[index + 1]
    const nextDate = next && next.user_id === visit.user_id ? next.visit_date : END
    const days = dayNumber(nextDate) - dayNumber(visit.visit_date)
    windows.push({ user_id: visit.user_id, visit_date: visit.visit_date, window_days: days })
    frames.push(frame('window', 'DATEDIFF(', 'next_visit = ',
      `Visit on ${visit.visit_date} by user ${visit.user_id} lasts ${days} days until ${nextDate === END && (!next || next.user_id !== visit.user_id) ? 'the end date' : 'the next visit'}.`,
      windowColumns, windows))
  })
  const best = new Map()
  for (const window of windows) best.set(window.user_id, Math.max(best.get(window.user_id) ?? 0, window.window_days))
  const result = [...best.entries()].sort((a, b) => a[0] - b[0]).map(([user_id, biggest_window]) => ({ user_id, biggest_window }))
  frames.push(frame('done', 'ORDER BY user_id', 'return (ordered', `Returned ${result.length} users.`, resultColumns, result))
  return { input: { UserVisits }, result, frames }
}
