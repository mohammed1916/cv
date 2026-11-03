// Knowledge-derived SQL walkthrough. The session rows are invented for this visualization.
export const sql = `WITH FirstSession AS (
  SELECT user_id, MIN(session_start) AS first_start
  FROM Sessions
  GROUP BY user_id
),
FirstType AS (
  SELECT s.user_id, s.session_type AS first_type, f.first_start
  FROM Sessions s
  JOIN FirstSession f ON s.user_id = f.user_id AND s.session_start = f.first_start
),
Viewers AS (
  SELECT user_id, first_start
  FROM FirstType
  WHERE first_type = 'Viewer'
)
SELECT v.user_id, COUNT(s.session_id) AS sessions_count
FROM Viewers v
JOIN Sessions s ON s.user_id = v.user_id
  AND s.session_type = 'Streamer'
  AND s.session_start > v.first_start
GROUP BY v.user_id
ORDER BY v.user_id`

export const code = sql.split('\n').map((text, index) => ({ line: index + 1, text }))
const SQL = key => {
  const index = code.findIndex(line => line.text.includes(key))
  if (index < 0) throw new Error(`Missing SQL line: ${key}`)
  return index + 1
}

export const python = `def turned_streamers(sessions):
    first = sessions.sort_values("session_start").drop_duplicates("user_id")
    viewers = first[first["session_type"] == "Viewer"]
    streams = sessions[sessions["session_type"] == "Streamer"]
    counts = {}
    for user, row in viewers.iterrows():
        later = streams[(streams["user_id"] == user) & (streams["session_start"] > row["session_start"])]
        counts[user] = len(later)
    return [{"user_id": u, "sessions_count": n} for u, n in sorted(counts.items()) if n > 0]`
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
  { id: 'load', label: 'Load', description: 'Read every session.' },
  { id: 'first', label: 'First', description: 'Find the earliest session for each user.' },
  { id: 'type', label: 'Type', description: 'Keep the users whose first session was as a viewer.' },
  { id: 'count', label: 'Count', description: 'Count each viewer\'s streamer sessions that start later.' },
  { id: 'done', label: 'Result', description: 'Return users with at least one later streamer session.' },
]

const SESSION_COLUMNS = ['user_id', 'session_start', 'session_end', 'session_id', 'session_type']
const TYPES = ['Viewer', 'Streamer']

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input) || !Array.isArray(input.Sessions)) {
    throw new Error('Use an object with a Sessions array.')
  }
  const rows = input.Sessions
  if (rows.length < 1 || rows.length > 12) throw new Error('Sessions needs 1 to 12 rows.')
  const Sessions = rows.map(row => {
    if (!row || typeof row !== 'object' || SESSION_COLUMNS.some(column => !(column in row))) {
      throw new Error(`Sessions rows need ${SESSION_COLUMNS.join(', ')}.`)
    }
    if (!TYPES.includes(row.session_type)) throw new Error('session_type must be Viewer or Streamer.')
    return { ...row, user_id: Number(row.user_id), session_id: Number(row.session_id) }
  })
  return { Sessions }
}

export function buildTrace(input) {
  const { Sessions } = input
  const frames = []
  frames.push(frame('load', 'WITH FirstSession', 'def turned', 'Read every session record.', SESSION_COLUMNS, Sessions))

  // Earliest session per user. Start times are compared as text in the same format.
  const earliest = new Map()
  for (const row of Sessions) {
    const current = earliest.get(row.user_id)
    if (!current || row.session_start < current.session_start) earliest.set(row.user_id, row)
  }
  const firsts = [...earliest.values()]
    .sort((a, b) => a.user_id - b.user_id)
    .map(row => ({ user_id: row.user_id, first_type: row.session_type, first_start: row.session_start }))
  frames.push(frame('first', 'SELECT user_id, MIN', 'first =', 'Each user\'s earliest session is found.', ['user_id', 'first_start'], firsts))
  frames.push(frame('type', 'WHERE first_type', 'viewers =', `${firsts.filter(row => row.first_type === 'Viewer').length} users started as Viewers.`, ['user_id', 'first_type', 'first_start'], firsts))

  const viewers = firsts.filter(row => row.first_type === 'Viewer')
  const summary = []
  for (const viewer of viewers) {
    const count = Sessions.filter(row => row.user_id === viewer.user_id
      && row.session_type === 'Streamer'
      && row.session_start > viewer.first_start).length
    summary.push({ user_id: viewer.user_id, sessions_count: count })
    const verdict = count > 0 ? 'stays' : 'is dropped'
    frames.push(frame('count', 'JOIN Sessions s ON', 'counts[user]', `User ${viewer.user_id} has ${count} later streamer session${count === 1 ? '' : 's'}, so it ${verdict}.`, ['user_id', 'sessions_count'], summary))
  }
  const result = summary.filter(row => row.sessions_count > 0)
  frames.push(frame('done', 'ORDER BY', 'return [', `Return ${result.length} users.`, ['user_id', 'sessions_count'], result))
  return { input, result, frames }
}
