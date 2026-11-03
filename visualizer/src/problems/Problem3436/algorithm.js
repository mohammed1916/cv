// Knowledge-derived teaching model of a SQL filter task. Not the official statement; the rule is our own.
// Rule: the local part starts with a letter and continues with letters, digits, _, . or -; the domain is exactly example.com.
const PATTERN = /^[A-Za-z][A-Za-z0-9_.-]*@example\.com$/

export const phases = [
  { id: 'load', label: 'Load', description: 'Read every row of the Users table.' },
  { id: 'check', label: 'Check', description: 'Test each email against the pattern.' },
  { id: 'output', label: 'Output', description: 'Order the kept rows by user_id.' },
]

export const sql = `SELECT user_id, email
FROM users
WHERE email REGEXP '^[A-Za-z][A-Za-z0-9_.-]*@example[.]com$'
ORDER BY user_id;`

export const python = `def find_valid_emails(users):
    pattern = r"^[A-Za-z][A-Za-z0-9_.-]*@example\\.com$"
    keep = users[users["email"].str.match(pattern)]
    return keep[["user_id", "email"]].sort_values("user_id")`

const sqlLines = sql.split('\n')
const pyLines = python.split('\n')
export const code = sqlLines.map((text, index) => ({ line: index + 1, text }))
function L(text) {
  const index = sqlLines.findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`No SQL line contains: ${text}`)
  return index + 1
}
function P(text) {
  const index = pyLines.findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`No Python line contains: ${text}`)
  return index + 1
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || !Array.isArray(input.users) || input.users.length > 12) throw new Error('Use an object with a users list of at most 12 rows.')
  const users = input.users.map(row => {
    if (!Number.isInteger(row?.user_id) || typeof row.email !== 'string') throw new Error('Each user needs an integer user_id and a text email.')
    return { user_id: row.user_id, email: row.email }
  })
  return { users }
}

function reason(email) {
  if (PATTERN.test(email)) return 'passes the pattern'
  const at = email.lastIndexOf('@')
  if (at < 0) return 'has no @ sign'
  const local = email.slice(0, at)
  const domain = email.slice(at + 1)
  if (domain !== 'example.com') return `domain ${domain} is not example.com`
  if (!/^[A-Za-z]/.test(local)) return 'local part does not start with a letter'
  return 'local part has a character outside the allowed set'
}

const copy = list => list.map(row => ({ ...row }))

export function buildTrace(input) {
  const frames = []
  const kept = []
  frames.push({ phase: 'load', activeLine: L('FROM users'), pythonLine: P('def find_valid_emails'), message: `Loaded ${input.users.length} users.`, rows: copy(input.users) })
  for (const row of input.users) {
    if (PATTERN.test(row.email)) kept.push({ user_id: row.user_id, email: row.email })
    frames.push({ phase: 'check', activeLine: L('WHERE email'), pythonLine: P('keep ='), message: `user ${row.user_id} ${row.email}: ${reason(row.email)}.`, rows: copy(kept) })
  }
  const result = [...kept].sort((a, b) => a.user_id - b.user_id)
  frames.push({ phase: 'output', activeLine: L('ORDER BY'), pythonLine: P('return keep'), message: `Returned ${result.length} rows ordered by user_id.`, rows: copy(result) })
  return { input, result, frames }
}
