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

export const sql = `WITH spam AS (
  SELECT DISTINCT action_date, post_id
  FROM Actions
  WHERE action = 'report' AND extra = 'spam'
),
flagged AS (
  SELECT s.action_date, s.post_id,
         MAX(CASE WHEN r.post_id IS NULL THEN 0 ELSE 1 END) AS removed
  FROM spam s
  LEFT JOIN Removals r ON r.post_id = s.post_id
  GROUP BY s.action_date, s.post_id
),
daily AS (
  SELECT action_date, 100.0 * SUM(removed) / COUNT(*) AS pct
  FROM flagged
  GROUP BY action_date
)
SELECT ROUND(AVG(pct), 2) AS average_daily_percent
FROM daily`
const sqlLines = sql.split('\n')
export const code = sqlLines.map((text, index) => ({ line: index + 1, text }))
export const python = `import pandas as pd

def reported_posts_ii(actions, removals):
    spam = actions[(actions["action"] == "report") & (actions["extra"] == "spam")][["action_date", "post_id"]].drop_duplicates()
    removed_ids = set(removals["post_id"])
    spam = spam.assign(removed=spam["post_id"].isin(removed_ids))
    daily = spam.groupby("action_date")["removed"].mean() * 100
    average = round(daily.mean(), 2)
    return pd.DataFrame({"average_daily_percent": [average]})`
const pyLines = python.split('\n')
const L = text => lineOf(sqlLines, text)
const P = text => lineOf(pyLines, text)
const frameAt = (phase, sqlText, pyText, message, columns, rows) => ({ phase, activeLine: L(sqlText), pythonLine: P(pyText), message, columns, rows: snap(rows) })

export const phases = [
  { id: 'load', label: 'Load', description: 'Read the action and removal rows.' },
  { id: 'spam', label: 'Spam', description: 'Keep distinct spam reports per day and post.' },
  { id: 'flag', label: 'Removed?', description: 'Mark each reported post as removed or not.' },
  { id: 'daily', label: 'Daily %', description: 'Compute the removed share for each day.' },
  { id: 'average', label: 'Average', description: 'Average the daily percentages.' },
  { id: 'done', label: 'Result', description: 'Output the rounded average.' },
]
export const inputLabel = 'JSON object with actions and removals tables'
export const complexity = 'Linear in the report and removal rows, plus one pass over each day.'
const ACTION_COLS = ['user_id', 'post_id', 'action_date', 'action', 'extra']
const REMOVAL_COLS = ['post_id', 'remove_date']
const SAMPLE = {
  actions: [
    { user_id: 1, post_id: 1, action_date: '2019-07-04', action: 'report', extra: 'spam' },
    { user_id: 2, post_id: 1, action_date: '2019-07-04', action: 'report', extra: 'spam' },
    { user_id: 3, post_id: 2, action_date: '2019-07-04', action: 'report', extra: 'spam' },
    { user_id: 1, post_id: 3, action_date: '2019-07-04', action: 'report', extra: 'abuse' },
    { user_id: 1, post_id: 4, action_date: '2019-07-05', action: 'report', extra: 'spam' },
    { user_id: 2, post_id: 5, action_date: '2019-07-05', action: 'report', extra: 'spam' },
    { user_id: 4, post_id: 6, action_date: '2019-07-06', action: 'report', extra: 'abuse' },
  ],
  removals: [
    { post_id: 1, remove_date: '2019-07-05' },
    { post_id: 5, remove_date: '2019-07-06' },
    { post_id: 2, remove_date: '2019-07-09' },
  ],
}
export const examples = [
  { label: 'Teaching sample', input: JSON.stringify(SAMPLE) },
  { label: 'Single report, no removal', input: '{"actions":[{"user_id":1,"post_id":1,"action_date":"2019-07-04","action":"report","extra":"spam"}],"removals":[]}' },
  { label: 'Removal on the same day is kept', input: '{"actions":[{"user_id":1,"post_id":1,"action_date":"2019-07-04","action":"report","extra":"spam"},{"user_id":2,"post_id":2,"action_date":"2019-07-04","action":"report","extra":"spam"}],"removals":[{"post_id":1,"remove_date":"2019-07-04"}]}' },
  { label: 'Long run: 12 actions, 4 removals', input: '{"actions":[{"user_id":3,"post_id":5,"action_date":"2019-07-04","action":"report","extra":"abuse"},{"user_id":1,"post_id":3,"action_date":"2019-07-04","action":"view","extra":"abuse"},{"user_id":4,"post_id":3,"action_date":"2019-07-05","action":"report","extra":"spam"},{"user_id":2,"post_id":5,"action_date":"2019-07-04","action":"report","extra":"abuse"},{"user_id":1,"post_id":1,"action_date":"2019-07-05","action":"view","extra":"spam"},{"user_id":1,"post_id":1,"action_date":"2019-07-04","action":"view","extra":"abuse"},{"user_id":4,"post_id":5,"action_date":"2019-07-05","action":"view","extra":"abuse"},{"user_id":3,"post_id":3,"action_date":"2019-07-05","action":"report","extra":"spam"},{"user_id":1,"post_id":3,"action_date":"2019-07-04","action":"report","extra":"spam"},{"user_id":4,"post_id":4,"action_date":"2019-07-05","action":"report","extra":"abuse"},{"user_id":4,"post_id":2,"action_date":"2019-07-04","action":"view","extra":"spam"},{"user_id":2,"post_id":4,"action_date":"2019-07-04","action":"report","extra":"spam"}],"removals":[{"post_id":3,"remove_date":"2019-07-05"},{"post_id":4,"remove_date":"2019-07-04"},{"post_id":2,"remove_date":"2019-07-05"},{"post_id":5,"remove_date":"2019-07-05"}]}' },
]

