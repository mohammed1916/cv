// Teaching model. The sample tables are invented for this visualization.
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

export const sql = `WITH joined AS (
  SELECT t.customer_id, t.amount, p.category
  FROM Transactions t
  JOIN Products p ON p.product_id = t.product_id
),
per_category AS (
  SELECT customer_id, category, COUNT(*) AS purchases
  FROM joined
  GROUP BY customer_id, category
),
ranked AS (
  SELECT customer_id, category,
         ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY purchases DESC, category) AS rn
  FROM per_category
)
SELECT j.customer_id,
       SUM(j.amount) AS total_spent,
       COUNT(*) AS purchase_count,
       COUNT(DISTINCT j.category) AS distinct_categories,
       r.category AS favorite_category
FROM joined j
JOIN ranked r ON r.customer_id = j.customer_id AND r.rn = 1
GROUP BY j.customer_id, r.category
ORDER BY j.customer_id`
const sqlLines = sql.split('\n')
export const code = sqlLines.map((text, index) => ({ line: index + 1, text }))

export const python = `import pandas as pd

def customer_purchasing_behavior(transactions, products):
    joined = transactions.merge(products[["product_id", "category"]], on="product_id")
    per_category = joined.groupby(["customer_id", "category"]).size().reset_index(name="purchases")
    ranked = per_category.sort_values(["customer_id", "purchases", "category"], ascending=[True, False, True])
    favorite = ranked.groupby("customer_id").head(1)[["customer_id", "category"]]
    favorite = favorite.rename(columns={"category": "favorite_category"})
    totals = joined.groupby("customer_id").agg(
        total_spent=("amount", "sum"),
        purchase_count=("amount", "size"),
        distinct_categories=("category", "nunique"),
    ).reset_index()
    return totals.merge(favorite, on="customer_id").sort_values("customer_id")`
const pyLines = python.split('\n')
const L = text => lineOf(sqlLines, text)
const P = text => lineOf(pyLines, text)
const frameAt = (phase, sqlText, pyText, message, columns, rows) => ({ phase, activeLine: L(sqlText), pythonLine: P(pyText), message, columns, rows: snap(rows) })

export const phases = [
  { id: 'load', label: 'Load', description: 'Read the purchases.' },
  { id: 'join', label: 'Join', description: 'Attach each product’s category to its purchases.' },
  { id: 'count', label: 'Count', description: 'Count purchases per customer and category.' },
  { id: 'rank', label: 'Rank', description: 'Pick each customer’s favourite category and totals.' },
  { id: 'done', label: 'Result', description: 'Output one row per customer.' },
]

const TX_COLS = ['transaction_id', 'customer_id', 'product_id', 'amount']
const JOIN_COLS = ['customer_id', 'product_id', 'category', 'amount']
const COUNT_COLS = ['customer_id', 'category', 'purchases']
const RESULT_COLS = ['customer_id', 'total_spent', 'purchase_count', 'distinct_categories', 'favorite_category']

export function parseInput(text) {
  const input = parseJsonObject(text)
  const transactions = requireRows(input, 'Transactions', TX_COLS)
  const products = requireRows(input, 'Products', ['product_id', 'category', 'price'])
  const known = new Set(products.map(row => row.product_id))
  for (const row of transactions) {
    if (!known.has(row.product_id)) throw new Error(`Transaction ${row.transaction_id} has an unknown product.`)
    if (!Number.isInteger(row.amount) || row.amount < 0) throw new Error('amount is a non-negative integer.')
  }
  return input
}

export function buildTrace(input) {
  const transactions = input.Transactions
  const categoryOf = new Map(input.Products.map(row => [row.product_id, row.category]))
  const frames = [frameAt('load', 'FROM Transactions t', 'def customer_purchasing_behavior', `Read ${transactions.length} purchases.`, TX_COLS, transactions)]
  const joined = transactions.map(row => ({ customer_id: row.customer_id, product_id: row.product_id, category: categoryOf.get(row.product_id), amount: row.amount }))
  frames.push(frameAt('join', 'JOIN Products p', 'transactions.merge(products', 'Attach the category of each purchased product.', JOIN_COLS, joined))
  const perCategory = new Map()
  for (const row of joined) {
    const key = `${row.customer_id}|${row.category}`
    const entry = perCategory.get(key) || { customer_id: row.customer_id, category: row.category, purchases: 0 }
    entry.purchases += 1
    perCategory.set(key, entry)
  }
  const counted = [...perCategory.values()].sort((a, b) => a.customer_id - b.customer_id || (a.category < b.category ? -1 : 1))
  frames.push(frameAt('count', 'GROUP BY customer_id, category', 'groupby(["customer_id", "category"])', `${counted.length} customer-category pairs.`, COUNT_COLS, counted))
  const customers = [...new Set(joined.map(row => row.customer_id))].sort((a, b) => a - b)
  const result = customers.map(customer_id => {
    const mine = joined.filter(row => row.customer_id === customer_id)
    const cats = counted.filter(row => row.customer_id === customer_id)
      .sort((a, b) => b.purchases - a.purchases || (a.category < b.category ? -1 : 1))
    return {
      customer_id,
      total_spent: mine.reduce((sum, row) => sum + row.amount, 0),
      purchase_count: mine.length,
      distinct_categories: cats.length,
      favorite_category: cats[0].category,
    }
  })
  frames.push(frameAt('rank', 'ROW_NUMBER() OVER', 'ranked = per_category.sort_values', 'Pick the top category by purchases, breaking ties alphabetically.', RESULT_COLS, result))
  frames.push(frameAt('done', 'ORDER BY j.customer_id', 'return totals.merge', 'Output one row per customer in id order.', RESULT_COLS, result))
  return { input, result, frames }
}
