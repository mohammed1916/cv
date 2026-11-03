// Knowledge-derived teaching model. The sample tables are invented for this visualization.
// Teaching rule: per age bucket, the share of send and open time among only those two activity types, rounded to two decimals.
export const sql = `SELECT a.age_bucket,
       ROUND(100.0 * SUM(CASE WHEN t.activity_type = 'send' THEN t.time_spent ELSE 0 END) / SUM(t.time_spent), 2) AS send_perc,
       ROUND(100.0 * SUM(CASE WHEN t.activity_type = 'open' THEN t.time_spent ELSE 0 END) / SUM(t.time_spent), 2) AS open_perc
FROM Activities t
JOIN Age a ON a.user_id = t.user_id
WHERE t.activity_type IN ('send', 'open')
GROUP BY a.age_bucket
ORDER BY a.age_bucket`

export const python = `import pandas as pd

def snap_split(activities, age):
    joined = activities.merge(age, on="user_id")
    joined = joined[joined["activity_type"].isin(["send", "open"])]
    totals = joined.groupby("age_bucket")["time_spent"].sum()
    send = joined[joined["activity_type"] == "send"].groupby("age_bucket")["time_spent"].sum().reindex(totals.index, fill_value=0)
    open_ = joined[joined["activity_type"] == "open"].groupby("age_bucket")["time_spent"].sum().reindex(totals.index, fill_value=0)
    out = pd.DataFrame({"send_perc": (100 * send / totals).round(2), "open_perc": (100 * open_ / totals).round(2)})
    return out.reset_index().sort_values("age_bucket")`

const sqlLines = sql.split('\n')
const pyLines = python.split('\n')
export const code = sqlLines.map((text, index) => ({ line: index + 1, text }))

function lineOf(lines, text) {
  const index = lines.findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`Missing code line for: ${text}`)
  return index + 1
}
const L = text => lineOf(sqlLines, text)
const P = text => lineOf(pyLines, text)
const frame = (phase, sqlText, pyText, message, columns, rows) => ({
  phase, activeLine: L(sqlText), pythonLine: P(pyText), message, columns, rows: rows.map(row => ({ ...row })),
})

export const phases = [
  { id: 'load', label: 'Load', description: 'Read the activity rows.' },
  { id: 'join', label: 'Join', description: 'Attach each user’s age bucket.' },
  { id: 'filter', label: 'Filter', description: 'Keep only send and open rows.' },
  { id: 'group', label: 'Group', description: 'Add up the time per bucket.' },
  { id: 'percent', label: 'Percent', description: 'Divide send and open time by the total.' },
  { id: 'order', label: 'Order', description: 'Sort by age bucket.' },
  { id: 'done', label: 'Result', description: 'Output the two percentages.' },
]

const ACT_COLS = ['activity_id', 'user_id', 'activity_type', 'time_spent']
const JOIN_COLS = ['age_bucket', 'user_id', 'activity_type', 'time_spent']
const GROUP_COLS = ['age_bucket', 'send_time', 'open_time', 'total_time']
const PERC_COLS = ['age_bucket', 'send_perc', 'open_perc']
const round2 = value => Number(value.toFixed(2))

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input) || !Array.isArray(input.Activities) || !Array.isArray(input.Age)) {
    throw new Error('Use an object with Activities and Age lists.')
  }
  if (input.Activities.length > 14 || input.Age.length > 10) throw new Error('Activities has at most 14 rows and Age at most 10.')
  for (const row of input.Activities) {
    if (!Number.isInteger(row?.activity_id) || !Number.isInteger(row.user_id) || typeof row.activity_type !== 'string' || !Number.isInteger(row.time_spent) || row.time_spent < 1) {
      throw new Error('Each activity needs integer activity_id, user_id and time_spent (at least 1) and a text activity_type.')
    }
  }
  for (const row of input.Age) {
    if (typeof row?.age_bucket !== 'string' || !row.age_bucket || !Number.isInteger(row.user_id)) throw new Error('Each age row needs a text age_bucket and an integer user_id.')
  }
  return {
    Activities: input.Activities.map(row => ({ activity_id: row.activity_id, user_id: row.user_id, activity_type: row.activity_type, time_spent: row.time_spent })),
    Age: input.Age.map(row => ({ age_bucket: row.age_bucket, user_id: row.user_id })),
  }
}

export function buildTrace(input) {
  const { Activities, Age } = input
  const frames = [frame('load', 'FROM Activities', 'def snap_split', `Load ${Activities.length} activity rows.`, ACT_COLS, Activities)]
  const bucketOf = new Map(Age.map(row => [row.user_id, row.age_bucket]))
  const joined = Activities.filter(row => bucketOf.has(row.user_id)).map(row => ({
    age_bucket: bucketOf.get(row.user_id), user_id: row.user_id, activity_type: row.activity_type, time_spent: row.time_spent,
  }))
  frames.push(frame('join', 'JOIN Age a', 'joined = activities.merge', `${joined.length} activity rows have an age bucket.`, JOIN_COLS, joined))
  const kept = joined.filter(row => row.activity_type === 'send' || row.activity_type === 'open')
  frames.push(frame('filter', 'WHERE t.activity_type', 'joined = joined[', 'Other activity types stay out of the denominator.', JOIN_COLS, kept))
  const buckets = [...new Set(kept.map(row => row.age_bucket))].sort()
  const groups = buckets.map(bucket => {
    const rows = kept.filter(row => row.age_bucket === bucket)
    const sendTime = rows.filter(row => row.activity_type === 'send').reduce((sum, row) => sum + row.time_spent, 0)
    const openTime = rows.filter(row => row.activity_type === 'open').reduce((sum, row) => sum + row.time_spent, 0)
    return { age_bucket: bucket, send_time: sendTime, open_time: openTime, total_time: sendTime + openTime }
  })
  frames.push(frame('group', 'GROUP BY a.age_bucket', 'totals = joined.groupby', 'Sum send time, open time and their total per bucket.', GROUP_COLS, groups))
  const percent = groups.map(group => ({
    age_bucket: group.age_bucket,
    send_perc: round2((100 * group.send_time) / group.total_time),
    open_perc: round2((100 * group.open_time) / group.total_time),
  }))
  frames.push(frame('percent', 'AS send_perc', 'out = pd.DataFrame', 'Divide by the total and round to two decimals.', PERC_COLS, percent))
  const result = [...percent].sort((a, b) => (a.age_bucket < b.age_bucket ? -1 : a.age_bucket > b.age_bucket ? 1 : 0))
  frames.push(frame('order', 'ORDER BY a.age_bucket', 'return out', 'Sort the buckets alphabetically.', PERC_COLS, result))
  frames.push(frame('done', 'ORDER BY a.age_bucket', 'return out', 'Output each bucket with its send and open shares.', PERC_COLS, result))
  return { input, result, frames }
}
