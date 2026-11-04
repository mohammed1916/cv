// SQL walkthrough. The position column is the row order in the input, which tells two identical purchases apart.
export const sql = `SELECT DISTINCT a.user_id
FROM Users a
JOIN Users b
  ON a.user_id = b.user_id
 AND a.position < b.position
 AND DATEDIFF(b.created_at, a.created_at) BETWEEN 0 AND 7
ORDER BY a.user_id`

export const code = sql.split('\n').map((text, index) => ({ line: index + 1, text }))
const SQL = key => {
  const index = code.findIndex(line => line.text.includes(key))
  if (index < 0) throw new Error(`Missing SQL line: ${key}`)
  return index + 1
}

export const python = `def find_active_users(users):
    active = set()
    for user in sorted({r["user_id"] for r in users}):
        dates = sorted(r["created_at"] for r in users if r["user_id"] == user)
        for i, earlier in enumerate(dates):
            for later in dates[i + 1:]:
                gap = days_between(earlier, later)
                if 0 <= gap <= 7:
                    active.add(user)
    return [{"user_id": u} for u in sorted(active)]`
const PY_LINES = python.split('\n')
const PY = key => {
  const index = PY_LINES.findIndex(line => line.includes(key))
  if (index < 0) throw new Error(`Missing Python line: ${key}`)
  return index + 1
}

const COLS = ['user_id', 'item', 'created_at', 'amount']
const PAIR_COLS = ['user_id', 'earlier', 'later', 'gap_days']

const frame = (phase, sqlKey, pyKey, message, columns, rows) => ({
  phase, activeLine: SQL(sqlKey), pythonLine: PY(pyKey), message, columns, rows: rows.map(row => ({ ...row })),
})

export const phases = [
  { id: 'load', label: 'Load', description: 'Read the purchase records.' },
  { id: 'pair', label: 'Pair', description: 'Compare two purchases by the same user.' },
  { id: 'done', label: 'Result', description: 'Output users with a repeat inside seven days.' },
]

function tableRows(input, name, columns) {
  const rows = input[name]
  if (!Array.isArray(rows) || rows.length < 1 || rows.length > 12) throw new Error(`${name} needs 1 to 12 rows.`)
  for (const row of rows) {
    if (!row || typeof row !== 'object' || columns.some(column => !(column in row))) throw new Error(`${name} rows need ${columns.join(', ')}.`)
  }
  return rows.map(row => Object.fromEntries(columns.map(column => [column, row[column]])))
}

const DATE = /^\d{4}-\d{2}-\d{2}$/

const dayNumber = s => Date.UTC(+s.slice(0, 4), +s.slice(5, 7) - 1, +s.slice(8, 10)) / 86400000

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with a Users table.')
  const rows = tableRows(input, 'Users', COLS)
  for (const row of rows) {
    if (!Number.isInteger(row.user_id) || !DATE.test(row.created_at)) throw new Error('user_id is an integer and created_at uses YYYY-MM-DD.')
  }
  return { Users: rows }
}

export function buildTrace(input) {
  const rows = input.Users
  const frames = [frame('load', 'FROM Users a', 'def ', 'Read the purchase records.', COLS, rows)]
  const users = [...new Set(rows.map(row => row.user_id))].sort((a, b) => a - b)
  const pairs = []
  const result = []
  for (const user of users) {
    const own = rows.filter(row => row.user_id === user).sort((a, b) => (a.created_at < b.created_at ? -1 : a.created_at > b.created_at ? 1 : 0))
    for (let i = 0; i < own.length; i++) {
      for (let j = i + 1; j < own.length; j++) {
        const gap = dayNumber(own[j].created_at) - dayNumber(own[i].created_at)
        const hit = gap >= 0 && gap <= 7
        if (hit) pairs.push({ user_id: user, earlier: own[i].created_at, later: own[j].created_at, gap_days: gap })
        if (hit && !result.some(r => r.user_id === user)) result.push({ user_id: user })
        frames.push(frame('pair', 'DATEDIFF(', 'for later in', hit
          ? `User ${user}: ${own[j].created_at} is ${gap} days after ${own[i].created_at}, so the user is active.`
          : `User ${user}: a gap of ${gap} days is outside the window, so this pair does not count.`, PAIR_COLS, pairs))
      }
    }
  }
  frames.push(frame('done', 'ORDER BY a.user_id', 'return [', `Return ${result.length} active users.`, ['user_id'], result))
  return { input, result, frames }
}
