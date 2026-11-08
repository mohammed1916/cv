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

export const sql = `WITH ranked AS (
  SELECT o.seller_id, i.item_brand,
         ROW_NUMBER() OVER (PARTITION BY o.seller_id ORDER BY o.order_date) AS sale_no
  FROM Orders o
  JOIN Items i ON i.item_id = o.item_id
),
second_sale AS (
  SELECT seller_id, item_brand
  FROM ranked
  WHERE sale_no = 2
)
SELECT u.user_id AS seller_id,
       CASE WHEN s.item_brand = u.favorite_brand THEN 'yes' ELSE 'no' END AS second_item_fav_brand
FROM Users u
LEFT JOIN second_sale s ON s.seller_id = u.user_id
ORDER BY u.user_id`
const sqlLines = sql.split('\n')
export const code = sqlLines.map((text, index) => ({ line: index + 1, text }))
export const python = `import pandas as pd

def market_analysis_ii(users, items, orders):
    sales = orders.merge(items, on="item_id").sort_values(["seller_id", "order_date"])
    sales["sale_no"] = sales.groupby("seller_id").cumcount() + 1
    second = sales[sales["sale_no"] == 2][["seller_id", "item_brand"]]
    sellers = users.rename(columns={"user_id": "seller_id"})
    merged = sellers.merge(second, on="seller_id", how="left")
    merged["second_item_fav_brand"] = (merged["item_brand"] == merged["favorite_brand"]).map({True: "yes", False: "no"})
    return merged[["seller_id", "second_item_fav_brand"]].sort_values("seller_id")`
const pyLines = python.split('\n')
const L = text => lineOf(sqlLines, text)
const P = text => lineOf(pyLines, text)
const frameAt = (phase, sqlText, pyText, message, columns, rows) => ({ phase, activeLine: L(sqlText), pythonLine: P(pyText), message, columns, rows: snap(rows) })

