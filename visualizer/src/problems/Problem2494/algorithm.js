// Knowledge-derived teaching model. The sample table is invented for this visualization.
// Teaching rule: events are inclusive day ranges. Two events merge only when they share at least one day.
// Events that touch end-to-start (for example days 1 to 2 and days 3 to 5) stay separate in this model.

export function lineOf(lines, text) {
  const index = lines.findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`Missing code line for: ${text}`)
  return index + 1
}

export const sql = `WITH ordered AS (
  SELECT hall_id, start_day, end_day,
         MAX(end_day) OVER (PARTITION BY hall_id ORDER BY start_day, end_day
                            ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING) AS prev_max_end
  FROM HallEvents
),
flagged AS (
  SELECT hall_id, start_day, end_day,
         CASE WHEN prev_max_end IS NULL OR start_day > prev_max_end THEN 1 ELSE 0 END AS new_group
  FROM ordered
),
numbered AS (
  SELECT hall_id, start_day, end_day,
         SUM(new_group) OVER (PARTITION BY hall_id ORDER BY start_day, end_day) AS grp
  FROM flagged
)
SELECT hall_id, MIN(start_day) AS start_day, MAX(end_day) AS end_day
FROM numbered
GROUP BY hall_id, grp
ORDER BY hall_id, start_day`
const sqlLines = sql.split('\n')
export const code = sqlLines.map((text, index) => ({ line: index + 1, text }))

export const python = `import pandas as pd

def merge_hall_events(hall_events):
    ev = hall_events.sort_values(["hall_id", "start_day", "end_day"]).reset_index(drop=True)
    ev["prev_max_end"] = ev.groupby("hall_id")["end_day"].transform(lambda s: s.cummax().shift(1))
    ev["new_group"] = ev["prev_max_end"].isna() | (ev["start_day"] > ev["prev_max_end"])
    ev["grp"] = ev.groupby("hall_id")["new_group"].cumsum()
    merged = ev.groupby(["hall_id", "grp"], as_index=False).agg(start_day=("start_day", "min"), end_day=("end_day", "max"))
    return merged[["hall_id", "start_day", "end_day"]].sort_values(["hall_id", "start_day"]).reset_index(drop=True)`
const pyLines = python.split('\n')
const sqlLn = text => lineOf(sqlLines, text)
const pyLn = text => lineOf(pyLines, text)

export const phases = [
  { id: 'load', label: 'Events', description: 'Read the event rows.' },
  { id: 'order', label: 'Order', description: 'Sort each hall by start day and track the furthest end so far.' },
  { id: 'flag', label: 'Flag', description: 'Start a new group when an event begins after that furthest end.' },
  { id: 'number', label: 'Number', description: 'Count the groups inside each hall.' },
  { id: 'done', label: 'Result', description: 'Output one row per merged interval.' },
]

const EVENT_COLS = ['hall_id', 'start_day', 'end_day']
const ORDER_COLS = ['hall_id', 'start_day', 'end_day', 'prev_max_end']
const FLAG_COLS = ['hall_id', 'start_day', 'end_day', 'prev_max_end', 'new_group']
const NUMBER_COLS = ['hall_id', 'start_day', 'end_day', 'new_group', 'grp']
const RESULT_COLS = ['hall_id', 'start_day', 'end_day']

function frameAt(phase, sqlText, pyText, message, columns, rows) {
  return { phase, activeLine: sqlLn(sqlText), pythonLine: pyLn(pyText), message, columns, rows: rows.map(row => ({ ...row })) }
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input) || !Array.isArray(input.HallEvents)) {
    throw new Error('Use a JSON object with a HallEvents list.')
  }
  if (input.HallEvents.length > 14) throw new Error('HallEvents must have at most 14 rows.')
  input.HallEvents.forEach((row, index) => {
    for (const column of EVENT_COLS) if (!(column in row)) throw new Error(`HallEvents row ${index + 1} needs ${column}.`)
    if (!Number.isInteger(row.start_day) || !Number.isInteger(row.end_day) || row.start_day < 1 || row.end_day < row.start_day) {
      throw new Error(`HallEvents row ${index + 1} needs whole days with 1 <= start_day <= end_day.`)
    }
  })
  return input
}

export function buildTrace(input) {
  const events = input.HallEvents
  const frames = [frameAt('load', 'FROM HallEvents', 'def merge_hall_events', `Load ${events.length} events.`, EVENT_COLS, events)]

  const sorted = [...events].sort((a, b) => a.hall_id - b.hall_id || a.start_day - b.start_day || a.end_day - b.end_day)
  const ordered = []
  let furthest = null
  let currentHall = null
  for (const row of sorted) {
    if (row.hall_id !== currentHall) { currentHall = row.hall_id; furthest = null }
    ordered.push({ hall_id: row.hall_id, start_day: row.start_day, end_day: row.end_day, prev_max_end: furthest })
    furthest = furthest === null ? row.end_day : Math.max(furthest, row.end_day)
  }
  frames.push(frameAt('order', 'MAX(end_day) OVER', 'ev = hall_events.sort_values', 'Each event sees the furthest end of the events before it in its hall.', ORDER_COLS, ordered))

  const flagged = ordered.map(row => ({ ...row, new_group: row.prev_max_end === null || row.start_day > row.prev_max_end ? 1 : 0 }))
  frames.push(frameAt('flag', 'CASE WHEN prev_max_end IS NULL', 'ev["new_group"] =', 'An event that starts after the furthest end begins a new group. A shared day joins the group.', FLAG_COLS, flagged))

  const numbered = []
  let grp = 0
  let hall = null
  for (const row of flagged) {
    if (row.hall_id !== hall) { hall = row.hall_id; grp = 0 }
    grp += row.new_group
    numbered.push({ hall_id: row.hall_id, start_day: row.start_day, end_day: row.end_day, new_group: row.new_group, grp })
  }
  frames.push(frameAt('number', 'SUM(new_group) OVER', 'ev["grp"] =', 'A running count of new groups gives each event its group number within the hall.', NUMBER_COLS, numbered))

  const byGroup = new Map()
  for (const row of numbered) {
    const key = `${row.hall_id}|${row.grp}`
    const group = byGroup.get(key) || { hall_id: row.hall_id, start_day: row.start_day, end_day: row.end_day }
    group.start_day = Math.min(group.start_day, row.start_day)
    group.end_day = Math.max(group.end_day, row.end_day)
    byGroup.set(key, group)
  }
  const result = [...byGroup.values()].sort((a, b) => a.hall_id - b.hall_id || a.start_day - b.start_day)
  frames.push(frameAt('done', 'ORDER BY hall_id, start_day', 'return merged', 'Output one row for each merged interval.', RESULT_COLS, result))
  return { input, result, frames }
}
