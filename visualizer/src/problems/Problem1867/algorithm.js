// SQL walkthrough. The sample tables are invented for this visualization.
export const sql = `WITH per_order AS (
  SELECT order_id, AVG(quantity) AS avg_qty, MAX(quantity) AS max_qty
  FROM OrdersDetails
  GROUP BY order_id
)
SELECT order_id
FROM per_order
WHERE max_qty > (SELECT MAX(avg_qty) FROM per_order)
ORDER BY order_id`

export const code = sql.split('\n').map((text, index) => ({ line: index + 1, text }))
const SQL = key => {
  const index = code.findIndex(line => line.text.includes(key))
  if (index < 0) throw new Error(`Missing SQL line: ${key}`)
  return index + 1
}

export const python = `def orders_above_average(order_details):
    stats = order_details.groupby("order_id")["quantity"].agg(["mean", "max"])
    best_average = stats["mean"].max()
    kept = stats[stats["max"] > best_average]
    return kept.reset_index()[["order_id"]].sort_values("order_id")`
const PY_LINES = python.split('\n')
const PY = key => {
  const index = PY_LINES.findIndex(line => line.includes(key))
  if (index < 0) throw new Error(`Missing Python line: ${key}`)
  return index + 1
}

export const phases = [
  { id: 'load', label: 'Load', description: 'Read the item lines.' },
  { id: 'group', label: 'Average', description: 'Average and maximum quantity for each order.' },
  { id: 'best', label: 'Best average', description: 'Find the largest per-order average.' },
  { id: 'filter', label: 'Filter', description: 'Keep orders whose maximum beats that average.' },
  { id: 'done', label: 'Result', description: 'Return the qualifying order ids.' },
]

const DETAIL_COLUMNS = ['order_id', 'product_id', 'quantity']
const SUMMARY_COLUMNS = ['order_id', 'avg_qty', 'max_qty']
const round = value => Math.round(value * 100) / 100

const frame = (phase, sqlKey, pyKey, message, columns, rows, extra = {}) => ({
  phase, activeLine: SQL(sqlKey), pythonLine: PY(pyKey), message, columns, rows: rows.map(row => ({ ...row })), ...extra,
})

function tableRows(input, name, columns, max = 12) {
  const rows = input[name]
  if (!Array.isArray(rows) || rows.length < 1 || rows.length > max) throw new Error(`${name} needs 1 to ${max} rows.`)
  return rows.map(row => {
    if (!row || typeof row !== 'object' || columns.some(column => !(column in row))) throw new Error(`${name} rows need ${columns.join(', ')}.`)
    return Object.fromEntries(columns.map(column => [column, row[column]]))
  })
}

const isInt = (value, min, max) => Number.isInteger(value) && value >= min && value <= max

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with an OrdersDetails table.')
  const OrdersDetails = tableRows(input, 'OrdersDetails', DETAIL_COLUMNS)
  for (const row of OrdersDetails) {
    if (!isInt(row.order_id, 1, 20) || !isInt(row.product_id, 1, 200) || !isInt(row.quantity, 1, 100)) throw new Error('Use whole numbers: order_id 1-20, product_id 1-50, quantity 1-100.')
  }
  return { OrdersDetails }
}

export function buildTrace(input) {
  const { OrdersDetails } = input
  const frames = [frame('load', 'FROM OrdersDetails', 'def ', 'Read every item line.', DETAIL_COLUMNS, OrdersDetails)]
  const groups = new Map()
  for (const row of OrdersDetails) {
    if (!groups.has(row.order_id)) groups.set(row.order_id, [])
    groups.get(row.order_id).push(row.quantity)
  }
  const summary = []
  for (const id of [...groups.keys()].sort((a, b) => a - b)) {
    const quantities = groups.get(id)
    const total = quantities.reduce((sum, quantity) => sum + quantity, 0)
    summary.push({ order_id: id, avg_qty: round(total / quantities.length), max_qty: Math.max(...quantities) })
    const last = summary.at(-1)
    frames.push(frame('group', 'AVG(quantity)', 'agg(', `Order ${id}: average ${last.avg_qty}, maximum ${last.max_qty}.`, SUMMARY_COLUMNS, summary))
  }
  const best = Math.max(...summary.map(row => row.avg_qty))
  frames.push(frame('best', 'SELECT MAX(avg_qty)', 'best_average =', `The largest order average is ${best}.`, SUMMARY_COLUMNS, summary))
  const kept = summary.filter(row => row.max_qty > best).map(row => ({ order_id: row.order_id }))
  frames.push(frame('filter', 'WHERE max_qty', 'kept =', `${kept.length} order(s) have a maximum above ${best}.`, ['order_id'], kept))
  frames.push(frame('done', 'ORDER BY order_id', 'return', 'Return the qualifying orders.', ['order_id'], kept))
  return { input, result: kept, frames }
}
