// SQL walkthrough. The sample tables are invented for this visualization.
export const sql = `SELECT s.salesperson_id, s.name, COALESCE(SUM(sa.price), 0) AS total
FROM Salesperson s
LEFT JOIN Customer c ON c.salesperson_id = s.salesperson_id
LEFT JOIN Sales sa ON sa.customer_id = c.customer_id
GROUP BY s.salesperson_id, s.name
ORDER BY s.salesperson_id`

export const code = sql.split('\n').map((text, index) => ({ line: index + 1, text }))
const SQL = key => {
  const index = code.findIndex(line => line.text.includes(key))
  if (index < 0) throw new Error(`Missing SQL line: ${key}`)
  return index + 1
}

export const python = `def salesperson_totals(salesperson, customer, sales):
    linked = customer.merge(sales, on="customer_id", how="left")
    totals = linked.groupby("salesperson_id")["price"].sum().reset_index()
    result = salesperson.merge(totals, on="salesperson_id", how="left")
    result["total"] = result["price"].fillna(0)
    return result.sort_values("salesperson_id")[["salesperson_id", "name", "total"]].to_dict("records")`
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
  { id: 'load', label: 'Load', description: 'Read the salespeople.' },
  { id: 'customer', label: 'Customers', description: 'Attach each sale to the salesperson who owns its customer.' },
  { id: 'group', label: 'Totals', description: 'Add up the prices for each salesperson.' },
  { id: 'order', label: 'Order', description: 'Sort by salesperson ID.' },
  { id: 'done', label: 'Result', description: 'Report every salesperson, including zero totals.' },
]

export const inputLabel = 'Object with Salesperson, Customer and Sales tables'
export const complexity = 'O(n + m + s) with a customer-to-salesperson lookup map. The visualizer caps each table at 12 rows.'
export const examples = [{
  label: 'Sample',
  input: '{"Salesperson":[{"salesperson_id":1,"name":"Ana"},{"salesperson_id":2,"name":"Ben"},{"salesperson_id":3,"name":"Cy"}],"Customer":[{"customer_id":10,"salesperson_id":1},{"customer_id":11,"salesperson_id":1},{"customer_id":12,"salesperson_id":2}],"Sales":[{"sale_id":1,"customer_id":10,"price":100},{"sale_id":2,"customer_id":11,"price":50},{"sale_id":3,"customer_id":12,"price":30},{"sale_id":4,"customer_id":10,"price":20}]}',
}, {
  label: 'Single salesperson',
  input: '{"Salesperson":[{"salesperson_id":1,"name":"Ada"}],"Customer":[{"customer_id":7,"salesperson_id":1}],"Sales":[{"sale_id":1,"customer_id":7,"price":500}]}',
}, {
  label: 'Salesperson with zero sales',
  input: '{"Salesperson":[{"salesperson_id":1,"name":"Ada"},{"salesperson_id":2,"name":"Ben"}],"Customer":[{"customer_id":7,"salesperson_id":1},{"customer_id":8,"salesperson_id":2}],"Sales":[{"sale_id":1,"customer_id":7,"price":10}]}',
}, {
  label: 'Equal totals keep both rows',
  input: '{"Salesperson":[{"salesperson_id":1,"name":"Ada"},{"salesperson_id":2,"name":"Ben"}],"Customer":[{"customer_id":7,"salesperson_id":1},{"customer_id":8,"salesperson_id":2}],"Sales":[{"sale_id":1,"customer_id":7,"price":30},{"sale_id":2,"customer_id":8,"price":30}]}',
}, {
  label: 'Long run: 12 sales',
  input: '{"Salesperson":[{"salesperson_id":1,"name":"Ada"},{"salesperson_id":2,"name":"Ben"},{"salesperson_id":3,"name":"Cy"},{"salesperson_id":4,"name":"Dee"},{"salesperson_id":5,"name":"Eli"},{"salesperson_id":6,"name":"Fay"}],"Customer":[{"customer_id":100,"salesperson_id":1},{"customer_id":101,"salesperson_id":4},{"customer_id":102,"salesperson_id":1},{"customer_id":103,"salesperson_id":6},{"customer_id":104,"salesperson_id":1},{"customer_id":105,"salesperson_id":6},{"customer_id":106,"salesperson_id":2},{"customer_id":107,"salesperson_id":1},{"customer_id":108,"salesperson_id":6},{"customer_id":109,"salesperson_id":3},{"customer_id":110,"salesperson_id":2},{"customer_id":111,"salesperson_id":1}],"Sales":[{"sale_id":1,"customer_id":111,"price":159},{"sale_id":2,"customer_id":103,"price":168},{"sale_id":3,"customer_id":104,"price":410},{"sale_id":4,"customer_id":104,"price":339},{"sale_id":5,"customer_id":101,"price":29},{"sale_id":6,"customer_id":108,"price":278},{"sale_id":7,"customer_id":110,"price":385},{"sale_id":8,"customer_id":109,"price":166},{"sale_id":9,"customer_id":110,"price":334},{"sale_id":10,"customer_id":108,"price":498},{"sale_id":11,"customer_id":103,"price":299},{"sale_id":12,"customer_id":104,"price":409}]}',
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
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with Salesperson, Customer and Sales tables.')
  return {
    Salesperson: tableRows(input, 'Salesperson', ['salesperson_id', 'name']),
    Customer: tableRows(input, 'Customer', ['customer_id', 'salesperson_id']),
    Sales: tableRows(input, 'Sales', ['sale_id', 'customer_id', 'price']),
  }
}

export function buildTrace(input) {
  const { Salesperson, Customer, Sales } = input
  const owner = new Map(Customer.map(row => [row.customer_id, row.salesperson_id]))
  const frames = [frame('load', 'FROM Salesperson', 'def ', `Load ${Salesperson.length} salespeople.`, ['salesperson_id', 'name'], Salesperson)]
  const linked = []
  for (const sale of Sales) {
    const salespersonId = owner.get(sale.customer_id)
    if (salespersonId === undefined) continue
    linked.push({ sale_id: sale.sale_id, salesperson_id: salespersonId, price: sale.price })
    frames.push(frame('customer', 'LEFT JOIN Sales', 'linked = ', `Sale ${sale.sale_id} belongs to salesperson ${salespersonId}.`, ['sale_id', 'salesperson_id', 'price'], linked))
  }
  const sums = new Map(Salesperson.map(row => [row.salesperson_id, 0]))
  for (const row of linked) sums.set(row.salesperson_id, sums.get(row.salesperson_id) + row.price)
  const totals = Salesperson.map(row => ({ salesperson_id: row.salesperson_id, name: row.name, total: sums.get(row.salesperson_id) }))
  frames.push(frame('group', 'GROUP BY s.salesperson_id', 'totals = ', 'Add the prices for each salesperson; no sales means 0.', ['salesperson_id', 'name', 'total'], totals))
  const result = [...totals].sort((a, b) => a.salesperson_id - b.salesperson_id)
  frames.push(frame('order', 'ORDER BY s.salesperson_id', 'return', 'Order the output by salesperson ID.', ['salesperson_id', 'name', 'total'], result))
  frames.push(frame('done', 'SELECT', 'return', `Return ${result.length} salespeople.`, ['salesperson_id', 'name', 'total'], result))
  return { input, result, frames }
}
