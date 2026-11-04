// Knowledge-derived teaching model. The SQL, pandas code, sample rows and wording were written for this visualizer.
const SQL = `WITH daily AS (
  SELECT user_id, action_date, MIN(action) AS action
  FROM activity
  GROUP BY user_id, action_date
  HAVING COUNT(DISTINCT action) = 1
), islands AS (
  SELECT user_id, action, action_date,
    DATE_SUB(action_date, INTERVAL ROW_NUMBER() OVER w DAY) AS grp
  FROM daily
  WINDOW w AS (PARTITION BY user_id, action ORDER BY action_date)
), runs AS (
  SELECT user_id, action, MIN(action_date) AS start_date, MAX(action_date) AS end_date,
    COUNT(*) AS streak_length
  FROM islands
  GROUP BY user_id, action, grp
  HAVING COUNT(*) >= 5
), best AS (
  SELECT *, ROW_NUMBER() OVER (PARTITION BY user_id
    ORDER BY streak_length DESC, action ASC, start_date DESC) AS rk
  FROM runs
)
SELECT user_id, action, streak_length, start_date, end_date
FROM best
WHERE rk = 1
ORDER BY streak_length DESC, user_id ASC`

export const code = SQL.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `import pandas as pd

def persistent_patterns(activity):
    daily = activity.groupby(["user_id", "action_date"])["action"].agg(["min", "nunique"]).reset_index()
    daily = daily[daily["nunique"] == 1].rename(columns={"min": "action"})
    daily = daily.sort_values(["user_id", "action", "action_date"])
    daily["day_no"] = pd.to_datetime(daily["action_date"]).map(lambda d: d.toordinal())
    daily["island"] = daily["day_no"] - daily.groupby(["user_id", "action"]).cumcount()
    runs = (daily.groupby(["user_id", "action", "island"])
                 .agg(start_date=("action_date", "min"), end_date=("action_date", "max"), streak_length=("action_date", "size"))
                 .reset_index())
    runs = runs[runs["streak_length"] >= 5]
    runs = runs.sort_values(["user_id", "streak_length", "action", "start_date"], ascending=[True, False, True, False])
    best = runs.drop_duplicates("user_id")
    return best.sort_values(["streak_length", "user_id"], ascending=[False, True])[["user_id", "action", "streak_length", "start_date", "end_date"]]`

const sqlLines = code.map(entry => entry.text)
const pythonLines = python.split('\n')

function lineOf(lines, fragment) {
  const index = lines.findIndex(text => text.includes(fragment))
  if (index < 0) throw new Error(`No line contains "${fragment}"`)
  return index + 1
}

const COLUMNS_ACTIVITY = ['user_id', 'action_date', 'action']
const COLUMNS_RUNS = ['user_id', 'action', 'streak_length', 'start_date', 'end_date']

const DATE = /^\d{4}-\d{2}-\d{2}$/
const dayNumber = date => Date.parse(`${date}T00:00:00Z`) / 86400000

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || !Array.isArray(input.activity)) throw new Error('Use an object with an activity list.')
  if (input.activity.length > 80) throw new Error('Keep at most 80 activity rows.')
  const seen = new Set()
  for (const row of input.activity) {
    if (!Number.isInteger(row.user_id)) throw new Error('user_id is an integer.')
    if (typeof row.action_date !== 'string' || !DATE.test(row.action_date)) throw new Error('action_date is YYYY-MM-DD.')
    if (typeof row.action !== 'string' || row.action.length === 0) throw new Error('action is non-empty text.')
    const key = `${row.user_id}|${row.action_date}|${row.action}`
    if (seen.has(key)) throw new Error('Each user, date and action appears once.')
    seen.add(key)
  }
  return input
}