export const phases = [
  { id: 'load', label: 'Load', description: 'Read the order rows.' },
  { id: 'join', label: 'Join', description: 'Attach each sold item’s brand, in seller and date order.' },
  { id: 'rank', label: 'Rank', description: 'Number each seller’s sales chronologically.' },
  { id: 'second', label: 'Second sale', description: 'Keep only each seller’s second sale.' },
  { id: 'compare', label: 'Compare', description: 'Check the brand against the favorite brand.' },
  { id: 'order', label: 'Order', description: 'Sort by seller id.' },
  { id: 'done', label: 'Result', description: 'Output the yes or no flag.' },
]
export const inputLabel = 'JSON object with Users, Items and Orders tables'
export const complexity = 'Sorting the orders dominates, O(n log n) for n orders.'
const USER_COLS = ['user_id', 'join_date', 'favorite_brand']
const ITEM_COLS = ['item_id', 'item_brand']
const ORDER_COLS = ['order_id', 'order_date', 'item_id', 'buyer_id', 'seller_id']
const SAMPLE = {
  users: [
    { user_id: 1, join_date: '2018-04-11', favorite_brand: 'Dell' },
    { user_id: 2, join_date: '2018-02-01', favorite_brand: 'Samsung' },
    { user_id: 3, join_date: '2018-06-18', favorite_brand: 'Samsung' },
  ],
  items: [
    { item_id: 10, item_brand: 'Lenovo' },
    { item_id: 20, item_brand: 'Samsung' },
    { item_id: 30, item_brand: 'Apple' },
    { item_id: 40, item_brand: 'Samsung' },
  ],
  orders: [
    { order_id: 1, order_date: '2019-08-01', item_id: 10, buyer_id: 2, seller_id: 1 },
    { order_id: 2, order_date: '2019-08-02', item_id: 30, buyer_id: 3, seller_id: 1 },
    { order_id: 3, order_date: '2019-08-03', item_id: 20, buyer_id: 1, seller_id: 2 },
    { order_id: 4, order_date: '2019-08-05', item_id: 40, buyer_id: 1, seller_id: 3 },
    { order_id: 5, order_date: '2019-08-04', item_id: 20, buyer_id: 2, seller_id: 3 },
  ],
}
export const examples = [{ label: 'Teaching sample', input: JSON.stringify(SAMPLE) }, { label: 'One sale', input: '{"users":[{"user_id":1,"join_date":"2018-01-01","favorite_brand":"Dell"}],"items":[{"item_id":1,"item_brand":"Dell"}],"orders":[{"order_id":1,"order_date":"2019-08-01","item_id":1,"buyer_id":1,"seller_id":1}]}' }, { label: 'Two sales on one day for one seller', input: '{"users":[{"user_id":1,"join_date":"2018-01-01","favorite_brand":"Dell"},{"user_id":2,"join_date":"2018-02-01","favorite_brand":"Acer"},{"user_id":3,"join_date":"2018-03-01","favorite_brand":"Apple"}],"items":[{"item_id":1,"item_brand":"Dell"},{"item_id":2,"item_brand":"Acer"}],"orders":[{"order_id":1,"order_date":"2019-08-01","item_id":1,"buyer_id":2,"seller_id":1},{"order_id":2,"order_date":"2019-08-01","item_id":2,"buyer_id":3,"seller_id":1}]}' }, { label: 'Several sellers, one per date', input: '{"users":[{"user_id":1,"join_date":"2018-01-01","favorite_brand":"Dell"},{"user_id":2,"join_date":"2018-02-01","favorite_brand":"Acer"}],"items":[{"item_id":1,"item_brand":"Apple"}],"orders":[{"order_id":1,"order_date":"2019-09-09","item_id":1,"buyer_id":2,"seller_id":2},{"order_id":2,"order_date":"2019-09-10","item_id":1,"buyer_id":1,"seller_id":1}]}' }, { label: 'Long run: 10 users, 5 items, 20 orders', input: '{"users":[{"user_id":1,"join_date":"2017-08-06","favorite_brand":"Samsung"},{"user_id":2,"join_date":"2017-11-04","favorite_brand":"Dell"},{"user_id":3,"join_date":"2018-08-27","favorite_brand":"Acer"},{"user_id":4,"join_date":"2018-03-14","favorite_brand":"Apple"},{"user_id":5,"join_date":"2016-06-23","favorite_brand":"Samsung"},{"user_id":6,"join_date":"2018-01-03","favorite_brand":"Apple"},{"user_id":7,"join_date":"2016-07-27","favorite_brand":"Samsung"},{"user_id":8,"join_date":"2017-04-21","favorite_brand":"Samsung"},{"user_id":9,"join_date":"2016-03-12","favorite_brand":"Apple"},{"user_id":10,"join_date":"2016-09-07","favorite_brand":"Samsung"}],"items":[{"item_id":1,"item_brand":"Samsung"},{"item_id":2,"item_brand":"Apple"},{"item_id":3,"item_brand":"Samsung"},{"item_id":4,"item_brand":"Apple"},{"item_id":5,"item_brand":"Dell"}],"orders":[{"order_id":1,"order_date":"2019-03-11","item_id":4,"buyer_id":5,"seller_id":2},{"order_id":2,"order_date":"2019-03-07","item_id":5,"buyer_id":10,"seller_id":2},{"order_id":3,"order_date":"2019-05-29","item_id":4,"buyer_id":9,"seller_id":6},{"order_id":4,"order_date":"2019-05-17","item_id":2,"buyer_id":6,"seller_id":8},{"order_id":5,"order_date":"2019-04-05","item_id":3,"buyer_id":9,"seller_id":3},{"order_id":6,"order_date":"2019-01-31","item_id":2,"buyer_id":3,"seller_id":5},{"order_id":7,"order_date":"2019-02-08","item_id":5,"buyer_id":4,"seller_id":5},{"order_id":8,"order_date":"2019-02-21","item_id":5,"buyer_id":4,"seller_id":8},{"order_id":9,"order_date":"2019-04-13","item_id":4,"buyer_id":7,"seller_id":4},{"order_id":10,"order_date":"2019-03-04","item_id":4,"buyer_id":7,"seller_id":5},{"order_id":11,"order_date":"2019-06-08","item_id":2,"buyer_id":8,"seller_id":3},{"order_id":12,"order_date":"2019-04-30","item_id":5,"buyer_id":7,"seller_id":5},{"order_id":13,"order_date":"2019-05-23","item_id":2,"buyer_id":10,"seller_id":5},{"order_id":14,"order_date":"2019-06-06","item_id":2,"buyer_id":8,"seller_id":7},{"order_id":15,"order_date":"2019-01-16","item_id":3,"buyer_id":5,"seller_id":7},{"order_id":16,"order_date":"2019-07-05","item_id":4,"buyer_id":10,"seller_id":10},{"order_id":17,"order_date":"2019-07-11","item_id":2,"buyer_id":10,"seller_id":5},{"order_id":18,"order_date":"2019-06-04","item_id":4,"buyer_id":10,"seller_id":8},{"order_id":19,"order_date":"2019-04-13","item_id":2,"buyer_id":2,"seller_id":5},{"order_id":20,"order_date":"2019-03-29","item_id":2,"buyer_id":4,"seller_id":3}]}' }]

