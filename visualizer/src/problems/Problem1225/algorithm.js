// Teaching walkthrough: number the rows inside each state, subtract that number from the date, and rows that share the result form one run.
export const phases = [
  { id: 'load', label: 'Filter', description: 'Keep only the 2019 outcomes, in date order.' },
  { id: 'extend', label: 'Extend', description: 'A consecutive day with the same state continues the run.' },
  { id: 'start', label: 'New run', description: 'A new state or a missing day starts a run.' },
  { id: 'done', label: 'Result', description: 'Group the runs and report each period.' },
]

const SQL_SOURCE = `WITH all_days AS (
  SELECT fail_date AS day, 'failed' AS state FROM Failed WHERE fail_date BETWEEN '2019-01-01' AND '2019-12-31'
  UNION ALL
  SELECT success_date, 'succeeded' FROM Succeeded WHERE success_date BETWEEN '2019-01-01' AND '2019-12-31'
), numbered AS (
  SELECT day, state, DATE_SUB(day, INTERVAL ROW_NUMBER() OVER (PARTITION BY state ORDER BY day) DAY) AS grp FROM all_days
)
SELECT state AS period_state, MIN(day) AS start_date, MAX(day) AS end_date
FROM numbered
GROUP BY state, grp
ORDER BY start_date;`

const PY_SOURCE = `import pandas as pd

def contiguous_dates(failed, succeeded):
    events = pd.concat([
        failed.rename(columns={"fail_date": "day"}).assign(state="failed"),
        succeeded.rename(columns={"success_date": "day"}).assign(state="succeeded"),
    ])
    events["day"] = pd.to_datetime(events["day"])
    events = events[events["day"].dt.year == 2019].sort_values(["state", "day"])
    events["rn"] = events.groupby("state").cumcount() + 1
    events["grp"] = events["day"] - pd.to_timedelta(events["rn"], unit="D")
    runs = events.groupby(["state", "grp"], as_index=False).agg(start_date=("day", "min"), end_date=("day", "max"))
    runs = runs.rename(columns={"state": "period_state"})
    return runs.sort_values("start_date").reset_index(drop=True)`

const SQL_LINES = SQL_SOURCE.split('\n').map((text, index) => ({ line: index + 1, text }))
const PY_LINES = PY_SOURCE.split('\n').map((text, index) => ({ line: index + 1, text }))
export const code = SQL_LINES
export const sql = SQL_SOURCE
export const python = PY_SOURCE

const RUN_COLUMNS = ['period_state', 'start_date', 'end_date']
const EVENT_COLUMNS = ['day', 'state']
const at = (lines, fragment) => {
  const hit = lines.find(line => line.text.includes(fragment))
  if (!hit) throw new Error(`No line contains "${fragment}"`)
  return hit.line
}
const copy = rows => JSON.parse(JSON.stringify(rows))
const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/
const dayNumber = iso => Date.parse(`${iso}T00:00:00Z`) / 86400000

export function parseInput(text) {
  const input = JSON.parse(text)
  const { failed, succeeded } = input ?? {}
  if (!Array.isArray(failed) || !Array.isArray(succeeded) || failed.length > 12 || succeeded.length > 12) throw new Error('failed and succeeded are lists of at most 12 rows.')
  const seen = new Set()
  const check = day => {
    if (typeof day !== 'string' || !ISO_DAY.test(day) || Number.isNaN(dayNumber(day))) throw new Error('Dates use the YYYY-MM-DD form.')
    if (seen.has(day)) throw new Error('Each date has exactly one outcome.')
    seen.add(day)
    return day
  }
  return {
    failed: failed.map(row => ({ fail_date: check(row?.fail_date) })),
    succeeded: succeeded.map(row => ({ success_date: check(row?.success_date) })),
  }
}

export function buildTrace(input) {
  const { failed, succeeded } = input
  const all = [
    ...failed.map(row => ({ day: row.fail_date, state: 'failed' })),
    ...succeeded.map(row => ({ day: row.success_date, state: 'succeeded' })),
  ].sort((a, b) => (a.day < b.day ? -1 : a.day > b.day ? 1 : 0))
  const events = all.filter(event => event.day.startsWith('2019-'))
  const dropped = all.length - events.length
  const frames = []
  const runs = []
  const push = (phase, sqlFragment, pyFragment, message, rows, columns) => frames.push({
    phase, activeLine: at(SQL_LINES, sqlFragment), pythonLine: at(PY_LINES, pyFragment),
    message, columns, rows: copy(rows),
  })
  push('load', 'FROM Failed WHERE', 'def contiguous_dates', `Keep ${events.length} rows from 2019${dropped ? `; ${dropped} outside 2019 are dropped` : ''}.`, events, EVENT_COLUMNS)
  for (const event of events) {
    const current = runs.at(-1)
    if (current && current.period_state === event.state && dayNumber(event.day) === dayNumber(current.end_date) + 1) {
      current.end_date = event.day
      push('extend', 'ROW_NUMBER()', 'events["rn"] = ', `${event.day} continues the ${event.state} run.`, runs, RUN_COLUMNS)
    } else {
      runs.push({ period_state: event.state, start_date: event.day, end_date: event.day })
      push('start', 'ROW_NUMBER()', 'events["rn"] = ', `${event.day} starts a ${event.state} run.`, runs, RUN_COLUMNS)
    }
  }
  runs.sort((a, b) => (a.start_date < b.start_date ? -1 : a.start_date > b.start_date ? 1 : 0))
  push('done', 'ORDER BY start_date', 'return runs.sort_values', 'Each run is one row: its state, first day and last day.', runs, RUN_COLUMNS)
  return { input, result: copy(runs), columns: RUN_COLUMNS, frames }
}
