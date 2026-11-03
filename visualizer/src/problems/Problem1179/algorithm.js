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

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const MONTH_COLS = MONTHS.map(month => `${month}_Revenue`)
export const sql = ['SELECT id,',
  ...MONTHS.map((month, index) => `  MAX(CASE WHEN month = '${month}' THEN revenue END) AS ${month}_Revenue${index < MONTHS.length - 1 ? ',' : ''}`),
  'FROM Department',
  'GROUP BY id',
  'ORDER BY id'].join('\n')
const sqlLines = sql.split('\n')
export const code = sqlLines.map((text, index) => ({ line: index + 1, text }))
export const python = `import pandas as pd

MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

def reformat_department(department):
    wide = department.pivot(index="id", columns="month", values="revenue")
    wide = wide.reindex(columns=MONTHS)
    wide.columns = [m + "_Revenue" for m in MONTHS]
    return wide.reset_index().sort_values("id")`
const pyLines = python.split('\n')
const L = text => lineOf(sqlLines, text)
const P = text => lineOf(pyLines, text)
const frameAt = (phase, sqlText, pyText, message, columns, rows) => ({ phase, activeLine: L(sqlText), pythonLine: P(pyText), message, columns, rows: snap(rows) })

export const phases = [
  { id: 'load', label: 'Load', description: 'Read the department rows.' },
  { id: 'pivot', label: 'Pivot', description: 'Place each month’s revenue in its own column.' },
  { id: 'order', label: 'Order', description: 'Sort by department id.' },
  { id: 'done', label: 'Result', description: 'Output one row per department.' },
]
export const inputLabel = 'JSON object with a department table of monthly revenue'
export const complexity = 'Linear in the rows, with a fixed 12 columns per department.'
const COLS = ['id', 'revenue', 'month']
const SAMPLE = { department: [
  { id: 1, revenue: 4100, month: 'Jan' },
  { id: 1, revenue: 3800, month: 'Feb' },
  { id: 1, revenue: 6200, month: 'Mar' },
  { id: 2, revenue: 2700, month: 'Jan' },
  { id: 2, revenue: 5100, month: 'Dec' },
  { id: 3, revenue: 9300, month: 'Feb' },
] }
export const examples = [{ label: 'Teaching sample', input: JSON.stringify(SAMPLE) }]

export function parseInput(text) {
  const input = parseJsonObject(text)
  const rows = requireRows(input, 'department', COLS, 60)
  const seen = new Set()
  rows.forEach((row, index) => {
    if (!MONTHS.includes(row.month)) throw new Error(`department row ${index + 1} has an unknown month.`)
    const key = `${row.id}|${row.month}`
    if (seen.has(key)) throw new Error(`department id ${row.id} has two ${row.month} rows.`)
    seen.add(key)
  })
  return input
}

export function buildTrace(input) {
  const department = input.department
  const frames = [frameAt('load', 'FROM Department', 'def reformat_department', `Load ${department.length} monthly rows.`, COLS, department)]
  const ids = [...new Set(department.map(row => row.id))].sort((a, b) => a - b)
  const wide = ids.map(id => {
    const row = { id }
    for (const month of MONTHS) {
      const hit = department.find(entry => entry.id === id && entry.month === month)
      row[`${month}_Revenue`] = hit ? hit.revenue : null
    }
    return row
  })
  frames.push(frameAt('pivot', 'MAX(CASE WHEN month', 'wide = department.pivot', `Build ${wide.length} rows; missing months are NULL.`, ['id', ...MONTH_COLS], wide))
  const result = [...wide].sort((a, b) => a.id - b.id)
  frames.push(frameAt('order', 'ORDER BY id', 'sort_values("id")', 'Sort by department id.', ['id', ...MONTH_COLS], result))
  frames.push(frameAt('done', 'SELECT id,', 'return wide', 'Output one row per department.', ['id', ...MONTH_COLS], result))
  return { input, result, frames }
}
