// Knowledge-derived teaching version. The sample tables are invented for this visualization.
const SQL = `WITH ranked AS (
  SELECT c.name AS customer_name, c.customer_id, o.order_id, o.order_date,
    ROW_NUMBER() OVER (
      PARTITION BY c.customer_id
      ORDER BY o.order_date DESC, o.order_id DESC
    ) AS position
  FROM Customers AS c
  JOIN Orders AS o ON o.customer_id = c.customer_id
)
SELECT customer_name, customer_id, order_id, order_date
FROM ranked
WHERE position <= 3
ORDER BY customer_name, customer_id, order_date DESC`

const PANDAS = `import pandas as pd

def recent_three(customers, orders):
    joined = orders.merge(customers, on="customer_id")
    ranked = joined.sort_values(["order_date", "order_id"], ascending=False)
    top = ranked.groupby("customer_id").head(3)
    return top.rename(columns={"name": "customer_name"})[["customer_name", "customer_id", "order_id", "order_date"]].sort_values(
        ["customer_name", "customer_id", "order_date"], ascending=[True, True, False])`

const SQL_LINES = SQL.split('\n')
const PY_LINES = PANDAS.split('\n')

function lineOf(lines, text) {
  const index = lines.findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`Missing line: ${text}`)
  return index + 1
}

export const sql = SQL
export const python = PANDAS
export const code = SQL_LINES.map((text, index) => ({ line: index + 1, text }))

const frame = (phase, sqlText, pyText, message, columns, rows) => ({
  phase,
  activeLine: lineOf(SQL_LINES, sqlText),
  pythonLine: lineOf(PY_LINES, pyText),
  message,
  columns: [...columns],
  rows: rows.map(row => ({ ...row })),
})

const DATE = /^\d{4}-\d{2}-\d{2}$/

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || !Array.isArray(input.Customers) || !Array.isArray(input.Orders)) throw new Error('Use Customers and Orders lists.')
  if (input.Customers.length > 12 || input.Orders.length > 30) throw new Error('Use at most 12 customers and 30 orders.')
  const Customers = input.Customers.map(row => {
    if (!row || !Number.isInteger(row.customer_id) || typeof row.name !== 'string') throw new Error('Each customer needs an integer customer_id and a name.')
    return { customer_id: row.customer_id, name: row.name }
  })
  const Orders = input.Orders.map(row => {
    if (!row || !Number.isInteger(row.order_id) || !Number.isInteger(row.customer_id) || !Number.isInteger(row.cost)) {
      throw new Error('Each order needs integer order_id, customer_id and cost.')
    }
    if (typeof row.order_date !== 'string' || !DATE.test(row.order_date)) throw new Error('order_date uses YYYY-MM-DD.')
    return { order_id: row.order_id, order_date: row.order_date, customer_id: row.customer_id, cost: row.cost }
  })
  return { Customers, Orders }
}

export function buildTrace({ Customers, Orders }) {
  const name = new Map(Customers.map(row => [row.customer_id, row.name]))
  const frames = [frame('load', 'FROM Customers AS c', 'def recent_three', `Read ${Orders.length} orders for ${Customers.length} customers.`, ['order_id', 'order_date', 'customer_id', 'cost'], Orders)]
  const ids = [...new Set(Customers.map(row => row.customer_id))].sort((a, b) => a - b)
  const result = []
  const picked = []
  for (const id of ids) {
    if (!name.has(id)) continue
    // Newest first; a tie on the date goes to the larger order_id, as the window ORDER BY states.
    const orders = Orders
      .filter(order => order.customer_id === id)
      .sort((a, b) => (a.order_date < b.order_date ? 1 : a.order_date > b.order_date ? -1 : b.order_id - a.order_id))
      .slice(0, 3)
    for (const order of orders) {
      picked.push({ customer_name: name.get(id), customer_id: id, order_id: order.order_id, order_date: order.order_date })
    }
    frames.push(frame('rank', 'ROW_NUMBER() OVER', 'groupby("customer_id").head(3)',
      `${name.get(id)} keeps ${orders.length} most recent order${orders.length === 1 ? '' : 's'}: ${orders.map(order => order.order_id).join(', ') || 'none'}.`,
      ['customer_name', 'customer_id', 'order_id', 'order_date'], picked))
  }
  const sorted = [...picked].sort((a, b) => {
    if (a.customer_name !== b.customer_name) return a.customer_name < b.customer_name ? -1 : 1
    if (a.customer_id !== b.customer_id) return a.customer_id - b.customer_id
    return a.order_date < b.order_date ? 1 : a.order_date > b.order_date ? -1 : 0
  })
  result.push(...sorted)
  frames.push(frame('sort', 'ORDER BY customer_name', 'sort_values(', 'Sort by name, then customer id, then newest order first.', ['customer_name', 'customer_id', 'order_id', 'order_date'], result))
  frames.push(frame('done', 'WHERE position <= 3', 'return top', `Returned ${result.length} orders.`, ['customer_name', 'customer_id', 'order_id', 'order_date'], result))
  return { input: { Customers, Orders }, result, frames }
}
