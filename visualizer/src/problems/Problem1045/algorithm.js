// Knowledge-derived SQL walkthrough. The sample tables are invented for this visualization.
export const sql = `SELECT customer_id
FROM Customer
GROUP BY customer_id
HAVING COUNT(DISTINCT product_key) = (SELECT COUNT(*) FROM Product)
ORDER BY customer_id`

export const code = sql.split('\n').map((text, index) => ({ line: index + 1, text }))
const SQL = key => {
  const index = code.findIndex(line => line.text.includes(key))
  if (index < 0) throw new Error(`Missing SQL line: ${key}`)
  return index + 1
}

export const python = `def customers_with_all_products(customer, product):
    total = product["product_key"].nunique()
    bought = customer.groupby("customer_id")["product_key"].nunique()
    kept = bought[bought == total].index
    return [{"customer_id": c} for c in sorted(kept)]`
const PY_LINES = python.split('\n')
const PY = key => {
  const index = PY_LINES.findIndex(line => line.includes(key))
  if (index < 0) throw new Error(`Missing Python line: ${key}`)
  return index + 1
}

const frame = (phase, sqlKey, pyKey, message, columns, rows, extra = {}) => ({
  phase, activeLine: SQL(sqlKey), pythonLine: PY(pyKey), message, columns, rows: rows.map(row => ({ ...row })), ...extra,
})

export const phases = [
  { id: 'load', label: 'Load', description: 'Read the purchase records.' },
  { id: 'products', label: 'Products', description: 'Count the listed products.' },
  { id: 'group', label: 'Group', description: 'Count distinct products for each customer.' },
  { id: 'done', label: 'Result', description: 'Output customers whose count matches.' },
]

export const inputLabel = 'Object with Customer and Product tables'
export const complexity = 'O(n) over the purchase rows. The visualizer caps each table at 12 rows.'
export const examples = [{
  label: 'Sample',
  input: '{"Customer":[{"customer_id":1,"product_key":5},{"customer_id":1,"product_key":6},{"customer_id":1,"product_key":7},{"customer_id":1,"product_key":5},{"customer_id":2,"product_key":5},{"customer_id":2,"product_key":6},{"customer_id":3,"product_key":5},{"customer_id":3,"product_key":6},{"customer_id":3,"product_key":7},{"customer_id":3,"product_key":7},{"customer_id":4,"product_key":5},{"customer_id":4,"product_key":5}],"Product":[{"product_key":5},{"product_key":6},{"product_key":7}]}',
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
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with Customer and Product tables.')
  return {
    Customer: tableRows(input, 'Customer', ['customer_id', 'product_key']),
    Product: tableRows(input, 'Product', ['product_key']),
  }
}

export function buildTrace(input) {
  const { Customer, Product } = input
  const listed = new Set(Product.map(row => row.product_key))
  const total = listed.size
  const frames = []
  frames.push(frame('load', 'FROM Customer', 'def ', 'Load the purchase records.', ['customer_id', 'product_key'], Customer))
  frames.push(frame('products', 'FROM Product', 'total =', `There are ${total} listed products.`, ['product_key'], Product))

  const bought = new Map()
  for (const row of Customer) {
    if (!bought.has(row.customer_id)) bought.set(row.customer_id, new Set())
    if (listed.has(row.product_key)) bought.get(row.customer_id).add(row.product_key)
  }
  const summary = []
  const result = []
  const customers = [...bought.entries()].sort((a, b) => a[0] - b[0])
  for (const [customer, keys] of customers) {
    const distinct = keys.size
    const ok = distinct === total
    summary.push({ customer_id: customer, distinct_products: distinct, kept: ok ? 'yes' : 'no' })
    if (ok) result.push({ customer_id: customer })
    frames.push(frame('group', 'HAVING', 'kept =', `Customer ${customer} bought ${distinct} of ${total} products, so it ${ok ? 'stays' : 'is dropped'}.`, ['customer_id', 'distinct_products', 'kept'], summary))
  }
  frames.push(frame('done', 'ORDER BY', 'return', `Return ${result.length} customer${result.length === 1 ? '' : 's'}.`, ['customer_id'], result))
  return { input, result, frames }
}
