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

export const sql = `SELECT activity_date AS day, COUNT(DISTINCT user_id) AS active_users
FROM Activity
WHERE activity_date BETWEEN '2019-06-28' AND '2019-07-27'
GROUP BY activity_date
ORDER BY activity_date`
const sqlLines = sql.split('\n')
export const code = sqlLines.map((text, index) => ({ line: index + 1, text }))
export const python = `import pandas as pd

def active_users_30_days(activity):
    window = activity[(activity["activity_date"] >= "2019-06-28") & (activity["activity_date"] <= "2019-07-27")]
    distinct = window[["activity_date", "user_id"]].drop_duplicates()
    counts = distinct.groupby("activity_date").size().reset_index(name="active_users")
    counts = counts.rename(columns={"activity_date": "day"})
    return counts.sort_values("day")`
const pyLines = python.split('\n')
const L = text => lineOf(sqlLines, text)
const P = text => lineOf(pyLines, text)
const frameAt = (phase, sqlText, pyText, message, columns, rows) => ({ phase, activeLine: L(sqlText), pythonLine: P(pyText), message, columns, rows: snap(rows) })

export const phases = [
  { id: 'load', label: 'Load', description: 'Read the activity rows.' },
  { id: 'window', label: 'Window', description: 'Keep 2019-06-28 through 2019-07-27.' },
  { id: 'distinct', label: 'Distinct', description: 'Keep one row per user and day.' },
  { id: 'group', label: 'Group', description: 'Count users for each day.' },
  { id: 'order', label: 'Order', description: 'Sort by day.' },
  { id: 'done', label: 'Result', description: 'Output the active counts.' },
]
export const inputLabel = 'JSON object with an activity table'
export const complexity = 'Linear in the activity rows, plus sorting the days that have activity.'
const COLS = ['user_id', 'session_id', 'activity_date', 'activity_type']
const START = '2019-06-28'
const END = '2019-07-27'
const SAMPLE = { activity: [
  { user_id: 5, session_id: 7, activity_date: '2019-07-18', activity_type: 'open_session' },
  { user_id: 5, session_id: 7, activity_date: '2019-07-18', activity_type: 'scroll_down' },
  { user_id: 5, session_id: 7, activity_date: '2019-07-18', activity_type: 'end_session' },
  { user_id: 6, session_id: 8, activity_date: '2019-07-18', activity_type: 'open_session' },
  { user_id: 6, session_id: 8, activity_date: '2019-07-19', activity_type: 'send_message' },
  { user_id: 7, session_id: 9, activity_date: '2019-07-19', activity_type: 'open_session' },
  { user_id: 7, session_id: 9, activity_date: '2019-06-26', activity_type: 'open_session' },
  { user_id: 8, session_id: 10, activity_date: '2019-06-29', activity_type: 'open_session' },
  { user_id: 8, session_id: 10, activity_date: '2019-07-30', activity_type: 'send_message' },
] }
export const examples = [{ label: 'Teaching sample', input: JSON.stringify(SAMPLE) }, { label: 'Single row', input: '{"activity":[{"user_id":1,"session_id":1,"activity_date":"2019-07-01","activity_type":"open_session"}]}' }, { label: 'Same user twice on one day counts once', input: '{"activity":[{"user_id":3,"session_id":4,"activity_date":"2019-07-10","activity_type":"scroll_down"},{"user_id":3,"session_id":4,"activity_date":"2019-07-10","activity_type":"end_session"},{"user_id":8,"session_id":9,"activity_date":"2019-07-10","activity_type":"open_session"},{"user_id":3,"session_id":5,"activity_date":"2019-06-27","activity_type":"open_session"}]}' }, { label: 'Window edges are inclusive', input: '{"activity":[{"user_id":1,"session_id":1,"activity_date":"2019-06-28","activity_type":"open_session"},{"user_id":2,"session_id":2,"activity_date":"2019-07-27","activity_type":"open_session"},{"user_id":3,"session_id":3,"activity_date":"2019-07-28","activity_type":"open_session"},{"user_id":4,"session_id":4,"activity_date":"2019-06-27","activity_type":"open_session"}]}' }, { label: 'Long run: 20 rows', input: '{"activity":[{"user_id":3,"session_id":3,"activity_date":"2019-07-21","activity_type":"open_session"},{"user_id":4,"session_id":13,"activity_date":"2019-06-25","activity_type":"send_message"},{"user_id":1,"session_id":4,"activity_date":"2019-07-09","activity_type":"scroll_down"},{"user_id":1,"session_id":12,"activity_date":"2019-06-28","activity_type":"scroll_down"},{"user_id":6,"session_id":8,"activity_date":"2019-07-17","activity_type":"open_session"},{"user_id":2,"session_id":11,"activity_date":"2019-07-24","activity_type":"end_session"},{"user_id":5,"session_id":10,"activity_date":"2019-06-24","activity_type":"open_session"},{"user_id":5,"session_id":6,"activity_date":"2019-08-01","activity_type":"send_message"},{"user_id":1,"session_id":18,"activity_date":"2019-07-08","activity_type":"scroll_down"},{"user_id":6,"session_id":19,"activity_date":"2019-07-08","activity_type":"scroll_down"},{"user_id":4,"session_id":7,"activity_date":"2019-07-19","activity_type":"open_session"},{"user_id":1,"session_id":2,"activity_date":"2019-07-12","activity_type":"open_session"},{"user_id":6,"session_id":4,"activity_date":"2019-08-04","activity_type":"scroll_down"},{"user_id":2,"session_id":6,"activity_date":"2019-08-01","activity_type":"scroll_down"},{"user_id":1,"session_id":8,"activity_date":"2019-07-24","activity_type":"scroll_down"},{"user_id":3,"session_id":10,"activity_date":"2019-06-24","activity_type":"end_session"},{"user_id":2,"session_id":10,"activity_date":"2019-06-29","activity_type":"send_message"},{"user_id":3,"session_id":16,"activity_date":"2019-07-07","activity_type":"scroll_down"},{"user_id":3,"session_id":7,"activity_date":"2019-06-28","activity_type":"end_session"},{"user_id":2,"session_id":9,"activity_date":"2019-06-29","activity_type":"scroll_down"}]}' }]

