// SQL walkthrough. The sample tables are invented for this visualization.
export const sql = `WITH spend AS (
SELECT s.user_id, s.product_id, SUM(s.quantity * p.price) AS total
FROM Sales s
JOIN Product p ON p.product_id = s.product_id
GROUP BY s.user_id, s.product_id
),
best AS (
SELECT user_id, MAX(total) AS top_total
FROM spend
GROUP BY user_id
)
SELECT spend.user_id, spend.product_id
FROM spend
JOIN best ON best.user_id = spend.user_id AND best.top_total = spend.total
ORDER BY spend.user_id, spend.product_id`

export const code = sql.split('\n').map((text, index) => ({ line: index + 1, text }))
const SQL = key => {
  const index = code.findIndex(line => line.text.includes(key))
  if (index < 0) throw new Error(`Missing SQL line: ${key}`)
  return index + 1
}

export const python = `def top_spenders(sales, product):
    joined = sales.merge(product, on="product_id")
    joined["amount"] = joined["quantity"] * joined["price"]
    spend = joined.groupby(["user_id", "product_id"], as_index=False)["amount"].sum()
    top = spend.groupby("user_id")["amount"].transform("max")
    return spend[spend["amount"] == top][["user_id", "product_id"]]`
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
  { id: 'load', label: 'Load', description: 'Read the sales rows.' },
  { id: 'join', label: 'Price', description: 'Attach each product price to its sale.' },
  { id: 'sum', label: 'Total', description: 'Add spending per user and product.' },
  { id: 'best', label: 'Top', description: 'Find each user top total.' },
  { id: 'done', label: 'Result', description: 'Keep every product tied for the top total.' },
]

const TABLES = {
  Sales: ['sale_id', 'product_id', 'user_id', 'quantity'],
  Product: ['product_id', 'price'],
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with Sales and Product tables.')
  const output = {}
  for (const [name, columns] of Object.entries(TABLES)) {
    const rows = input[name]
    if (!Array.isArray(rows) || rows.length < 1 || rows.length > 30) throw new Error(`${name} needs 1 to 30 rows.`)
    for (const row of rows) {
      if (!row || typeof row !== 'object' || columns.some(column => !(column in row))) throw new Error(`${name} rows need ${columns.join(', ')}.`)
    }
    output[name] = rows.map(row => Object.fromEntries(columns.map(column => [column, row[column]])))
  }
  return output
}

export function buildTrace(input) {
  const { Sales, Product } = input
  const priceOf = new Map(Product.map(row => [row.product_id, row.price]))
  const saleColumns = ['sale_id', 'product_id', 'user_id', 'quantity']
  const frames = [frame('load', 'FROM Sales s', 'def ', 'Read the sales. Each row is one purchase line.', saleColumns, Sales)]
  const joinColumns = ['sale_id', 'user_id', 'product_id', 'quantity', 'price', 'amount']
  const joined = []
  for (const sale of Sales) {
    if (!priceOf.has(sale.product_id)) throw new Error(`Product ${sale.product_id} is missing from Product.`)
    const price = priceOf.get(sale.product_id)
    joined.push({ sale_id: sale.sale_id, user_id: sale.user_id, product_id: sale.product_id, quantity: sale.quantity, price, amount: sale.quantity * price })
    frames.push(frame('join', 'JOIN Product p', 'joined = ', `Sale ${sale.sale_id} costs ${sale.quantity} x ${price}.`, joinColumns, joined))
  }
  const totalColumns = ['user_id', 'product_id', 'total']
  const totals = []
  const keys = [...new Set(joined.map(row => `${row.user_id}:${row.product_id}`))]
    .map(key => key.split(':').map(Number))
    .sort((a, b) => a[0] - b[0] || a[1] - b[1])
  for (const [user, product] of keys) {
    const total = joined.filter(row => row.user_id === user && row.product_id === product).reduce((sum, row) => sum + row.amount, 0)
    totals.push({ user_id: user, product_id: product, total })
    frames.push(frame('sum', 'SUM(s.quantity', 'spend = ', `User ${user} spends ${total} on product ${product}.`, totalColumns, totals))
  }
  const tops = new Map()
  for (const row of totals) tops.set(row.user_id, Math.max(tops.get(row.user_id) ?? -Infinity, row.total))
  const topColumns = ['user_id', 'top_total']
  const topRows = []
  for (const user of [...tops.keys()].sort((a, b) => a - b)) {
    topRows.push({ user_id: user, top_total: tops.get(user) })
    frames.push(frame('best', 'SELECT user_id, MAX', 'top = ', `User ${user} has a top total of ${tops.get(user)}.`, topColumns, topRows))
  }
  const result = totals
    .filter(row => row.total === tops.get(row.user_id))
    .map(row => ({ user_id: row.user_id, product_id: row.product_id }))
  frames.push(frame('done', 'ORDER BY spend.user_id', 'return', `Return ${result.length} user and product pairs tied for the top total.`, ['user_id', 'product_id'], result))
  return { input, result, frames }
}
