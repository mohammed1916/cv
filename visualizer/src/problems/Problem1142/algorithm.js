// Knowledge-derived teaching model. The sample tables are invented for this visualization.
export function snap(rows) {
  return rows.map(row => ({ ...row }))
}

export function lineOf(lines, text) {
  const index = lines.findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`Missing code line for: ${text}`)
  return index + 1
}

export function parseJsonObject(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use a JSON object whose keys name the tables.')
  return input
}

export function requireRows(input, name, columns, maxRows = 12) {
  const rows = input[name]
  if (!Array.isArray(rows) || rows.length > maxRows) throw new Error(`${name} must be a list of at most ${maxRows} rows.`)
  rows.forEach((row, index) => {
    if (!row || typeof row !== 'object' || Array.isArray(row)) throw new Error(`${name} row ${index + 1} must be an object.`)
    columns.forEach(column => { if (!(column in row)) throw new Error(`${name} row ${index + 1} needs ${column}.`) })
  })
  return rows
}

export const sql = `SELECT COALESCE(
  ROUND(COUNT(DISTINCT session_id) / NULLIF(COUNT(DISTINCT user_id), 0), 2),
  0) AS average_sessions_per_user
FROM Activity
WHERE activity_date BETWEEN '2019-06-28' AND '2019-07-27'`
const sqlLines = sql.split('\n')
export const code = sqlLines.map((text, index) => ({ line: index + 1, text }))
export const python = `import pandas as pd

def sessions_per_user(activity):
    window = activity[(activity["activity_date"] >= "2019-06-28") & (activity["activity_date"] <= "2019-07-27")]
    sessions = window["session_id"].nunique()
    users = window["user_id"].nunique()
    average = round(sessions / users, 2) if users else 0
    return pd.DataFrame({"average_sessions_per_user": [average]})`
const pyLines = python.split('\n')
const L = text => lineOf(sqlLines, text)
const P = text => lineOf(pyLines, text)
const frameAt = (phase, sqlText, pyText, message, columns, rows) => ({ phase, activeLine: L(sqlText), pythonLine: P(pyText), message, columns, rows: snap(rows) })

export const phases = [
  { id: 'load', label: 'Load', description: 'Read the activity rows.' },
  { id: 'window', label: 'Window', description: 'Keep the 30 days ending 2019-07-27.' },
  { id: 'sessions', label: 'Sessions', description: 'Count distinct sessions.' },
  { id: 'users', label: 'Users', description: 'Count distinct users.' },
  { id: 'divide', label: 'Divide', description: 'Divide sessions by users, or use zero.' },
  { id: 'done', label: 'Result', description: 'Output the rounded average.' },
]
export const inputLabel = 'JSON object with an activity table'
export const complexity = 'Linear in the activity rows; the distinct counts use one pass each.'
const COLS = ['user_id', 'session_id', 'activity_date', 'activity_type']
const SAMPLE = { activity: [
  { user_id: 5, session_id: 7, activity_date: '2019-07-18', activity_type: 'open_session' },
  { user_id: 5, session_id: 7, activity_date: '2019-07-18', activity_type: 'scroll_down' },
  { user_id: 5, session_id: 7, activity_date: '2019-07-18', activity_type: 'end_session' },
  { user_id: 6, session_id: 8, activity_date: '2019-07-18', activity_type: 'open_session' },
  { user_id: 6, session_id: 8, activity_date: '2019-07-19', activity_type: 'send_message' },
  { user_id: 7, session_id: 9, activity_date: '2019-07-19', activity_type: 'open_session' },
  { user_id: 7, session_id: 11, activity_date: '2019-07-20', activity_type: 'open_session' },
  { user_id: 7, session_id: 9, activity_date: '2019-06-26', activity_type: 'open_session' },
  { user_id: 8, session_id: 10, activity_date: '2019-06-29', activity_type: 'open_session' },
  { user_id: 8, session_id: 10, activity_date: '2019-07-30', activity_type: 'send_message' },
] }
export const examples = [{ label: 'Teaching sample', input: JSON.stringify(SAMPLE) }]

export function parseInput(text) {
  const input = parseJsonObject(text)
  requireRows(input, 'activity', COLS, 20)
  return input
}

export function buildTrace(input) {
  const activity = input.activity
  const frames = [frameAt('load', 'FROM Activity', 'def sessions_per_user', `Load ${activity.length} activity rows.`, COLS, activity)]
  const window = activity.filter(row => row.activity_date >= '2019-06-28' && row.activity_date <= '2019-07-27')
  frames.push(frameAt('window', 'WHERE activity_date', 'window = activity', `${window.length} rows are inside the window.`, COLS, window))
  const sessionIds = [...new Set(window.map(row => row.session_id))]
  frames.push(frameAt('sessions', 'COUNT(DISTINCT session_id)', 'sessions = window', `${sessionIds.length} distinct sessions.`, ['session_id'], sessionIds.map(session_id => ({ session_id }))))
  const userIds = [...new Set(window.map(row => row.user_id))]
  frames.push(frameAt('users', 'COUNT(DISTINCT user_id)', 'users = window', `${userIds.length} distinct users.`, ['user_id'], userIds.map(user_id => ({ user_id }))))
  const average = userIds.length ? Math.round((100 * sessionIds.length) / userIds.length) / 100 : 0
  frames.push(frameAt('divide', 'ROUND(COUNT', 'average = round', `${sessionIds.length} sessions divided by ${userIds.length} users.`, ['distinct_sessions', 'distinct_users', 'average_sessions_per_user'], [{ distinct_sessions: sessionIds.length, distinct_users: userIds.length, average_sessions_per_user: average }]))
  const result = [{ average_sessions_per_user: average }]
  frames.push(frameAt('done', 'SELECT COALESCE', 'return pd', 'Output average_sessions_per_user.', ['average_sessions_per_user'], result))
  return { input, result, frames }
}
