// Knowledge-derived teaching model. The sample table is invented for this visualization.
// Teaching rule: a customer qualifies when they have at least two spending years, every year after
// the first is exactly one year after the previous one, and each yearly total is higher than the last.

export function lineOf(lines, text) {
  const index = lines.findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`Missing code line for: ${text}`)
  return index + 1
}

export const sql = `WITH yearly AS (
  SELECT customer_id, YEAR(order_date) AS yr, SUM(price) AS total
  FROM Orders
  GROUP BY customer_id, YEAR(order_date)
),
steps AS (
  SELECT customer_id, yr, total,
         LAG(yr) OVER (PARTITION BY customer_id ORDER BY yr) AS prev_yr,
         LAG(total) OVER (PARTITION BY customer_id ORDER BY yr) AS prev_total
  FROM yearly
)
SELECT customer_id
FROM steps
GROUP BY customer_id
HAVING COUNT(*) >= 2
   AND SUM(CASE WHEN prev_yr IS NOT NULL AND (yr <> prev_yr + 1 OR total <= prev_total) THEN 1 ELSE 0 END) = 0
ORDER BY customer_id`
const sqlLines = sql.split('\n')
export const code = sqlLines.map((text, index) => ({ line: index + 1, text }))

export const python = `import pandas as pd

def strictly_increasing_customers(orders):
    orders = orders.assign(yr=orders["order_date"].str[:4].astype(int))
    yearly = orders.groupby(["customer_id", "yr"], as_index=False)["price"].sum()
    yearly = yearly.rename(columns={"price": "total"}).sort_values(["customer_id", "yr"])
    grp = yearly.groupby("customer_id")
    yearly["prev_yr"] = grp["yr"].shift(1)
    yearly["prev_total"] = grp["total"].shift(1)
    yearly["bad"] = yearly["prev_yr"].notna() & ((yearly["yr"] != yearly["prev_yr"] + 1) | (yearly["total"] <= yearly["prev_total"]))
    summary = yearly.groupby("customer_id").agg(years=("yr", "size"), bad=("bad", "sum"))
    keep = summary[(summary["years"] >= 2) & (summary["bad"] == 0)].index
    return pd.DataFrame({"customer_id": sorted(keep)})`
const sqlLn = text => lineOf(sqlLines, text)
const pyLines = python.split('\n')
const pyLn = text => lineOf(pyLines, text)

export const phases = [
  { id: 'load', label: 'Orders', description: 'Read the order rows.' },
  { id: 'yearly', label: 'Yearly', description: 'Add up each customer total per year.' },
  { id: 'steps', label: 'Steps', description: 'Compare every year with the year before it.' },
  { id: 'group', label: 'Group', description: 'Decide each customer from their steps.' },
  { id: 'done', label: 'Result', description: 'Output the customers who qualify.' },
]

const ORDER_COLS = ['order_id', 'customer_id', 'order_date', 'price']
const YEAR_COLS = ['customer_id', 'yr', 'total']
const STEP_COLS = ['customer_id', 'yr', 'total', 'prev_yr', 'prev_total', 'check']
const GROUP_COLS = ['customer_id', 'years', 'bad', 'kept']
const RESULT_COLS = ['customer_id']

function frameAt(phase, sqlText, pyText, message, columns, rows, extra = {}) {
  return { phase, activeLine: sqlLn(sqlText), pythonLine: pyLn(pyText), message, columns, rows: rows.map(row => ({ ...row })), ...extra }
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input) || !Array.isArray(input.orders)) {
    throw new Error('Use a JSON object with an orders list.')
  }
  if (input.orders.length > 14) throw new Error('orders must have at most 14 rows.')
  input.orders.forEach((row, index) => {
    for (const column of ORDER_COLS) if (!(column in row)) throw new Error(`orders row ${index + 1} needs ${column}.`)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(row.order_date)) throw new Error(`orders row ${index + 1} order_date must be YYYY-MM-DD.`)
    if (!(row.price >= 0)) throw new Error(`orders row ${index + 1} price must be zero or more.`)
  })
  return input
}

export function buildTrace(input) {
  const orders = input.orders
  const frames = [frameAt('load', 'FROM Orders', 'def strictly_increasing_customers', `Load ${orders.length} orders.`, ORDER_COLS, orders)]

  // yearly totals per customer, sorted by customer then year
  const totals = new Map()
  for (const row of orders) {
    const yr = Number(row.order_date.slice(0, 4))
    const key = `${row.customer_id}|${yr}`
    const current = totals.get(key) || { customer_id: row.customer_id, yr, total: 0 }
    current.total += row.price
    totals.set(key, current)
  }
  const yearly = [...totals.values()].sort((a, b) => a.customer_id - b.customer_id || a.yr - b.yr)
  frames.push(frameAt('yearly', 'GROUP BY customer_id, YEAR', 'yearly = orders.groupby', `${yearly.length} customer-year totals.`, YEAR_COLS, yearly))

  // compare each year with the previous year of the same customer
  const steps = []
  let previous = null
  for (const row of yearly) {
    const prev = previous && previous.customer_id === row.customer_id ? previous : null
    let check = 'first year'
    if (prev) {
      if (row.yr !== prev.yr + 1) check = 'gap year'
      else if (row.total <= prev.total) check = 'not higher'
      else check = 'higher'
    }
    steps.push({ customer_id: row.customer_id, yr: row.yr, total: row.total, prev_yr: prev ? prev.yr : null, prev_total: prev ? prev.total : null, check })
    previous = row
  }
  frames.push(frameAt('steps', 'LAG(yr) OVER', 'yearly["prev_yr"] = grp', 'Each year is compared with the same customer\'s year before.', STEP_COLS, steps))

  // one decision row per customer
  const customers = [...new Set(yearly.map(row => row.customer_id))].sort((a, b) => a - b)
  const groups = customers.map(customer_id => {
    const mine = steps.filter(step => step.customer_id === customer_id)
    const bad = mine.filter(step => step.check === 'gap year' || step.check === 'not higher').length
    return { customer_id, years: mine.length, bad, kept: mine.length >= 2 && bad === 0 ? 'yes' : 'no' }
  })
  frames.push(frameAt('group', 'HAVING COUNT(*) >= 2', 'summary = yearly.groupby', 'A customer needs two years and no broken step.', GROUP_COLS, groups))

  const result = groups.filter(group => group.kept === 'yes').map(group => ({ customer_id: group.customer_id }))
  frames.push(frameAt('done', 'ORDER BY customer_id', 'return pd.DataFrame', 'Output the customers whose spending strictly increases.', RESULT_COLS, result))
  return { input, result, frames }
}
