// Knowledge-derived SQL lesson. The sample tables are invented for this visualization.
export const sql = `select p.product_name, p.product_id, o.order_id, o.order_date
from Orders o
join Products p on p.product_id = o.product_id
where o.order_date = (
  select max(o2.order_date) from Orders o2 where o2.product_id = o.product_id)
order by p.product_name, p.product_id, o.order_id`
export const code = sql.split('\n').map((text, index) => ({ line: index + 1, text }))
export const python = `def latest_orders(orders, products):
    merged = orders.merge(products, on='product_id')
    newest = merged.groupby('product_id')['order_date'].transform('max')
    picked = merged[merged['order_date'] == newest]
    return picked[['product_name', 'product_id', 'order_id', 'order_date']].sort_values(['product_name', 'product_id', 'order_id'])`
export const phases = [
  { id: 'load', label: 'Load', description: 'Read the Orders rows.' },
  { id: 'join', label: 'Join', description: 'Attach each product name to its orders.' },
  { id: 'latest', label: 'Latest', description: 'Find the newest order date for each product.' },
  { id: 'filter', label: 'Filter', description: 'Keep every order on that newest date, ties included.' },
  { id: 'order', label: 'Order', description: 'Sort by name, product id and order id.' },
  { id: 'done', label: 'Result', description: 'Report the most recent orders.' },
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
const byKeys = keys => (a, b) => {
  for (const key of keys) {
    if (a[key] < b[key]) return -1
    if (a[key] > b[key]) return 1
  }
  return 0
}
const isDate = text => typeof text === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(text)

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with orders and products lists.')
  if (!Array.isArray(input.orders) || input.orders.length > 12) throw new Error('orders is a list of at most 12 rows.')
  if (!Array.isArray(input.products) || input.products.length > 8) throw new Error('products is a list of at most 8 rows.')
  for (const o of input.orders) {
    if (typeof o.order_id !== 'number' || !isDate(o.order_date) || typeof o.product_id !== 'number') throw new Error('Each order has order_id, order_date (YYYY-MM-DD) and product_id.')
  }
  for (const p of input.products) {
    if (typeof p.product_id !== 'number' || typeof p.product_name !== 'string') throw new Error('Each product has product_id and product_name.')
  }
  return input
}

export function buildTrace(input) {
  const frames = []
  const orders = input.orders.map(o => ({ ...o }))
  frames.push(frame('load', 'from Orders o', 'def latest_orders', orders, [], `Read ${orders.length} orders.`))
  const names = new Map(input.products.map(p => [p.product_id, p.product_name]))
  const joined = orders.map(o => ({ order_id: o.order_id, order_date: o.order_date, product_id: o.product_id, product_name: names.get(o.product_id) }))
  frames.push(frame('join', 'join Products', 'merge(', joined, [], 'Attach the product name to each order.'))
  const newest = new Map()
  for (const row of joined) newest.set(row.product_id, row.order_date > (newest.get(row.product_id) ?? '') ? row.order_date : newest.get(row.product_id))
  const withNewest = joined.map(row => ({ ...row, newest_date: newest.get(row.product_id) }))
  frames.push(frame('latest', 'select max(o2.order_date)', 'transform', withNewest, [], 'Each product has a newest date among its orders.'))
  const picked = withNewest.filter(row => row.order_date === row.newest_date)
  frames.push(frame('filter', 'where o.order_date', "picked = merged", picked, [], `Keep ${picked.length} orders on their product's newest date.`))
  const shaped = picked.map(row => ({ product_name: row.product_name, product_id: row.product_id, order_id: row.order_id, order_date: row.order_date }))
  shaped.sort(byKeys(['product_name', 'product_id', 'order_id']))
  frames.push(frame('order', 'order by p.product_name', 'sort_values', shaped, [], 'Sort by product name, product id and order id.'))
  const result = shaped.map(row => ({ ...row }))
  frames.push(frame('done', 'select p.product_name', 'return picked', result, result, `Returned ${result.length} orders.`))
  return { input, result, frames }
}
