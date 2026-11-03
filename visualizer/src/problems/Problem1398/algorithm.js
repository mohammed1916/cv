// Knowledge-derived teaching model. Sample tables and wording are original.
const lineIn = (source, text) => {
  const index = source.split('\n').findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`No line contains: ${text}`)
  return index + 1
}

export const phases = [
  { id: 'load', label: 'Orders', description: 'Start from the order rows.' },
  { id: 'scan', label: 'Scan', description: 'Record which products each customer has bought.' },
  { id: 'filter', label: 'Filter', description: 'Qualify: bought A, bought B, never bought C.' },
  { id: 'join', label: 'Name', description: 'Attach the customer names to the qualifying ids.' },
  { id: 'order', label: 'Order', description: 'Sort by customer id.' },
  { id: 'done', label: 'Result', description: 'Return customer_id and customer_name.' },
]

export const sql = `
SELECT c.customer_id, c.customer_name
FROM Customers c
JOIN Orders o ON o.customer_id = c.customer_id
GROUP BY c.customer_id, c.customer_name
HAVING SUM(o.product_name = 'A') > 0
  AND SUM(o.product_name = 'B') > 0
  AND SUM(o.product_name = 'C') = 0
ORDER BY c.customer_id`.trim()

export const code = sql.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `
def a_and_b_not_c(customers, orders):
    bought = orders.groupby('customer_id').product_name.agg(set)
    ok = bought.apply(lambda s: {'A', 'B'} <= s and 'C' not in s)
    keep = customers[customers.customer_id.isin(ok[ok].index)]
    return keep[['customer_id', 'customer_name']].sort_values('customer_id')`.trim()

const S = text => lineIn(sql, text)
const P = text => lineIn(python, text)
const frame = (phase, sqlText, pyText, message, caption, rows) => ({
  phase, activeLine: S(sqlText), pythonLine: P(pyText), message, caption, rows: rows.map(row => ({ ...row })),
})

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || !Array.isArray(input.Customers) || !Array.isArray(input.Orders)) throw new Error('Use an object with Customers and Orders lists.')
  const { Customers, Orders } = input
  if (Customers.length < 1 || Customers.length > 8 || Orders.length > 12) throw new Error('Keep up to 8 customers and 12 orders.')
  const ids = new Set()
  for (const row of Customers) {
    if (!Number.isInteger(row.customer_id) || ids.has(row.customer_id) || typeof row.customer_name !== 'string') {
      throw new Error('Each customer needs a unique integer id and a name.')
    }
    ids.add(row.customer_id)
  }
  const orderIds = new Set()
  for (const row of Orders) {
    if (!Number.isInteger(row.order_id) || orderIds.has(row.order_id)) throw new Error('order_id must be a unique integer.')
    if (!ids.has(row.customer_id)) throw new Error('Each order must name an existing customer_id.')
    if (typeof row.product_name !== 'string' || !/^[A-Za-z]{1,10}$/.test(row.product_name)) throw new Error('product_name is a short word of letters.')
    orderIds.add(row.order_id)
  }
  return input
}

export function buildTrace(input) {
  const { Customers, Orders } = input
  const names = new Map(Customers.map(row => [row.customer_id, row.customer_name]))
  const frames = []
  frames.push(frame('load', 'FROM Customers c', 'def a_and_b_not_c',
    `Start with ${Orders.length} orders. A product repeated by one customer does not change the answer.`, 'Orders', Orders))

  const flags = new Map()
  const flagRows = () => [...flags.values()].map(entry => ({ customer_id: entry.customer_id, A: entry.A, B: entry.B, C: entry.C }))
  for (const order of Orders) {
    const entry = flags.get(order.customer_id) || { customer_id: order.customer_id, A: 'no', B: 'no', C: 'no' }
    if (order.product_name === 'A' || order.product_name === 'B' || order.product_name === 'C') entry[order.product_name] = 'yes'
    flags.set(order.customer_id, entry)
    frames.push(frame('scan', 'JOIN Orders', 'bought = ',
      `Order ${order.order_id} by customer ${order.customer_id} records ${order.product_name}.`, 'Products bought so far', flagRows()))
  }

  const qualifies = [...flags.values()].map(entry => ({ ...entry, qualifies: entry.A === 'yes' && entry.B === 'yes' && entry.C === 'no' ? 'yes' : 'no' }))
  frames.push(frame('filter', 'HAVING', 'ok = ',
    'Each customer is checked against the three HAVING conditions.', 'Qualification check', qualifies))

  const kept = qualifies.filter(row => row.qualifies === 'yes')
  const named = kept.map(row => ({ customer_id: row.customer_id, customer_name: names.get(row.customer_id) }))
  frames.push(frame('join', 'FROM Customers c', 'keep = ', 'Look up the names of the qualifying customers.', 'Qualifying customers', named))

  const sorted = [...named].sort((a, b) => a.customer_id - b.customer_id)
  frames.push(frame('order', 'ORDER BY c.customer_id', 'sort_values', 'Sort by customer id.', 'Sorted rows', sorted))
  frames.push(frame('done', 'SELECT c.customer_id', 'return keep', 'The output has customer_id and customer_name.', 'Result', sorted))
  return { input, result: sorted, frames }
}