export function buildTrace(input) {
  const rows = input.activity
  const frames = []
  const push = (phase, sql, py, message, columns, tableRows) => frames.push({
    phase,
    activeLine: lineOf(sqlLines, sql),
    pythonLine: lineOf(pythonLines, py),
    message,
    table: { columns, rows: tableRows },
  })

  push('load', 'FROM activity', 'def persistent_patterns', `Load ${rows.length} activity rows.`, COLUMNS_ACTIVITY, rows)

  // A user-day with exactly one distinct action is a usable day; any other day breaks a run.
  const byDay = new Map()
  for (const row of rows) {
    const key = `${row.user_id}|${row.action_date}`
    if (!byDay.has(key)) byDay.set(key, new Set())
    byDay.get(key).add(row.action)
  }
  const singles = rows
    .filter(row => byDay.get(`${row.user_id}|${row.action_date}`).size === 1)
    .map(row => ({ user_id: row.user_id, action_date: row.action_date, action: row.action }))
    .sort((a, b) => a.user_id - b.user_id || (a.action_date < b.action_date ? -1 : a.action_date > b.action_date ? 1 : 0))
  const mixed = [...byDay.values()].filter(set => set.size > 1).length
  push('days', 'HAVING COUNT(DISTINCT action) = 1', 'daily = activity', `${mixed} user-day${mixed === 1 ? '' : 's'} with several actions break runs; ${singles.length} single-action days remain.`, COLUMNS_ACTIVITY, singles)

  const runs = []
  let current = null
  for (const single of singles) {
    const day = dayNumber(single.action_date)
    if (current && current.user_id === single.user_id && current.action === single.action && day === current.last + 1) {
      current.last = day
      current.end_date = single.action_date
      current.streak_length += 1
    } else {
      if (current) runs.push(current)
      current = { user_id: single.user_id, action: single.action, streak_length: 1, start_date: single.action_date, end_date: single.action_date, last: day }
    }
  }
  if (current) runs.push(current)
  const publish = run => ({ user_id: run.user_id, action: run.action, streak_length: run.streak_length, start_date: run.start_date, end_date: run.end_date })

  const kept = []
  for (const run of runs) {
    const ok = run.streak_length >= 5
    if (ok) kept.push(publish(run))
    push('run', 'HAVING COUNT(*) >= 5', 'runs = runs[', `User ${run.user_id}, ${run.action} from ${run.start_date}: ${run.streak_length} days, ${ok ? 'kept' : 'too short'}.`, COLUMNS_RUNS, [...kept])
    frames[frames.length - 1].focus = { user_id: run.user_id, start: run.start_date, end: run.end_date }
  }

  const ordered = [...kept].sort((a, b) => a.user_id - b.user_id
    || b.streak_length - a.streak_length
    || (a.action < b.action ? -1 : a.action > b.action ? 1 : 0)
    || (a.start_date < b.start_date ? 1 : a.start_date > b.start_date ? -1 : 0))
  const chosen = []
  for (const run of ordered) {
    if (chosen.some(entry => entry.user_id === run.user_id)) continue
    chosen.push(run)
    push('choose', 'ROW_NUMBER() OVER (PARTITION BY user_id', 'best = runs.drop_duplicates', `User ${run.user_id}: keep ${run.action} for ${run.streak_length} days from ${run.start_date}.`, COLUMNS_RUNS, [...chosen])
    frames[frames.length - 1].focus = { user_id: run.user_id, start: run.start_date, end: run.end_date }
  }

  const result = [...chosen].sort((a, b) => b.streak_length - a.streak_length || a.user_id - b.user_id)
  push('order', 'ORDER BY streak_length DESC', 'return best.sort_values', 'Sort by length descending, then user ascending.', COLUMNS_RUNS, result)
  push('done', 'WHERE rk = 1', 'return best.sort_values', 'The result rows are ready.', COLUMNS_RUNS, result)

  return { input, result, frames }
}

const day = (base, offset) => new Date(Date.parse(`${base}T00:00:00Z`) + offset * 86400000).toISOString().slice(0, 10)
const span = (user_id, action, start, count) => Array.from({ length: count }, (_, k) => ({ user_id, action_date: day(start, k), action }))

export const sampleInput = {
  activity: [
    ...span(1, 'view', '2024-01-01', 6), ...span(1, 'view', '2024-01-10', 5),
    ...span(2, 'click', '2024-02-01', 5), ...span(2, 'buy', '2024-02-06', 5),
    { user_id: 2, action_date: '2024-02-11', action: 'buy' }, { user_id: 2, action_date: '2024-02-11', action: 'view' },
    ...span(3, 'search', '2024-03-01', 4),
    { user_id: 3, action_date: '2024-03-05', action: 'search' }, { user_id: 3, action_date: '2024-03-05', action: 'exit' },
    ...span(3, 'search', '2024-03-06', 6),
    ...span(4, 'share', '2024-04-01', 5), ...span(4, 'comment', '2024-04-06', 2),
    ...span(5, 'x', '2024-05-01', 5), ...span(5, 'x', '2024-05-10', 5),
  ],
}

export const sampleText = JSON.stringify(sampleInput)
