// Knowledge-derived SQL walkthrough. The sample tables are invented for this visualization.
// The rule (a Verified text dated the calendar day after signup) is as remembered and is labelled for verification.
export const sql = `SELECT DISTINCT e.user_id
FROM Emails e
JOIN Texts t ON t.email_id = e.email_id
WHERE t.signup_action = 'Verified'
  AND t.action_date = e.signup_date + INTERVAL 1 DAY
ORDER BY e.user_id`

export const code = sql.split('\n').map((text, index) => ({ line: index + 1, text }))
const SQL = key => {
  const index = code.findIndex(line => line.text.includes(key))
  if (index < 0) throw new Error(`Missing SQL line: ${key}`)
  return index + 1
}

export const python = `def second_day_verified(emails, texts):
    joined = texts.merge(emails, on="email_id")
    joined["gap"] = (pd.to_datetime(joined["action_date"]) - pd.to_datetime(joined["signup_date"])).dt.days
    kept = joined[(joined["signup_action"] == "Verified") & (joined["gap"] == 1)]
    return kept[["user_id"]].drop_duplicates().sort_values("user_id").to_dict("records")`
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
  { id: 'load', label: 'Load', description: 'Read the signups and the texts.' },
  { id: 'join', label: 'Join', description: 'Attach each text to its signup email.' },
  { id: 'gap', label: 'Gap', description: 'Count calendar days from signup to the action.' },
  { id: 'check', label: 'Check', description: 'Keep Verified texts exactly one day after signup.' },
  { id: 'done', label: 'Result', description: 'Return each qualifying user once.' },
]

const EMAIL_COLUMNS = ['email_id', 'user_id', 'signup_date']
const TEXT_COLUMNS = ['text_id', 'email_id', 'signup_action', 'action_date']
const DATE = /^\d{4}-\d{2}-\d{2}$/

function tableRows(input, name, columns) {
  const rows = input[name]
  if (!Array.isArray(rows) || rows.length < 1 || rows.length > 12) throw new Error(`${name} needs 1 to 12 rows.`)
  for (const row of rows) {
    if (!row || typeof row !== 'object' || columns.some(column => !(column in row))) throw new Error(`${name} rows need ${columns.join(', ')}.`)
  }
  return rows.map(row => Object.fromEntries(columns.map(column => [column, row[column]])))
}

const dayNumber = date => Date.parse(`${date}T00:00:00Z`) / 86400000

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with Emails and Texts tables.')
  const Emails = tableRows(input, 'Emails', EMAIL_COLUMNS)
  const Texts = tableRows(input, 'Texts', TEXT_COLUMNS)
  for (const row of Emails) {
    if (!Number.isInteger(row.email_id) || !Number.isInteger(row.user_id)) throw new Error('email_id and user_id are integers.')
    if (typeof row.signup_date !== 'string' || !DATE.test(row.signup_date)) throw new Error('signup_date is YYYY-MM-DD.')
  }
  for (const row of Texts) {
    if (!Number.isInteger(row.text_id) || !Number.isInteger(row.email_id)) throw new Error('text_id and email_id are integers.')
    if (typeof row.action_date !== 'string' || !DATE.test(row.action_date)) throw new Error('action_date is YYYY-MM-DD.')
    if (typeof row.signup_action !== 'string') throw new Error('signup_action is text.')
  }
  return { Emails, Texts }
}

export function buildTrace(input) {
  const { Emails, Texts } = input
  const frames = []
  frames.push(frame('load', 'FROM Emails', 'def ', `Load ${Emails.length} signups and ${Texts.length} texts.`, TEXT_COLUMNS, Texts))

  const emailById = new Map(Emails.map(row => [row.email_id, row]))
  const joined = Texts.filter(text => emailById.has(text.email_id)).map(text => {
    const email = emailById.get(text.email_id)
    return { text_id: text.text_id, user_id: email.user_id, signup_date: email.signup_date, signup_action: text.signup_action, action_date: text.action_date, gap: dayNumber(text.action_date) - dayNumber(email.signup_date), kept: '' }
  })
  const joinColumns = ['text_id', 'user_id', 'signup_date', 'signup_action', 'action_date', 'gap']
  frames.push(frame('join', 'JOIN Texts', 'joined = ', `Attach each text to its signup; ${joined.length} pairs found.`, joinColumns, joined))

  frames.push(frame('gap', 'INTERVAL 1 DAY', 'joined["gap"]', 'The gap is measured in whole calendar days.', joinColumns, joined))

  const kept = []
  joined.forEach((row, index) => {
    const ok = row.signup_action === 'Verified' && row.gap === 1
    row.kept = ok ? 'yes' : 'no'
    if (ok) kept.push({ user_id: row.user_id })
    frames.push(frame('check', 'WHERE t.signup_action', 'kept = ',
      `Text ${row.text_id}: ${row.signup_action} on ${row.action_date}, ${row.gap} day${row.gap === 1 ? '' : 's'} after signup, ${ok ? 'kept' : 'dropped'}.`,
      [...joinColumns, 'kept'], joined.slice(0, index + 1)))
  })

  const seen = new Set()
  const result = kept.filter(row => !seen.has(row.user_id) && seen.add(row.user_id)).sort((a, b) => a.user_id - b.user_id)
  frames.push(frame('done', 'ORDER BY e.user_id', 'return', `Return ${result.length} user${result.length === 1 ? '' : 's'}, each once.`, ['user_id'], result))
  return { input, result, frames }
}