export function parseInput(text) {
  const input = parseJsonObject(text)
  requireRows(input, 'actions', ACTION_COLS)
  requireRows(input, 'removals', REMOVAL_COLS)
  return input
}

export function buildTrace(input) {
  const { actions, removals } = input
  const frames = [frameAt('load', 'WITH spam AS', 'def reported_posts_ii', `Load ${actions.length} action rows and ${removals.length} removals.`, ACTION_COLS, actions)]
  const seen = new Set()
  const spam = []
  for (const row of actions) {
    if (row.action !== 'report' || row.extra !== 'spam') continue
    const key = `${row.action_date}|${row.post_id}`
    if (!seen.has(key)) { seen.add(key); spam.push({ action_date: row.action_date, post_id: row.post_id }) }
  }
  frames.push(frameAt('spam', 'AND extra = ', 'spam = actions', `${spam.length} distinct spam reports remain.`, ['action_date', 'post_id'], spam))
  const removed = new Set(removals.map(row => row.post_id))
  const flagged = spam.map(row => ({ ...row, removed: removed.has(row.post_id) ? 1 : 0 }))
  frames.push(frameAt('flag', 'LEFT JOIN Removals', 'spam = spam.assign', 'A post counts as removed when any removal row names it.', ['action_date', 'post_id', 'removed'], flagged))
  const days = new Map()
  for (const row of flagged) {
    const day = days.get(row.action_date) || { total: 0, gone: 0 }
    day.total += 1
    day.gone += row.removed
    days.set(row.action_date, day)
  }
  const daily = [...days].sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)).map(([action_date, day]) => ({ action_date, pct: (100 * day.gone) / day.total }))
  frames.push(frameAt('daily', 'GROUP BY action_date', 'daily = spam', `${daily.length} days each get a removed percentage.`, ['action_date', 'pct'], daily))
  const mean = daily.length ? daily.reduce((sum, row) => sum + row.pct, 0) / daily.length : 0
  const average = Math.round(mean * 100) / 100
  frames.push(frameAt('average', 'SELECT ROUND(AVG', 'average = round', 'Average the daily percentages and round to two decimals.', ['average_daily_percent'], [{ average_daily_percent: average }]))
  const result = [{ average_daily_percent: average }]
  frames.push(frameAt('done', 'FROM daily', 'return pd', 'Output average_daily_percent.', ['average_daily_percent'], result))
  return { input, result, frames }
}
