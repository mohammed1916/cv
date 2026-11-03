// Knowledge-derived SQL walkthrough. The sample tables are invented for this visualization.
export const sql = `SELECT seller_id
FROM Sales
GROUP BY seller_id
HAVING SUM(price) = (
  SELECT MAX(t.total) FROM (SELECT SUM(price) AS total FROM Sales GROUP BY seller_id) t
)
ORDER BY seller_id`

export const code = sql.split('\n').map((text, index) => ({ line: index + 1, text }))
const SQL = key => {
  const index = code.findIndex(line => line.text.includes(key))
  if (index < 0) throw new Error(`Missing SQL line: ${key}`)
  return index + 1
}

export const python = `def top_sellers(sales):
    totals = sales.groupby("seller_id")["price"].sum()
    kept = totals[totals == totals.max()].index
    return [{"seller_id": s} for s in sorted(kept)]`
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
  { id: 'sum', label: 'Sum', description: 'Add each sale price to its seller.' },
  { id: 'max', label: 'Maximum', description: 'Find the largest total and mark ties.' },
  { id: 'done', label: 'Result', description: 'Output every seller at the maximum.' },
]

export const inputLabel = 'Object with a Sales table'
export const complexity = 'O(n) to total the sales and O(s) to compare sellers. The visualizer caps the table at 12 rows.'
export const examples = [{
  label: 'Sample',
  input: '{"Sales":[{"seller_id":1,"product_id":1,"buyer_id":1,"sale_date":"2019-01-02","quantity":2,"price":100},{"seller_id":1,"product_id":2,"buyer_id":2,"sale_date":"2019-02-03","quantity":1,"price":300},{"seller_id":2,"product_id":1,"buyer_id":3,"sale_date":"2019-03-01","quantity":3,"price":250},{"seller_id":2,"product_id":3,"buyer_id":1,"sale_date":"2019-03-05","quantity":1,"price":150},{"seller_id":3,"product_id":2,"buyer_id":4,"sale_date":"2019-03-08","quantity":4,"price":100}]}',
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
  return { Sales: tableRows(input, 'Sales', ['seller_id', 'price']) }
}

export function buildTrace(input) {
  const { Sales } = input
  const frames = []
  frames.push(frame('load', 'FROM Sales', 'def ', 'Read the sales records.', ['seller_id', 'price'], Sales))

  const totals = new Map()
  for (const sale of Sales) {
    totals.set(sale.seller_id, (totals.get(sale.seller_id) ?? 0) + sale.price)
    const summary = [...totals].map(([seller_id, total]) => ({ seller_id, total_price: total }))
    frames.push(frame('sum', 'GROUP BY seller_id', 'totals =', `Add ${sale.price} to seller ${sale.seller_id}.`, ['seller_id', 'total_price'], summary))
  }

  const top = Math.max(...totals.values())
  const marked = [...totals].map(([seller_id, total]) => ({ seller_id, total_price: total, kept: total === top ? 'yes' : 'no' }))
  frames.push(frame('max', 'HAVING SUM', 'kept =', `The largest total is ${top}.`, ['seller_id', 'total_price', 'kept'], marked))

  const result = marked.filter(row => row.kept === 'yes').map(row => ({ seller_id: row.seller_id })).sort((a, b) => a.seller_id - b.seller_id)
  frames.push(frame('done', 'ORDER BY', 'return', `Return ${result.length} seller${result.length === 1 ? '' : 's'}.`, ['seller_id'], result))
  return { input, result, frames }
}
