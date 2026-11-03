// Knowledge-derived teaching version. The sample tables are invented for this visualization.
const SQL = `SELECT user_id, name, mail
FROM Users
WHERE mail REGEXP BINARY '^[A-Za-z][A-Za-z0-9_.-]*@leetcode[.]com$'
ORDER BY user_id`

const PANDAS = `import pandas as pd

def valid_mails(users):
    keep = users["mail"].str.fullmatch(r"[A-Za-z][A-Za-z0-9_.\\-]*@leetcode\\.com")
    return users[keep][["user_id", "name", "mail"]].sort_values("user_id")`

const SQL_LINES = SQL.split('\n')
const PY_LINES = PANDAS.split('\n')

function lineOf(lines, text) {
  const index = lines.findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`Missing line: ${text}`)
  return index + 1
}

export const sql = SQL
export const python = PANDAS
export const code = SQL_LINES.map((text, index) => ({ line: index + 1, text }))

const frame = (phase, sqlText, pyText, message, columns, rows) => ({
  phase,
  activeLine: lineOf(SQL_LINES, sqlText),
  pythonLine: lineOf(PY_LINES, pyText),
  message,
  columns: [...columns],
  rows: rows.map(row => ({ ...row })),
})

// Same rules as the pattern: a letter first, then letters, digits, _, . or -, then exactly @leetcode.com.
function verdict(mail) {
  const at = mail.lastIndexOf('@')
  if (at < 0) return 'no @ sign'
  const prefix = mail.slice(0, at)
  const domain = mail.slice(at + 1)
  if (domain !== 'leetcode.com') return 'the domain must be exactly leetcode.com'
  if (!/^[A-Za-z]/.test(prefix)) return 'the prefix must start with a letter'
  if (!/^[A-Za-z][A-Za-z0-9_.-]*$/.test(prefix)) return 'the prefix has a character outside letters, digits, _, . and -'
  return 'valid'
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || !Array.isArray(input.Users) || input.Users.length > 12) throw new Error('Use a Users list of at most 12 rows.')
  const Users = input.Users.map(row => {
    if (!row || !Number.isInteger(row.user_id) || typeof row.name !== 'string' || typeof row.mail !== 'string') {
      throw new Error('Each user needs an integer user_id, a name and a mail.')
    }
    return { user_id: row.user_id, name: row.name, mail: row.mail }
  })
  return { Users }
}

export function buildTrace({ Users }) {
  const frames = [frame('load', 'FROM Users', 'def valid_mails', `Read ${Users.length} users and check each mail.`, ['user_id', 'name', 'mail'], Users)]
  const sorted = [...Users].sort((a, b) => a.user_id - b.user_id)
  const checked = []
  const result = []
  for (const user of sorted) {
    const reason = verdict(user.mail)
    const keep = reason === 'valid'
    checked.push({ user_id: user.user_id, name: user.name, mail: user.mail, verdict: keep ? 'keep' : 'drop' })
    if (keep) result.push({ user_id: user.user_id, name: user.name, mail: user.mail })
    frames.push(frame('check', 'WHERE mail REGEXP', 'keep = ',
      `${user.mail}: ${keep ? 'keep' : `drop, because ${reason}`}.`, ['user_id', 'name', 'mail', 'verdict'], checked))
  }
  frames.push(frame('done', 'ORDER BY user_id', 'return users', `Returned ${result.length} users with valid mails.`, ['user_id', 'name', 'mail'], result))
  return { input: { Users }, result, frames }
}
