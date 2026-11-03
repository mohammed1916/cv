// Knowledge-derived teaching model. Sample tables and wording are original.
const lineIn = (source, text) => {
  const index = source.split('\n').findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`No line contains: ${text}`)
  return index + 1
}

export const phases = [
  { id: 'load', label: 'Activities', description: 'Start from every activity row.' },
  { id: 'rank', label: 'Rank', description: 'Newest start date gets recency 1 within each user.' },
  { id: 'keep', label: 'Keep', description: 'Keep recency 2, or the only activity of a user.' },
  { id: 'order', label: 'Order', description: 'Sort the kept rows by username.' },
  { id: 'done', label: 'Result', description: 'Return the four original columns.' },
]

export const sql = `
WITH ranked AS (
  SELECT username, activity, startDate, endDate,
    ROW_NUMBER() OVER (PARTITION BY username ORDER BY startDate DESC) AS recency,
    COUNT(*) OVER (PARTITION BY username) AS total
  FROM UserActivity)
SELECT username, activity, startDate, endDate
FROM ranked
WHERE recency = 2 OR total = 1
ORDER BY username`.trim()

export const code = sql.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `
def second_recent(df):
    df = df.copy()
    df['recency'] = df.groupby('username')['startDate'].rank(ascending=False, method='first')
    df['total'] = df.groupby('username')['username'].transform('size')
    keep = df[(df.recency == 2) | (df.total == 1)]
    return keep[['username', 'activity', 'startDate', 'endDate']].sort_values('username')`.trim()

const S = text => lineIn(sql, text)
const P = text => lineIn(python, text)
const frame = (phase, sqlText, pyText, message, caption, rows) => ({
  phase, activeLine: S(sqlText), pythonLine: P(pyText), message, caption, rows: rows.map(row => ({ ...row })),
})

const DATE = /^\d{4}-\d{2}-\d{2}$/

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || !Array.isArray(input.UserActivity)) throw new Error('Use an object with a UserActivity list.')
  const rows = input.UserActivity
  if (rows.length < 1 || rows.length > 12) throw new Error('UserActivity has 1 to 12 rows.')
  for (const row of rows) {
    if (typeof row.username !== 'string' || typeof row.activity !== 'string') throw new Error('username and activity are text.')
    if (!DATE.test(row.startDate) || !DATE.test(row.endDate)) throw new Error('Dates use YYYY-MM-DD.')
    if (row.startDate > row.endDate) throw new Error('startDate must not be after endDate.')
  }
  const byUser = new Map()
  for (const row of rows) byUser.set(row.username, [...(byUser.get(row.username) || []), row])
  for (const list of byUser.values()) {
    const sorted = [...list].sort((a, b) => a.startDate.localeCompare(b.startDate))
    if (new Set(sorted.map(row => row.startDate)).size !== sorted.length) throw new Error('A user cannot start two activities on the same day.')
    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i - 1].endDate >= sorted[i].startDate) throw new Error('A user’s activities must not overlap.')
    }
  }
  return input
}

export function buildTrace(input) {
  const rows = input.UserActivity
  const ranked = rows.map(row => {
    const peers = rows.filter(other => other.username === row.username)
    const newer = peers.filter(other => other.startDate > row.startDate).length
    return { ...row, recency: newer + 1, total: peers.length }
  })
  const frames = []
  frames.push(frame('load', 'FROM UserActivity', 'def second_recent',
    `Start with ${rows.length} activities. Only the original four columns matter for the answer.`, 'UserActivity', rows))
  frames.push(frame('rank', 'ROW_NUMBER()', "df['recency'] =",
    'Within each user, the latest start date gets recency 1. total counts that user’s activities.', 'Ranked by start date', ranked))
  const kept = ranked.filter(row => row.recency === 2 || row.total === 1)
  frames.push(frame('keep', 'WHERE recency', 'keep = ',
    'Keep recency 2, plus any user who has only one activity.', 'Kept rows', kept))
  const sorted = [...kept].sort((a, b) => a.username.localeCompare(b.username))
  frames.push(frame('order', 'ORDER BY username', 'sort_values', 'Sort the kept rows by username.', 'Sorted rows', sorted))
  const result = sorted.map(({ username, activity, startDate, endDate }) => ({ username, activity, startDate, endDate }))
  frames.push(frame('done', 'FROM ranked', 'return keep', 'The output keeps only the original four columns.', 'Result', result))
  return { input, result, frames }
}
