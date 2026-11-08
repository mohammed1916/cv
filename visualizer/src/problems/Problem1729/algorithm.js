// Find followers count: group the follow rows by the followed user and count them, ordered by user.
export const sql = `SELECT user_id, COUNT(follower_id) AS followers_count
FROM Followers
GROUP BY user_id
ORDER BY user_id;`

const JS_LINES = [
  { text: 'const counts = new Map()', py: 'counts = {}' },
  { text: 'for (const row of rows) {', py: 'for row in rows' },
  { text: 'counts.set(row.user_id, (counts.get(row.user_id) ?? 0) + 1)', py: 'counts[row' },
  { text: '}', py: null },
  { text: 'return [...counts].sort((a, b) => a[0] - b[0]).map(([user_id, followers_count]) => ({ user_id, followers_count }))', py: 'return [' },
]

export const code = JS_LINES.map(({ text }, i) => ({ line: i + 1, text }))

export const python = `def countFollowers(rows):
    counts = {}
    for row in rows:
        counts[row['user_id']] = counts.get(row['user_id'], 0) + 1
    return [{'user_id': u, 'followers_count': counts[u]} for u in sorted(counts)]
`

const PY = python.split('\n')
const pyAt = needle => {
  const index = PY.findIndex(line => line.includes(needle))
  if (index < 0) throw new Error(`python line missing: ${needle}`)
  return index + 1
}
export const pythonLineMap = Object.fromEntries(JS_LINES.map((line, i) => [i + 1, pyAt(line.py ?? 'return [')]))

export const phases = [
  { id: 'from', label: 'FROM', description: 'Read each follow row: follower_id follows user_id.' },
  { id: 'group', label: 'GROUP BY', description: 'Rows with the same user_id go into the same bucket.' },
  { id: 'count', label: 'COUNT', description: 'Each bucket counts its follow rows.' },
  { id: 'done', label: 'ORDER BY', description: 'Output one row per user, ordered by user_id.' },
]

export const examples = [
  { label: 'Three users', input: '[{"user_id":7,"follower_id":3},{"user_id":2,"follower_id":5},{"user_id":7,"follower_id":4},{"user_id":2,"follower_id":8},{"user_id":9,"follower_id":5}]' },
  { label: 'One follower', input: '[{"user_id":4,"follower_id":1}]' },
  { label: 'Duplicate follow row', input: '[{"user_id":3,"follower_id":1},{"user_id":3,"follower_id":1}]' },
  { label: 'Two separate users', input: '[{"user_id":1,"follower_id":2},{"user_id":3,"follower_id":4}]' },
  { label: 'Large ids', input: '[{"user_id":99999,"follower_id":1},{"user_id":99999,"follower_id":2}]' },
  { label: 'Long run: 30 rows', input: '[{"user_id":8,"follower_id":2},{"user_id":6,"follower_id":9},{"user_id":6,"follower_id":5},{"user_id":5,"follower_id":9},{"user_id":1,"follower_id":11},{"user_id":3,"follower_id":10},{"user_id":5,"follower_id":7},{"user_id":7,"follower_id":5},{"user_id":5,"follower_id":8},{"user_id":6,"follower_id":11},{"user_id":4,"follower_id":9},{"user_id":2,"follower_id":3},{"user_id":8,"follower_id":2},{"user_id":2,"follower_id":11},{"user_id":6,"follower_id":7},{"user_id":3,"follower_id":4},{"user_id":8,"follower_id":10},{"user_id":1,"follower_id":2},{"user_id":6,"follower_id":5},{"user_id":4,"follower_id":11},{"user_id":6,"follower_id":4},{"user_id":1,"follower_id":2},{"user_id":3,"follower_id":8},{"user_id":4,"follower_id":5},{"user_id":3,"follower_id":9},{"user_id":6,"follower_id":10},{"user_id":1,"follower_id":11},{"user_id":6,"follower_id":7},{"user_id":2,"follower_id":7},{"user_id":3,"follower_id":12}]' },
]

export const complexity = 'O(n + k log k) time for n follow rows and k distinct users. Space is O(k).'

export function parseInput(text) {
  const rows = JSON.parse(text)
  if (!Array.isArray(rows) || rows.length < 1 || rows.length > 30) throw new Error('Use a JSON array of 1 to 30 follow rows (visual cap).')
  for (const row of rows) {
    if (!Number.isInteger(row.user_id) || !Number.isInteger(row.follower_id) || row.user_id === row.follower_id) throw new Error('Each row has integer user_id and follower_id, and they differ.')
  }
  return rows
}

export function buildTrace(rows) {
  const frames = []
  const counts = new Map()
  const snap = extra => ({ counts: Object.fromEntries(counts), ...extra })
  rows.forEach((row, i) => {
    frames.push({ phase: 'from', activeLine: 2, index: i, message: `Follower ${row.follower_id} follows user ${row.user_id}.`, snapshot: snap({}) })
    counts.set(row.user_id, (counts.get(row.user_id) ?? 0) + 1)
    frames.push({ phase: 'group', activeLine: 3, index: i, message: `User ${row.user_id} now has ${counts.get(row.user_id)} follower${counts.get(row.user_id) === 1 ? '' : 's'}.`, snapshot: snap({ current: row.user_id }) })
  })
  const result = [...counts].sort((a, b) => a[0] - b[0]).map(([user_id, followers_count]) => ({ user_id, followers_count }))
  frames.push({ phase: 'done', activeLine: 5, index: -1, result, message: `${result.length} users, ordered by user_id.`, snapshot: snap({ result }) })
  return { input: rows, result, frames }
}
