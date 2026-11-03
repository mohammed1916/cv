// Knowledge-derived SQL lesson. The sample tables are invented for this visualization.
export const sql = `select date_format(o.order_date, '%Y-%m') as month,
       count(distinct o.order_id) as order_count,
       count(distinct o.customer_id) as customer_count
from Orders o
where o.invoice > 20
group by month
order by month`
export const code = sql.split('\n').map((text, index) => ({ line: index + 1, text }))
export const python = `def monthly_reach(orders):
    kept = orders[orders['invoice'] > 20].copy()
    kept['month'] = kept['order_date'].str[:7]
    grouped = kept.groupby('month').agg(order_count=('order_id', 'nunique'), customer_count=('customer_id', 'nunique'))
    return grouped.reset_index().sort_values('month')`
export const phases = [
  { id: 'load', label: 'Load', description: 'Read the Orders rows.' },
  { id: 'filter', label: 'Invoice', description: 'Keep only invoices strictly above 20.' },
  { id: 'month', label: 'Month', description: 'Label each kept order with its month.' },
  { id: 'group', label: 'Count', description: 'Count distinct orders and customers per month.' },
  { id: 'order', label: 'Order', description: 'Sort the months ascending.' },
  { id: 'done', label: 'Result', description: 'Report one row per month.' },
]

const sqlLine = text => {
  const hit = code.find(c => c.text.includes(text))
  if (!hit) throw new Error(`No SQL line contains "${text}".`)
  return hit.line
}
const pyLine = text => {
  const index = python.split('\n').findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`No Python line contains "${text}".`)
  return index + 1
}
const frame = (phase, sqlText, pyText, rows, output, message) => ({
  phase, activeLine: sqlLine(sqlText), pythonLine: pyLine(pyText),
  rows: rows.map(row => ({ ...row })), output: output.map(row => ({ ...row })), message,
})

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with an orders list.')
  if (!Array.isArray(input.orders) || input.orders.length > 12) throw new Error('orders is a list of at most 12 rows.')
  for (const o of input.orders) {
    if (typeof o.order_id !== 'number' || typeof o.customer_id !== 'number' || typeof o.invoice !== 'number'
      || typeof o.order_date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(o.order_date)) {
      throw new Error('Each order has order_id, order_date (YYYY-MM-DD), customer_id and a numeric invoice.')
    }
  }
  return input
}

export function buildTrace(input) {
  const frames = []
  const orders = input.orders.map(o => ({ ...o }))
  frames.push(frame('load', 'from Orders o', 'def monthly_reach', orders, [], `Read ${orders.length} orders.`))
  const kept = orders.filter(o => o.invoice > 20)
  frames.push(frame('filter', 'where o.invoice > 20', "kept = orders[", kept, [], `${kept.length} orders have an invoice above 20.`))
  const labelled = kept.map(o => ({ order_id: o.order_id, customer_id: o.customer_id, month: o.order_date.slice(0, 7) }))
  frames.push(frame('month', "date_format(o.order_date", "kept['month']", labelled, [], 'Each kept order is labelled with its YYYY-MM.'))
  const groups = new Map()
  for (const row of labelled) {
    const group = groups.get(row.month) ?? { month: row.month, orders: new Set(), customers: new Set() }
    group.orders.add(row.order_id)
    group.customers.add(row.customer_id)
    groups.set(row.month, group)
  }
  const counted = [...groups.values()].map(g => ({ month: g.month, order_count: g.orders.size, customer_count: g.customers.size }))
  frames.push(frame('group', 'count(distinct o.order_id)', "groupby('month')", counted, [], `Counted ${counted.length} months.`))
  const ordered = [...counted].sort((a, b) => (a.month < b.month ? -1 : a.month > b.month ? 1 : 0))
  frames.push(frame('order', 'order by month', "sort_values('month')", ordered, [], 'Sort months ascending.'))
  const result = ordered.map(row => ({ ...row }))
  frames.push(frame('done', 'select date_format', 'return grouped', result, result, `Returned ${result.length} months.`))
  return { input, result, frames }
}
