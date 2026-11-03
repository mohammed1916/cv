// Knowledge-derived SQL walkthrough. The sample tables are invented for this visualization.
export const sql = `SELECT first_login AS login_date, COUNT(*) AS user_count
FROM (
  SELECT user_id, MIN(activity_date) AS first_login
  FROM Traffic
  WHERE activity = 'login'
  GROUP BY user_id
) f
WHERE first_login BETWEEN '2019-04-02' AND '2019-06-30'
GROUP BY first_login
ORDER BY first_login`

export const code = sql.split('\n').map((text, index) => ({ line: index + 1, text }))
const SQL = key => {
  const index = code.findIndex(line => line.text.includes(key))
  if (index < 0) throw new Error(`Missing SQL line: ${key}`)
  return index + 1
}

export const python = `def new_user_counts(traffic):
    logins = traffic[traffic["activity"] == "login"]
    first = logins.groupby("user_id")["activity_date"].min()
    window = first[(first >= "2019-04-02") & (first <= "2019-06-30")]
    counts = window.value_counts().sort_index()
    return [{"login_date": d, "user_count": int(c)} for d, c in counts.items()]`
const PY_LINES = python.split('\n')
const PY = key => {
  const index = PY_LINES.findIndex(line => line.includes(key))
  if (index < 0) throw new Error(`Missing Python line: ${key}`)
  return index + 1
}

const frame = (phase, sqlKey, pyKey, message, columns, rows, extra = {}) => ({
  phase, activeLine: SQL(sqlKey), pythonLine: PY(pyKey), message, columns, rows: rows.map(row => ({ ...row })), ...extra,
})

export const phases = [
  { id: 'load', label: 'Load', description: 'Read the traffic rows.' },
  { id: 'first', label: 'First login', description: 'Find each user first login across all history.' },
  { id: 'group', label: 'Group', description: 'Count first logins inside the window per day.' },
  { id: 'done', label: 'Result', description: 'Output one row per day.' },
]

export const inputLabel = 'Object with a Traffic table'
export const complexity = 'O(n) to find first logins and O(u log u) to order the days. The visualizer caps the table at 12 rows.'
export const examples = [{
  label: 'Sample',
  input: '{"Traffic":[{"user_id":1,"activity":"login","activity_date":"2019-03-01"},{"user_id":1,"activity":"login","activity_date":"2019-04-05"},{"user_id":2,"activity":"login","activity_date":"2019-04-02"},{"user_id":3,"activity":"login","activity_date":"2019-06-30"},{"user_id":4,"activity":"login","activity_date":"2019-06-16"},{"user_id":4,"activity":"login","activity_date":"2019-06-15"},{"user_id":5,"activity":"logout","activity_date":"2019-06-20"},{"user_id":6,"activity":"login","activity_date":"2019-06-15"},{"user_id":6,"activity":"logout","activity_date":"2019-06-18"}]}',
}]

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
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with a Traffic table.')
  return { Traffic: tableRows(input, 'Traffic', ['user_id', 'activity', 'activity_date']) }
}

// The 90-day window ends on 2019-06-30 and includes that day, so it starts on 2019-04-02.
const WINDOW_START = '2019-04-02'
const WINDOW_END = '2019-06-30'

export function buildTrace(input) {
  const { Traffic } = input
  const frames = []
  frames.push(frame('load', 'FROM Traffic', 'def ', 'Read the traffic rows.', ['user_id', 'activity', 'activity_date'], Traffic))

  const users = []
  const firstLogin = new Map()
  for (const row of Traffic) {
    if (row.activity !== 'login') continue
    const current = firstLogin.get(row.user_id)
    if (current === undefined) users.push(row.user_id)
    if (current === undefined || row.activity_date < current) firstLogin.set(row.user_id, row.activity_date)
  }
  const firstRows = []
  const inWindow = []
  for (const user of users) {
    const day = firstLogin.get(user)
    const ok = day >= WINDOW_START && day <= WINDOW_END
    firstRows.push({ user_id: user, first_login: day, in_window: ok ? 'yes' : 'no' })
    if (ok) inWindow.push(day)
    frames.push(frame('first', 'MIN(activity_date)', 'first =', `User ${user} first logged in on ${day}.`, ['user_id', 'first_login', 'in_window'], firstRows))
  }

  const counts = new Map()
  for (const day of inWindow) counts.set(day, (counts.get(day) ?? 0) + 1)
  const summary = []
  const result = []
  for (const day of [...counts.keys()].sort()) {
    summary.push({ login_date: day, user_count: counts.get(day) })
    result.push({ login_date: day, user_count: counts.get(day) })
    frames.push(frame('group', 'GROUP BY first_login', 'counts =', `${counts.get(day)} new user${counts.get(day) === 1 ? '' : 's'} on ${day}.`, ['login_date', 'user_count'], summary))
  }
  frames.push(frame('done', 'ORDER BY first_login', 'return', `Return ${result.length} day rows.`, ['login_date', 'user_count'], result))
  return { input, result, frames }
}
