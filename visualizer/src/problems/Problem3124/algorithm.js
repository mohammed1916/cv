// SQL walkthrough: the three longest incoming and outgoing calls, one table per query stage.
// The sample contacts and calls are invented for this visualization.
export const sql = `WITH T AS (
  SELECT
    first_name,
    type,
    DATE_FORMAT(SEC_TO_TIME(duration), '%H:%i:%s') AS duration_formatted,
    RANK() OVER (
      PARTITION BY type
      ORDER BY duration DESC
    ) AS rk
  FROM Calls AS c1
  JOIN Contacts AS c2 ON c1.contact_id = c2.id
)
SELECT first_name, type, duration_formatted
FROM T
WHERE rk <= 3
ORDER BY type DESC, duration_formatted DESC, first_name DESC`

export const code = sql.split('\n').map((text, index) => ({ line: index + 1, text }))
const SQL = key => {
  const index = code.findIndex(line => line.text.includes(key))
  if (index < 0) throw new Error(`Missing SQL line: ${key}`)
  return index + 1
}

export const python = `def longest_calls(contacts, calls):
    joined = calls.merge(contacts, left_on="contact_id", right_on="id")
    joined["duration_formatted"] = joined["duration"].apply(fmt)
    joined["rk"] = joined.groupby("type")["duration"].rank(method="min", ascending=False)
    top = joined[joined["rk"] <= 3]
    ordered = top.sort_values(["type", "duration_formatted", "first_name"], ascending=False)
    return ordered[["first_name", "type", "duration_formatted"]].to_dict("records")`
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
  { id: 'load', label: 'Load', description: 'Read the contacts and calls.' },
  { id: 'join', label: 'Join', description: 'Attach each call to its contact first name.' },
  { id: 'rank', label: 'Rank', description: 'Rank the calls inside each type, longest first.' },
  { id: 'done', label: 'Result', description: 'Keep ranks one to three and sort the output.' },
]

const CONTACT_COLUMNS = ['id', 'first_name', 'last_name']
const CALL_COLUMNS = ['contact_id', 'type', 'duration']
const TYPES = ['incoming', 'outgoing']

export function formatSeconds(total) {
  const hours = Math.floor(total / 3600)
  const minutes = Math.floor((total % 3600) / 60)
  const seconds = total % 60
  return [hours, minutes, seconds].map(part => String(part).padStart(2, '0')).join(':')
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with Contacts and Calls tables.')
  const contacts = input.Contacts
  const calls = input.Calls
  if (!Array.isArray(contacts) || contacts.length < 1 || contacts.length > 12) throw new Error('Contacts needs 1 to 12 rows.')
  if (!Array.isArray(calls) || calls.length < 1 || calls.length > 12) throw new Error('Calls needs 1 to 12 rows.')
  const parsedContacts = contacts.map(row => {
    if (!row || typeof row !== 'object' || CONTACT_COLUMNS.some(column => !(column in row))) throw new Error(`Contacts rows need ${CONTACT_COLUMNS.join(', ')}.`)
    return Object.fromEntries(CONTACT_COLUMNS.map(column => [column, row[column]]))
  })
  const known = new Set(parsedContacts.map(row => row.id))
  const parsedCalls = calls.map(row => {
    if (!row || typeof row !== 'object' || CALL_COLUMNS.some(column => !(column in row))) throw new Error(`Calls rows need ${CALL_COLUMNS.join(', ')}.`)
    if (!TYPES.includes(row.type)) throw new Error('type must be incoming or outgoing.')
    if (!Number.isInteger(row.duration) || row.duration < 0) throw new Error('duration must be a whole number of seconds.')
    if (!known.has(row.contact_id)) throw new Error('Every call contact_id must appear in Contacts.')
    return Object.fromEntries(CALL_COLUMNS.map(column => [column, row[column]]))
  })
  return { Contacts: parsedContacts, Calls: parsedCalls }
}

export function buildTrace(input) {
  const { Contacts, Calls } = input
  const nameOf = new Map(Contacts.map(row => [row.id, row.first_name]))
  const frames = []
  frames.push(frame('load', 'FROM Calls', 'def ', `Read ${Contacts.length} contacts.`, CONTACT_COLUMNS, Contacts))
  frames.push(frame('load', 'FROM Calls', 'def ', `Read ${Calls.length} calls.`, CALL_COLUMNS, Calls))

  const joined = Calls.map(row => ({ first_name: nameOf.get(row.contact_id), type: row.type, seconds: row.duration }))
  frames.push(frame('join', 'JOIN Contacts', 'joined =', `Attach ${joined.length} calls to their first names.`, ['first_name', 'type', 'seconds'], joined))

  const ranked = []
  for (const type of TYPES) {
    const group = joined.filter(row => row.type === type).sort((a, b) => b.seconds - a.seconds)
    let rank = 0
    let previous = null
    group.forEach((row, index) => {
      if (row.seconds !== previous) rank = index + 1
      previous = row.seconds
      ranked.push({ first_name: row.first_name, type: row.type, seconds: row.seconds, rk: rank })
    })
    frames.push(frame('rank', 'PARTITION BY type', 'joined["rk"]', `Rank the ${type} calls; equal durations share a rank.`, ['first_name', 'type', 'seconds', 'rk'], ranked.filter(row => row.type === type)))
  }

  const top = ranked.filter(row => row.rk <= 3).map(row => ({
    first_name: row.first_name, type: row.type, duration_formatted: formatSeconds(row.seconds),
  }))
  const result = top.sort((a, b) => (b.type.localeCompare(a.type)) || (b.duration_formatted.localeCompare(a.duration_formatted)) || (b.first_name.localeCompare(a.first_name)))
  frames.push(frame('done', 'ORDER BY type DESC', 'return', `Return ${result.length} row${result.length === 1 ? '' : 's'}, ordered by type, duration and first name, all descending.`, ['first_name', 'type', 'duration_formatted'], result))
  return { input, result, frames }
}
