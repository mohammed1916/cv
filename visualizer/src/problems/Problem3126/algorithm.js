// Knowledge-derived SQL walkthrough. The sample events and the unclosed-session rule are invented for this visualization.
export const sql = `WITH Paired AS (
  SELECT s1.server_id, s1.status_time AS start_time,
    MIN(s2.status_time) AS stop_time
  FROM Servers s1
  JOIN Servers s2 ON s2.server_id = s1.server_id
    AND s2.session_status = 'stop' AND s2.status_time > s1.status_time
  WHERE s1.session_status = 'start'
  GROUP BY s1.server_id, s1.status_time
)
SELECT FLOOR(SUM(stop_time - start_time) / 86400) AS total_uptime_days
FROM Paired`

export const code = sql.split('\n').map((text, index) => ({ line: index + 1, text }))
const SQL = key => {
  const index = code.findIndex(line => line.text.includes(key))
  if (index < 0) throw new Error(`Missing SQL line: ${key}`)
  return index + 1
}

export const python = `def uptime_days(servers):
    events = servers.sort_values(["server_id", "status_time"])
    starts = events[events["session_status"] == "start"]
    stops = events[events["session_status"] == "stop"]
    paired = starts.merge(stops, on="server_id", suffixes=("_start", "_stop"))
    paired = paired[paired["status_time_stop"] > paired["status_time_start"]]
    closed = paired.groupby(["server_id", "status_time_start"])["status_time_stop"].min().reset_index()
    total = (closed["status_time_stop"] - closed["status_time_start"]).sum()
    return [{"total_uptime_days": int(total // 86400)}]`
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
  { id: 'load', label: 'Load', description: 'Read the start and stop events.' },
  { id: 'pair', label: 'Pair', description: 'Match each start with the next stop on the same server.' },
  { id: 'sum', label: 'Sum', description: 'Add the seconds of every closed session.' },
  { id: 'done', label: 'Result', description: 'Convert the total into whole days.' },
]

const COLUMNS = ['server_id', 'status_time', 'session_status']

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with a Servers table.')
  const rows = input.Servers
  if (!Array.isArray(rows) || rows.length < 1 || rows.length > 12) throw new Error('Servers needs 1 to 12 rows.')
  return {
    Servers: rows.map(row => {
      if (!row || typeof row !== 'object' || COLUMNS.some(column => !(column in row))) throw new Error(`Servers rows need ${COLUMNS.join(', ')}.`)
      if (!Number.isInteger(row.status_time) || row.status_time < 0) throw new Error('status_time must be a whole number of seconds, zero or more.')
      if (row.session_status !== 'start' && row.session_status !== 'stop') throw new Error('session_status must be start or stop.')
      return Object.fromEntries(COLUMNS.map(column => [column, row[column]]))
    }),
  }
}

export function buildTrace(input) {
  const { Servers } = input
  const frames = []
  frames.push(frame('load', 'FROM Servers', 'def ', `Read ${Servers.length} status events.`, COLUMNS, Servers))

  const events = [...Servers].sort((a, b) => a.server_id - b.server_id || a.status_time - b.status_time)
  const starts = events.filter(row => row.session_status === 'start')
  const stops = events.filter(row => row.session_status === 'stop')
  const pairs = []
  const shown = []
  for (const start of starts) {
    const next = stops.filter(row => row.server_id === start.server_id && row.status_time > start.status_time)
      .reduce((best, row) => (best === null || row.status_time < best ? row.status_time : best), null)
    const seconds = next === null ? 0 : next - start.status_time
    if (next !== null) pairs.push({ server_id: start.server_id, start_time: start.status_time, stop_time: next, seconds })
    shown.push({ server_id: start.server_id, start_time: start.status_time, stop_time: next === null ? 'open' : next, seconds: next === null ? '' : seconds })
    frames.push(frame('pair', 'JOIN Servers', 'closed =', next === null ? `Server ${start.server_id} starts at ${start.status_time} and never stops, so it adds nothing.` : `Server ${start.server_id} runs from ${start.status_time} to ${next}.`, ['server_id', 'start_time', 'stop_time', 'seconds'], shown))
  }

  const total = pairs.reduce((sum, row) => sum + row.seconds, 0)
  frames.push(frame('sum', 'SELECT FLOOR', 'total =', `Closed sessions add up to ${total} seconds.`, ['server_id', 'start_time', 'stop_time', 'seconds'], pairs))

  const days = Math.floor(total / 86400)
  const result = [{ total_uptime_days: days }]
  frames.push(frame('done', 'FROM Paired', 'return', `Return ${days} whole day${days === 1 ? '' : 's'} of uptime.`, ['total_uptime_days'], result))
  return { input, result, frames }
}
