// Knowledge-derived SQL walkthrough. The sample tables are invented for this visualization.
export const sql = `SELECT pu.product_id, pu.quantity, pu.quantity * p.price AS price
FROM Purchases pu
JOIN Products p ON p.product_id = pu.product_id
WHERE pu.invoice_id = (
  SELECT invoice_id
  FROM Purchases pu2
  JOIN Products p2 ON p2.product_id = pu2.product_id
  GROUP BY invoice_id
  ORDER BY SUM(pu2.quantity * p2.price) DESC, invoice_id ASC
  LIMIT 1
)`

export const code = sql.split('\n').map((text, index) => ({ line: index + 1, text }))
const SQL = key => {
  const index = code.findIndex(line => line.text.includes(key))
  if (index < 0) throw new Error(`Missing SQL line: ${key}`)
  return index + 1
}

export const python = `def generate_invoice(purchases, products):
    lines = purchases.merge(products, on="product_id")
    lines["line_price"] = lines["quantity"] * lines["price"]
    totals = lines.groupby("invoice_id")["line_price"].sum()
    best = totals[totals == totals.max()].index.min()
    chosen = lines[lines["invoice_id"] == best]
    return chosen[["product_id", "quantity", "line_price"]].rename(columns={"line_price": "price"}).to_dict("records")`
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
  { id: 'load', label: 'Load', description: 'Read the purchase lines.' },
  { id: 'join', label: 'Join', description: 'Attach each unit price and compute the line price.' },
  { id: 'total', label: 'Totals', description: 'Add the line prices of each invoice.' },
  { id: 'choose', label: 'Choose', description: 'Pick the largest total, with the smaller invoice ID winning ties.' },
  { id: 'done', label: 'Result', description: 'List the lines of the chosen invoice.' },
]

export const inputLabel = 'Object with Products and Purchases tables'
export const complexity = 'O(n + m) to join and total, plus O(k) to find the maximum over k invoices. The visualizer caps each table at 12 rows.'
export const examples = [{
  label: 'Sample',
  input: '{"Products":[{"product_id":1,"price":100},{"product_id":2,"price":200},{"product_id":3,"price":50}],"Purchases":[{"invoice_id":1,"product_id":1,"quantity":2},{"invoice_id":1,"product_id":2,"quantity":1},{"invoice_id":2,"product_id":3,"quantity":4},{"invoice_id":2,"product_id":1,"quantity":3},{"invoice_id":3,"product_id":1,"quantity":5}]}',
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
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with Products and Purchases tables.')
  return {
    Products: tableRows(input, 'Products', ['product_id', 'price']),
    Purchases: tableRows(input, 'Purchases', ['invoice_id', 'product_id', 'quantity']),
  }
}

export function buildTrace(input) {
  const { Products, Purchases } = input
  const price = new Map(Products.map(row => [row.product_id, row.price]))
  const lineCols = ['invoice_id', 'product_id', 'quantity', 'line_price']
  const frames = [frame('load', 'FROM Purchases pu', 'def ', `Load ${Purchases.length} purchase lines.`, ['invoice_id', 'product_id', 'quantity'], Purchases)]
  const lines = []
  for (const purchase of Purchases) {
    if (!price.has(purchase.product_id)) throw new Error(`Purchase on invoice ${purchase.invoice_id} has no product.`)
    const linePrice = purchase.quantity * price.get(purchase.product_id)
    lines.push({ invoice_id: purchase.invoice_id, product_id: purchase.product_id, quantity: purchase.quantity, line_price: linePrice })
    frames.push(frame('join', 'JOIN Products p', 'merge(', `Line on invoice ${purchase.invoice_id} costs ${linePrice}.`, lineCols, lines))
  }
  const totals = new Map()
  for (const line of lines) totals.set(line.invoice_id, (totals.get(line.invoice_id) ?? 0) + line.line_price)
  const totalRows = [...totals].map(([invoice_id, total]) => ({ invoice_id, total }))
  frames.push(frame('total', 'GROUP BY invoice_id', 'totals = ', 'Add the line prices within each invoice.', ['invoice_id', 'total'], totalRows))
  const best = Math.max(...totalRows.map(row => row.total))
  const chosenId = Math.min(...totalRows.filter(row => row.total === best).map(row => row.invoice_id))
  frames.push(frame('choose', 'ORDER BY SUM', 'best = ', `The largest total is ${best}; the smallest invoice with it is ${chosenId}.`, ['invoice_id', 'total'], totalRows.filter(row => row.invoice_id === chosenId)))
  const result = lines.filter(line => line.invoice_id === chosenId).map(line => ({ product_id: line.product_id, quantity: line.quantity, price: line.line_price }))
  frames.push(frame('done', 'SELECT', 'return', `Return the ${result.length} lines of invoice ${chosenId}.`, ['product_id', 'quantity', 'price'], result))
  return { input, result, frames }
}
