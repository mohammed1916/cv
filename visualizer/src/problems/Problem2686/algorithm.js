// Knowledge-derived SQL walkthrough. The sample table is invented for this visualization.
export const sql = `SELECT order_date,
       ROUND(100.0 * SUM(CASE WHEN order_date = customer_pref_delivery_date THEN 1 ELSE 0 END) / COUNT(*), 2) AS immediate_percentage
FROM Delivery
GROUP BY order_date
ORDER BY order_date`

export const code = sql.split('\n').map((text, index) => ({ line: index + 1, text }))
const SQL = key => {
  const index = code.findIndex(line => line.text.includes(key))
  if (index < 0) throw new Error(`Missing SQL line: ${key}`)
  return index + 1
}

export const python = `def immediate_percentage(delivery):
    totals = {}
    immediate = {}
    for row in delivery:
        day = row["order_date"]
        totals[day] = totals.get(day, 0) + 1
        if row["order_date"] == row["customer_pref_delivery_date"]:
            immediate[day] = immediate.get(day, 0) + 1
    out = []
    for day in sorted(totals):
        pct = round(100 * immediate.get(day, 0) / totals[day], 2)
        out.append({"order_date": day, "immediate_percentage": pct})
    return out`
const PY_LINES = python.split('\n')
const PY = key => {
  const index = PY_LINES.findIndex(line => line.includes(key))
  if (index < 0) throw new Error(`Missing Python line: ${key}`)
  return index + 1
}

const COLS = ['delivery_id', 'customer_id', 'order_date', 'customer_pref_delivery_date']
const GROUP_COLS = ['order_date', 'total', 'immediate', 'immediate_percentage']
const RESULT_COLS = ['order_date', 'immediate_percentage']

const frame = (phase, sqlKey, pyKey, message, columns, rows) => ({
  phase, activeLine: SQL(sqlKey), pythonLine: PY(pyKey), message, columns, rows: rows.map(row => ({ ...row })),
})

export const phases = [
  { id: 'load', label: 'Load', description: 'Read the delivery records.' },
  { id: 'group', label: 'Group', description: 'Count the orders and immediate orders for each date.' },
  { id: 'done', label: 'Result', description: 'Output one percentage for each order date.' },
]

function tableRows(input, name, columns) {
  const rows = input[name]
  if (!Array.isArray(rows) || rows.length < 1 || rows.length > 12) throw new Error(`${name} needs 1 to 12 rows.`)
  for (const row of rows) {
    if (!row || typeof row !== 'object' || columns.some(column => !(column in row))) throw new Error(`${name} rows need ${columns.join(', ')}.`)
  }
  return rows.map(row => Object.fromEntries(columns.map(column => [column, row[column]])))
}

const DATE = /^\d{4}-\d{2}-\d{2}$/

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with a Delivery table.')
  const rows = tableRows(input, 'Delivery', COLS)
  for (const row of rows) {
    if (!DATE.test(row.order_date) || !DATE.test(row.customer_pref_delivery_date)) throw new Error('Dates use YYYY-MM-DD.')
  }
  return { Delivery: rows }
}

export function buildTrace(input) {
  const rows = input.Delivery
  const frames = [frame('load', 'FROM Delivery', 'def ', 'Read the delivery records.', COLS, rows)]
  const groups = new Map()
  for (const row of rows) {
    if (!groups.has(row.order_date)) groups.set(row.order_date, { order_date: row.order_date, total: 0, immediate: 0 })
    const group = groups.get(row.order_date)
    group.total += 1
    if (row.order_date === row.customer_pref_delivery_date) group.immediate += 1
  }
  const dates = [...groups.values()].sort((a, b) => (a.order_date < b.order_date ? -1 : a.order_date > b.order_date ? 1 : 0))
  const summary = []
  for (const group of dates) {
    const immediate_percentage = Math.round((group.immediate * 10000) / group.total) / 100
    summary.push({ order_date: group.order_date, total: group.total, immediate: group.immediate, immediate_percentage })
    frames.push(frame('group', 'SUM(CASE', 'pct = round', `${group.order_date}: ${group.immediate} of ${group.total} orders are immediate, which is ${immediate_percentage}%.`, GROUP_COLS, summary))
  }
  const result = summary.map(({ order_date, immediate_percentage }) => ({ order_date, immediate_percentage }))
  frames.push(frame('done', 'ORDER BY order_date', 'return out', `Return ${result.length} date rows.`, RESULT_COLS, result))
  return { input, result, frames }
}
