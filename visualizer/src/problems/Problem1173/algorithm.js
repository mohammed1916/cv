// Knowledge-derived teaching model. The sample tables are invented for this visualization.
export function snap(rows) {
  return rows.map(row => ({ ...row }))
}

export function lineOf(lines, text) {
  const index = lines.findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`Missing code line for: ${text}`)
  return index + 1
}

export function parseJsonObject(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use a JSON object whose keys name the tables.')
  return input
}

export function requireRows(input, name, columns, maxRows = 12) {
  const rows = input[name]
  if (!Array.isArray(rows) || rows.length > maxRows) throw new Error(`${name} must be a list of at most ${maxRows} rows.`)
  rows.forEach((row, index) => {
    if (!row || typeof row !== 'object' || Array.isArray(row)) throw new Error(`${name} row ${index + 1} must be an object.`)
    columns.forEach(column => { if (!(column in row)) throw new Error(`${name} row ${index + 1} needs ${column}.`) })
  })
  return rows
}

export const sql = `SELECT ROUND(
  100.0 * SUM(CASE WHEN order_date = customer_pref_delivery_date THEN 1 ELSE 0 END) / COUNT(*),
  2) AS immediate_percentage
FROM Delivery`
const sqlLines = sql.split('\n')
export const code = sqlLines.map((text, index) => ({ line: index + 1, text }))
export const python = `import pandas as pd

def immediate_percentage(delivery):
    flags = delivery["order_date"] == delivery["customer_pref_delivery_date"]
    share = round(100 * flags.mean(), 2)
    return pd.DataFrame({"immediate_percentage": [share]})`
const pyLines = python.split('\n')
const L = text => lineOf(sqlLines, text)
const P = text => lineOf(pyLines, text)
const frameAt = (phase, sqlText, pyText, message, columns, rows) => ({ phase, activeLine: L(sqlText), pythonLine: P(pyText), message, columns, rows: snap(rows) })

