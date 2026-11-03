// Teaching rule (not verified against the official statement): golden-hour orders are placed at hour 18 up to but not including 20;
// a customer qualifies with at least 3 golden-hour orders. Output is customer ids in ascending order.
const WINDOW_START = 18
const WINDOW_END = 20
const MIN_ORDERS = 3
const MAX_ROWS = 12

export const phases = [
  { id: 'setup', label: 'Rule', description: 'Fix the hour window and the threshold.' },
  { id: 'scan', label: 'Scan', description: 'Read one order row.' },
  { id: 'count', label: 'Count', description: 'The hour is inside the window, so add one to its customer.' },
  { id: 'skip', label: 'Skip', description: 'The hour is outside the window.' },
  { id: 'check', label: 'Check', description: 'Compare a customer total with the threshold.' },
  { id: 'keep', label: 'Keep', description: 'This customer reaches the threshold.' },
  { id: 'done', label: 'Result', description: 'Customers are listed in ascending order.' },
]

export const sql = `SELECT customer_id
FROM orders
WHERE hour_of_day >= 18 AND hour_of_day < 20
GROUP BY customer_id
HAVING COUNT(*) >= 3
ORDER BY customer_id;`

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with an orders list.')
  const { orders } = input
  if (!Array.isArray(orders) || orders.length > MAX_ROWS) throw new Error(`orders is a list of at most ${MAX_ROWS} rows.`)
  for (const row of orders) {
    if (!Array.isArray(row) || row.length !== 3) throw new Error('Each row is [order_id, customer_id, hour_of_day].')
    const [orderId, customerId, hour] = row
    if (!Number.isInteger(orderId) || orderId < 1) throw new Error('order_id is a positive integer.')
    if (!Number.isInteger(customerId) || customerId < 1 || customerId > 50) throw new Error('customer_id is an integer from 1 to 50.')
    if (!Number.isInteger(hour) || hour < 0 || hour > 23) throw new Error('hour_of_day is an integer from 0 to 23.')
  }
  return { orders }
}

export function buildTrace({ orders }) {
  const frames = []
  const counts = {}
  const snapshot = () => ({ ...counts })
  const rowOf = (order_id, customer_id, hour_of_day, inWindow) => ({ order_id, customer_id, hour_of_day, inWindow })
  frames.push({ pythonLine: P('counts = {}'), phase: 'setup', activeLine: L('fix the window'), row: rowOf(null, null, null, null), counts: snapshot(),
    message: `Golden hour means hour ${WINDOW_START} up to ${WINDOW_END}; a customer needs at least ${MIN_ORDERS} such orders.` })
  for (const [order_id, customer_id, hour_of_day] of orders) {
    const inWindow = hour_of_day >= WINDOW_START && hour_of_day < WINDOW_END
    frames.push({ pythonLine: P('for order_id, customer_id, hour in orders'), phase: 'scan', activeLine: L('for each order row'),
      row: rowOf(order_id, customer_id, hour_of_day, inWindow), counts: snapshot(),
      message: `Order ${order_id} for customer ${customer_id} is at hour ${hour_of_day}.` })
    if (inWindow) {
      counts[customer_id] = (counts[customer_id] || 0) + 1
      frames.push({ pythonLine: P('counts[customer_id] = counts.get'), phase: 'count', activeLine: L('if the hour is inside'),
        row: rowOf(order_id, customer_id, hour_of_day, true), counts: snapshot(),
        message: `Hour ${hour_of_day} is inside the window; customer ${customer_id} now has ${counts[customer_id]}.` })
    } else {
      frames.push({ pythonLine: P('if 18 <= hour < 20'), phase: 'skip', activeLine: L('if the hour is inside'),
        row: rowOf(order_id, customer_id, hour_of_day, false), counts: snapshot(),
        message: `Hour ${hour_of_day} is outside the window, so this order is ignored.` })
    }
  }
  const result = []
  for (const customer_id of Object.keys(counts).map(Number).sort((a, b) => a - b)) {
    const total = counts[customer_id]
    const qualifies = total >= MIN_ORDERS
    frames.push({ pythonLine: P('if counts[customer_id] >= 3'), phase: 'check', activeLine: L('for each customer'),
      row: { customer_id, orders: total, qualifies }, counts: snapshot(),
      message: `Customer ${customer_id} has ${total} golden-hour order${total === 1 ? '' : 's'}; the threshold is ${MIN_ORDERS}.` })
    if (qualifies) {
      result.push(customer_id)
      frames.push({ pythonLine: P('result.append(customer_id)'), phase: 'keep', activeLine: L('if the count is at least'),
        row: { customer_id, orders: total, qualifies }, counts: snapshot(), message: `Customer ${customer_id} is kept.` })
    }
  }
  frames.push({ pythonLine: P('return result'), phase: 'done', activeLine: L('return the kept'),
    row: { customer_id: null, orders: null, qualifies: null }, counts: snapshot(),
    message: result.length ? `Customers ${result.join(', ')} qualify.` : 'No customer reaches the threshold.' })
  return { input: { orders }, result, frames }
}

export const code = `find golden hour customers from order rows
  fix the window as hour 18 up to 20 and the threshold as 3
  start an empty count for each customer
  for each order row (order_id, customer_id, hour)
    if the hour is inside the window then add one to that customer
  for each customer in ascending order
    if the count is at least 3 then keep the customer
  return the kept customers`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => {
  const index = code.findIndex(c => c.text.includes(s))
  if (index < 0) throw new Error(`Missing code text: ${s}`)
  return index + 1
}

export const python = `def golden_hour_customers(orders):
    counts = {}
    for order_id, customer_id, hour in orders:
        if 18 <= hour < 20:
            counts[customer_id] = counts.get(customer_id, 0) + 1
    result = []
    for customer_id in sorted(counts):
        if counts[customer_id] >= 3:
            result.append(customer_id)
    return result
`
const PY_LINES = python.split('\n')
const P = s => {
  const index = PY_LINES.findIndex(line => line.includes(s))
  if (index < 0) throw new Error(`Missing python text: ${s}`)
  return index + 1
}