export function parseInput(text) {
  const input = parseJsonObject(text)
  requireRows(input, 'users', USER_COLS, 20)
  requireRows(input, 'items', ITEM_COLS, 20)
  requireRows(input, 'orders', ORDER_COLS, 20)
  const known = new Set(input.items.map(row => row.item_id))
  input.orders.forEach((row, index) => {
    if (!known.has(row.item_id)) throw new Error(`orders row ${index + 1} names an unknown item.`)
  })
  return input
}

export function buildTrace(input) {
  const { users, items, orders } = input
  const frames = [frameAt('load', 'FROM Orders o', 'def market_analysis_ii', `Load ${orders.length} orders.`, ORDER_COLS, orders)]
  const brandOf = new Map(items.map(row => [row.item_id, row.item_brand]))
  const sales = orders
    .map(row => ({ order_id: row.order_id, seller_id: row.seller_id, order_date: row.order_date, item_brand: brandOf.get(row.item_id) }))
    .sort((a, b) => (a.seller_id - b.seller_id) || (a.order_date < b.order_date ? -1 : a.order_date > b.order_date ? 1 : 0))
  frames.push(frameAt('join', 'JOIN Items i', 'sales = orders', 'Attach each sold item’s brand; sort by seller, then date.', ['order_id', 'seller_id', 'order_date', 'item_brand'], sales))
  const counter = new Map()
  const ranked = sales.map(row => {
    const sale_no = (counter.get(row.seller_id) || 0) + 1
    counter.set(row.seller_id, sale_no)
    return { ...row, sale_no }
  })
  frames.push(frameAt('rank', 'ROW_NUMBER()', 'sales["sale_no"]', 'Number each seller’s sales from 1.', ['order_id', 'seller_id', 'order_date', 'item_brand', 'sale_no'], ranked))
  const second = ranked.filter(row => row.sale_no === 2)
  frames.push(frameAt('second', 'WHERE sale_no = 2', 'second = sales', `${second.length} sellers have a second sale.`, ['order_id', 'seller_id', 'order_date', 'item_brand', 'sale_no'], second))
  const secondOf = new Map(second.map(row => [row.seller_id, row.item_brand]))
  const compared = users.map(user => {
    const brand = secondOf.get(user.user_id)
    return {
      seller_id: user.user_id,
      item_brand: brand ?? null,
      favorite_brand: user.favorite_brand,
      second_item_fav_brand: brand !== undefined && brand === user.favorite_brand ? 'yes' : 'no',
    }
  })
  frames.push(frameAt('compare', 'CASE WHEN s.item_brand', 'merged["second_item_fav_brand"]', 'A seller with a single sale has no second sale to compare, so it gets no.', ['seller_id', 'item_brand', 'favorite_brand', 'second_item_fav_brand'], compared))
  const result = compared
    .map(row => ({ seller_id: row.seller_id, second_item_fav_brand: row.second_item_fav_brand }))
    .sort((a, b) => a.seller_id - b.seller_id)
  frames.push(frameAt('order', 'ORDER BY u.user_id', 'sort_values("seller_id")', 'Sort by seller id.', ['seller_id', 'second_item_fav_brand'], result))
  frames.push(frameAt('done', 'SELECT u.user_id', 'return merged', 'Output seller_id and second_item_fav_brand.', ['seller_id', 'second_item_fav_brand'], result))
  return { input, result, frames }
}
