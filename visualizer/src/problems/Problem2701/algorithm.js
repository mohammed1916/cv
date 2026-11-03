// Knowledge-derived SQL walkthrough. The sample table is invented for this visualization.
export const sql = `WITH steps AS (
  SELECT customer_id, transaction_date, amount,
         CASE WHEN DATEDIFF(transaction_date,
                 LAG(transaction_date) OVER (PARTITION BY customer_id ORDER BY transaction_date)) = 1
               AND amount > LAG(amount) OVER (PARTITION BY customer_id ORDER BY transaction_date)
              THEN 0 ELSE 1 END AS starts_run
  FROM Transactions
),
islands AS (
  SELECT customer_id, transaction_date,
         SUM(starts_run) OVER (PARTITION BY customer_id ORDER BY transaction_date) AS run_id
  FROM steps
)
SELECT customer_id, MIN(transaction_date) AS start_date, MAX(transaction_date) AS end_date
FROM islands
GROUP BY customer_id, run_id
HAVING COUNT(*) >= 3
ORDER BY customer_id, start_date`

export const code = sql.split('\n').map((text, index) => ({ line: index + 1, text }))
const SQL = key => {
  const index = code.findIndex(line => line.text.includes(key))
  if (index < 0) throw new Error(`Missing SQL line: ${key}`)
  return index + 1
}

export const python = `def consecutive_increasing(transactions):
    result = []
    ordered = transactions.sort_values(["customer_id", "transaction_date"])
    for customer_id, rows in ordered.groupby("customer_id"):
        run = []
        for row in rows.itertuples():
            if run and (row.transaction_date - run[-1].transaction_date).days == 1 and row.amount > run[-1].amount:
                run.append(row)
                continue
            if len(run) >= 3:
                result.append((customer_id, run[0].transaction_date, run[-1].transaction_date))
            run = [row]
        if len(run) >= 3:
            result.append((customer_id, run[0].transaction_date, run[-1].transaction_date))
    return result`
const PY_LINES = python.split('\n')
const PY = key => {
  const index = PY_LINES.findIndex(line => line.includes(key))
  if (index < 0) throw new Error(`Missing Python line: ${key}`)
  return index + 1
}

const COLS = ['transaction_id', 'customer_id', 'transaction_date', 'amount']
const STEP_COLS = ['customer_id', 'transaction_date', 'amount', 'starts_run', 'run_id']
const RUN_COLS = ['customer_id', 'start_date', 'end_date', 'dates', 'kept']
const RESULT_COLS = ['customer_id', 'start_date', 'end_date']

const frame = (phase, sqlKey, pyKey, message, columns, rows) => ({
  phase, activeLine: SQL(sqlKey), pythonLine: PY(pyKey), message, columns, rows: rows.map(row => ({ ...row })),
})

export const phases = [
  { id: 'load', label: 'Load', description: 'Read the transactions.' },
  { id: 'steps', label: 'Steps', description: 'Mark each day that starts a new run.' },
  { id: 'group', label: 'Runs', description: 'Measure each run and keep runs of three or more dates.' },
  { id: 'done', label: 'Result', description: 'Output the kept runs.' },
]

function tableRows(input, name, columns) {
  const rows = input[name]
  if (!Array.isArray(rows) || rows.length < 1 || rows.length > 20) throw new Error(`${name} needs 1 to 20 rows.`)
  for (const row of rows) {
    if (!row || typeof row !== 'object' || columns.some(column => !(column in row))) throw new Error(`${name} rows need ${columns.join(', ')}.`)
  }
  return rows.map(row => Object.fromEntries(columns.map(column => [column, row[column]])))
}

const DATE = /^\d{4}-\d{2}-\d{2}$/

const dayNumber = s => Date.UTC(+s.slice(0, 4), +s.slice(5, 7) - 1, +s.slice(8, 10)) / 86400000

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with a Transactions table.')
  const rows = tableRows(input, 'Transactions', COLS)
  const seen = new Set()
  for (const row of rows) {
    if (!Number.isInteger(row.customer_id) || !DATE.test(row.transaction_date) || !Number.isInteger(row.amount)) throw new Error('customer_id and amount are integers; transaction_date uses YYYY-MM-DD.')
    const key = `${row.customer_id}|${row.transaction_date}`
    if (seen.has(key)) throw new Error('A customer has at most one transaction per day.')
    seen.add(key)
  }
  return { Transactions: rows }
}

export function buildTrace(input) {
  const rows = input.Transactions
  const frames = [frame('load', 'FROM Transactions', 'def ', 'Read the transactions.', COLS, rows)]
  const ordered = [...rows].sort((a, b) => a.customer_id - b.customer_id
    || (a.transaction_date < b.transaction_date ? -1 : a.transaction_date > b.transaction_date ? 1 : 0))

  const flagged = []
  let prev = null
  let runId = 0
  for (const row of ordered) {
    const sameCustomer = prev !== null && prev.customer_id === row.customer_id
    if (!sameCustomer) runId = 0
    const continues = sameCustomer && dayNumber(row.transaction_date) - dayNumber(prev.transaction_date) === 1 && row.amount > prev.amount
    const startsRun = continues ? 0 : 1
    if (startsRun) runId += 1
    const item = { customer_id: row.customer_id, transaction_date: row.transaction_date, amount: row.amount, starts_run: startsRun, run_id: runId }
    flagged.push(item)
    frames.push(frame('steps', 'CASE WHEN DATEDIFF', startsRun ? 'run = [row]' : 'run.append(row)',
      startsRun ? `${row.transaction_date} starts a new run for customer ${row.customer_id}.` : `${row.transaction_date} continues the run with a higher amount.`,
      STEP_COLS, flagged))
    prev = row
  }

  const groups = new Map()
  for (const item of flagged) {
    const key = `${item.customer_id}:${item.run_id}`
    if (!groups.has(key)) groups.set(key, { customer_id: item.customer_id, start_date: item.transaction_date, end_date: item.transaction_date, dates: 0 })
    const group = groups.get(key)
    group.end_date = item.transaction_date
    group.dates += 1
  }

  const summary = []
  const result = []
  for (const group of groups.values()) {
    const kept = group.dates >= 3
    summary.push({ ...group, kept: kept ? 'yes' : 'no' })
    if (kept) result.push({ customer_id: group.customer_id, start_date: group.start_date, end_date: group.end_date })
    frames.push(frame('group', 'HAVING COUNT', 'result.append', `Customer ${group.customer_id}: ${group.start_date} to ${group.end_date} has ${group.dates} dates, so the run ${kept ? 'is kept' : 'is dropped'}.`, RUN_COLS, summary))
  }
  frames.push(frame('done', 'ORDER BY customer_id, start_date', 'return result', `Return ${result.length} runs.`, RESULT_COLS, result))
  return { input, result, frames }
}
