const SQL = `SELECT u.user_id,
  u.name,
  COALESCE(SUM(r.distance), 0) AS traveled_distance
FROM Users u
LEFT JOIN Rides r ON r.user_id = u.user_id
GROUP BY u.user_id, u.name
ORDER BY u.user_id;`

const PY = `import pandas as pd

def total_traveled_distance(users, rides):
    sums = rides.groupby("user_id", as_index=False)["distance"].sum()
    merged = users.merge(sums, on="user_id", how="left")
    merged["traveled_distance"] = merged["distance"].fillna(0).astype(int)
    return merged[["user_id", "name", "traveled_distance"]].sort_values("user_id").reset_index(drop=True)
`

const snap = rows => JSON.parse(JSON.stringify(rows))
const SQL_LINES = SQL.split('\n')
const PY_LINES = PY.split('\n')
function lookup(lines, fragment, label) {
  const index = lines.findIndex(text => text.includes(fragment))
  if (index < 0) throw new Error(`${label} has no line containing "${fragment}"`)
  return index + 1
}
const sqlLine = fragment => lookup(SQL_LINES, fragment, 'SQL')
const pyLine = fragment => lookup(PY_LINES, fragment, 'Python')
const frame = (phase, sqlFragment, pyFragment, message, rows) => ({
  phase, activeLine: sqlLine(sqlFragment), pythonLine: pyLine(pyFragment), message, rows: snap(rows),
})

export const sql = SQL
export const python = PY
export const code = SQL_LINES.map((text, index) => ({ line: index + 1, text }))
export const phases = [
  { id: 'load', label: 'Users', description: 'Start from every user, even one who never rode.' },
  { id: 'join', label: 'Join rides', description: 'Attach each user’s rides; a user with none gets an empty match.' },
  { id: 'sum', label: 'Sum', description: 'Add the distances per user; an empty sum becomes zero.' },
  { id: 'done', label: 'Result', description: 'One row per user, sorted by user id.' },
]
export const sample = {
  users: [
    { user_id: 1, name: 'Alice' },
    { user_id: 2, name: 'Bob' },
    { user_id: 3, name: 'Carol' },
  ],
  rides: [
    { ride_id: 1, user_id: 1, distance: 120 },
    { ride_id: 2, user_id: 1, distance: 80 },
    { ride_id: 3, user_id: 3, distance: 45 },
  ],
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!Array.isArray(input.users) || !Array.isArray(input.rides)) throw new Error('Provide users and rides arrays.')
  const ids = new Set(input.users.map(u => u.user_id))
  if (ids.size !== input.users.length) throw new Error('user_id must be unique.')
  for (const r of input.rides) {
    if (!ids.has(r.user_id)) throw new Error(`Ride ${r.ride_id} names an unknown user.`)
    if (!Number.isFinite(r.distance) || r.distance < 0) throw new Error(`Ride ${r.ride_id} needs a non-negative distance.`)
  }
  return input
}

export function buildTrace(input) {
  const { users, rides } = input
  const frames = []
  frames.push(frame('load', 'FROM Users u', 'users.merge', 'Start with every user.', users))
  const joined = []
  for (const u of users) {
    const mine = rides.filter(r => r.user_id === u.user_id)
    if (!mine.length) joined.push({ user_id: u.user_id, name: u.name, distance: null })
    for (const r of mine) joined.push({ user_id: u.user_id, name: u.name, distance: r.distance })
  }
  frames.push(frame('join', 'LEFT JOIN Rides r', 'merge(sums', 'Each ride is attached to its user; users with no rides keep one empty row.', joined))
  const sums = new Map(users.map(u => [u.user_id, 0]))
  for (const r of rides) sums.set(r.user_id, sums.get(r.user_id) + r.distance)
  const summed = users.map(u => ({ user_id: u.user_id, name: u.name, traveled_distance: sums.get(u.user_id) }))
  frames.push(frame('sum', 'COALESCE(SUM(r.distance), 0)', 'fillna(0)', 'Add each user’s distances; no rides means zero.', summed))
  const result = summed.slice().sort((a, b) => a.user_id - b.user_id)
  frames.push(frame('done', 'ORDER BY u.user_id', 'return merged', 'Every user listed by id.', result))
  return { input, result, frames }
}
