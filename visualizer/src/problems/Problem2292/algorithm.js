// Knowledge-derived SQL walkthrough. The sample tables are invented for this visualization.
export const sql = `WITH yearly AS (
SELECT product_id, YEAR(purchase_date) AS yr, COUNT(*) AS orders
FROM Orders
GROUP BY product_id, YEAR(purchase_date)
HAVING COUNT(*) >= 3
)
SELECT DISTINCT a.product_id
FROM yearly a
JOIN yearly b ON b.product_id = a.product_id AND b.yr = a.yr + 1
ORDER BY a.product_id`

export const code = sql.split('\n').map((text, index) => ({ line: index + 1, text }))
const SQL = key => {
  const index = code.findIndex(line => line.text.includes(key))
  if (index < 0) throw new Error(`Missing SQL line: ${key}`)
  return index + 1
}

export const python = `def consecutive_years(orders):
    orders["yr"] = orders["purchase_date"].str[:4].astype(int)
    yearly = orders.groupby(["product_id", "yr"]).size().reset_index(name="orders")
    busy = yearly[yearly["orders"] >= 3]
    merged = busy.merge(busy, on="product_id")
    hits = merged[merged["yr_y"] == merged["yr_x"] + 1]
    return sorted(hits["product_id"].unique())`
const PY_LINES = python.split('\n')
const PY = key => {
  const index = PY_LINES.findIndex(line => line.includes(key))
  if (index < 0) throw new Error(`Missing Python line: ${key}`)
  return index + 1
}

const frame = (phase, sqlKey, pyKey, message, columns, rows) => ({
  phase, activeLine: SQL(sqlKey), pythonLine: PY(pyKey), message, columns, rows: rows.map(row => ({ ...row })),
})

export const phases = [
  { id: 'load', label: 'Load', description: 'Read the order rows.' },
  { id: 'group', label: 'Count', description: 'Count orders per product and year.' },
  { id: 'pair', label: 'Neighbours', description: 'Check for two busy years in a row.' },
  { id: 'done', label: 'Result', description: 'Return the qualifying products.' },
]

const COLUMNS = ['order_id', 'product_id', 'quantity', 'purchase_date']

export function parseInput(text) {
  const input = JSON.parse(text)
  const rows = input && Array.isArray(input.Orders) ? input.Orders : null
  if (!rows || rows.length < 1 || rows.length > 30) throw new Error('Orders needs 1 to 30 rows.')
  for (const row of rows) {
    if (!row || typeof row !== 'object' || COLUMNS.some(column => !(column in row))) throw new Error(`Orders rows need ${COLUMNS.join(', ')}.`)
    if (typeof row.purchase_date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(row.purchase_date)) throw new Error('purchase_date must be YYYY-MM-DD.')
  }
  return { Orders: rows.map(row => Object.fromEntries(COLUMNS.map(column => [column, row[column]]))) }
}

const yearOf = date => Number(date.slice(0, 4))

export function buildTrace(input) {
  const { Orders } = input
  const frames = [frame('load', 'FROM Orders', 'def ', 'Read the order rows. Quantity is ignored because the rule counts orders.', COLUMNS, Orders)]
  const counts = new Map()
  for (const row of Orders) {
    const key = `${row.product_id}:${yearOf(row.purchase_date)}`
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }
  const groups = [...counts.entries()]
    .map(([key, orders]) => {
      const [product_id, yr] = key.split(':').map(Number)
      return { product_id, yr, orders }
    })
    .sort((a, b) => a.product_id - b.product_id || a.yr - b.yr)
  const summaryColumns = ['product_id', 'yr', 'orders', 'enough']
  const summary = []
  for (const group of groups) {
    const enough = group.orders >= 3 ? 'yes' : 'no'
    summary.push({ product_id: group.product_id, yr: group.yr, orders: group.orders, enough })
    frames.push(frame('group', 'GROUP BY product_id', 'yearly = ', `Product ${group.product_id} has ${group.orders} orders in ${group.yr}, so that year ${enough === 'yes' ? 'counts' : 'does not count'}.`, summaryColumns, summary))
  }
  const products = [...new Set(groups.map(group => group.product_id))]
  const result = []
  for (const product of products) {
    const years = groups.filter(group => group.product_id === product && group.orders >= 3).map(group => group.yr)
    const ok = years.some(year => years.includes(year + 1))
    if (ok) result.push({ product_id: product })
    frames.push(frame('pair', 'JOIN yearly', 'hits = ', `Product ${product} ${ok ? 'has' : 'does not have'} two busy years in a row.`, summaryColumns, summary))
  }
  frames.push(frame('done', 'ORDER BY', 'return', `Return ${result.length} products.`, ['product_id'], result))
  return { input, result, frames }
}
