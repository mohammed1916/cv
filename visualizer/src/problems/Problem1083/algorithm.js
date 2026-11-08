// Knowledge-derived SQL walkthrough. The sample tables are invented for this visualization.
export const sql = `SELECT DISTINCT s.buyer_id
FROM Sales s
JOIN Product p ON p.product_id = s.product_id
WHERE p.product_name = 'Kettle'
  AND s.buyer_id NOT IN (
    SELECT s2.buyer_id
    FROM Sales s2
    JOIN Product p2 ON p2.product_id = s2.product_id
    WHERE p2.product_name = 'Toaster'
  )
ORDER BY s.buyer_id`

export const code = sql.split('\n').map((text, index) => ({ line: index + 1, text }))
const SQL = key => {
  const index = code.findIndex(line => line.text.includes(key))
  if (index < 0) throw new Error(`Missing SQL line: ${key}`)
  return index + 1
}

export const python = `def s8_not_iphone(product, sales):
    names = product.set_index("product_id")["product_name"]
    named = sales.assign(product_name=sales["product_id"].map(names))
    s8 = set(named.loc[named["product_name"] == "Kettle", "buyer_id"])
    iphone = set(named.loc[named["product_name"] == "Toaster", "buyer_id"])
    return [{"buyer_id": b} for b in sorted(s8 - iphone)]`
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
  { id: 'names', label: 'Names', description: 'Attach each product name to its sale.' },
  { id: 'scan', label: 'Scan', description: 'Collect buyers of the first product.' },
  { id: 'exclude', label: 'Exclude', description: 'Remove buyers of the second product.' },
  { id: 'done', label: 'Result', description: 'Output the remaining buyers.' },
]

export const inputLabel = 'Object with Product and Sales tables'
export const complexity = 'O(n + m) with set membership for the two product names. The visualizer caps each table at 12 rows.'
export const examples = [
  {
    label: 'Sample',
    input: '{"Product":[{"product_id":1,"product_name":"Kettle","unit_price":699},{"product_id":2,"product_name":"Toaster","unit_price":999},{"product_id":3,"product_name":"Pixel","unit_price":500}],"Sales":[{"seller_id":1,"product_id":1,"buyer_id":10,"sale_date":"2019-01-01","quantity":1,"price":699},{"seller_id":1,"product_id":2,"buyer_id":11,"sale_date":"2019-01-02","quantity":1,"price":999},{"seller_id":2,"product_id":1,"buyer_id":11,"sale_date":"2019-01-03","quantity":1,"price":699},{"seller_id":2,"product_id":3,"buyer_id":12,"sale_date":"2019-01-04","quantity":1,"price":500},{"seller_id":3,"product_id":1,"buyer_id":12,"sale_date":"2019-01-05","quantity":2,"price":699}]}',
  },
  { label: 'Single product sold', input: '{"Product":[{"product_id":1,"product_name":"Bead"}],"Sales":[{"product_id":1,"buyer_id":10}]}' },
  { label: 'Unsold product', input: '{"Product":[{"product_id":1,"product_name":"Bead"},{"product_id":2,"product_name":"Clip"}],"Sales":[{"product_id":1,"buyer_id":10}]}' },
  { label: 'Largest tables: twelve sales', input: '{"Product":[{"product_id":1,"product_name":"Bead"},{"product_id":2,"product_name":"Clip"},{"product_id":3,"product_name":"Dart"}],"Sales":[{"product_id":2,"buyer_id":1},{"product_id":3,"buyer_id":2},{"product_id":1,"buyer_id":3},{"product_id":2,"buyer_id":4},{"product_id":3,"buyer_id":5},{"product_id":1,"buyer_id":6},{"product_id":2,"buyer_id":7},{"product_id":3,"buyer_id":8},{"product_id":1,"buyer_id":9},{"product_id":2,"buyer_id":10},{"product_id":3,"buyer_id":11},{"product_id":1,"buyer_id":12}]}' },
  { label: 'Long run: twelve sales', input: '{"Product":[{"product_id":1,"product_name":"Item 1"},{"product_id":2,"product_name":"Item 2"},{"product_id":3,"product_name":"Item 3"},{"product_id":4,"product_name":"Item 4"}],"Sales":[{"product_id":4,"buyer_id":33},{"product_id":1,"buyer_id":19},{"product_id":1,"buyer_id":35},{"product_id":1,"buyer_id":2},{"product_id":2,"buyer_id":18},{"product_id":4,"buyer_id":7},{"product_id":4,"buyer_id":32},{"product_id":1,"buyer_id":13},{"product_id":1,"buyer_id":36},{"product_id":1,"buyer_id":8},{"product_id":3,"buyer_id":32},{"product_id":2,"buyer_id":14}]}' },
]

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
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with Product and Sales tables.')
  return {
    Product: tableRows(input, 'Product', ['product_id', 'product_name']),
    Sales: tableRows(input, 'Sales', ['product_id', 'buyer_id']),
  }
}

export function buildTrace(input) {
  const { Product, Sales } = input
  const names = new Map(Product.map(row => [row.product_id, row.product_name]))
  const frames = []
  frames.push(frame('load', 'FROM Sales s', 'def ', 'Read the sales records.', ['buyer_id', 'product_id'], Sales))

  const named = Sales.map(sale => ({ buyer_id: sale.buyer_id, product_id: sale.product_id, product_name: names.get(sale.product_id) ?? '' }))
  frames.push(frame('names', 'JOIN Product p', 'named =', 'Attach the product name to each sale.', ['buyer_id', 'product_id', 'product_name'], named))

  const s8 = [...new Set(named.filter(row => row.product_name === 'Kettle').map(row => row.buyer_id))].sort((a, b) => a - b)
  const iphone = new Set(named.filter(row => row.product_name === 'Toaster').map(row => row.buyer_id))
  const candidates = s8.map(buyer_id => ({ buyer_id, product_name: 'Kettle' }))
  frames.push(frame('scan', "p.product_name = 'Kettle'", 's8 =', `Collect ${s8.length} buyers of Kettle.`, ['buyer_id', 'product_name'], candidates))

  const excluded = candidates.map(row => ({ buyer_id: row.buyer_id, bought_iphone: iphone.has(row.buyer_id) ? 'yes' : 'no', kept: iphone.has(row.buyer_id) ? 'no' : 'yes' }))
  frames.push(frame('exclude', 'NOT IN', 'iphone =', 'Remove buyers who also bought the second product.', ['buyer_id', 'bought_iphone', 'kept'], excluded))

  const result = excluded.filter(row => row.kept === 'yes').map(row => ({ buyer_id: row.buyer_id }))
  frames.push(frame('done', 'ORDER BY', 'return', `Return ${result.length} buyer${result.length === 1 ? '' : 's'}.`, ['buyer_id'], result))
  return { input, result, frames }
}
