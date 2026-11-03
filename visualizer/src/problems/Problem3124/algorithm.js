// Knowledge-derived SQL walkthrough. The sample contacts, calls and tie rule are invented for this visualization.
export const sql = `WITH Ranked AS (
  SELECT c.type AS call_type,
    CONCAT(k.first_name, ' ', k.last_name) AS contact_name,
    c.duration AS seconds,
    ROW_NUMBER() OVER (PARTITION BY c.type ORDER BY c.duration DESC, k.first_name, k.last_name) AS call_rank
  FROM Calls c
  JOIN Contacts k ON k.id = c.contact_id
)
SELECT call_type, contact_name, SEC_TO_TIME(seconds) AS duration, call_rank
FROM Ranked
WHERE call_rank <= 3
ORDER BY call_type, call_rank`

export const code = sql.split('\n').map((text, index) => ({ line: index + 1, text }))
const SQL = key => {
  const index = code.findIndex(line => line.text.includes(key))
  if (index < 0) throw new Error(`Missing SQL line: ${key}`)
  return index + 1
}

export const python = `def longest_calls(contacts, calls):
    joined = calls.merge(contacts, left_on="contact_id", right_on="id")
    joined["contact_name"] = joined["first_name"] + " " + joined["last_name"]
    ranked = joined.sort_values(["type", "duration", "contact_name"], ascending=[True, False, True])
    ranked["call_rank"] = ranked.groupby("type").cumcount() + 1
    top = ranked[ranked["call_rank"] <= 3]
    return top.assign(duration=top["duration"].apply(fmt)).to_dict("records")`
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
  { id: 'join', label: 'Join', description: 'Attach each call to its contact name.' },
  { id: 'rank', label: 'Rank', description: 'Rank the calls inside each call type.' },
  { id: 'done', label: 'Result', description: 'Keep the three longest calls of each type.' },
]

const CONTACT_COLUMNS = ['id', 'first_name', 'last_name']
const CALL_COLUMNS = ['contact_id', 'type', 'duration']

function formatSeconds(total) {
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
    if (!Number.isInteger(row.duration) || row.duration < 0) throw new Error('duration must be a whole number of seconds.')
    if (!known.has(row.contact_id)) throw new Error('Every call contact_id must appear in Contacts.')
    return Object.fromEntries(CALL_COLUMNS.map(column => [column, row[column]]))
  })
  return { Contacts: parsedContacts, Calls: parsedCalls }
}

export function buildTrace(input) {
  const { Contacts, Calls } = input
  const nameOf = new Map(Contacts.map(row => [row.id, `${row.first_name} ${row.last_name}`]))
  const frames = []
  frames.push(frame('load', 'WITH Ranked', 'def ', `Read ${Contacts.length} contacts.`, CONTACT_COLUMNS, Contacts))
  frames.push(frame('load', 'FROM Calls', 'def ', `Read ${Calls.length} calls.`, CALL_COLUMNS, Calls))

  const joined = Calls.map(row => ({ call_type: row.type, contact_name: nameOf.get(row.contact_id), seconds: row.duration }))
  frames.push(frame('join', 'JOIN Contacts', 'joined =', `Attach ${joined.length} calls to their contact names.`, ['call_type', 'contact_name', 'seconds'], joined))

  const types = [...new Set(joined.map(row => row.call_type))].sort()
  const ranked = []
  for (const type of types) {
    const group = joined.filter(row => row.call_type === type)
      .sort((a, b) => b.seconds - a.seconds || (a.contact_name < b.contact_name ? -1 : a.contact_name > b.contact_name ? 1 : 0))
    group.forEach((row, index) => ranked.push({ ...row, call_rank: index + 1 }))
    frames.push(frame('rank', 'PARTITION BY', 'ranked =', `Rank the ${type} calls by length.`, ['call_type', 'contact_name', 'seconds', 'call_rank'], ranked))
  }

  const result = ranked.filter(row => row.call_rank <= 3)
    .map(row => ({ call_type: row.call_type, contact_name: row.contact_name, duration: formatSeconds(row.seconds), call_rank: row.call_rank }))
  frames.push(frame('done', 'ORDER BY call_type', 'return', `Return ${result.length} longest-call row${result.length === 1 ? '' : 's'}.`, ['call_type', 'contact_name', 'duration', 'call_rank'], result))
  return { input, result, frames }
}