export const phases = [
  { id: 'load', label: 'Load', description: 'Read the delivery rows.' },
  { id: 'compare', label: 'Compare', description: 'Mark deliveries whose preferred date is the order date.' },
  { id: 'count', label: 'Count', description: 'Count immediate and total deliveries.' },
  { id: 'percent', label: 'Percent', description: 'Divide and round to two decimals.' },
  { id: 'done', label: 'Result', description: 'Output immediate_percentage.' },
]
export const inputLabel = 'JSON object with a deliveries table'
export const complexity = 'Linear in the delivery rows.'
const COLS = ['delivery_id', 'customer_id', 'order_date', 'customer_pref_delivery_date']
const SAMPLE = { deliveries: [
  { delivery_id: 1, customer_id: 1, order_date: '2020-05-11', customer_pref_delivery_date: '2020-05-13' },
  { delivery_id: 2, customer_id: 2, order_date: '2020-05-13', customer_pref_delivery_date: '2020-05-13' },
  { delivery_id: 3, customer_id: 3, order_date: '2020-05-14', customer_pref_delivery_date: '2020-05-18' },
  { delivery_id: 4, customer_id: 1, order_date: '2020-05-16', customer_pref_delivery_date: '2020-05-16' },
  { delivery_id: 5, customer_id: 4, order_date: '2020-05-18', customer_pref_delivery_date: '2020-05-22' },
] }
export const examples = [{ label: 'Teaching sample', input: JSON.stringify(SAMPLE) }, { label: 'Single immediate delivery', input: '{"deliveries":[{"delivery_id":1,"customer_id":1,"order_date":"2020-06-01","customer_pref_delivery_date":"2020-06-01"}]}' }, { label: 'No immediate deliveries', input: '{"deliveries":[{"delivery_id":1,"customer_id":1,"order_date":"2020-06-01","customer_pref_delivery_date":"2020-06-03"},{"delivery_id":2,"customer_id":2,"order_date":"2020-06-02","customer_pref_delivery_date":"2020-06-05"}]}' }, { label: 'Half immediate', input: '{"deliveries":[{"delivery_id":1,"customer_id":1,"order_date":"2020-06-01","customer_pref_delivery_date":"2020-06-01"},{"delivery_id":2,"customer_id":2,"order_date":"2020-06-02","customer_pref_delivery_date":"2020-06-05"}]}' }, { label: 'Long run: 20 deliveries', input: '{"deliveries":[{"delivery_id":1,"customer_id":1,"order_date":"2020-06-02","customer_pref_delivery_date":"2020-06-02"},{"delivery_id":2,"customer_id":4,"order_date":"2020-06-11","customer_pref_delivery_date":"2020-06-12"},{"delivery_id":3,"customer_id":6,"order_date":"2020-06-04","customer_pref_delivery_date":"2020-06-04"},{"delivery_id":4,"customer_id":8,"order_date":"2020-06-12","customer_pref_delivery_date":"2020-06-14"},{"delivery_id":5,"customer_id":4,"order_date":"2020-06-04","customer_pref_delivery_date":"2020-06-09"},{"delivery_id":6,"customer_id":3,"order_date":"2020-06-10","customer_pref_delivery_date":"2020-06-10"},{"delivery_id":7,"customer_id":7,"order_date":"2020-06-05","customer_pref_delivery_date":"2020-06-10"},{"delivery_id":8,"customer_id":7,"order_date":"2020-06-15","customer_pref_delivery_date":"2020-06-15"},{"delivery_id":9,"customer_id":9,"order_date":"2020-06-08","customer_pref_delivery_date":"2020-06-14"},{"delivery_id":10,"customer_id":9,"order_date":"2020-06-10","customer_pref_delivery_date":"2020-06-11"},{"delivery_id":11,"customer_id":1,"order_date":"2020-06-20","customer_pref_delivery_date":"2020-06-20"},{"delivery_id":12,"customer_id":9,"order_date":"2020-06-19","customer_pref_delivery_date":"2020-06-19"},{"delivery_id":13,"customer_id":7,"order_date":"2020-06-05","customer_pref_delivery_date":"2020-06-09"},{"delivery_id":14,"customer_id":9,"order_date":"2020-06-04","customer_pref_delivery_date":"2020-06-07"},{"delivery_id":15,"customer_id":2,"order_date":"2020-06-20","customer_pref_delivery_date":"2020-06-20"},{"delivery_id":16,"customer_id":4,"order_date":"2020-06-08","customer_pref_delivery_date":"2020-06-12"},{"delivery_id":17,"customer_id":6,"order_date":"2020-06-13","customer_pref_delivery_date":"2020-06-17"},{"delivery_id":18,"customer_id":1,"order_date":"2020-06-16","customer_pref_delivery_date":"2020-06-18"},{"delivery_id":19,"customer_id":5,"order_date":"2020-06-17","customer_pref_delivery_date":"2020-06-20"},{"delivery_id":20,"customer_id":4,"order_date":"2020-06-19","customer_pref_delivery_date":"2020-06-19"}]}' }]

export function parseInput(text) {
  const input = parseJsonObject(text)
  requireRows(input, 'deliveries', COLS, 20)
  return input
}

export function buildTrace(input) {
  const deliveries = input.deliveries
  const frames = [frameAt('load', 'FROM Delivery', 'def immediate_percentage', `Load ${deliveries.length} deliveries.`, COLS, deliveries)]
  const flagged = deliveries.map(row => ({ delivery_id: row.delivery_id, is_immediate: row.order_date === row.customer_pref_delivery_date ? 1 : 0 }))
  frames.push(frameAt('compare', 'SUM(CASE WHEN order_date', 'flags = delivery', 'A delivery is immediate when the preferred date equals the order date.', ['delivery_id', 'is_immediate'], flagged))
  const immediate = flagged.reduce((sum, row) => sum + row.is_immediate, 0)
  frames.push(frameAt('count', 'COUNT(*)', 'flags = delivery', `${immediate} of ${flagged.length} deliveries are immediate.`, ['immediate', 'total'], [{ immediate, total: flagged.length }]))
  const share = flagged.length ? Math.round((10000 * immediate) / flagged.length) / 100 : 0
  frames.push(frameAt('percent', 'SELECT ROUND', 'share = round', 'Divide by the total and round to two decimals.', ['immediate_percentage'], [{ immediate_percentage: share }]))
  const result = [{ immediate_percentage: share }]
  frames.push(frameAt('done', 'SELECT ROUND', 'return pd', 'Output immediate_percentage.', ['immediate_percentage'], result))
  return { input, result, frames }
}
