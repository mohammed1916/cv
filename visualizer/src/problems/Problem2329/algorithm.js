// SQL walkthrough. The sample tables are invented for this visualization.
export const sql = `SELECT s.user_id, SUM(s.quantity * p.price) AS spending
FROM Sales s
JOIN Product p ON p.product_id = s.product_id
GROUP BY s.user_id
ORDER BY spending DESC, s.user_id ASC`

export const code = sql.split('\n').map((text, index) => ({ line: index + 1, text }))
const SQL = key => {
  const index = code.findIndex(line => line.text.includes(key))
  if (index < 0) throw new Error(`Missing SQL line: ${key}`)
  return index + 1
}

export const python = `def spending_by_user(sales, product):
    joined = sales.merge(product, on="product_id")
    joined["amount"] = joined["quantity"] * joined["price"]
    totals = joined.groupby("user_id", as_index=False)["amount"].sum()
    totals = totals.sort_values(["amount", "user_id"], ascending=[False, True])
    return totals.rename(columns={"amount": "spending"}).to_dict("records")`
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
  { id: 'join', label: 'Join', description: 'Attach each sale’s unit price and compute its amount.' },
  { id: 'group', label: 'Group', description: 'Add up the amounts for each user.' },
  { id: 'order', label: 'Order', description: 'Sort by spending, then by user ID.' },
  { id: 'done', label: 'Result', description: 'Report each user’s total spending.' },
]

export const inputLabel = 'Object with Sales and Product tables'
export const complexity = 'O(n + m) to join and group, plus O(k log k) to sort k users. The visualizer caps each table at 12 rows.'
export const examples = [{
  label: 'Sample',
  input: '{"Sales":[{"sale_id":1,"product_id":1,"user_id":7,"quantity":2},{"sale_id":2,"product_id":2,"user_id":5,"quantity":1},{"sale_id":3,"product_id":3,"user_id":7,"quantity":5},{"sale_id":4,"product_id":1,"user_id":9,"quantity":3},{"sale_id":5,"product_id":2,"user_id":3,"quantity":1}],"Product":[{"product_id":1,"price":10},{"product_id":2,"price":25},{"product_id":3,"price":4}]}',
}]

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
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with Sales and Product tables.')
  return {
    Sales: tableRows(input, 'Sales', ['sale_id', 'product_id', 'user_id', 'quantity']),
    Product: tableRows(input, 'Product', ['product_id', 'price']),
  }
}

export function buildTrace(input) {
  const { Sales, Product } = input
  const price = new Map(Product.map(row => [row.product_id, row.price]))
  const saleCols = ['sale_id', 'product_id', 'user_id', 'quantity']
  const amountCols = ['sale_id', 'user_id', 'amount']
  const totalCols = ['user_id', 'spending']
  const frames = [frame('load', 'FROM Sales', 'def ', `Load ${Sales.length} sales rows.`, saleCols, Sales)]
  const joined = []
  for (const sale of Sales) {
    if (!price.has(sale.product_id)) throw new Error(`Sale ${sale.sale_id} has no product.`)
    const amount = sale.quantity * price.get(sale.product_id)
    joined.push({ sale_id: sale.sale_id, user_id: sale.user_id, amount })
    frames.push(frame('join', 'JOIN Product', 'merge(', `Sale ${sale.sale_id} is ${sale.quantity} times the unit price, so ${amount}.`, amountCols, joined))
  }
  const totals = new Map()
  for (const row of joined) totals.set(row.user_id, (totals.get(row.user_id) ?? 0) + row.amount)
  const grouped = [...totals].map(([user_id, spending]) => ({ user_id, spending }))
  frames.push(frame('group', 'GROUP BY', 'groupby', `Add the amounts into ${grouped.length} user totals.`, totalCols, grouped))
  const result = [...grouped].sort((a, b) => (b.spending - a.spending) || (a.user_id - b.user_id))
  frames.push(frame('order', 'ORDER BY', 'sort_values', 'Sort by spending high to low, then user ID low to high.', totalCols, result))
  frames.push(frame('done', 'SELECT', 'return', `Return ${result.length} rows.`, totalCols, result))
  return { input, result, frames }
}
