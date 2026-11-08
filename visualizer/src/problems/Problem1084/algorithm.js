// Knowledge-derived SQL walkthrough. The sample tables are invented for this visualization.
export const sql = `SELECT p.product_id, p.product_name
FROM Product p
JOIN Sales s ON s.product_id = p.product_id
GROUP BY p.product_id, p.product_name
HAVING MIN(s.sale_date) >= '2019-01-01' AND MAX(s.sale_date) <= '2019-03-31'
ORDER BY p.product_id`

export const code = sql.split('\n').map((text, index) => ({ line: index + 1, text }))
const SQL = key => {
  const index = code.findIndex(line => line.text.includes(key))
  if (index < 0) throw new Error(`Missing SQL line: ${key}`)
  return index + 1
}

export const python = `def quarter_only_products(product, sales):
    joined = product.merge(sales, on="product_id")
    spans = joined.groupby(["product_id", "product_name"])["sale_date"].agg(["min", "max"])
    kept = spans[(spans["min"] >= "2019-01-01") & (spans["max"] <= "2019-03-31")]
    return kept.reset_index()[["product_id", "product_name"]].to_dict("records")`
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
  { id: 'load', label: 'Load', description: 'Read the product list.' },
  { id: 'join', label: 'Join', description: 'Pair each sale with its product.' },
  { id: 'range', label: 'Range', description: 'Check the first and last sale dates.' },
  { id: 'done', label: 'Result', description: 'Output products that stay in the quarter.' },
]

export const inputLabel = 'Object with Product and Sales tables'
export const complexity = 'O(n + m) to join and O(n) to check each product date range. The visualizer caps each table at 12 rows.'
export const examples = [
  {
    label: 'Sample',
    input: '{"Product":[{"product_id":1,"product_name":"Phone X"},{"product_id":2,"product_name":"Tablet Y"},{"product_id":3,"product_name":"Cable Z"},{"product_id":4,"product_name":"Lamp"}],"Sales":[{"product_id":1,"sale_date":"2019-01-05"},{"product_id":1,"sale_date":"2019-03-20"},{"product_id":2,"sale_date":"2019-02-01"},{"product_id":2,"sale_date":"2019-04-10"},{"product_id":4,"sale_date":"2019-03-31"}]}',
  },
  { label: 'Single sale in range', input: '{"Product":[{"product_id":1,"product_name":"Lamp"}],"Sales":[{"product_id":1,"sale_date":"2019-02-15"}]}' },
  { label: 'Range endpoints count', input: '{"Product":[{"product_id":1,"product_name":"Lamp"},{"product_id":2,"product_name":"Desk"}],"Sales":[{"product_id":1,"sale_date":"2019-01-01"},{"product_id":1,"sale_date":"2019-03-31"},{"product_id":2,"sale_date":"2018-12-31"}]}' },
  { label: 'Largest tables: twelve sales', input: '{"Product":[{"product_id":1,"product_name":"Lamp"},{"product_id":2,"product_name":"Desk"},{"product_id":3,"product_name":"Chair"}],"Sales":[{"product_id":2,"sale_date":"2019-01-15"},{"product_id":3,"sale_date":"2019-02-15"},{"product_id":1,"sale_date":"2019-03-15"},{"product_id":2,"sale_date":"2019-04-15"},{"product_id":3,"sale_date":"2019-05-15"},{"product_id":1,"sale_date":"2019-06-15"},{"product_id":2,"sale_date":"2019-07-15"},{"product_id":3,"sale_date":"2019-08-15"},{"product_id":1,"sale_date":"2019-09-15"},{"product_id":2,"sale_date":"2019-10-15"},{"product_id":3,"sale_date":"2019-11-15"},{"product_id":1,"sale_date":"2019-12-15"}]}' },
  { label: 'Long run: twelve sales', input: '{"Product":[{"product_id":1,"product_name":"Item 1"},{"product_id":2,"product_name":"Item 2"},{"product_id":3,"product_name":"Item 3"},{"product_id":4,"product_name":"Item 4"}],"Sales":[{"product_id":3,"sale_date":"2019-12-11"},{"product_id":2,"sale_date":"2019-09-22"},{"product_id":2,"sale_date":"2019-02-07"},{"product_id":2,"sale_date":"2019-12-12"},{"product_id":1,"sale_date":"2019-09-16"},{"product_id":1,"sale_date":"2019-01-21"},{"product_id":1,"sale_date":"2019-03-23"},{"product_id":4,"sale_date":"2019-05-06"},{"product_id":3,"sale_date":"2019-10-07"},{"product_id":4,"sale_date":"2019-12-19"},{"product_id":1,"sale_date":"2019-08-04"},{"product_id":1,"sale_date":"2019-02-06"}]}' },
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
    Sales: tableRows(input, 'Sales', ['product_id', 'sale_date']),
  }
}

const START = '2019-01-01'
const END = '2019-03-31'

export function buildTrace(input) {
  const { Product, Sales } = input
  const frames = []
  frames.push(frame('load', 'FROM Product p', 'def ', 'Read the product list.', ['product_id', 'product_name'], Product))

  const joined = []
  for (const sale of Sales) {
    const product = Product.find(row => row.product_id === sale.product_id)
    if (product) joined.push({ product_id: product.product_id, product_name: product.product_name, sale_date: sale.sale_date })
  }
  frames.push(frame('join', 'JOIN Sales s', 'joined =', `Pair ${joined.length} sales with their products.`, ['product_id', 'product_name', 'sale_date'], joined))

  const spans = []
  const result = []
  for (const product of Product) {
    const dates = joined.filter(row => row.product_id === product.product_id).map(row => row.sale_date)
    if (dates.length === 0) {
      frames.push(frame('range', 'MIN(s.sale_date)', 'spans =', `Product ${product.product_id} has no sales, so it does not qualify.`, ['product_id', 'product_name', 'first_sale', 'last_sale', 'kept'], spans))
      continue
    }
    const first = dates.reduce((a, b) => (a < b ? a : b))
    const last = dates.reduce((a, b) => (a > b ? a : b))
    const ok = first >= START && last <= END
    spans.push({ product_id: product.product_id, product_name: product.product_name, first_sale: first, last_sale: last, kept: ok ? 'yes' : 'no' })
    if (ok) result.push({ product_id: product.product_id, product_name: product.product_name })
    frames.push(frame('range', 'MIN(s.sale_date)', 'spans =', `Product ${product.product_id} runs from ${first} to ${last}, so it ${ok ? 'stays' : 'is dropped'}.`, ['product_id', 'product_name', 'first_sale', 'last_sale', 'kept'], spans))
  }
  frames.push(frame('done', 'ORDER BY', 'return', `Return ${result.length} product${result.length === 1 ? '' : 's'}.`, ['product_id', 'product_name'], result))
  return { input, result, frames }
}
