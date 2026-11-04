// Teaching walkthrough. The session rows are invented for this visualization.
export const sql = `WITH ordered AS (
  SELECT user_id, session_type, session_start, session_end,
         LAG(session_end) OVER (PARTITION BY user_id, session_type ORDER BY session_start) AS prev_end
  FROM Sessions
)
SELECT DISTINCT user_id
FROM ordered
WHERE prev_end IS NOT NULL
  AND session_start <= prev_end + INTERVAL 12 HOUR
ORDER BY user_id`

export const code = sql.split('\n').map((text, index) => ({ line: index + 1, text }))
const SQL = key => {
  const index = code.findIndex(line => line.text.includes(key))
  if (index < 0) throw new Error(`Missing SQL line: ${key}`)
  return index + 1
}

export const python = `import pandas as pd

def active_users(sessions):
    ordered = sessions.sort_values(["user_id", "session_type", "session_start"]).copy()
    prev_end = ordered.groupby(["user_id", "session_type"])["session_end"].shift()
    gap = ordered["session_start"] - prev_end
    ok = prev_end.notna() & (gap <= pd.Timedelta(hours=12))
    return ordered.loc[ok, ["user_id"]].drop_duplicates().sort_values("user_id")`
const PY_LINES = python.split('\n')
const PY = key => {
  const index = PY_LINES.findIndex(line => line.includes(key))
  if (index < 0) throw new Error(`Missing Python line: ${key}`)
  return index + 1
}

const COLUMNS = ['user_id', 'session_type', 'session_start', 'session_end']
const TYPES = ['Viewer', 'Streamer']
const HOUR = 60 * 60 * 1000
const DATETIME = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/

const frame = (phase, sqlKey, pyKey, message, columns, rows) => ({
  phase, activeLine: SQL(sqlKey), pythonLine: PY(pyKey), message, columns, rows: rows.map(row => ({ ...row })),
})

export const phases = [
  { id: 'load', label: 'Load', description: 'Read every session.' },
  { id: 'order', label: 'Order', description: 'Group each user\'s sessions by type, earliest first.' },
  { id: 'check', label: 'Gap', description: 'Compare each session with the previous one of the same type.' },
  { id: 'keep', label: 'Keep', description: 'A gap of at most 12 hours qualifies the user.' },
  { id: 'done', label: 'Result', description: 'Return the qualifying users in ascending order.' },
]

const stamp = text => Date.parse(`${text.replace(' ', 'T')}Z`)

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input) || !Array.isArray(input.Sessions)) {
    throw new Error('Use an object with a Sessions array.')
  }
  const rows = input.Sessions
  if (rows.length < 1 || rows.length > 12) throw new Error('Sessions needs 1 to 12 rows.')
  const ids = new Set()
  const Sessions = rows.map(row => {
    if (!row || typeof row !== 'object' || ['session_id', 'user_id', 'session_start', 'session_end', 'session_type'].some(c => !(c in row))) {
      throw new Error('Sessions rows need session_id, user_id, session_start, session_end and session_type.')
    }
    if (ids.has(row.session_id)) throw new Error('session_id values must be unique.')
    ids.add(row.session_id)
    if (!TYPES.includes(row.session_type)) throw new Error('session_type must be Viewer or Streamer.')
    if (!DATETIME.test(row.session_start) || !DATETIME.test(row.session_end)) throw new Error('Times look like 2023-11-01 08:00:00.')
    if (stamp(row.session_end) < stamp(row.session_start)) throw new Error('session_end must not be before session_start.')
    return { session_id: row.session_id, user_id: row.user_id, session_start: row.session_start, session_end: row.session_end, session_type: row.session_type }
  })
  return { Sessions }
}

export function buildTrace(input) {
  const { Sessions } = input
  const frames = [frame('load', 'FROM Sessions', 'def active_users', 'Read every session.', COLUMNS, Sessions)]
  const users = [...new Set(Sessions.map(row => row.user_id))].sort((a, b) => a - b)
  const kept = []
  for (const user of users) {
    let qualifies = false
    for (const type of TYPES) {
      const own = Sessions
        .filter(row => row.user_id === user && row.session_type === type)
        .sort((a, b) => (a.session_start < b.session_start ? -1 : a.session_start > b.session_start ? 1 : 0))
      frames.push(frame('order', 'PARTITION BY user_id, session_type', 'ordered = sessions.sort_values',
        `User ${user} has ${own.length} ${type} session${own.length === 1 ? '' : 's'}, earliest first.`, COLUMNS, own))
      for (let i = 1; i < own.length && !qualifies; i++) {
        const gap = (stamp(own[i].session_start) - stamp(own[i - 1].session_end)) / HOUR
        const ok = gap <= 12
        frames.push(frame('check', 'LAG(session_end)', 'prev_end = ordered', `User ${user}: the ${type} session starting ${own[i].session_start} begins ${gap.toFixed(1)} hours after the previous one ended. ${ok ? 'At most 12, so the user qualifies.' : 'More than 12, so it does not count.'}`,
          COLUMNS, [own[i - 1], own[i]]))
        if (ok) qualifies = true
      }
    }
    if (qualifies) {
      kept.push({ user_id: user })
      frames.push(frame('keep', 'session_start <= prev_end', 'ok = prev_end.notna()', `User ${user} is kept.`, ['user_id'], kept))
    }
  }
  const result = kept.map(row => ({ ...row }))
  frames.push(frame('done', 'ORDER BY user_id', 'return ordered', `Return ${result.length} user${result.length === 1 ? '' : 's'}.`, ['user_id'], result))
  return { input, result, frames }
}
