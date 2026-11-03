// Knowledge-derived walkthrough written for this visualizer. The sample tables are invented.
const SQL_TEXT = `WITH daily AS (
  SELECT visited_on, SUM(amount) AS day_amount
  FROM Customer
  GROUP BY visited_on
), rolling AS (
  SELECT visited_on, day_amount,
         SUM(day_amount) OVER w AS amount,
         COUNT(*) OVER w AS days_seen
  FROM daily
  WINDOW w AS (ORDER BY visited_on ROWS 6 PRECEDING)
)
SELECT visited_on, amount, ROUND(amount / 7, 2) AS average_amount
FROM rolling
WHERE days_seen = 7
ORDER BY visited_on`

export const sql = SQL_TEXT
export const code = SQL_TEXT.split('\n').map((text, index) => ({ line: index + 1, text }))
export const python = `import pandas as pd

def restaurant_growth(customer):
    daily = customer.groupby("visited_on", as_index=False)["amount"].sum()
    daily["amount7"] = daily["amount"].rolling(7).sum()
    daily["days_seen"] = daily["amount"].rolling(7).count()
    full = daily[daily["days_seen"] == 7].copy()
    full["average_amount"] = (full["amount7"] / 7).round(2)
    return full[["visited_on", "amount7", "average_amount"]].rename(columns={"amount7": "amount"})
`

export const phases = [
  { id: 'load', label: 'Payments', description: 'Read every payment row.' },
  { id: 'group', label: 'Daily totals', description: 'Add up the payments for each date.' },
  { id: 'window', label: 'Seven-day window', description: 'Sum this date and the six before it.' },
  { id: 'filter', label: 'Full windows', description: 'Keep only dates with seven days behind them.' },
  { id: 'done', label: 'Result', description: 'Show the rows the query returns.' },
]

export const sample = {
  Customer: [
    { customer_id: 1, name: 'Ana', visited_on: '2026-01-01', amount: 6 },
    { customer_id: 2, name: 'Ben', visited_on: '2026-01-01', amount: 4 },
    { customer_id: 3, name: 'Cy', visited_on: '2026-01-02', amount: 20 },
    { customer_id: 4, name: 'Dee', visited_on: '2026-01-03', amount: 30 },
    { customer_id: 5, name: 'Eli', visited_on: '2026-01-04', amount: 40 },
    { customer_id: 6, name: 'Fay', visited_on: '2026-01-05', amount: 50 },
    { customer_id: 7, name: 'Gus', visited_on: '2026-01-06', amount: 60 },
    { customer_id: 8, name: 'Hal', visited_on: '2026-01-07', amount: 70 },
    { customer_id: 9, name: 'Ivy', visited_on: '2026-01-08', amount: 80 },
  ],
}

export const examples = [{ label: 'Eight days', input: JSON.stringify(sample) }]
export const inputLabel = 'Object with a Customer list of rows (visited_on as YYYY-MM-DD, integer amount)'
export const complexity = 'O(r + d) for r payment rows and d distinct dates once grouped. The visualization caps the table at 12 rows.'
export const reasoning = [
  'Payments can share a date, so the query first adds them into one total per date.',
  'A seven-row window that slides one date at a time gives each date its own trailing total.',
  'Dates near the start have fewer than seven days behind them, so the WHERE clause drops them. The sample assumes every calendar day has data, as the window relies on consecutive rows.',
]

const L = key => {
  const index = code.findIndex(line => line.text.includes(key))
  if (index < 0) throw new Error(`No SQL line contains "${key}".`)
  return index + 1
}
const P = key => {
  const index = python.split('\n').findIndex(line => line.includes(key))
  if (index < 0) throw new Error(`No Python line contains "${key}".`)
  return index + 1
}

const COLUMNS = ['customer_id', 'name', 'visited_on', 'amount']

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || !Array.isArray(input.Customer)) throw new Error('Use an object with a Customer list.')
  if (input.Customer.length > 12) throw new Error('Keep Customer to 12 rows.')
  for (const row of input.Customer) {
    if (!Number.isInteger(row.amount) || typeof row.visited_on !== 'string') throw new Error('Each row needs an integer amount and a visited_on date.')
  }
  return { Customer: input.Customer }
}

export function buildTrace({ Customer }) {
  const frames = []
  const push = (phase, sqlKey, pyKey, message, caption, columns, rows) => frames.push({
    phase, activeLine: L(sqlKey), pythonLine: P(pyKey), message,
    view: { caption, columns, rows: rows.map(row => ({ ...row })) },
  })
  push('load', 'FROM Customer', 'def restaurant_growth', `Read ${Customer.length} payment rows.`, 'Customer', COLUMNS, Customer)
  const totals = new Map()
  for (const row of Customer) totals.set(row.visited_on, (totals.get(row.visited_on) ?? 0) + row.amount)
  const daily = [...totals.keys()].sort().map(visited_on => ({ visited_on, day_amount: totals.get(visited_on) }))
  push('group', 'GROUP BY visited_on', 'groupby(', `Sum the payments into ${daily.length} dates.`, 'daily', ['visited_on', 'day_amount'], daily)
  const rolling = []
  const result = []
  const resultColumns = ['visited_on', 'amount', 'average_amount']
  daily.forEach((day, index) => {
    const windowRows = daily.slice(Math.max(0, index - 6), index + 1)
    const amount = windowRows.reduce((sum, row) => sum + row.day_amount, 0)
    const row = { ...day, amount, days_seen: windowRows.length }
    rolling.push(row)
    push('window', 'SUM(day_amount) OVER', 'rolling(7).sum()', `${day.visited_on}: the window holds ${row.days_seen} day(s) with total ${amount}.`, 'rolling', ['visited_on', 'day_amount', 'amount', 'days_seen'], rolling)
    if (row.days_seen === 7) result.push({ visited_on: day.visited_on, amount, average_amount: Number((amount / 7).toFixed(2)) })
    push('filter', 'WHERE days_seen', 'full = daily', row.days_seen === 7
      ? `${day.visited_on} has seven days, so it stays.`
      : `${day.visited_on} has only ${row.days_seen} day(s), so it is dropped.`, 'Kept so far', resultColumns, result)
  })
  push('done', 'ORDER BY visited_on', 'return full', `Return ${result.length} row(s).`, 'Result', resultColumns, result)
  return { input: { Customer }, result, frames }
}
