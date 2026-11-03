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

export const sql = `SELECT u.user_id AS buyer_id, u.join_date, COUNT(o.order_id) AS orders_2019
FROM Users u
LEFT JOIN Orders o
  ON o.buyer_id = u.user_id AND YEAR(o.order_date) = 2019
GROUP BY u.user_id, u.join_date
ORDER BY u.user_id`
const sqlLines = sql.split('\n')
export const code = sqlLines.map((text, index) => ({ line: index + 1, text }))
export const python = `import pandas as pd

def market_analysis_i(users, orders):
    in_year = orders[orders["order_date"].str.startswith("2019")]
    counts = in_year.groupby("buyer_id").size().rename("orders_2019")
    joined = users.join(counts, on="user_id")
    joined["orders_2019"] = joined["orders_2019"].fillna(0).astype(int)
    result = joined.rename(columns={"user_id": "buyer_id"})
    return result[["buyer_id", "join_date", "orders_2019"]].sort_values("buyer_id")`
const pyLines = python.split('\n')
const L = text => lineOf(sqlLines, text)
const P = text => lineOf(pyLines, text)
const frameAt = (phase, sqlText, pyText, message, columns, rows) => ({ phase, activeLine: L(sqlText), pythonLine: P(pyText), message, columns, rows: snap(rows) })

export const phases = [
  { id: 'load', label: 'Load', description: 'Read the user rows.' },
  { id: 'filter', label: 'Filter', description: 'Keep orders placed in 2019.' },
  { id: 'count', label: 'Count', description: 'Count 2019 orders per buyer.' },
  { id: 'join', label: 'Join', description: 'Attach counts to every user, using zero.' },
  { id: 'order', label: 'Order', description: 'Sort by user id.' },
  { id: 'done', label: 'Result', description: 'Output the rows.' },
]
export const inputLabel = 'JSON object with Users and Orders tables'
export const complexity = 'Linear in the user and order rows, with one hash count per buyer.'
const USER_COLS = ['user_id', 'join_date', 'favorite_brand']
const ORDER_COLS = ['order_id', 'order_date', 'item_id', 'buyer_id', 'seller_id']
const SAMPLE = {
  users: [
    { user_id: 1, join_date: '2017-05-12', favorite_brand: 'Dell' },
    { user_id: 2, join_date: '2017-06-03', favorite_brand: 'Acer' },
    { user_id: 3, join_date: '2019-02-14', favorite_brand: 'Apple' },
    { user_id: 4, join_date: '2019-07-21', favorite_brand: 'Acer' },
  ],
  orders: [
    { order_id: 1, order_date: '2019-08-01', item_id: 10, buyer_id: 1, seller_id: 2 },
    { order_id: 2, order_date: '2019-08-02', item_id: 20, buyer_id: 1, seller_id: 3 },
    { order_id: 3, order_date: '2018-12-01', item_id: 30, buyer_id: 2, seller_id: 1 },
    { order_id: 4, order_date: '2019-03-04', item_id: 40, buyer_id: 3, seller_id: 1 },
    { order_id: 5, order_date: '2019-05-06', item_id: 50, buyer_id: 4, seller_id: 2 },
  ],
}
export const examples = [{ label: 'Teaching sample', input: JSON.stringify(SAMPLE) }]

export function parseInput(text) {
  const input = parseJsonObject(text)
  requireRows(input, 'users', USER_COLS, 20)
  requireRows(input, 'orders', ORDER_COLS, 20)
  return input
}

export function buildTrace(input) {
  const { users, orders } = input
  const frames = [frameAt('load', 'FROM Users u', 'def market_analysis_i', `Load ${users.length} users.`, USER_COLS, users)]
  const inYear = orders.filter(row => row.order_date.startsWith('2019'))
  frames.push(frameAt('filter', 'YEAR(o.order_date) = 2019', 'in_year = orders', `${inYear.length} orders were placed in 2019.`, ORDER_COLS, inYear))
  const counts = new Map()
  for (const row of inYear) counts.set(row.buyer_id, (counts.get(row.buyer_id) || 0) + 1)
  const counted = [...counts].map(([buyer_id, orders_2019]) => ({ buyer_id, orders_2019 }))
  frames.push(frameAt('count', 'LEFT JOIN Orders', 'counts = in_year', 'Count the 2019 orders for each buyer.', ['buyer_id', 'orders_2019'], counted))
  const joined = users.map(user => ({
    buyer_id: user.user_id,
    join_date: user.join_date,
    orders_2019: counts.get(user.user_id) || 0,
  }))
  frames.push(frameAt('join', 'GROUP BY u.user_id', 'joined = users', 'Every user stays in the output; users without orders get zero.', ['buyer_id', 'join_date', 'orders_2019'], joined))
  const result = [...joined].sort((a, b) => a.buyer_id - b.buyer_id)
  frames.push(frameAt('order', 'ORDER BY u.user_id', 'sort_values("buyer_id")', 'Sort by user id.', ['buyer_id', 'join_date', 'orders_2019'], result))
  frames.push(frameAt('done', 'SELECT u.user_id', 'return result', 'Output buyer_id, join_date and orders_2019.', ['buyer_id', 'join_date', 'orders_2019'], result))
  return { input, result, frames }
}
