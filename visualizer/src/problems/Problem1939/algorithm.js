// LeetCode 1939 (SQL): a user qualifies when two confirmation requests fall within 24 hours (both ends included). Self-join the requests, keep same-user pairs in the window, then list the distinct users.
const SOURCE = [
  'function activeConfirmationUsers(confirmations) {',
  '  const seconds = row => (Date.parse(row.time.replace(" ", "T") + "Z") / 1000)',
  '  const joined = []',
  '  for (const c1 of confirmations) {',
  '    for (const c2 of confirmations) {',
  '      if (c1.user === c2.user && seconds(c1) < seconds(c2) && seconds(c2) - seconds(c1) <= 86400) joined.push([c1, c2])',
  '    }',
  '  }',
  '  const users = [...new Set(joined.map(([c1]) => c1.user))]',
  '  return users.sort((a, b) => a - b)',
  '}',
]

export const code = SOURCE.map((text, index) => ({ line: index + 1, text }))

export const python = `from datetime import datetime

def active_confirmation_users(confirmations):
    def seconds(row):
        return (datetime.fromisoformat(row["time"]) - datetime(1970, 1, 1)).total_seconds()
    joined = []
    for c1 in confirmations:
        for c2 in confirmations:
            if c1["user"] == c2["user"] and seconds(c1) < seconds(c2) and seconds(c2) - seconds(c1) <= 86400:
                joined.append((c1, c2))
    users = sorted({c1["user"] for c1, _ in joined})
    return users
`

export const sql = `SELECT DISTINCT c1.user_id
FROM Confirmations c1
JOIN Confirmations c2
  ON c1.user_id = c2.user_id
 AND c1.time_stamp < c2.time_stamp
 AND TIMESTAMPDIFF(SECOND, c1.time_stamp, c2.time_stamp) <= 86400
ORDER BY c1.user_id;
`

const L = text => { const i = SOURCE.findIndex(line => line.includes(text)); if (i < 0) throw new Error(`no code line: ${text}`); return i + 1 }
const P = text => { const i = python.split('\n').findIndex(line => line.includes(text)); if (i < 0) throw new Error(`no python line: ${text}`); return i + 1 }

export const phases = [
  { id: 'source', label: 'Source rows', description: 'The confirmation requests as stored.' },
  { id: 'join', label: 'Join pairs', description: 'Pairs of requests by the same user within 24 hours.' },
  { id: 'group', label: 'Group users', description: 'Distinct users that have at least one such pair.' },
  { id: 'order', label: 'Order', description: 'Sorted user IDs.' },
]

const TS = /^[0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2}$/

export function parseInput(text) {
  let input
  try { input = JSON.parse(text) } catch { throw new Error('Enter JSON like {"confirmations":[[2,"2024-01-01 10:00:00","confirmed"]]}.') }
  const rows = input?.confirmations
  if (!Array.isArray(rows) || rows.length < 1 || rows.length > 12) throw new Error('confirmations holds 1 to 12 rows.')
  const keys = new Set()
  const confirmations = rows.map(r => {
    if (!Array.isArray(r) || r.length !== 3 || !Number.isInteger(r[0]) || r[0] < 1 || r[0] > 6 || typeof r[1] !== 'string' || !TS.test(r[1]) || !['confirmed', 'timeout'].includes(r[2])) throw new Error('Each row is [user_id, "YYYY-MM-DD HH:MM:SS", "confirmed" or "timeout"].')
    const key = `${r[0]}|${r[1]}`
    if (keys.has(key)) throw new Error('(user_id, time_stamp) is unique.')
    keys.add(key)
    return { user: r[0], time: r[1], action: r[2] }
  })
  return { confirmations }
}

export function buildTrace({ confirmations }) {
  const seconds = row => Date.parse(row.time.replace(' ', 'T') + 'Z') / 1000
  const frames = []
  frames.push({ phase: 'source', activeLine: L('const seconds'), pythonLine: P('def seconds'), message: `${confirmations.length} confirmation request(s) in the table.`, stage: 'source', rows: confirmations.map(c => [c.user, c.time, c.action]), cols: ['user_id', 'time_stamp', 'action'], match: [] })
  const joined = []
  for (const c1 of confirmations) {
    for (const c2 of confirmations) {
      if (c1.user === c2.user && seconds(c1) < seconds(c2) && seconds(c2) - seconds(c1) <= 86400) joined.push([c1, c2])
    }
  }
  frames.push({ phase: 'join', activeLine: L('joined.push'), pythonLine: P('joined.append'), message: `${joined.length} pair(s) of same-user requests within 24 hours.`, stage: 'join', rows: joined.map(([a, b]) => [a.user, a.time, b.time]), cols: ['user_id', 'first request', 'second request'], match: joined.map(([a]) => a.user) })
  const users = [...new Set(joined.map(([c1]) => c1.user))]
  frames.push({ phase: 'group', activeLine: L('const users'), pythonLine: P('users = sorted'), message: `Distinct users: ${users.join(', ') || 'none'}.`, stage: 'group', rows: users.map(u => [u]), cols: ['user_id'], match: users })
  const sorted = [...users].sort((a, b) => a - b)
  frames.push({ phase: 'order', activeLine: L('return users.sort'), pythonLine: P('return users'), message: 'Result sorted by user_id.', stage: 'order', rows: sorted.map(u => [u]), cols: ['user_id'], match: sorted, result: sorted })
  return { input: { confirmations }, result: sorted, frames }
}
