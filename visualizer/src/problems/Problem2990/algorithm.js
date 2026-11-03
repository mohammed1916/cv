// Knowledge-derived SQL walkthrough. The sample tables are invented for this visualization.
export const sql = `SELECT user_id
FROM Loans
WHERE loan_type IN ('Mortgage', 'Refinance')
GROUP BY user_id
HAVING COUNT(DISTINCT loan_type) = 2
ORDER BY user_id`

export const code = sql.split('\n').map((text, index) => ({ line: index + 1, text }))
const SQL = key => {
  const index = code.findIndex(line => line.text.includes(key))
  if (index < 0) throw new Error(`Missing SQL line: ${key}`)
  return index + 1
}

export const python = `def loan_pairs(loans):
    wanted = loans[loans["loan_type"].isin(["Mortgage", "Refinance"])]
    counts = wanted.groupby("user_id")["loan_type"].nunique()
    return counts[counts == 2].index.to_frame(index=False)`
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
  { id: 'load', label: 'Load', description: 'Read every loan.' },
  { id: 'filter', label: 'Filter', description: 'Keep only Mortgage and Refinance loans.' },
  { id: 'group', label: 'Group', description: 'Count distinct loan types for each user.' },
  { id: 'done', label: 'Result', description: 'Report users with both types.' },
]

function tableRows(input, name, columns) {
  const rows = input[name]
  if (!Array.isArray(rows) || rows.length < 1 || rows.length > 20) throw new Error(`${name} needs 1 to 20 rows.`)
  return rows.map(row => {
    if (!row || typeof row !== 'object' || columns.some(column => !(column in row))) throw new Error(`${name} rows need ${columns.join(', ')}.`)
    return Object.fromEntries(columns.map(column => [column, row[column]]))
  })
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with a Loans table.')
  return { Loans: tableRows(input, 'Loans', ['loan_id', 'user_id', 'loan_type']) }
}

export function buildTrace(input) {
  const rows = input.Loans
  const frames = []
  frames.push(frame('load', 'FROM Loans', 'def loan_pairs', 'Read every loan.', ['loan_id', 'user_id', 'loan_type'], rows))

  const wanted = rows.filter(row => row.loan_type === 'Mortgage' || row.loan_type === 'Refinance')
  frames.push(frame('filter', 'WHERE loan_type IN', 'wanted = ', `Keep ${wanted.length} of ${rows.length} loans. Other types are ignored.`, ['loan_id', 'user_id', 'loan_type'], wanted))

  const types = new Map()
  for (const row of wanted) {
    if (!types.has(row.user_id)) types.set(row.user_id, new Set())
    types.get(row.user_id).add(row.loan_type)
  }
  const summary = []
  const result = []
  for (const user of [...types.keys()].sort((a, b) => a - b)) {
    const distinct = types.get(user).size
    const kept = distinct === 2
    summary.push({ user_id: user, distinct_types: distinct, kept: kept ? 'yes' : 'no' })
    if (kept) result.push({ user_id: user })
    frames.push(frame('group', 'HAVING COUNT(DISTINCT', 'counts = ', `User ${user} has ${distinct} of the two required types, so it ${kept ? 'stays' : 'is dropped'}.`, ['user_id', 'distinct_types', 'kept'], summary))
  }
  frames.push(frame('done', 'ORDER BY user_id', 'return', `Return ${result.length} user${result.length === 1 ? '' : 's'}.`, ['user_id'], result))
  return { input, result, frames }
}
