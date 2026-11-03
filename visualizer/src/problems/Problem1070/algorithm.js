// Knowledge-derived SQL walkthrough. The sample tables are invented for this visualization.
export const sql = `SELECT s.product_id, f.first_year, s.quantity, s.price
FROM Sales s
JOIN (SELECT product_id, MIN(year) AS first_year FROM Sales GROUP BY product_id) f
  ON f.product_id = s.product_id
WHERE s.year = f.first_year
ORDER BY s.sale_id`

export const code = sql.split('\n').map((text, index) => ({ line: index + 1, text }))
const SQL = key => {
  const index = code.findIndex(line => line.text.includes(key))
  if (index < 0) throw new Error(`Missing SQL line: ${key}`)
  return index + 1
}

export const python = `def earliest_year_sales(sales):
    first = sales.groupby("product_id")["year"].min()
    merged = sales.assign(first_year=sales["product_id"].map(first))
    kept = merged[merged["year"] == merged["first_year"]]
    return kept.sort_values("sale_id")[["product_id", "first_year", "quantity", "price"]].to_dict("records")`
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
  { id: 'earliest', label: 'Earliest', description: 'Find the first sale year of each product.' },
  { id: 'filter', label: 'Filter', description: 'Keep sales made in the first year.' },
  { id: 'done', label: 'Result', description: 'Output the kept sales in sale order.' },
]

export const inputLabel = 'Object with a Sales table'
export const complexity = 'O(n log n) with the sort on sale_id, or O(n) with a sale-order scan. The visualizer caps the table at 12 rows.'
export const examples = [{
  label: 'Sample',
  input: '{"Sales":[{"sale_id":1,"product_id":11,"year":2010,"quantity":3,"price":40},{"sale_id":2,"product_id":11,"year":2010,"quantity":2,"price":41},{"sale_id":3,"product_id":11,"year":2011,"quantity":5,"price":45},{"sale_id":4,"product_id":22,"year":2011,"quantity":15,"price":9},{"sale_id":5,"product_id":22,"year":2012,"quantity":20,"price":8}]}',
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
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with a Sales table.')
  return { Sales: tableRows(input, 'Sales', ['sale_id', 'product_id', 'year', 'quantity', 'price']) }
}

export function buildTrace(input) {
  const { Sales } = input
  const ordered = [...Sales].sort((a, b) => a.sale_id - b.sale_id)
  const frames = []
  frames.push(frame('load', 'FROM Sales s', 'def ', `Load ${Sales.length} sales records.`, ['sale_id', 'product_id', 'year', 'quantity', 'price'], Sales))

  const first = new Map()
  for (const sale of ordered) first.set(sale.product_id, Math.min(first.get(sale.product_id) ?? Infinity, sale.year))
  const firstRows = [...first].map(([product_id, first_year]) => ({ product_id, first_year }))
  frames.push(frame('earliest', 'MIN(year)', 'first =', 'Find the earliest sale year of each product.', ['product_id', 'first_year'], firstRows))

  const checked = []
  const result = []
  for (const sale of ordered) {
    const keep = sale.year === first.get(sale.product_id)
    checked.push({ sale_id: sale.sale_id, product_id: sale.product_id, year: sale.year, first_year: first.get(sale.product_id), kept: keep ? 'yes' : 'no' })
    if (keep) result.push({ product_id: sale.product_id, first_year: sale.year, quantity: sale.quantity, price: sale.price })
    frames.push(frame('filter', 'WHERE s.year', 'kept =', `Sale ${sale.sale_id} is ${keep ? 'in' : 'after'} its product's first year.`, ['sale_id', 'product_id', 'year', 'first_year', 'kept'], checked))
  }
  frames.push(frame('done', 'ORDER BY', 'return', `Return ${result.length} sale rows.`, ['product_id', 'first_year', 'quantity', 'price'], result))
  return { input, result, frames }
}
