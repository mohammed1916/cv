const SQL = `WITH daily AS (
  SELECT DISTINCT customer_id, transaction_date
  FROM Transactions
),
numbered AS (
  SELECT customer_id, transaction_date,
    ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY transaction_date) AS rn
  FROM daily
),
islands AS (
  SELECT customer_id,
    DATE_SUB(transaction_date, INTERVAL rn DAY) AS island_key
  FROM numbered
),
runs AS (
  SELECT customer_id, COUNT(*) AS run_len
  FROM islands
  GROUP BY customer_id, island_key
),
best AS (
  SELECT customer_id, MAX(run_len) AS longest_run
  FROM runs
  GROUP BY customer_id
)
SELECT customer_id, longest_run
FROM best
WHERE longest_run = (SELECT MAX(longest_run) FROM best)
ORDER BY customer_id;`

const PY = `import pandas as pd

def longest_streaks(transactions):
    days = transactions[["customer_id", "transaction_date"]].drop_duplicates()
    days = days.sort_values(["customer_id", "transaction_date"])
    days["rn"] = days.groupby("customer_id").cumcount() + 1
    days["island_key"] = days["transaction_date"] - pd.to_timedelta(days["rn"], unit="D")
    runs = days.groupby(["customer_id", "island_key"]).size().reset_index(name="run_len")
    best = runs.groupby("customer_id", as_index=False)["run_len"].max().rename(columns={"run_len": "longest_run"})
    top = best[best["longest_run"] == best["longest_run"].max()]
    return top.sort_values("customer_id").reset_index(drop=True)
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
  { id: 'load', label: 'Transactions', description: 'Each row is one transaction on one date.' },
  { id: 'dedupe', label: 'One per day', description: 'Several transactions on one day count once.' },
  { id: 'island', label: 'Streaks', description: 'Subtract the row number from the date: consecutive days share the same key.' },
  { id: 'measure', label: 'Run length', description: 'Count the days in each streak.' },
  { id: 'pick', label: 'Longest', description: 'Keep the best streak per customer, then the overall maximum.' },
  { id: 'done', label: 'Result', description: 'Customers tied for the greatest streak.' },
]
export const sample = {
  transactions: [
    { transaction_id: 1, customer_id: 1, transaction_date: '2026-01-01', amount: 10 },
    { transaction_id: 2, customer_id: 1, transaction_date: '2026-01-02', amount: 5 },
    { transaction_id: 3, customer_id: 1, transaction_date: '2026-01-02', amount: 7 },
    { transaction_id: 4, customer_id: 1, transaction_date: '2026-01-03', amount: 9 },
    { transaction_id: 5, customer_id: 1, transaction_date: '2026-01-10', amount: 4 },
    { transaction_id: 6, customer_id: 2, transaction_date: '2026-01-05', amount: 3 },
    { transaction_id: 7, customer_id: 2, transaction_date: '2026-01-06', amount: 8 },
    { transaction_id: 8, customer_id: 2, transaction_date: '2026-01-07', amount: 2 },
    { transaction_id: 9, customer_id: 2, transaction_date: '2026-01-08', amount: 6 },
    { transaction_id: 10, customer_id: 3, transaction_date: '2026-01-02', amount: 1 },
    { transaction_id: 11, customer_id: 3, transaction_date: '2026-01-04', amount: 2 },
    { transaction_id: 12, customer_id: 4, transaction_date: '2026-01-03', amount: 5 },
    { transaction_id: 13, customer_id: 4, transaction_date: '2026-01-04', amount: 5 },
    { transaction_id: 14, customer_id: 4, transaction_date: '2026-01-05', amount: 5 },
    { transaction_id: 15, customer_id: 4, transaction_date: '2026-01-06', amount: 5 },
  ],
}

const DAY_MS = 86400000
const dayIndex = iso => Date.UTC(...iso.split('-').map((part, i) => (i === 1 ? Number(part) - 1 : Number(part)))) / DAY_MS

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!Array.isArray(input.transactions)) throw new Error('Provide a transactions array.')
  for (const t of input.transactions) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(t.transaction_date)) throw new Error(`Transaction ${t.transaction_id} needs a YYYY-MM-DD date.`)
  }
  return input
}

export function buildTrace(input) {
  const { transactions } = input
  const frames = []
  frames.push(frame('load', 'FROM Transactions', 'days = transactions', 'Start with every transaction row.', transactions.map(t => ({ customer_id: t.customer_id, transaction_date: t.transaction_date }))))
  const seen = new Map()
  for (const t of transactions) {
    const key = `${t.customer_id}|${t.transaction_date}`
    if (!seen.has(key)) seen.set(key, { customer_id: t.customer_id, transaction_date: t.transaction_date })
  }
  const days = [...seen.values()].sort((a, b) => a.customer_id - b.customer_id || a.transaction_date.localeCompare(b.transaction_date))
  frames.push(frame('dedupe', 'SELECT DISTINCT', 'drop_duplicates', `${days.length} distinct customer-days remain.`, days))
  const numbered = []
  const counter = new Map()
  for (const d of days) {
    const rn = (counter.get(d.customer_id) || 0) + 1
    counter.set(d.customer_id, rn)
    numbered.push({ ...d, rn, island_key: dayIndex(d.transaction_date) - rn })
  }
  frames.push(frame('island', 'ROW_NUMBER() OVER', 'cumcount', 'Number each customer’s days; the shifted date stays fixed inside a streak.', numbered))
  const runMap = new Map()
  for (const row of numbered) {
    const key = `${row.customer_id}|${row.island_key}`
    runMap.set(key, { customer_id: row.customer_id, run_len: (runMap.get(key)?.run_len || 0) + 1 })
  }
  const runs = [...runMap.values()]
  frames.push(frame('measure', 'COUNT(*) AS run_len', 'size().reset_index', 'Count the days in each streak.', runs))
  const bestMap = new Map()
  for (const r of runs) bestMap.set(r.customer_id, Math.max(bestMap.get(r.customer_id) || 0, r.run_len))
  const best = [...bestMap.entries()].map(([customer_id, longest_run]) => ({ customer_id, longest_run }))
  frames.push(frame('pick', 'MAX(run_len) AS longest_run', 'best = runs.groupby', 'Best streak per customer.', best))
  const top = Math.max(...best.map(b => b.longest_run))
  const result = best.filter(b => b.longest_run === top).sort((a, b) => a.customer_id - b.customer_id)
  frames.push(frame('done', 'WHERE longest_run = (SELECT MAX', 'return top.sort_values', `Customers tied at ${top} consecutive days.`, result))
  return { input, result, frames }
}
