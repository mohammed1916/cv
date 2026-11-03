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

export const sql = `SELECT p.product_id,
  COALESCE((
    SELECT q.new_price
    FROM Products q
    WHERE q.product_id = p.product_id AND q.change_date <= '2019-08-16'
    ORDER BY q.change_date DESC
    LIMIT 1
  ), 10) AS price
FROM (SELECT DISTINCT product_id FROM Products) AS p
ORDER BY p.product_id`
const sqlLines = sql.split('\n')
export const code = sqlLines.map((text, index) => ({ line: index + 1, text }))
export const python = `import pandas as pd

def product_price(products):
    eligible = products[products["change_date"] <= "2019-08-16"]
    latest = eligible.sort_values("change_date").groupby("product_id").tail(1)
    all_ids = products[["product_id"]].drop_duplicates()
    merged = all_ids.merge(latest[["product_id", "new_price"]], on="product_id", how="left")
    merged["price"] = merged["new_price"].fillna(10).astype(int)
    return merged[["product_id", "price"]].sort_values("product_id")`
const pyLines = python.split('\n')
const L = text => lineOf(sqlLines, text)
const P = text => lineOf(pyLines, text)
const frameAt = (phase, sqlText, pyText, message, columns, rows) => ({ phase, activeLine: L(sqlText), pythonLine: P(pyText), message, columns, rows: snap(rows) })

export const phases = [
  { id: 'load', label: 'Load', description: 'Read every price change.' },
  { id: 'filter', label: 'Filter', description: 'Keep changes on or before the date.' },
  { id: 'latest', label: 'Latest', description: 'Keep the newest qualifying change per product.' },
  { id: 'fill', label: 'Default', description: 'Use 10 when no change qualifies.' },
  { id: 'order', label: 'Order', description: 'Sort by product id.' },
  { id: 'done', label: 'Result', description: 'Output product and price.' },
]
export const inputLabel = 'JSON object with a products table of price changes'
export const complexity = 'Sorting the changes by date, O(n log n) for n changes.'
const COLS = ['product_id', 'new_price', 'change_date']
const SAMPLE = { products: [
  { product_id: 1, new_price: 40, change_date: '2019-08-12' },
  { product_id: 1, new_price: 55, change_date: '2019-08-17' },
  { product_id: 2, new_price: 35, change_date: '2019-08-18' },
  { product_id: 3, new_price: 15, change_date: '2019-08-10' },
  { product_id: 3, new_price: 20, change_date: '2019-08-16' },
] }
export const examples = [{ label: 'Teaching sample', input: JSON.stringify(SAMPLE) }]
const START_PRICE = 10
const DATE = '2019-08-16'

export function parseInput(text) {
  const input = parseJsonObject(text)
  const rows = requireRows(input, 'products', COLS, 20)
  rows.forEach((row, index) => {
    if (!Number.isInteger(row.new_price)) throw new Error(`products row ${index + 1} needs an integer new_price.`)
  })
  return input
}

export function buildTrace(input) {
  const products = input.products
  const frames = [frameAt('load', 'FROM Products q', 'def product_price', `Load ${products.length} price changes.`, COLS, products)]
  const eligible = products.filter(row => row.change_date <= DATE)
  frames.push(frameAt('filter', 'WHERE q.product_id', 'eligible = products', `${eligible.length} changes happened on or before ${DATE}.`, COLS, eligible))
  const latestByProduct = new Map()
  for (const row of [...eligible].sort((a, b) => (a.change_date < b.change_date ? -1 : a.change_date > b.change_date ? 1 : 0))) {
    latestByProduct.set(row.product_id, row)
  }
  const latest = [...latestByProduct.values()].map(row => ({ product_id: row.product_id, new_price: row.new_price, change_date: row.change_date }))
  frames.push(frameAt('latest', 'ORDER BY q.change_date', 'latest = eligible', 'Keep the newest qualifying change for each product.', COLS, latest))
  const allIds = [...new Set(products.map(row => row.product_id))]
  const priced = allIds.map(product_id => ({
    product_id,
    price: latestByProduct.has(product_id) ? latestByProduct.get(product_id).new_price : START_PRICE,
  }))
  frames.push(frameAt('fill', 'COALESCE((', 'merged["price"]', 'Products with no qualifying change keep the starting price of 10.', ['product_id', 'price'], priced))
  const result = [...priced].sort((a, b) => a.product_id - b.product_id)
  frames.push(frameAt('order', 'ORDER BY p.product_id', 'sort_values("product_id")', 'Sort by product id.', ['product_id', 'price'], result))
  frames.push(frameAt('done', 'SELECT p.product_id', 'return merged', 'Output product_id and price.', ['product_id', 'price'], result))
  return { input, result, frames }
}