export function parseInput(text) {
  const input = parseJsonObject(text)
  requireRows(input, 'activity', COLS, 20)
  return input
}

export function buildTrace(input) {
  const activity = input.activity
  const frames = [frameAt('load', 'FROM Activity', 'def active_users_30_days', `Load ${activity.length} activity rows.`, COLS, activity)]
  const window = activity.filter(row => row.activity_date >= START && row.activity_date <= END)
  frames.push(frameAt('window', 'WHERE activity_date', 'window = activity', `${window.length} rows fall between ${START} and ${END}.`, COLS, window))
  const seen = new Set()
  const distinct = []
  for (const row of window) {
    const key = `${row.activity_date}|${row.user_id}`
    if (!seen.has(key)) { seen.add(key); distinct.push({ activity_date: row.activity_date, user_id: row.user_id }) }
  }
  frames.push(frameAt('distinct', 'COUNT(DISTINCT user_id)', 'distinct = window', 'A user with several actions on one day counts once.', ['activity_date', 'user_id'], distinct))
  const byDay = new Map()
  for (const row of distinct) byDay.set(row.activity_date, (byDay.get(row.activity_date) || 0) + 1)
  const counts = [...byDay].map(([day, active_users]) => ({ day, active_users }))
  frames.push(frameAt('group', 'GROUP BY activity_date', 'counts = distinct', 'Days with no active users never appear here.', ['day', 'active_users'], counts))
  const result = [...counts].sort((a, b) => (a.day < b.day ? -1 : a.day > b.day ? 1 : 0))
  frames.push(frameAt('order', 'ORDER BY activity_date', 'sort_values("day")', 'Sort the days ascending.', ['day', 'active_users'], result))
  frames.push(frameAt('done', 'SELECT activity_date AS day', 'return counts', 'Output day and active_users.', ['day', 'active_users'], result))
  return { input, result, frames }
}
