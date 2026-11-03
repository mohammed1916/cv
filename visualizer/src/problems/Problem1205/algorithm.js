const SQL = `WITH approved AS (
  SELECT DATE_FORMAT(trans_date, '%Y-%m') AS month, country,
    COUNT(*) AS approved_count, SUM(amount) AS approved_amount
  FROM Transactions
  WHERE state = 'approved'
  GROUP BY month, country
),
charged AS (
  SELECT DATE_FORMAT(cb.trans_date, '%Y-%m') AS month, t.country,
    COUNT(*) AS chargeback_count, SUM(t.amount) AS chargeback_amount
  FROM Chargebacks cb
  JOIN Transactions t ON t.id = cb.trans_id
  GROUP BY month, t.country
)
SELECT k.month, k.country,
  COALESCE(a.approved_count, 0) AS approved_count,
  COALESCE(a.approved_amount, 0) AS approved_amount,
  COALESCE(c.chargeback_count, 0) AS chargeback_count,
  COALESCE(c.chargeback_amount, 0) AS chargeback_amount
FROM (SELECT month, country FROM approved
      UNION
      SELECT month, country FROM charged) k
LEFT JOIN approved a ON a.month = k.month AND a.country = k.country
LEFT JOIN charged c ON c.month = k.month AND c.country = k.country
ORDER BY k.month, k.country;`

const PY = `import pandas as pd

def monthly_transactions(transactions, chargebacks):
    tx = transactions.assign(month=transactions["trans_date"].str[:7])
    approved = tx[tx["state"] == "approved"].groupby(["month", "country"]).agg(approved_count=("id", "count"), approved_amount=("amount", "sum")).reset_index()
    cb = chargebacks.merge(transactions[["id", "country", "amount"]], left_on="trans_id", right_on="id")
    charged = cb.assign(month=cb["trans_date"].str[:7]).groupby(["month", "country"]).agg(chargeback_count=("trans_id", "count"), chargeback_amount=("amount", "sum")).reset_index()
    keys = pd.concat([approved[["month", "country"]], charged[["month", "country"]]]).drop_duplicates()
    out = keys.merge(approved, on=["month", "country"], how="left").merge(charged, on=["month", "country"], how="left").fillna(0)
    return out.sort_values(["month", "country"])
`

const snap = rows => JSON.parse(JSON.stringify(rows))
const SQL_LINES = SQL.split('\n')
const PY_LINES = PY.split('\n')
function lookup(lines, fragment, label) {
  const index = lines.findIndex(text => text.includes(fragment))
  if (index < 0) throw new Error(`${label} has no line containing "${fragment}"`)
  return index + 1
}
const sqlLine = fragment => lookup(SQL_LINES, fragment, 'SQL')
const pyLine = fragment => lookup(PY_LINES, fragment, 'Python')
const frame = (phase, sqlFragment, pyFragment, message, rows) => ({
  phase, activeLine: sqlLine(sqlFragment), pythonLine: pyLine(pyFragment), message, rows: snap(rows),
})

export const sql = SQL
export const python = PY
export const code = SQL_LINES.map((text, index) => ({ line: index + 1, text }))
export const phases = [
  { id: 'load', label: 'Load', description: 'Read both streams.' },
  { id: 'approved', label: 'Approved', description: 'Approved transactions count toward their own month.' },
  { id: 'chargeback', label: 'Chargebacks', description: 'Each chargeback counts toward the month it was filed, using its transaction country and amount.' },
  { id: 'merge', label: 'Merge', description: 'Keep every month and country from either stream.' },
  { id: 'done', label: 'Result', description: 'Rows sorted by month and country.' },
]
export const sample = {
  transactions: [
    { id: 1, country: 'US', state: 'approved', amount: 1000, trans_date: '2019-05-03' },
    { id: 2, country: 'US', state: 'declined', amount: 2000, trans_date: '2019-05-08' },
    { id: 3, country: 'DE', state: 'approved', amount: 500, trans_date: '2019-06-01' },
    { id: 4, country: 'US', state: 'approved', amount: 700, trans_date: '2019-06-10' },
  ],
  chargebacks: [
    { trans_id: 1, trans_date: '2019-06-02' },
    { trans_id: 4, trans_date: '2019-06-15' },
  ],
}

export function parseInput(text) {
  const input = JSON.parse(text)
  const { transactions, chargebacks } = input
  if (!Array.isArray(transactions) || !Array.isArray(chargebacks)) throw new Error('Provide transactions and chargebacks arrays.')
  const ids = new Set(transactions.map(t => t.id))
  for (const cb of chargebacks) {
    if (!ids.has(cb.trans_id)) throw new Error(`Chargeback names unknown transaction ${cb.trans_id}.`)
  }
  return input
}

export function buildTrace(input) {
  const { transactions, chargebacks } = input
  const byId = new Map(transactions.map(t => [t.id, t]))
  const groups = new Map()
  const slot = (month, country) => {
    const key = `${month}|${country}`
    if (!groups.has(key)) groups.set(key, { month, country, approved_count: 0, approved_amount: 0, chargeback_count: 0, chargeback_amount: 0 })
    return groups.get(key)
  }
  const table = () => [...groups.values()]
  const frames = [frame('load', 'FROM Transactions', 'tx = transactions.assign', `Read ${transactions.length} transactions and ${chargebacks.length} chargebacks.`, [])]
  for (const t of transactions) {
    if (t.state !== 'approved') continue
    const g = slot(t.trans_date.slice(0, 7), t.country)
    g.approved_count += 1
    g.approved_amount += t.amount
    frames.push(frame('approved', 'WHERE state', 'approved = tx[', `Transaction ${t.id} is approved and counts toward ${g.month} ${t.country}.`, table()))
  }
  for (const cb of chargebacks) {
    const t = byId.get(cb.trans_id)
    const g = slot(cb.trans_date.slice(0, 7), t.country)
    g.chargeback_count += 1
    g.chargeback_amount += t.amount
    frames.push(frame('chargeback', 'JOIN Transactions t', 'cb = chargebacks.merge', `Chargeback on transaction ${cb.trans_id} is filed ${cb.trans_date}.`, table()))
  }
  const result = table().sort((a, b) => a.month.localeCompare(b.month) || a.country.localeCompare(b.country))
  frames.push(frame('merge', 'FROM (SELECT month', 'out = keys.merge', 'Keep every month and country seen in either stream; missing sums become 0.', result))
  frames.push(frame('done', 'ORDER BY k.month', 'return out', 'Rows listed by month and country.', result))
  return { input, result, frames }
}
