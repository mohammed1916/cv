// Knowledge-derived teaching model. The sample tables are invented for this visualization.
export function snap(rows) {
  return rows.map(row => ({ ...row }))
}

export function lineOf(lines, text) {
  const index = lines.findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`Missing code line for: ${text}`)
  return index + 1
}

export function parseJsonObject(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use a JSON object whose keys name the tables.')
  return input
}

export function requireRows(input, name, columns, maxRows = 12) {
  const rows = input[name]
  if (!Array.isArray(rows) || rows.length > maxRows) throw new Error(`${name} must be a list of at most ${maxRows} rows.`)
  rows.forEach((row, index) => {
    if (!row || typeof row !== 'object' || Array.isArray(row)) throw new Error(`${name} row ${index + 1} must be an object.`)
    columns.forEach(column => { if (!(column in row)) throw new Error(`${name} row ${index + 1} needs ${column}.`) })
  })
  return rows
}

export const sql = `SELECT DATE_FORMAT(trans_date, '%Y-%m') AS month,
       country,
       COUNT(*) AS trans_count,
       SUM(CASE WHEN state = 'approved' THEN 1 ELSE 0 END) AS approved_count,
       SUM(amount) AS trans_total_amount,
       SUM(CASE WHEN state = 'approved' THEN amount ELSE 0 END) AS approved_total_amount
FROM Transactions
GROUP BY month, country
ORDER BY month, country IS NULL, country`
const sqlLines = sql.split('\n')
export const code = sqlLines.map((text, index) => ({ line: index + 1, text }))
export const python = `import pandas as pd

def monthly_transactions(transactions):
    tx = transactions.assign(month=transactions["trans_date"].str[:7])
    tx["approved"] = tx["state"] == "approved"
    tx["approved_amount"] = tx["amount"].where(tx["approved"], 0)
    grouped = tx.groupby(["month", "country"], dropna=False).agg(
        trans_count=("id", "size"),
        approved_count=("approved", "sum"),
        trans_total_amount=("amount", "sum"),
        approved_total_amount=("approved_amount", "sum"),
    ).reset_index()
    return grouped.sort_values(["month", "country"], na_position="last")`
const pyLines = python.split('\n')
const L = text => lineOf(sqlLines, text)
const P = text => lineOf(pyLines, text)
const frameAt = (phase, sqlText, pyText, message, columns, rows) => ({ phase, activeLine: L(sqlText), pythonLine: P(pyText), message, columns, rows: snap(rows) })

export const phases = [
  { id: 'load', label: 'Load', description: 'Read the transaction rows.' },
  { id: 'month', label: 'Month', description: 'Label each row with its year and month.' },
  { id: 'group', label: 'Group', description: 'Group by month and country, NULL country included.' },
  { id: 'order', label: 'Order', description: 'Sort by month, then country with NULL last.' },
  { id: 'done', label: 'Result', description: 'Output the monthly summary.' },
]
export const inputLabel = 'JSON object with a transactions table'
export const complexity = 'Linear in the transaction rows, plus sorting the month and country groups.'
const COLS = ['id', 'country', 'state', 'amount', 'trans_date']
const SAMPLE = { transactions: [
  { id: 1, country: 'US', state: 'approved', amount: 1000, trans_date: '2018-12-18' },
  { id: 2, country: 'US', state: 'declined', amount: 2000, trans_date: '2018-12-19' },
  { id: 3, country: 'US', state: 'approved', amount: 2000, trans_date: '2019-01-01' },
  { id: 4, country: 'DE', state: 'approved', amount: 2000, trans_date: '2019-01-07' },
  { id: 5, country: null, state: 'approved', amount: 500, trans_date: '2019-01-08' },
  { id: 6, country: 'DE', state: 'declined', amount: 300, trans_date: '2019-01-09' },
] }
export const examples = [{ label: 'Teaching sample', input: JSON.stringify(SAMPLE) }]

export function parseInput(text) {
  const input = parseJsonObject(text)
  const rows = requireRows(input, 'transactions', COLS, 30)
  rows.forEach((row, index) => {
    if (!['approved', 'declined'].includes(row.state)) throw new Error(`transactions row ${index + 1} state must be approved or declined.`)
  })
  return input
}

export function buildTrace(input) {
  const transactions = input.transactions
  const frames = [frameAt('load', 'FROM Transactions', 'def monthly_transactions', `Load ${transactions.length} transactions.`, COLS, transactions)]
  const withMonth = transactions.map(row => ({ ...row, month: row.trans_date.slice(0, 7) }))
  frames.push(frameAt('month', "DATE_FORMAT(trans_date", 'tx = transactions.assign', 'Each row gets its year and month.', ['id', 'month', 'country', 'state', 'amount'], withMonth.map(({ trans_date, ...rest }) => rest)))
  const groups = new Map()
  for (const row of withMonth) {
    const key = JSON.stringify([row.month, row.country])
    const group = groups.get(key) || { month: row.month, country: row.country, trans_count: 0, approved_count: 0, trans_total_amount: 0, approved_total_amount: 0 }
    group.trans_count += 1
    group.trans_total_amount += row.amount
    if (row.state === 'approved') {
      group.approved_count += 1
      group.approved_total_amount += row.amount
    }
    groups.set(key, group)
  }
  const grouped = [...groups.values()]
  frames.push(frameAt('group', 'GROUP BY month, country', 'grouped = tx.groupby', `${grouped.length} month and country groups, NULL country included.`, ['month', 'country', 'trans_count', 'approved_count', 'trans_total_amount', 'approved_total_amount'], grouped))
  const result = [...grouped].sort((a, b) => {
    if (a.month !== b.month) return a.month < b.month ? -1 : 1
    if (a.country === null || b.country === null) return (a.country === null) - (b.country === null)
    return a.country < b.country ? -1 : a.country > b.country ? 1 : 0
  })
  frames.push(frameAt('order', 'ORDER BY month, country IS NULL', 'sort_values(["month", "country"]', 'Sort by month; a NULL country sorts after the named countries.', ['month', 'country', 'trans_count', 'approved_count', 'trans_total_amount', 'approved_total_amount'], result))
  frames.push(frameAt('done', 'SELECT DATE_FORMAT', 'return grouped', 'Output the monthly summary rows.', ['month', 'country', 'trans_count', 'approved_count', 'trans_total_amount', 'approved_total_amount'], result))
  return { input, result, frames }
}
