// Knowledge-derived SQL walkthrough. The sample tables are invented for this visualization.
export const sql = `WITH has_type0 AS (
  SELECT DISTINCT customer_id FROM Orders WHERE order_type = 0
)
SELECT o.order_id, o.customer_id, o.order_type
FROM Orders o
WHERE o.order_type = 0
   OR (o.order_type = 1 AND o.customer_id NOT IN (SELECT customer_id FROM has_type0))
ORDER BY o.order_id`

export const code = sql.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def keep_orders(orders):
    type0 = orders.loc[orders.order_type == 0, "customer_id"].unique()
    keep = (orders.order_type == 0) | ((orders.order_type == 1) & ~orders.customer_id.isin(type0))
    return orders[keep].sort_values("order_id")`

export const sampleText = '{"Orders":[{"order_id":3,"customer_id":2,"order_type":1},{"order_id":1,"customer_id":1,"order_type":0},{"order_id":5,"customer_id":3,"order_type":0},{"order_id":2,"customer_id":1,"order_type":1},{"order_id":7,"customer_id":4,"order_type":1},{"order_id":4,"customer_id":2,"order_type":1},{"order_id":6,"customer_id":3,"order_type":0}]}'

const SQL = key => {
  const index = code.findIndex(line => line.text.includes(key))
  if (index < 0) throw new Error(`Missing SQL line: ${key}`)
  return index + 1
}
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
  { id: 'load', label: 'Load', description: 'Read the orders.' },
  { id: 'customers', label: 'Find', description: 'List customers who have at least one type-0 order.' },
  { id: 'check', label: 'Keep', description: 'Keep every type-0 order, and type-1 orders only for customers without type 0.' },
  { id: 'done', label: 'Result', description: 'Output the kept orders in order_id order.' },
]

function tableRows(input, name, columns) {
  const rows = input[name]
  if (!Array.isArray(rows) || rows.length < 1 || rows.length > 12) throw new Error(`${name} needs 1 to 12 rows.`)
  for (const row of rows) {
    if (!row || typeof row !== 'object' || columns.some(column => !(column in row))) throw new Error(`${name} rows need ${columns.join(', ')}.`)
  }
  return rows.map(row => Object.fromEntries(columns.map(column => [column, row[column]])))
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with an Orders table.')
  const Orders = tableRows(input, 'Orders', ['order_id', 'customer_id', 'order_type'])
  for (const row of Orders) {
    if (row.order_type !== 0 && row.order_type !== 1) throw new Error('order_type must be 0 or 1.')
  }
  return { Orders }
}

export function buildTrace(input) {
  const { Orders } = input
  const frames = []
  frames.push(frame('load', 'FROM Orders o', 'def ', 'Read the orders as stored.', ['order_id', 'customer_id', 'order_type'], Orders))

  const type0 = [...new Set(Orders.filter(row => row.order_type === 0).map(row => row.customer_id))]
  frames.push(frame('customers', 'SELECT DISTINCT', 'type0 = ', 'These customers have at least one type-0 order.', ['customer_id'], type0.map(customer_id => ({ customer_id }))))

  const sorted = [...Orders].sort((a, b) => a.order_id - b.order_id)
  const checked = []
  const result = []
  for (const row of sorted) {
    const kept = row.order_type === 0 || (row.order_type === 1 && !type0.includes(row.customer_id))
    checked.push({ order_id: row.order_id, customer_id: row.customer_id, order_type: row.order_type, kept: kept ? 'yes' : 'no' })
    if (kept) result.push({ order_id: row.order_id, customer_id: row.customer_id, order_type: row.order_type })
    frames.push(frame('check', 'OR (', 'keep =', `Order ${row.order_id} (customer ${row.customer_id}, type ${row.order_type}) is ${kept ? 'kept' : 'dropped'}.`, ['order_id', 'customer_id', 'order_type', 'kept'], checked))
  }
  frames.push(frame('done', 'ORDER BY o.order_id', 'return', `Return ${result.length} kept orders.`, ['order_id', 'customer_id', 'order_type'], result))
  return { input, result, frames }
}
