// Knowledge-derived SQL walkthrough. The sample table is invented for this visualization.
// Teaching rule: the denominator counts the distinct users that appear anywhere in Friends.
export const sql = `WITH edges AS (
  SELECT user1 AS user_id, user2 AS friend_id FROM Friends
  UNION ALL
  SELECT user2, user1 FROM Friends
),
degree AS (
  SELECT user_id, COUNT(*) AS friend_count
  FROM edges
  GROUP BY user_id
),
total AS (
  SELECT COUNT(DISTINCT user_id) AS n FROM edges
)
SELECT d.user_id, ROUND(100.0 * d.friend_count / t.n, 2) AS popularity_percentage
FROM degree d
CROSS JOIN total t
ORDER BY d.user_id`

export const code = sql.split('\n').map((text, index) => ({ line: index + 1, text }))
const SQL = key => {
  const index = code.findIndex(line => line.text.includes(key))
  if (index < 0) throw new Error(`Missing SQL line: ${key}`)
  return index + 1
}

export const python = `def popularity_percentage(friends):
    degree = {}
    for a, b in zip(friends.user1, friends.user2):
        degree[a] = degree.get(a, 0) + 1
        degree[b] = degree.get(b, 0) + 1
    total = len(degree)
    rows = []
    for user in sorted(degree):
        pct = round(100 * degree[user] / total, 2)
        rows.append({"user_id": user, "popularity_percentage": pct})
    return rows`
const PY_LINES = python.split('\n')
const PY = key => {
  const index = PY_LINES.findIndex(line => line.includes(key))
  if (index < 0) throw new Error(`Missing Python line: ${key}`)
  return index + 1
}

const COLS = ['user1', 'user2']
const DEGREE_COLS = ['user_id', 'friend_count', 'popularity_percentage']
const RESULT_COLS = ['user_id', 'popularity_percentage']

const frame = (phase, sqlKey, pyKey, message, columns, rows) => ({
  phase, activeLine: SQL(sqlKey), pythonLine: PY(pyKey), message, columns, rows: rows.map(row => ({ ...row })),
})

export const phases = [
  { id: 'load', label: 'Load', description: 'Read the friendship pairs.' },
  { id: 'people', label: 'Users', description: 'Count the distinct users in the table.' },
  { id: 'degree', label: 'Degree', description: 'Count each user friends and convert to a percentage.' },
  { id: 'done', label: 'Result', description: 'Output one percentage per user.' },
]

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
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with a Friends table.')
  const rows = tableRows(input, 'Friends', COLS)
  const seen = new Set()
  for (const row of rows) {
    if (!Number.isInteger(row.user1) || !Number.isInteger(row.user2)) throw new Error('user1 and user2 are integers.')
    if (row.user1 === row.user2) throw new Error('A user cannot befriend themself.')
    const key = `${Math.min(row.user1, row.user2)}|${Math.max(row.user1, row.user2)}`
    if (seen.has(key)) throw new Error('Each friendship appears once, in either order.')
    seen.add(key)
  }
  return { Friends: rows }
}

export function buildTrace(input) {
  const rows = input.Friends
  const frames = [frame('load', 'FROM Friends', 'def ', 'Read the friendship pairs.', COLS, rows)]
  const people = [...new Set(rows.flatMap(row => [row.user1, row.user2]))].sort((a, b) => a - b)
  const total = people.length
  frames.push(frame('people', 'COUNT(DISTINCT user_id)', 'total = len', `The table names ${total} distinct users.`, ['user_id'], people.map(user_id => ({ user_id }))))

  const degree = new Map(people.map(user => [user, 0]))
  for (const row of rows) {
    degree.set(row.user1, degree.get(row.user1) + 1)
    degree.set(row.user2, degree.get(row.user2) + 1)
  }
  const summary = []
  for (const user of people) {
    const count = degree.get(user)
    const popularity_percentage = Math.round((count * 10000) / total) / 100
    summary.push({ user_id: user, friend_count: count, popularity_percentage })
    frames.push(frame('degree', 'COUNT(*) AS friend_count', 'pct = round', `User ${user} has ${count} friends out of ${total} users, which is ${popularity_percentage}%.`, DEGREE_COLS, summary))
  }
  const result = summary.map(({ user_id, popularity_percentage }) => ({ user_id, popularity_percentage }))
  frames.push(frame('done', 'ORDER BY d.user_id', 'return rows', `Return ${result.length} user rows.`, RESULT_COLS, result))
  return { input, result, frames }
}
