// Knowledge-derived SQL walkthrough. The sample tables are invented for this visualization.
export const sql = `SELECT product_id, SUM(quantity) AS total_quantity
FROM Sales
GROUP BY product_id
ORDER BY product_id`

export const code = sql.split('\n').map((text, index) => ({ line: index + 1, text }))
const SQL = key => {
  const index = code.findIndex(line => line.text.includes(key))
  if (index < 0) throw new Error(`Missing SQL line: ${key}`)
  return index + 1
}

export const python = `def total_units(sales):
    totals = sales.groupby("product_id", sort=False)["quantity"].sum()
    out = totals.reset_index().rename(columns={"quantity": "total_quantity"})
    return out.sort_values("product_id").to_dict("records")`
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
  { id: 'scan', label: 'Scan', description: 'Add each sale quantity to its product total.' },
  { id: 'done', label: 'Result', description: 'Output one row per product.' },
]

export const inputLabel = 'Object with a Sales table'
export const complexity = 'O(n) over the sales rows with one running total per product. The visualizer caps the table at 12 rows.'
export const examples = [{
  label: 'Sample',
  input: '{"Sales":[{"sale_id":1,"product_id":11,"year":2010,"quantity":3,"price":40},{"sale_id":2,"product_id":11,"year":2011,"quantity":2,"price":41},{"sale_id":3,"product_id":22,"year":2011,"quantity":7,"price":95},{"sale_id":4,"product_id":11,"year":2012,"quantity":5,"price":45}]}',
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
  const frames = []
  frames.push(frame('load', 'FROM Sales', 'def ', `Load ${Sales.length} sales records.`, ['sale_id', 'product_id', 'quantity'], Sales))
  const totals = new Map()
  for (const sale of Sales) {
    totals.set(sale.product_id, (totals.get(sale.product_id) ?? 0) + sale.quantity)
    const summary = [...totals].map(([product_id, total_quantity]) => ({ product_id, total_quantity }))
    frames.push(frame('scan', 'SUM(quantity)', 'totals =', `Add ${sale.quantity} to product ${sale.product_id}.`, ['product_id', 'total_quantity'], summary))
  }
  const result = [...totals].map(([product_id, total_quantity]) => ({ product_id, total_quantity })).sort((a, b) => a.product_id - b.product_id)
  frames.push(frame('done', 'ORDER BY', 'return', `Return ${result.length} product rows.`, ['product_id', 'total_quantity'], result))
  return { input, result, frames }
}
