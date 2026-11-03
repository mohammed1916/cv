// Knowledge-derived SQL walkthrough. The sample tables are invented for this visualization.
export const sql = `SELECT p.product_name, s.year, s.price
FROM Sales s
JOIN Product p ON p.product_id = s.product_id
ORDER BY s.sale_id`

export const code = sql.split('\n').map((text, index) => ({ line: index + 1, text }))
const SQL = key => {
  const index = code.findIndex(line => line.text.includes(key))
  if (index < 0) throw new Error(`Missing SQL line: ${key}`)
  return index + 1
}

export const python = `def sales_with_names(sales, product):
    joined = sales.merge(product, on="product_id")
    joined = joined.sort_values("sale_id")
    return joined[["product_name", "year", "price"]].to_dict("records")`
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
  { id: 'load', label: 'Load', description: 'Read the sales records.' },
  { id: 'join', label: 'Join', description: 'Pair each sale with its product name.' },
  { id: 'done', label: 'Result', description: 'Output the joined rows in sale order.' },
]

export const inputLabel = 'Object with Sales and Product tables'
export const complexity = 'O(n + m) with a lookup map from product to name. The visualizer caps each table at 12 rows.'
export const examples = [{
  label: 'Sample',
  input: '{"Sales":[{"sale_id":5,"product_id":11,"year":2010,"quantity":3,"price":40},{"sale_id":6,"product_id":11,"year":2011,"quantity":2,"price":41},{"sale_id":8,"product_id":22,"year":2011,"quantity":7,"price":95},{"sale_id":9,"product_id":44,"year":2012,"quantity":1,"price":10}],"Product":[{"product_id":11,"product_name":"Lamp"},{"product_id":22,"product_name":"Desk"},{"product_id":33,"product_name":"Chair"}]}',
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
    Sales: tableRows(input, 'Sales', ['sale_id', 'product_id', 'year', 'quantity', 'price']),
    Product: tableRows(input, 'Product', ['product_id', 'product_name']),
  }
}

export function buildTrace(input) {
  const { Sales, Product } = input
  const names = new Map(Product.map(row => [row.product_id, row.product_name]))
  const ordered = [...Sales].sort((a, b) => a.sale_id - b.sale_id)
  const frames = []
  frames.push(frame('load', 'FROM Sales', 'def ', `Load ${Sales.length} sales records.`, ['sale_id', 'product_id', 'year', 'quantity', 'price'], Sales))
  const result = []
  for (const sale of ordered) {
    const name = names.get(sale.product_id)
    if (name === undefined) {
      frames.push(frame('join', 'JOIN Product', 'joined =', `Sale ${sale.sale_id} has no matching product, so the inner join drops it.`, ['product_name', 'year', 'price'], result))
      continue
    }
    result.push({ product_name: name, year: sale.year, price: sale.price })
    frames.push(frame('join', 'JOIN Product', 'joined =', `Sale ${sale.sale_id} pairs with ${name}.`, ['product_name', 'year', 'price'], result))
  }
  frames.push(frame('done', 'ORDER BY', 'return', `Return ${result.length} rows.`, ['product_name', 'year', 'price'], result))
  return { input, result, frames }
}
