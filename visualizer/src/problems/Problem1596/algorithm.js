// Knowledge-derived SQL lesson. The sample tables are invented for this visualization.
export const sql = `with counts as (
  select o.customer_id, o.product_id, count(*) as order_count
  from Orders o
  group by o.customer_id, o.product_id
),
best as (
  select customer_id, max(order_count) as best_count from counts group by customer_id
)
select c.customer_id, c.product_id, p.product_name
from counts c
join best b on b.customer_id = c.customer_id and b.best_count = c.order_count
join Products p on p.product_id = c.product_id
order by c.customer_id, c.product_id`
export const code = sql.split('\n').map((text, index) => ({ line: index + 1, text }))
export const python = `def favourite_products(orders, products):
    counts = orders.groupby(['customer_id', 'product_id']).size().reset_index(name='order_count')
    best = counts.groupby('customer_id')['order_count'].transform('max')
    tied = counts[counts['order_count'] == best]
    merged = tied.merge(products, on='product_id')
    return merged[['customer_id', 'product_id', 'product_name']].sort_values(['customer_id', 'product_id'])`
export const phases = [
  { id: 'load', label: 'Load', description: 'Read the Orders rows.' },
  { id: 'count', label: 'Count', description: 'Count orders for each customer and product pair.' },
  { id: 'best', label: 'Best', description: 'Find the largest count for each customer.' },
  { id: 'keep', label: 'Ties', description: 'Keep every product that reaches that largest count.' },
  { id: 'join', label: 'Name', description: 'Attach product names.' },
  { id: 'order', label: 'Order', description: 'Sort by customer id, then product id.' },
  { id: 'done', label: 'Result', description: 'Report the favourite products.' },
]

const sqlLine = text => {
  const hit = code.find(c => c.text.includes(text))
  if (!hit) throw new Error(`No SQL line contains "${text}".`)
  return hit.line
}
const pyLine = text => {
  const index = python.split('\n').findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`No Python line contains "${text}".`)
  return index + 1
}
const frame = (phase, sqlText, pyText, rows, output, message) => ({
  phase, activeLine: sqlLine(sqlText), pythonLine: pyLine(pyText),
  rows: rows.map(row => ({ ...row })), output: output.map(row => ({ ...row })), message,
})

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with customers, orders and products lists.')
  if (!Array.isArray(input.orders) || input.orders.length > 16) throw new Error('orders is a list of at most 16 rows.')
  if (!Array.isArray(input.products) || input.products.length > 8) throw new Error('products is a list of at most 8 rows.')
  for (const o of input.orders) {
    if (typeof o.order_id !== 'number' || typeof o.customer_id !== 'number' || typeof o.product_id !== 'number') throw new Error('Each order has order_id, customer_id and product_id.')
  }
  for (const p of input.products) {
    if (typeof p.product_id !== 'number' || typeof p.product_name !== 'string') throw new Error('Each product has product_id and product_name.')
  }
  return input
}

export function buildTrace(input) {
  const frames = []
  const orders = input.orders.map(o => ({ ...o }))
  frames.push(frame('load', 'from Orders o', 'def favourite_products', orders, [], `Read ${orders.length} orders.`))
  const pairs = new Map()
  for (const o of orders) {
    const key = `${o.customer_id}|${o.product_id}`
    const entry = pairs.get(key) ?? { customer_id: o.customer_id, product_id: o.product_id, order_count: 0 }
    entry.order_count += 1
    pairs.set(key, entry)
  }
  const counts = [...pairs.values()]
  frames.push(frame('count', 'count(*) as order_count', "groupby(['customer_id', 'product_id'])", counts, [], `${counts.length} customer and product pairs.`))
  const best = new Map()
  for (const row of counts) best.set(row.customer_id, Math.max(best.get(row.customer_id) ?? 0, row.order_count))
  const withBest = counts.map(row => ({ ...row, best_count: best.get(row.customer_id) }))
  frames.push(frame('best', 'max(order_count)', "transform('max')", withBest, [], 'Each customer has a largest count.'))
  const tied = withBest.filter(row => row.order_count === row.best_count)
  frames.push(frame('keep', 'b.best_count = c.order_count', "tied = counts", tied, [], `Keep ${tied.length} pairs that reach their customer's largest count.`))
  const names = new Map(input.products.map(p => [p.product_id, p.product_name]))
  const named = tied.map(row => ({ customer_id: row.customer_id, product_id: row.product_id, product_name: names.get(row.product_id) }))
  frames.push(frame('join', 'join Products p', 'merge(products', named, [], 'Attach each product name.'))
  const ordered = [...named].sort((a, b) => a.customer_id - b.customer_id || a.product_id - b.product_id)
  frames.push(frame('order', 'order by c.customer_id', "sort_values(['customer_id', 'product_id'])", ordered, [], 'Sort by customer, then product.'))
  const result = ordered.map(row => ({ ...row }))
  frames.push(frame('done', 'select c.customer_id', 'return merged', result, result, `Returned ${result.length} rows.`))
  return { input, result, frames }
}
