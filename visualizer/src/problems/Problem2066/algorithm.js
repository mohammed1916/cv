// Knowledge-derived SQL walkthrough. The sample transactions are invented for this visualization.
export const sql = `SELECT account_id, day,
       SUM(CASE WHEN type = 'Deposit' THEN amount ELSE -amount END)
         OVER (PARTITION BY account_id ORDER BY day
               ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS balance
FROM Transactions
ORDER BY account_id, day`

export const code = sql.split('\n').map((text, index) => ({ line: index + 1, text }))
const SQL = key => {
  const index = code.findIndex(line => line.text.includes(key))
  if (index < 0) throw new Error(`Missing SQL line: ${key}`)
  return index + 1
}

export const python = `def account_balance(transactions):
    t = transactions.sort_values(["account_id", "day"]).copy()
    t["signed"] = t["amount"].where(t["type"] == "Deposit", -t["amount"])
    t["balance"] = t.groupby("account_id")["signed"].cumsum()
    return t[["account_id", "day", "balance"]]`
const PY_LINES = python.split('\n')
const PY = key => {
  const index = PY_LINES.findIndex(line => line.includes(key))
  if (index < 0) throw new Error(`Missing Python line: ${key}`)
  return index + 1
}

export const phases = [
  { id: 'load', label: 'Rows', description: 'Read the transactions as they were recorded.' },
  { id: 'order', label: 'Order', description: 'Sort each account by day.' },
  { id: 'running', label: 'Running', description: 'Add or subtract each amount in turn.' },
  { id: 'done', label: 'Result', description: 'Return the balance after each day.' },
]

const COLUMNS = ['account_id', 'day', 'type', 'amount']

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with a Transactions table.')
  const rows = input.Transactions
  if (!Array.isArray(rows) || rows.length > 16) throw new Error('Transactions allows at most 16 rows.')
  const seen = new Set()
  const table = rows.map(row => {
    if (!row || typeof row !== 'object' || COLUMNS.some(column => !(column in row))) throw new Error(`Transactions rows need ${COLUMNS.join(', ')}.`)
    if (row.type !== 'Deposit' && row.type !== 'Withdraw') throw new Error('type is Deposit or Withdraw.')
    if (!Number.isInteger(row.amount) || row.amount < 0) throw new Error('amount is a non-negative integer.')
    const key = `${row.account_id}/${row.day}`
    if (seen.has(key)) throw new Error('Each account has at most one transaction per day in this visualization.')
    seen.add(key)
    return { account_id: row.account_id, day: row.day, type: row.type, amount: row.amount }
  })
  return { Transactions: table }
}

export function buildTrace(input) {
  const { Transactions } = input
  const frames = []
  const push = (phase, sqlKey, pyKey, message, columns, rows) => frames.push({
    phase, activeLine: SQL(sqlKey), pythonLine: PY(pyKey), message, columns, rows: rows.map(row => ({ ...row })),
  })

  push('load', 'FROM Transactions', 'def account_balance', 'Read the transactions in the order they were recorded.', COLUMNS, Transactions)
  const sorted = [...Transactions].sort((a, b) => a.account_id - b.account_id || a.day - b.day)
  push('order', 'ORDER BY account_id', 't = transactions.sort_values', 'Sort by account, then by day, so each running total follows time.', COLUMNS, sorted)

  const running = new Map()
  const seen = []
  const result = []
  for (const row of sorted) {
    const signed = row.type === 'Deposit' ? row.amount : -row.amount
    const balance = (running.get(row.account_id) ?? 0) + signed
    running.set(row.account_id, balance)
    result.push({ account_id: row.account_id, day: row.day, balance })
    seen.push({ account_id: row.account_id, day: row.day, type: row.type, amount: row.amount, balance })
    push('running', 'OVER (PARTITION', 't["balance"]', `Account ${row.account_id} on day ${row.day}: ${row.type} of ${row.amount} gives ${balance}.`, [...COLUMNS, 'balance'], seen)
  }
  push('done', 'SELECT account_id', 'return t[', `Return ${result.length} balance rows.`, ['account_id', 'day', 'balance'], result)
  return { input, result, frames }
}
