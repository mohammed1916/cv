// Knowledge-derived teaching version. The sample tables are invented for this visualization.
const SQL = `WITH monthly AS (
  SELECT o.customer_id,
    SUBSTRING(o.order_date, 1, 7) AS month,
    SUM(p.price * o.quantity) AS spent
  FROM Orders AS o
  JOIN Product AS p ON p.product_id = o.product_id
  WHERE SUBSTRING(o.order_date, 1, 7) IN ('2020-06', '2020-07')
  GROUP BY o.customer_id, month
)
SELECT c.customer_id, c.name
FROM Customers AS c
JOIN monthly AS m ON m.customer_id = c.customer_id
GROUP BY c.customer_id, c.name
HAVING SUM(CASE WHEN m.month = '2020-06' AND m.spent >= 100 THEN 1 ELSE 0 END) > 0
   AND SUM(CASE WHEN m.month = '2020-07' AND m.spent >= 100 THEN 1 ELSE 0 END) > 0
ORDER BY c.customer_id`

const PANDAS = `import pandas as pd

def frequent_customers(customers, product, orders):
    o = orders.merge(product, on="product_id")
    o["spent"] = o["price"] * o["quantity"]
    o["month"] = o["order_date"].str[:7]
    summer = o[o["month"].isin(["2020-06", "2020-07"])]
    spend = summer.groupby(["customer_id", "month"])["spent"].sum().unstack(fill_value=0)
    spend = spend.reindex(columns=["2020-06", "2020-07"], fill_value=0)
    qualified = spend[(spend >= 100).all(axis=1)].index
    return customers[customers["customer_id"].isin(qualified)][["customer_id", "name"]].sort_values("customer_id")`

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
  if (!input || !Array.isArray(input.Customers) || !Array.isArray(input.Product) || !Array.isArray(input.Orders)) throw new Error('Use Customers, Product and Orders lists.')
  if (input.Customers.length > 12 || input.Product.length > 12 || input.Orders.length > 30) throw new Error('Use at most 12 customers, 12 products and 30 orders.')
  const Customers = input.Customers.map(row => {
    if (!row || !Number.isInteger(row.customer_id) || typeof row.name !== 'string') throw new Error('Each customer needs an integer customer_id and a name.')
    return { customer_id: row.customer_id, name: row.name }
  })
  const Product = input.Product.map(row => {
    if (!row || !Number.isInteger(row.product_id) || !Number.isInteger(row.price) || row.price < 0) throw new Error('Each product needs an integer product_id and a non-negative integer price.')
    return { product_id: row.product_id, price: row.price }
  })
  const Orders = input.Orders.map(row => {
    if (!row || !Number.isInteger(row.customer_id) || !Number.isInteger(row.product_id) || !Number.isInteger(row.quantity) || row.quantity < 0) {
      throw new Error('Each order needs integer customer_id, product_id and a non-negative quantity.')
    }
    if (typeof row.order_date !== 'string' || !DATE.test(row.order_date)) throw new Error('order_date uses YYYY-MM-DD.')
    return { customer_id: row.customer_id, product_id: row.product_id, order_date: row.order_date, quantity: row.quantity }
  })
  return { Customers, Product, Orders }
}

export function buildTrace({ Customers, Product, Orders }) {
  const price = new Map(Product.map(row => [row.product_id, row.price]))
  const frames = [frame('load', 'FROM Orders AS o', 'def frequent_customers', `Read ${Customers.length} customers and ${Orders.length} orders.`, ['customer_id', 'name'], Customers)]
  const sorted = [...Customers].sort((a, b) => a.customer_id - b.customer_id)
  const totals = []
  const result = []
  for (const customer of sorted) {
    let june = 0
    let july = 0
    for (const order of Orders) {
      if (order.customer_id !== customer.customer_id) continue
      const cost = order.quantity * (price.get(order.product_id) ?? NaN)
      if (Number.isNaN(cost)) throw new Error(`Order for customer ${customer.customer_id} names an unknown product.`)
      if (order.order_date.startsWith('2020-06')) june += cost
      if (order.order_date.startsWith('2020-07')) july += cost
    }
    totals.push({ customer_id: customer.customer_id, name: customer.name, june, july })
    frames.push(frame('total', 'SUM(p.price', 'spend = summer',
      `${customer.name} spends ${june} in June and ${july} in July.`, ['customer_id', 'name', 'june', 'july'], totals))
    const qualifies = june >= 100 && july >= 100
    if (qualifies) result.push({ customer_id: customer.customer_id, name: customer.name })
    frames.push(frame('decide', 'HAVING', 'qualified = spend',
      `${customer.name} ${qualifies ? 'meets' : 'misses'} the 100 threshold in both months.`, ['customer_id', 'name', 'june', 'july'], totals))
  }
  frames.push(frame('done', 'ORDER BY c.customer_id', 'return customers', `Returned ${result.length} customers.`, ['customer_id', 'name'], result))
  return { input: { Customers, Product, Orders }, result, frames }
}
