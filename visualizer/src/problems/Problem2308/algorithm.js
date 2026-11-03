// Knowledge-derived SQL walkthrough. The sample table is invented for this visualization.
export const sql = `WITH ranked AS (
SELECT user_id, gender,
ROW_NUMBER() OVER (PARTITION BY gender ORDER BY user_id) AS rn
FROM Genders
)
SELECT user_id, gender
FROM ranked
ORDER BY rn, CASE gender WHEN 'female' THEN 1 WHEN 'male' THEN 2 ELSE 3 END`

export const code = sql.split('\n').map((text, index) => ({ line: index + 1, text }))
const SQL = key => {
  const index = code.findIndex(line => line.text.includes(key))
  if (index < 0) throw new Error(`Missing SQL line: ${key}`)
  return index + 1
}

export const python = `def arrange_by_gender(genders):
    genders = genders.sort_values("user_id")
    genders["rn"] = genders.groupby("gender").cumcount() + 1
    order = {"female": 1, "male": 2, "other": 3}
    genders["g"] = genders["gender"].map(order).fillna(4)
    return genders.sort_values(["rn", "g"])[["user_id", "gender"]]`
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
  { id: 'load', label: 'Load', description: 'Read the user rows.' },
  { id: 'rank', label: 'Number', description: 'Number the users inside each gender.' },
  { id: 'order', label: 'Interleave', description: 'Read the rows round-robin.' },
  { id: 'done', label: 'Result', description: 'Return the arranged users.' },
]

const GENDER_ORDER = ['female', 'male', 'other']
const COLUMNS = ['user_id', 'gender']
const rankOf = gender => {
  const index = GENDER_ORDER.indexOf(gender)
  return index < 0 ? GENDER_ORDER.length : index
}

export function parseInput(text) {
  const input = JSON.parse(text)
  const rows = input && Array.isArray(input.Genders) ? input.Genders : null
  if (!rows || rows.length < 1 || rows.length > 30) throw new Error('Genders needs 1 to 30 rows.')
  for (const row of rows) {
    if (!row || typeof row !== 'object' || COLUMNS.some(column => !(column in row))) throw new Error(`Genders rows need ${COLUMNS.join(', ')}.`)
    if (!Number.isInteger(row.user_id) || typeof row.gender !== 'string' || row.gender === '') throw new Error('user_id must be an integer and gender must be text.')
  }
  return { Genders: rows.map(row => Object.fromEntries(COLUMNS.map(column => [column, row[column]]))) }
}

export function buildTrace(input) {
  const { Genders } = input
  const frames = [frame('load', 'FROM Genders', 'def ', 'Read the user rows in the order they are stored.', COLUMNS, Genders)]
  const rankColumns = ['user_id', 'gender', 'rn']
  const genders = [...new Set(Genders.map(row => row.gender))]
    .sort((a, b) => rankOf(a) - rankOf(b) || (a < b ? -1 : a > b ? 1 : 0))
  const ranked = []
  for (const gender of genders) {
    const members = Genders.filter(row => row.gender === gender).sort((a, b) => a.user_id - b.user_id)
    members.forEach((row, index) => ranked.push({ user_id: row.user_id, gender, rn: index + 1 }))
    frames.push(frame('rank', 'ROW_NUMBER()', 'genders["rn"]', `Number the ${gender} users by user_id: ${members.map(row => row.user_id).join(', ')}.`, rankColumns, ranked))
  }
  const byRound = (a, b) => a.rn - b.rn || rankOf(a.gender) - rankOf(b.gender)
  const ordered = [...ranked].sort(byRound)
  frames.push(frame('order', 'ORDER BY rn', 'order = ', 'Read the rows by round number first, then by gender order.', rankColumns, ordered))
  const result = ordered.map(row => ({ user_id: row.user_id, gender: row.gender }))
  frames.push(frame('done', 'FROM ranked', 'return', `Return ${result.length} users in round-robin order.`, COLUMNS, result))
  return { input, result, frames }
}
