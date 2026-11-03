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

export const sql = `SELECT transaction_date,
       COALESCE(SUM(CASE WHEN amount % 2 = 1 THEN amount END), 0) AS odd_sum,
       COALESCE(SUM(CASE WHEN amount % 2 = 0 THEN amount END), 0) AS even_sum
FROM transactions
GROUP BY transaction_date
ORDER BY transaction_date`
const sqlLines = sql.split('\n')
export const code = sqlLines.map((text, index) => ({ line: index + 1, text }))

export const python = `import pandas as pd

def odd_even_transactions(transactions):
    df = transactions.copy()
    df["parity"] = df["amount"] % 2
    odd = df[df["parity"] == 1].groupby("transaction_date")["amount"].sum()
    even = df[df["parity"] == 0].groupby("transaction_date")["amount"].sum()
    dates = sorted(df["transaction_date"].unique())
    out = pd.DataFrame({"transaction_date": dates})
    out["odd_sum"] = [int(odd.get(d, 0)) for d in dates]
    out["even_sum"] = [int(even.get(d, 0)) for d in dates]
    return out`
const pyLines = python.split('\n')
const L = text => lineOf(sqlLines, text)
const P = text => lineOf(pyLines, text)
const frameAt = (phase, sqlText, pyText, message, columns, rows) => ({ phase, activeLine: L(sqlText), pythonLine: P(pyText), message, columns, rows: snap(rows) })

export const phases = [
  { id: 'load', label: 'Load', description: 'Read the transactions.' },
  { id: 'split', label: 'Split', description: 'Label each amount odd or even.' },
  { id: 'sum', label: 'Sum', description: 'Sum each parity for each date, using zero when absent.' },
  { id: 'done', label: 'Result', description: 'Output one row per date in date order.' },
]

const COLS = ['transaction_id', 'amount', 'transaction_date']
const SPLIT_COLS = ['transaction_id', 'amount', 'transaction_date', 'parity']
const RESULT_COLS = ['transaction_date', 'odd_sum', 'even_sum']

export function parseInput(text) {
  const input = parseJsonObject(text)
  const rows = requireRows(input, 'transactions', COLS)
  for (const row of rows) {
    if (!Number.isInteger(row.amount) || row.amount < 0) throw new Error('amount is a non-negative integer.')
    if (typeof row.transaction_date !== 'string' || row.transaction_date === '') throw new Error('transaction_date is text.')
  }
  return input
}

export function buildTrace(input) {
  const rows = input.transactions
  const frames = [frameAt('load', 'FROM transactions', 'def odd_even_transactions', `Read ${rows.length} transactions.`, COLS, rows)]
  const labelled = rows.map(row => ({ ...row, parity: row.amount % 2 === 1 ? 'odd' : 'even' }))
  frames.push(frameAt('split', 'CASE WHEN amount % 2 = 1', 'df["parity"] = df["amount"] % 2', 'Label each amount by its remainder after dividing by two.', SPLIT_COLS, labelled))
  const byDate = new Map()
  for (const row of labelled) {
    const entry = byDate.get(row.transaction_date) || { transaction_date: row.transaction_date, odd_sum: 0, even_sum: 0 }
    if (row.parity === 'odd') entry.odd_sum += row.amount
    else entry.even_sum += row.amount
    byDate.set(row.transaction_date, entry)
  }
  const sums = [...byDate.values()].sort((a, b) => (a.transaction_date < b.transaction_date ? -1 : a.transaction_date > b.transaction_date ? 1 : 0))
  frames.push(frameAt('sum', 'SUM(CASE WHEN amount % 2 = 0', 'out["even_sum"]', `Sum the odd and even amounts for ${sums.length} dates.`, RESULT_COLS, sums))
  frames.push(frameAt('done', 'ORDER BY transaction_date', 'return out', 'Output one row per date in date order.', RESULT_COLS, sums))
  return { input, result: sums, frames }
}
