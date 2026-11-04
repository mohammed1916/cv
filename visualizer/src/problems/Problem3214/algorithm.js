// Teaching model. The sample tables are invented for this visualization.
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

export const sql = `WITH yearly AS (
  SELECT product_id, YEAR(transaction_date) AS yr, SUM(spend) AS total_spend
  FROM user_transactions
  GROUP BY product_id, YEAR(transaction_date)
),
paired AS (
  SELECT cur.product_id, cur.yr, cur.total_spend AS current_spend, prev.total_spend AS prior_spend
  FROM yearly cur
  JOIN yearly prev ON prev.product_id = cur.product_id AND prev.yr = cur.yr - 1
)
SELECT product_id, yr AS year, current_spend, prior_spend,
       ROUND((current_spend - prior_spend) * 100.0 / prior_spend, 2) AS yoy_growth
FROM paired
ORDER BY product_id, yr`
const sqlLines = sql.split('\n')
export const code = sqlLines.map((text, index) => ({ line: index + 1, text }))

export const python = `import pandas as pd

def year_on_year_growth(user_transactions):
    df = user_transactions.copy()
    df["yr"] = pd.to_datetime(df["transaction_date"]).dt.year
    yearly = df.groupby(["product_id", "yr"], as_index=False)["spend"].sum()
    prior = yearly.assign(yr=yearly["yr"] + 1).rename(columns={"spend": "prior_spend"})
    paired = yearly.merge(prior, on=["product_id", "yr"]).rename(columns={"spend": "current_spend"})
    paired["yoy_growth"] = ((paired["current_spend"] - paired["prior_spend"]) * 100 / paired["prior_spend"]).round(2)
    return paired.sort_values(["product_id", "yr"])`
const pyLines = python.split('\n')
const L = text => lineOf(sqlLines, text)
const P = text => lineOf(pyLines, text)
const frameAt = (phase, sqlText, pyText, message, columns, rows) => ({ phase, activeLine: L(sqlText), pythonLine: P(pyText), message, columns, rows: snap(rows) })

export const phases = [
  { id: 'load', label: 'Load', description: 'Read the transactions and their dates.' },
  { id: 'yearly', label: 'Yearly', description: 'Total each product by calendar year.' },
  { id: 'pair', label: 'Pair', description: 'Keep product-years whose previous year also has spend.' },
  { id: 'growth', label: 'Growth', description: 'Compute the percentage change, rounded to two decimals.' },
  { id: 'done', label: 'Result', description: 'Output the paired years in product and year order.' },
]

const COLS = ['transaction_id', 'product_id', 'spend', 'transaction_date']
const YEAR_COLS = ['product_id', 'yr', 'total_spend']
const PAIR_COLS = ['product_id', 'yr', 'current_spend', 'prior_spend']
const RESULT_COLS = ['product_id', 'year', 'current_spend', 'prior_spend', 'yoy_growth']
const DATE = /^\d{4}-\d{2}-\d{2}$/

export function parseInput(text) {
  const input = parseJsonObject(text)
  const rows = requireRows(input, 'user_transactions', COLS)
  for (const row of rows) {
    if (!DATE.test(row.transaction_date)) throw new Error('transaction_date uses YYYY-MM-DD.')
    if (!Number.isInteger(row.spend) || row.spend < 0) throw new Error('spend is a non-negative integer.')
  }
  return input
}

const round2 = value => Math.round(value * 100) / 100

export function buildTrace(input) {
  const rows = input.user_transactions
  const frames = [frameAt('load', 'FROM user_transactions', 'def year_on_year_growth', `Read ${rows.length} transactions.`, COLS, rows)]
  const totals = new Map()
  for (const row of rows) {
    const yr = Number(row.transaction_date.slice(0, 4))
    const key = `${row.product_id}|${yr}`
    const entry = totals.get(key) || { product_id: row.product_id, yr, total_spend: 0 }
    entry.total_spend += row.spend
    totals.set(key, entry)
  }
  const yearly = [...totals.values()].sort((a, b) => a.product_id - b.product_id || a.yr - b.yr)
  frames.push(frameAt('yearly', 'GROUP BY product_id, YEAR', 'groupby(["product_id", "yr"]', `Total ${yearly.length} product-years.`, YEAR_COLS, yearly))
  const paired = []
  for (const cur of yearly) {
    const prev = totals.get(`${cur.product_id}|${cur.yr - 1}`)
    if (prev) paired.push({ product_id: cur.product_id, yr: cur.yr, current_spend: cur.total_spend, prior_spend: prev.total_spend })
  }
  frames.push(frameAt('pair', 'JOIN yearly prev', 'yearly.merge(prior', `${paired.length} product-years have spend in the year before.`, PAIR_COLS, paired))
  const growth = paired.map(row => ({ ...row, yoy_growth: round2(((row.current_spend - row.prior_spend) * 100) / row.prior_spend) }))
  frames.push(frameAt('growth', 'ROUND((current_spend', 'paired["yoy_growth"]', 'Compute (current minus prior) times 100 divided by prior.', [...PAIR_COLS, 'yoy_growth'], growth))
  const result = growth.map(row => ({ product_id: row.product_id, year: row.yr, current_spend: row.current_spend, prior_spend: row.prior_spend, yoy_growth: row.yoy_growth }))
  frames.push(frameAt('done', 'ORDER BY product_id, yr', 'return paired.sort_values', 'Output the paired years in product and year order.', RESULT_COLS, result))
  return { input, result, frames }
}
