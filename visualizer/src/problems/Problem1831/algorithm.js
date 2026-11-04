// SQL walkthrough. The sample tables are invented for this visualization.
export const sql = `WITH daily_max AS (
  SELECT DATE(day) AS calendar_day, MAX(amount) AS top_amount
  FROM Transactions
  GROUP BY DATE(day)
)
SELECT t.transaction_id
FROM Transactions t
JOIN daily_max d
  ON DATE(t.day) = d.calendar_day
  AND t.amount = d.top_amount
ORDER BY t.transaction_id`

export const code = sql.split('\n').map((text, index) => ({ line: index + 1, text }))
const SQL = key => {
  const index = code.findIndex(line => line.text.includes(key))
  if (index < 0) throw new Error(`Missing SQL line: ${key}`)
  return index + 1
}

export const python = `def top_transactions_by_day(transactions):
    t = transactions.assign(calendar_day=pd.to_datetime(transactions["day"]).dt.date)
    tops = t.groupby("calendar_day")["amount"].transform("max")
    kept = t[t["amount"] == tops]
    return kept[["transaction_id"]].sort_values("transaction_id")`
const PY_LINES = python.split('\n')
const PY = key => {
  const index = PY_LINES.findIndex(line => line.includes(key))
  if (index < 0) throw new Error(`Missing Python line: ${key}`)
  return index + 1
}

const TX_COLUMNS = ['transaction_id', 'day', 'amount']
const DAILY_COLUMNS = ['calendar_day', 'top_amount']
const CHECK_COLUMNS = ['transaction_id', 'calendar_day', 'amount', 'top_amount', 'kept']

const frame = (phase, sqlKey, pyKey, message, columns, rows) => ({
  phase, activeLine: SQL(sqlKey), pythonLine: PY(pyKey), message, columns, rows: rows.map(row => ({ ...row })),
})

export const phases = [
  { id: 'load', label: 'Load', description: 'Read the transactions with their date-time values.' },
  { id: 'daily', label: 'Daily max', description: 'Find the largest amount on each calendar day.' },
  { id: 'check', label: 'Check', description: 'Keep each transaction that ties its day largest amount.' },
  { id: 'done', label: 'Result', description: 'Output the kept transaction IDs in order.' },
]

export const inputLabel = 'Object with a Transactions table (day as a date-time string)'
export const complexity = 'O(n log n) for the sort, or O(n) with a per-day hash map of maxima. The visualizer caps the table at 12 rows.'

function tableRows(input, name, columns) {
  const rows = input[name]
  if (!Array.isArray(rows) || rows.length < 1 || rows.length > 12) throw new Error(`${name} needs 1 to 12 rows.`)
  for (const row of rows) {
    if (!row || typeof row !== 'object' || columns.some(column => !(column in row))) throw new Error(`${name} rows need ${columns.join(', ')}.`)
  }
  return rows.map(row => Object.fromEntries(columns.map(column => [column, row[column]])))
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with a Transactions table.')
  const Transactions = tableRows(input, 'Transactions', TX_COLUMNS)
  for (const row of Transactions) {
    if (!/^\d{4}-\d{2}-\d{2}/.test(String(row.day))) throw new Error('day must start with YYYY-MM-DD.')
  }
  return { Transactions }
}

export function buildTrace(input) {
  const rows = [...input.Transactions].sort((a, b) => a.transaction_id - b.transaction_id)
  const frames = []
  frames.push(frame('load', 'FROM Transactions', 'def ', `Load ${rows.length} transactions.`, TX_COLUMNS, rows))

  const top = new Map()
  for (const row of rows) {
    const day = row.day.slice(0, 10)
    top.set(day, Math.max(top.get(day) ?? -Infinity, row.amount))
  }
  const dailyRows = [...top].sort((a, b) => (a[0] < b[0] ? -1 : 1)).map(([calendar_day, top_amount]) => ({ calendar_day, top_amount }))
  frames.push(frame('daily', 'MAX(amount)', 'tops =', 'Find the largest amount on each calendar day.', DAILY_COLUMNS, dailyRows))

  const checked = []
  const result = []
  for (const row of rows) {
    const day = row.day.slice(0, 10)
    const keep = row.amount === top.get(day)
    checked.push({ transaction_id: row.transaction_id, calendar_day: day, amount: row.amount, top_amount: top.get(day), kept: keep ? 'yes' : 'no' })
    if (keep) result.push({ transaction_id: row.transaction_id })
    frames.push(frame('check', 'ON DATE(t.day)', 'kept =',
      `Transaction ${row.transaction_id} ${keep ? 'ties' : 'is below'} the largest amount for ${day}.`, CHECK_COLUMNS, checked))
  }
  frames.push(frame('done', 'ORDER BY t.transaction_id', 'return kept', `Return ${result.length} transaction IDs.`, ['transaction_id'], result))
  return { input, result, frames }
}
