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

export const sql = `WITH first_orders AS (
  SELECT customer_id, MIN(order_date) AS first_date
  FROM Delivery
  GROUP BY customer_id
),
firsts AS (
  SELECT d.*
  FROM Delivery d
  JOIN first_orders f ON f.customer_id = d.customer_id AND d.order_date = f.first_date
)
SELECT ROUND(
  100.0 * SUM(CASE WHEN order_date = customer_pref_delivery_date THEN 1 ELSE 0 END) / COUNT(*),
  2) AS immediate_percentage
FROM firsts`
const sqlLines = sql.split('\n')
export const code = sqlLines.map((text, index) => ({ line: index + 1, text }))
export const python = `import pandas as pd

def immediate_percentage_first(delivery):
    first_dates = delivery.groupby("customer_id")["order_date"].min().rename("first_date")
    firsts = delivery.join(first_dates, on="customer_id")
    firsts = firsts[firsts["order_date"] == firsts["first_date"]]
    flags = firsts["order_date"] == firsts["customer_pref_delivery_date"]
    share = round(100 * flags.mean(), 2)
    return pd.DataFrame({"immediate_percentage": [share]})`
const pyLines = python.split('\n')
const L = text => lineOf(sqlLines, text)
const P = text => lineOf(pyLines, text)
const frameAt = (phase, sqlText, pyText, message, columns, rows) => ({ phase, activeLine: L(sqlText), pythonLine: P(pyText), message, columns, rows: snap(rows) })

export const phases = [
  { id: 'load', label: 'Load', description: 'Read the delivery rows.' },
  { id: 'first', label: 'First date', description: 'Find each customer’s first order date.' },
  { id: 'firsts', label: 'First orders', description: 'Keep only each customer’s first order.' },
  { id: 'compare', label: 'Compare', description: 'Mark first orders delivered on the order date.' },
  { id: 'percent', label: 'Percent', description: 'Divide and round to two decimals.' },
  { id: 'done', label: 'Result', description: 'Output immediate_percentage.' },
]
export const inputLabel = 'JSON object with a deliveries table'
export const complexity = 'Linear in the delivery rows, with one minimum per customer.'
const COLS = ['delivery_id', 'customer_id', 'order_date', 'customer_pref_delivery_date']
const SAMPLE = { deliveries: [
  { delivery_id: 1, customer_id: 1, order_date: '2019-08-01', customer_pref_delivery_date: '2019-08-02' },
  { delivery_id: 2, customer_id: 2, order_date: '2019-08-02', customer_pref_delivery_date: '2019-08-02' },
  { delivery_id: 3, customer_id: 3, order_date: '2019-08-03', customer_pref_delivery_date: '2019-08-05' },
  { delivery_id: 4, customer_id: 1, order_date: '2019-08-04', customer_pref_delivery_date: '2019-08-04' },
  { delivery_id: 5, customer_id: 4, order_date: '2019-08-05', customer_pref_delivery_date: '2019-08-09' },
  { delivery_id: 6, customer_id: 5, order_date: '2019-08-06', customer_pref_delivery_date: '2019-08-06' },
] }
export const examples = [{ label: 'Teaching sample', input: JSON.stringify(SAMPLE) }]

export function parseInput(text) {
  const input = parseJsonObject(text)
  const rows = requireRows(input, 'deliveries', COLS, 20)
  const firstDate = new Map()
  for (const row of rows) {
    const current = firstDate.get(row.customer_id)
    if (current === undefined || row.order_date < current) firstDate.set(row.customer_id, row.order_date)
  }
  const tied = new Set()
  for (const row of rows) {
    if (row.order_date === firstDate.get(row.customer_id)) {
      if (tied.has(row.customer_id)) throw new Error(`customer ${row.customer_id} has two first orders on the same date.`)
      tied.add(row.customer_id)
    }
  }
  return input
}

export function buildTrace(input) {
  const deliveries = input.deliveries
  const frames = [frameAt('load', 'FROM Delivery', 'def immediate_percentage_first', `Load ${deliveries.length} deliveries.`, COLS, deliveries)]
  const earliest = new Map()
  for (const row of deliveries) {
    const current = earliest.get(row.customer_id)
    if (current === undefined || row.order_date < current) earliest.set(row.customer_id, row.order_date)
  }
  const firstDates = [...earliest].map(([customer_id, first_date]) => ({ customer_id, first_date }))
  frames.push(frameAt('first', 'MIN(order_date)', 'first_dates = delivery', `Find the first order date of ${firstDates.length} customers.`, ['customer_id', 'first_date'], firstDates))
  const firsts = deliveries.filter(row => row.order_date === earliest.get(row.customer_id))
  frames.push(frameAt('firsts', 'JOIN first_orders', 'firsts = firsts[', 'Keep the orders placed on each customer’s first date.', COLS, firsts))
  const flagged = firsts.map(row => ({ delivery_id: row.delivery_id, is_immediate: row.order_date === row.customer_pref_delivery_date ? 1 : 0 }))
  frames.push(frameAt('compare', 'SUM(CASE WHEN order_date', 'flags = firsts', 'Mark first orders whose preferred date is the order date.', ['delivery_id', 'is_immediate'], flagged))
  const immediate = flagged.reduce((sum, row) => sum + row.is_immediate, 0)
  const share = flagged.length ? Math.round((10000 * immediate) / flagged.length) / 100 : 0
  frames.push(frameAt('percent', 'SELECT ROUND', 'share = round', `${immediate} of ${flagged.length} first orders are immediate.`, ['immediate_percentage'], [{ immediate_percentage: share }]))
  const result = [{ immediate_percentage: share }]
  frames.push(frameAt('done', 'FROM firsts', 'return pd', 'Output immediate_percentage.', ['immediate_percentage'], result))
  return { input, result, frames }
}
