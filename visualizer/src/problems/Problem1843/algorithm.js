// SQL walkthrough. The sample tables are invented for this visualization.
export const sql = `WITH monthly AS (
  SELECT t.account_id,
         DATE_FORMAT(t.day, '%Y-%m') AS month,
         SUM(t.amount) AS credit
  FROM Transactions t
  WHERE t.type = 'Creditor'
  GROUP BY t.account_id, DATE_FORMAT(t.day, '%Y-%m')
),
over AS (
  SELECT m.account_id, m.month
  FROM monthly m
  JOIN Accounts a ON a.account_id = m.account_id
  WHERE m.credit > a.max_income
)
SELECT DISTINCT o1.account_id
FROM over o1
JOIN over o2
  ON o2.account_id = o1.account_id
  AND o2.month = DATE_FORMAT(DATE_ADD(CONCAT(o1.month, '-01'), INTERVAL 1 MONTH), '%Y-%m')
ORDER BY o1.account_id`

export const code = sql.split('\n').map((text, index) => ({ line: index + 1, text }))
const SQL = key => {
  const index = code.findIndex(line => line.text.includes(key))
  if (index < 0) throw new Error(`Missing SQL line: ${key}`)
  return index + 1
}

export const python = `def suspicious_accounts(accounts, transactions):
    credits = transactions[transactions["type"] == "Creditor"].copy()
    credits["month"] = credits["day"].str[:7]
    monthly = credits.groupby(["account_id", "month"])["amount"].sum().reset_index()
    monthly = monthly.merge(accounts, on="account_id")
    over = monthly[monthly["amount"] > monthly["max_income"]]
    keys = set(zip(over["account_id"], over["month"]))
    flagged = {acct for acct, month in keys if (acct, (pd.Period(month) + 1).strftime("%Y-%m")) in keys}
    return accounts[accounts["account_id"].isin(flagged)][["account_id"]].sort_values("account_id")`
const PY_LINES = python.split('\n')
const PY = key => {
  const index = PY_LINES.findIndex(line => line.includes(key))
  if (index < 0) throw new Error(`Missing Python line: ${key}`)
  return index + 1
}

const ACCOUNT_COLUMNS = ['account_id', 'max_income']
const TX_COLUMNS = ['transaction_id', 'account_id', 'type', 'amount', 'day']
const MONTH_COLUMNS = ['account_id', 'month', 'credit', 'max_income', 'over']
const CHECK_COLUMNS = ['account_id', 'month', 'credit', 'over', 'next_month_over', 'flagged']

const frame = (phase, sqlKey, pyKey, message, columns, rows) => ({
  phase, activeLine: SQL(sqlKey), pythonLine: PY(pyKey), message, columns, rows: rows.map(row => ({ ...row })),
})

export const phases = [
  { id: 'load', label: 'Load', description: 'Read the accounts and their transactions.' },
  { id: 'monthly', label: 'Monthly', description: 'Total the incoming credits per account per month.' },
  { id: 'over', label: 'Over limit', description: 'Mark the months whose credits pass max_income.' },
  { id: 'check', label: 'Consecutive', description: 'Flag accounts with over-limit months in two consecutive months.' },
  { id: 'done', label: 'Result', description: 'Output the flagged accounts.' },
]

export const inputLabel = 'Object with Accounts and Transactions tables (day as YYYY-MM-DD)'
export const complexity = 'O(T log T) for T transactions, from grouping by account and month and a sort of the flagged months. The visualizer caps each table at 20 rows.'

function tableRows(input, name, columns, min = 1) {
  const rows = input[name]
  if (!Array.isArray(rows) || rows.length < min || rows.length > 20) throw new Error(`${name} needs ${min} to 20 rows.`)
  for (const row of rows) {
    if (!row || typeof row !== 'object' || columns.some(column => !(column in row))) throw new Error(`${name} rows need ${columns.join(', ')}.`)
  }
  return rows.map(row => Object.fromEntries(columns.map(column => [column, row[column]])))
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with Accounts and Transactions tables.')
  const Accounts = tableRows(input, 'Accounts', ACCOUNT_COLUMNS)
  const Transactions = tableRows(input, 'Transactions', TX_COLUMNS, 0)
  for (const row of Transactions) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(row.day))) throw new Error('day must be YYYY-MM-DD.')
  }
  return { Accounts, Transactions }
}

// Month key 'YYYY-MM' plus one month, computed without timezone effects.
function nextMonth(month) {
  const [year, mon] = month.split('-').map(Number)
  const date = new Date(Date.UTC(year, mon, 1))
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`
}

export function buildTrace(input) {
  const accounts = [...input.Accounts].sort((a, b) => a.account_id - b.account_id)
  const transactions = input.Transactions
  const frames = []
  frames.push(frame('load', 'FROM Transactions', 'def ', `Load ${accounts.length} accounts and ${transactions.length} transactions.`, ACCOUNT_COLUMNS, accounts))

  const limit = new Map(accounts.map(account => [account.account_id, account.max_income]))
  const credit = new Map()
  for (const tx of transactions) {
    if (tx.type !== 'Creditor') continue
    const key = `${tx.account_id}|${tx.day.slice(0, 7)}`
    credit.set(key, (credit.get(key) ?? 0) + tx.amount)
  }
  const monthlyRows = [...credit].sort((a, b) => (a[0] < b[0] ? -1 : 1)).map(([key, total]) => {
    const [account_id, month] = key.split('|')
    const id = Number(account_id)
    return { account_id: id, month, credit: total, max_income: limit.get(id), over: total > limit.get(id) ? 'yes' : 'no' }
  })
  frames.push(frame('monthly', 'SUM(t.amount)', 'monthly =', 'Total incoming credits for each account and month.', MONTH_COLUMNS, monthlyRows))

  const over = new Set(monthlyRows.filter(row => row.over === 'yes').map(row => `${row.account_id}|${row.month}`))
  frames.push(frame('over', 'WHERE m.credit', 'keys =', 'Keep only the months whose credit is strictly above max_income.', MONTH_COLUMNS, monthlyRows.filter(row => row.over === 'yes')))

  const flagged = new Set()
  const checked = []
  for (const row of monthlyRows.filter(r => r.over === 'yes')) {
    const nextOver = over.has(`${row.account_id}|${nextMonth(row.month)}`)
    if (nextOver) flagged.add(row.account_id)
    checked.push({ account_id: row.account_id, month: row.month, credit: row.credit, over: 'yes', next_month_over: nextOver ? 'yes' : 'no', flagged: nextOver ? 'yes' : 'no' })
    frames.push(frame('check', 'ON o2.account_id', 'flagged =', `Account ${row.account_id} in ${row.month}: ${nextOver ? 'the next month is also over' : 'no over-limit month follows'}.`, CHECK_COLUMNS, checked))
  }
  const result = [...flagged].sort((a, b) => a - b).map(account_id => ({ account_id }))
  frames.push(frame('done', 'ORDER BY o1.account_id', 'return accounts', `Return ${result.length} suspicious accounts.`, ['account_id'], result))
  return { input, result, frames }
}
