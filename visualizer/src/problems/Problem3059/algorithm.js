// Teaching teaching model. The sample table is invented for this visualization.
// Teaching rule: keep emails whose lower-cased domain ends in .com, then count the rows for each domain.
export const sql = `SELECT LOWER(SUBSTRING(email FROM POSITION('@' IN email) + 1)) AS domain,
       COUNT(*) AS cnt
FROM Emails
WHERE LOWER(email) LIKE '%@%.com'
GROUP BY LOWER(SUBSTRING(email FROM POSITION('@' IN email) + 1))
ORDER BY domain`

export const python = `import pandas as pd

def com_domain_counts(emails):
    lowered = emails["email"].str.lower()
    kept = lowered[lowered.str.match(r"^[^@]+@[^@]+\\.com$")]
    domains = kept.str.split("@").str[1]
    return domains.value_counts().rename_axis("domain").reset_index(name="cnt").sort_values("domain")`

const sqlLines = sql.split('\n')
const pyLines = python.split('\n')
export const code = sqlLines.map((text, index) => ({ line: index + 1, text }))

function lineOf(lines, text) {
  const index = lines.findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`Missing code line for: ${text}`)
  return index + 1
}
const L = text => lineOf(sqlLines, text)
const P = text => lineOf(pyLines, text)
const frame = (phase, sqlText, pyText, message, columns, rows) => ({
  phase, activeLine: L(sqlText), pythonLine: P(pyText), message, columns, rows: rows.map(row => ({ ...row })),
})

export const phases = [
  { id: 'load', label: 'Load', description: 'Read each email address.' },
  { id: 'extract', label: 'Extract', description: 'Take the lower-cased text after the @.' },
  { id: 'filter', label: 'Filter', description: 'Keep addresses whose domain ends in .com.' },
  { id: 'group', label: 'Group', description: 'Count the kept rows for each domain.' },
  { id: 'order', label: 'Order', description: 'Sort by domain.' },
  { id: 'done', label: 'Result', description: 'Output each domain and its count.' },
]

const LOAD_COLS = ['id', 'email']
const EXTRACT_COLS = ['id', 'email', 'domain']
const COUNT_COLS = ['domain', 'cnt']

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input) || !Array.isArray(input.Emails)) throw new Error('Use an object with an Emails list.')
  if (input.Emails.length < 1 || input.Emails.length > 16) throw new Error('Emails has 1 to 16 rows.')
  const ids = new Set()
  for (const row of input.Emails) {
    if (!Number.isInteger(row?.id) || typeof row.email !== 'string' || row.email.length < 3 || row.email.length > 40) {
      throw new Error('Each row needs an integer id and an email text of 3 to 40 characters.')
    }
    if (ids.has(row.id)) throw new Error('id values must be unique.')
    ids.add(row.id)
  }
  return { Emails: input.Emails.map(row => ({ id: row.id, email: row.email })) }
}

const domainOf = email => email.toLowerCase().slice(email.indexOf('@') + 1)

export function buildTrace(input) {
  const emails = input.Emails
  const frames = [frame('load', 'FROM Emails', 'def com_domain_counts', `Load ${emails.length} email addresses.`, LOAD_COLS, emails)]
  const extracted = emails.map(row => ({ id: row.id, email: row.email, domain: row.email.includes('@') ? domainOf(row.email) : '' }))
  frames.push(frame('extract', 'SELECT LOWER(SUBSTRING', 'lowered = emails', 'Lower-case the address and take the text after the @.', EXTRACT_COLS, extracted))
  const kept = extracted.filter(row => /^[^@]+@[^@]+\.com$/.test(row.email.toLowerCase()))
  frames.push(frame('filter', 'WHERE LOWER(email) LIKE', 'kept = lowered[', `${kept.length} addresses end in .com.`, EXTRACT_COLS, kept))
  const counts = new Map()
  for (const row of kept) counts.set(row.domain, (counts.get(row.domain) || 0) + 1)
  const groups = [...counts].map(([domain, cnt]) => ({ domain, cnt }))
  frames.push(frame('group', 'GROUP BY LOWER', 'domains = kept.str.split', 'Count the kept rows for each domain.', COUNT_COLS, groups))
  const result = [...groups].sort((a, b) => (a.domain < b.domain ? -1 : a.domain > b.domain ? 1 : 0))
  frames.push(frame('order', 'ORDER BY domain', 'return domains', 'Sort the domains alphabetically.', COUNT_COLS, result))
  frames.push(frame('done', 'COUNT(*) AS cnt', 'return domains', 'Output each domain and its count.', COUNT_COLS, result))
  return { input, result, frames }
}
