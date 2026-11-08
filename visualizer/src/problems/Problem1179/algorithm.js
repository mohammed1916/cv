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
export const examples = [{ label: 'Teaching sample', input: JSON.stringify(SAMPLE) }, { label: 'Single month', input: '{"department":[{"id":1,"revenue":100,"month":"Jan"}]}' }, { label: 'Full year for one department', input: '{"department":[{"id":2,"revenue":100,"month":"Jan"},{"id":2,"revenue":200,"month":"Feb"},{"id":2,"revenue":300,"month":"Mar"},{"id":2,"revenue":400,"month":"Apr"},{"id":2,"revenue":500,"month":"May"},{"id":2,"revenue":600,"month":"Jun"},{"id":2,"revenue":700,"month":"Jul"},{"id":2,"revenue":800,"month":"Aug"},{"id":2,"revenue":900,"month":"Sep"},{"id":2,"revenue":1000,"month":"Oct"},{"id":2,"revenue":1100,"month":"Nov"},{"id":2,"revenue":1200,"month":"Dec"}]}' }, { label: 'Gaps are empty months', input: '{"department":[{"id":3,"revenue":400,"month":"Dec"},{"id":4,"revenue":150,"month":"Jun"},{"id":4,"revenue":250,"month":"Jul"}]}' }, { label: 'Long run: 60 monthly rows', input: '{"department":[{"id":1,"revenue":1427,"month":"Jan"},{"id":1,"revenue":2720,"month":"Feb"},{"id":1,"revenue":8988,"month":"Mar"},{"id":1,"revenue":5212,"month":"Apr"},{"id":1,"revenue":7925,"month":"May"},{"id":1,"revenue":4645,"month":"Jun"},{"id":1,"revenue":6738,"month":"Jul"},{"id":1,"revenue":1278,"month":"Aug"},{"id":1,"revenue":2532,"month":"Sep"},{"id":1,"revenue":4084,"month":"Oct"},{"id":1,"revenue":3083,"month":"Nov"},{"id":1,"revenue":1397,"month":"Dec"},{"id":2,"revenue":7473,"month":"Jan"},{"id":2,"revenue":9679,"month":"Feb"},{"id":2,"revenue":5735,"month":"Mar"},{"id":2,"revenue":8519,"month":"Apr"},{"id":2,"revenue":3483,"month":"May"},{"id":2,"revenue":1953,"month":"Jun"},{"id":2,"revenue":6644,"month":"Jul"},{"id":2,"revenue":7743,"month":"Aug"},{"id":2,"revenue":8285,"month":"Sep"},{"id":2,"revenue":5751,"month":"Oct"},{"id":2,"revenue":3820,"month":"Nov"},{"id":2,"revenue":5336,"month":"Dec"},{"id":3,"revenue":2061,"month":"Jan"},{"id":3,"revenue":9615,"month":"Feb"},{"id":3,"revenue":8445,"month":"Mar"},{"id":3,"revenue":5029,"month":"Apr"},{"id":3,"revenue":1897,"month":"May"},{"id":3,"revenue":1879,"month":"Jun"},{"id":3,"revenue":2017,"month":"Jul"},{"id":3,"revenue":3106,"month":"Aug"},{"id":3,"revenue":4817,"month":"Sep"},{"id":3,"revenue":4777,"month":"Oct"},{"id":3,"revenue":8989,"month":"Nov"},{"id":3,"revenue":9623,"month":"Dec"},{"id":4,"revenue":7730,"month":"Jan"},{"id":4,"revenue":6043,"month":"Feb"},{"id":4,"revenue":7819,"month":"Mar"},{"id":4,"revenue":6287,"month":"Apr"},{"id":4,"revenue":8841,"month":"May"},{"id":4,"revenue":7347,"month":"Jun"},{"id":4,"revenue":2043,"month":"Jul"},{"id":4,"revenue":5033,"month":"Aug"},{"id":4,"revenue":7476,"month":"Sep"},{"id":4,"revenue":5732,"month":"Oct"},{"id":4,"revenue":1221,"month":"Nov"},{"id":4,"revenue":8223,"month":"Dec"},{"id":5,"revenue":4849,"month":"Jan"},{"id":5,"revenue":6812,"month":"Feb"},{"id":5,"revenue":5442,"month":"Mar"},{"id":5,"revenue":4736,"month":"Apr"},{"id":5,"revenue":9436,"month":"May"},{"id":5,"revenue":6889,"month":"Jun"},{"id":5,"revenue":473,"month":"Jul"},{"id":5,"revenue":4763,"month":"Aug"},{"id":5,"revenue":7952,"month":"Sep"},{"id":5,"revenue":6306,"month":"Oct"},{"id":5,"revenue":4973,"month":"Nov"},{"id":5,"revenue":9689,"month":"Dec"}]}' }]

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
