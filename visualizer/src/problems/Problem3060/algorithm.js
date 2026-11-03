// Knowledge-derived SQL walkthrough. The sample table and the duration window are invented for this visualization.
export const sql = `SELECT user_id
FROM Sessions
WHERE end_time - start_time BETWEEN 5 AND 60
GROUP BY user_id
HAVING COUNT(*) >= 2
ORDER BY user_id`

export const code = sql.split('\n').map((text, index) => ({ line: index + 1, text }))
const SQL = key => {
  const index = code.findIndex(line => line.text.includes(key))
  if (index < 0) throw new Error(`Missing SQL line: ${key}`)
  return index + 1
}

export const python = `def active_users(sessions):
    span = sessions["end_time"] - sessions["start_time"]
    ok = sessions[(span >= 5) & (span <= 60)]
    counts = ok.groupby("user_id").size()
    kept = counts[counts >= 2].index
    return [{"user_id": u} for u in sorted(kept)]`
const PY_LINES = python.split('\n')
const PY = key => {
  const index = PY_LINES.findIndex(line => line.includes(key))
  if (index < 0) throw new Error(`Missing Python line: ${key}`)
  return index + 1
}

const frame = (phase, sqlKey, pyKey, message, columns, rows) => ({
  phase, activeLine: SQL(sqlKey), pythonLine: PY(pyKey), message, columns, rows: rows.map(row => ({ ...row })),
})

export const phases = [
  { id: 'load', label: 'Load', description: 'Read the session rows.' },
  { id: 'filter', label: 'Filter', description: 'Keep sessions lasting 5 to 60 minutes.' },
  { id: 'group', label: 'Group', description: 'Count the kept sessions for each user.' },
  { id: 'done', label: 'Result', description: 'Output users with at least two kept sessions.' },
]

const COLUMNS = ['session_id', 'user_id', 'start_time', 'end_time']

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with a Sessions table.')
  const rows = input.Sessions
  if (!Array.isArray(rows) || rows.length < 1 || rows.length > 12) throw new Error('Sessions needs 1 to 12 rows.')
  return {
    Sessions: rows.map(row => {
      if (!row || typeof row !== 'object' || COLUMNS.some(column => !(column in row))) throw new Error(`Sessions rows need ${COLUMNS.join(', ')}.`)
      if (!Number.isInteger(row.start_time) || !Number.isInteger(row.end_time) || row.end_time < row.start_time) throw new Error('Times must be whole minutes with end_time at or after start_time.')
      return Object.fromEntries(COLUMNS.map(column => [column, row[column]]))
    }),
  }
}

export function buildTrace(input) {
  const { Sessions } = input
  const frames = []
  frames.push(frame('load', 'FROM Sessions', 'def ', `Read ${Sessions.length} session rows.`, COLUMNS, Sessions))

  const judged = []
  for (const row of Sessions) {
    const span = row.end_time - row.start_time
    const ok = span >= 5 && span <= 60
    judged.push({ session_id: row.session_id, user_id: row.user_id, duration: span, kept: ok ? 'yes' : 'no' })
    frames.push(frame('filter', 'WHERE', 'ok =', `Session ${row.session_id} lasts ${span} minutes, so it ${ok ? 'stays' : 'is dropped'}.`, ['session_id', 'user_id', 'duration', 'kept'], judged))
  }

  const counts = new Map()
  for (const row of judged) {
    if (row.kept === 'yes') counts.set(row.user_id, (counts.get(row.user_id) ?? 0) + 1)
  }
  const summary = []
  const users = [...new Set(Sessions.map(row => row.user_id))].sort((a, b) => a - b)
  for (const user of users) {
    const n = counts.get(user) ?? 0
    summary.push({ user_id: user, kept_sessions: n, qualifies: n >= 2 ? 'yes' : 'no' })
    frames.push(frame('group', 'HAVING', 'counts =', `User ${user} has ${n} kept session${n === 1 ? '' : 's'}, so it ${n >= 2 ? 'qualifies' : 'does not qualify'}.`, ['user_id', 'kept_sessions', 'qualifies'], summary))
  }

  const result = users.filter(user => (counts.get(user) ?? 0) >= 2).map(user => ({ user_id: user }))
  frames.push(frame('done', 'ORDER BY', 'return', `Return ${result.length} user${result.length === 1 ? '' : 's'}.`, ['user_id'], result))
  return { input, result, frames }
}
