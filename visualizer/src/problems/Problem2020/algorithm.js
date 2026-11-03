// Knowledge-derived SQL walkthrough. The sample tables are invented for this visualization.
export const sql = `WITH active AS (
  SELECT DISTINCT account_id
  FROM Subscriptions
  WHERE start_date <= '2021-12-31' AND end_date >= '2021-01-01'
),
streamed AS (
  SELECT DISTINCT account_id
  FROM Streams
  WHERE stream_date BETWEEN '2021-01-01' AND '2021-12-31'
)
SELECT COUNT(*) AS accounts_count
FROM active a
WHERE NOT EXISTS (SELECT 1 FROM streamed s WHERE s.account_id = a.account_id)`

export const code = sql.split('\n').map((text, index) => ({ line: index + 1, text }))
const SQL = key => {
  const index = code.findIndex(line => line.text.includes(key))
  if (index < 0) throw new Error(`Missing SQL line: ${key}`)
  return index + 1
}

export const python = `def accounts_without_streams_2021(subscriptions, streams):
    active = subscriptions[(subscriptions["start_date"] <= "2021-12-31") & (subscriptions["end_date"] >= "2021-01-01")]
    streamed = streams[streams["stream_date"].between("2021-01-01", "2021-12-31")]["account_id"]
    kept = sorted(set(active["account_id"]) - set(streamed))
    return [{"accounts_count": len(kept)}]`
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
  { id: 'subs', label: 'Subscriptions', description: 'Keep subscriptions whose interval touches 2021.' },
  { id: 'streams', label: 'Streams', description: 'Mark the streams that fall inside 2021.' },
  { id: 'anti', label: 'Anti-join', description: 'Keep active accounts with no 2021 stream.' },
  { id: 'done', label: 'Result', description: 'Count the kept accounts.' },
]

function rowsOf(input, name, columns) {
  const rows = input[name]
  if (!Array.isArray(rows) || rows.length < 1 || rows.length > 12) throw new Error(`${name} needs 1 to 12 rows.`)
  return rows.map(row => {
    if (!row || typeof row !== 'object' || columns.some(column => !(column in row))) throw new Error(`${name} rows need ${columns.join(', ')}.`)
    return Object.fromEntries(columns.map(column => [column, String(row[column])]))
  })
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with Subscriptions and Streams tables.')
  return {
    Subscriptions: rowsOf(input, 'Subscriptions', ['account_id', 'start_date', 'end_date']),
    Streams: rowsOf(input, 'Streams', ['session_id', 'account_id', 'stream_date']),
  }
}

const inYear = date => date >= '2021-01-01' && date <= '2021-12-31'

export function buildTrace(input) {
  const { Subscriptions, Streams } = input
  const frames = []
  const subSummary = []
  const active = new Set()
  for (const sub of Subscriptions) {
    const overlaps = sub.start_date <= '2021-12-31' && sub.end_date >= '2021-01-01'
    if (overlaps) active.add(sub.account_id)
    subSummary.push({ account_id: sub.account_id, start_date: sub.start_date, end_date: sub.end_date, touches_2021: overlaps ? 'yes' : 'no' })
    frames.push(frame('subs', 'WHERE start_date', 'active =', `Account ${sub.account_id} ${overlaps ? 'has' : 'has no'} an interval that touches 2021.`, ['account_id', 'start_date', 'end_date', 'touches_2021'], subSummary))
  }

  const streamSummary = []
  const streamed = new Set()
  for (const stream of Streams) {
    const within = inYear(stream.stream_date)
    if (within) streamed.add(stream.account_id)
    streamSummary.push({ session_id: stream.session_id, account_id: stream.account_id, stream_date: stream.stream_date, in_2021: within ? 'yes' : 'no' })
    frames.push(frame('streams', 'WHERE stream_date', 'streamed =', `Session ${stream.session_id} ${within ? 'is' : 'is not'} inside 2021.`, ['session_id', 'account_id', 'stream_date', 'in_2021'], streamSummary))
  }

  const anti = []
  const kept = [...active].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
  const keptRows = []
  for (const account of kept) {
    const had = streamed.has(account)
    anti.push({ account_id: account, streamed_2021: had ? 'yes' : 'no', kept: had ? 'no' : 'yes' })
    if (!had) keptRows.push({ account_id: account })
    frames.push(frame('anti', 'NOT EXISTS', 'kept =', `Account ${account} ${had ? 'is dropped because it streamed in 2021' : 'stays'}.`, ['account_id', 'streamed_2021', 'kept'], anti))
  }
  const result = [{ accounts_count: keptRows.length }]
  frames.push(frame('done', 'SELECT COUNT', 'return', `Count ${keptRows.length} account${keptRows.length === 1 ? '' : 's'}.`, ['accounts_count'], result))
  return { input, result, frames }
}
