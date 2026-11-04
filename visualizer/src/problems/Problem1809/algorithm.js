// SQL walkthrough. The sample tables are invented for this visualization.
export const sql = `SELECT p.session_id
FROM Playback p
WHERE NOT EXISTS (
  SELECT 1
  FROM Ads a
  WHERE a.customer_id = p.customer_id
    AND a.timestamp BETWEEN p.start_time AND p.end_time
)
ORDER BY p.session_id`

export const code = sql.split('\n').map((text, index) => ({ line: index + 1, text }))
const SQL = key => {
  const index = code.findIndex(line => line.text.includes(key))
  if (index < 0) throw new Error(`Missing SQL line: ${key}`)
  return index + 1
}

export const python = `def ad_free_sessions(playback, ads):
    def has_ad(row):
        same_customer = ads[ads["customer_id"] == row["customer_id"]]
        return same_customer["timestamp"].between(row["start_time"], row["end_time"]).any()
    free = playback[~playback.apply(has_ad, axis=1)]
    return free[["session_id"]].sort_values("session_id")`
const PY_LINES = python.split('\n')
const PY = key => {
  const index = PY_LINES.findIndex(line => line.includes(key))
  if (index < 0) throw new Error(`Missing Python line: ${key}`)
  return index + 1
}

const PLAY_COLUMNS = ['session_id', 'customer_id', 'start_time', 'end_time']
const CHECK_COLUMNS = [...PLAY_COLUMNS, 'ad_hit']

const frame = (phase, sqlKey, pyKey, message, columns, rows) => ({
  phase, activeLine: SQL(sqlKey), pythonLine: PY(pyKey), message, columns, rows: rows.map(row => ({ ...row })),
})

export const phases = [
  { id: 'load', label: 'Load', description: 'Read the playback sessions and the ad log.' },
  { id: 'check', label: 'Check', description: 'For each session, look for an ad from the same customer inside its window.' },
  { id: 'done', label: 'Result', description: 'Output the sessions with no ad inside their window.' },
]

export const inputLabel = 'Object with Playback and Ads tables'
export const complexity = 'O(P * A) with a nested check, or O((P + A) log A) with sorted ads per customer. The visualizer caps each table at 12 rows.'

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
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with Playback and Ads tables.')
  const Playback = tableRows(input, 'Playback', PLAY_COLUMNS)
  const Ads = tableRows(input, 'Ads', ['ad_id', 'customer_id', 'timestamp'])
  for (const session of Playback) {
    if (session.start_time > session.end_time) throw new Error('A session must not end before it starts.')
  }
  return { Playback, Ads }
}

export function buildTrace(input) {
  const { Playback, Ads } = input
  const sessions = [...Playback].sort((a, b) => a.session_id - b.session_id)
  const frames = []
  frames.push(frame('load', 'FROM Playback', 'def ', `Load ${sessions.length} playback sessions and ${Ads.length} ad rows.`, PLAY_COLUMNS, sessions))

  const checked = []
  const result = []
  for (const session of sessions) {
    const hit = Ads.some(ad => ad.customer_id === session.customer_id && ad.timestamp >= session.start_time && ad.timestamp <= session.end_time)
    checked.push({ ...session, ad_hit: hit ? 'yes' : 'no' })
    if (!hit) result.push({ session_id: session.session_id })
    frames.push(frame('check', 'a.timestamp BETWEEN', 'return same_customer',
      `Session ${session.session_id}: ${hit ? 'an ad from its customer falls inside the window' : 'no ad falls inside the window'}.`,
      CHECK_COLUMNS, checked))
  }
  frames.push(frame('done', 'ORDER BY', 'return free', `Return ${result.length} ad-free sessions.`, ['session_id'], result))
  return { input, result, frames }
}
