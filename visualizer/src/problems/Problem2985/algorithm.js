// Knowledge-derived teaching model. The sample tables are invented for this visualization.
const COLS = ['item_count', 'order_occurrences']

export function snap(rows) {
  return rows.map(row => ({ ...row }))
}

export function lineOf(lines, text) {
  const index = lines.findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`Missing code line for: ${text}`)
  return index + 1
}

export function requireRows(input, name, columns) {
  const rows = input?.[name]
  if (!Array.isArray(rows) || rows.length === 0 || rows.length > 12) throw new Error(`${name} must be a list of 1 to 12 rows.`)
  rows.forEach((row, index) => {
    if (!row || typeof row !== 'object' || Array.isArray(row)) throw new Error(`${name} row ${index + 1} must be an object.`)
    columns.forEach(column => { if (!(column in row)) throw new Error(`${name} row ${index + 1} needs ${column}.`) })
  })
  return rows
}

export const sql = `WITH weighted AS (
  SELECT item_count * order_occurrences AS total_items,
         order_occurrences AS total_orders
  FROM Orders
)
SELECT ROUND(SUM(total_items) * 1.0 / SUM(total_orders), 2) AS average_items_per_order
FROM weighted`
const sqlLines = sql.split('\n')
export const code = sqlLines.map((text, index) => ({ line: index + 1, text }))
export const python = `import pandas as pd

def calculate_compressed_mean(orders):
    total_items = (orders["item_count"] * orders["order_occurrences"]).sum()
    total_orders = orders["order_occurrences"].sum()
    mean = round(total_items / total_orders, 2)
    return pd.DataFrame({"average_items_per_order": [mean]})`
const pyLines = python.split('\n')
const L = text => lineOf(sqlLines, text)
const P = text => lineOf(pyLines, text)

export const phases = [
  { id: 'load', label: 'Load', description: 'Read each compressed size and how often it occurs.' },
  { id: 'weight', label: 'Weight', description: 'Multiply each size by its occurrence count.' },
  { id: 'sum', label: 'Sum', description: 'Add up the weighted items and the order counts.' },
  { id: 'divide', label: 'Divide', description: 'Divide total items by total orders and round.' },
  { id: 'done', label: 'Result', description: 'Return the weighted mean.' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  const rows = requireRows(input, 'Orders', COLS)
  rows.forEach((row, index) => {
    if (!Number.isInteger(row.item_count) || row.item_count < 0) throw new Error(`Orders row ${index + 1} needs a whole-number item_count.`)
    if (!Number.isInteger(row.order_occurrences) || row.order_occurrences < 1) throw new Error(`Orders row ${index + 1} needs order_occurrences of at least 1.`)
  })
  return input
}

export function buildTrace(input) {
  const rows = input.Orders
  const frames = []
  const add = (phase, sqlText, pyText, message, columns, data) => frames.push({ phase, activeLine: L(sqlText), pythonLine: P(pyText), message, columns, rows: snap(data) })
  add('load', 'FROM Orders', 'def calculate', `Read ${rows.length} compressed rows.`, COLS, rows)
  const weighted = rows.map(row => ({ total_items: row.item_count * row.order_occurrences, total_orders: row.order_occurrences }))
  add('weight', 'AS total_items', 'total_items = (', 'Multiply each size by its count to get items, and keep the count as orders.', ['total_items', 'total_orders'], weighted)
  const sumItems = weighted.reduce((sum, row) => sum + row.total_items, 0)
  const sumOrders = weighted.reduce((sum, row) => sum + row.total_orders, 0)
  const totals = [{ total_items: sumItems, total_orders: sumOrders }]
  add('sum', 'SUM(total_items)', 'total_orders = ', `Totals: ${sumItems} items over ${sumOrders} orders.`, ['total_items', 'total_orders'], totals)
  const average = Number((sumItems / sumOrders).toFixed(2))
  add('divide', 'AS average_items_per_order', 'mean = round', `${sumItems} / ${sumOrders} = ${(sumItems / sumOrders).toFixed(4)}, rounded to two decimals.`, ['average_items_per_order'], [{ average_items_per_order: average }])
  const result = [{ average_items_per_order: average }]
  add('done', 'FROM weighted', 'return pd', 'Return the single weighted mean.', ['average_items_per_order'], result)
  return { input, result, frames }
}
