const isInt = (v, lo, hi) => Number.isInteger(v) && v >= lo && v <= hi
const NAME = /^[A-Za-z]{1,12}$/

export const phases = [
  { id: 'start', label: 'Setup', description: 'Work out the window and give each customer a count of 0.' },
  { id: 'scan', label: 'Scan', description: 'Read the next transaction.' },
  { id: 'count', label: 'Count', description: 'The day falls inside the window, so add one to its customer.' },
  { id: 'skip', label: 'Skip', description: 'The day falls outside the window, so it is not counted.' },
  { id: 'check', label: 'Check', description: 'Compare the customer count with the minimum.' },
  { id: 'done', label: 'Result', description: 'Return the loyal customer ids in ascending order.' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with asOf, window, minOrders, customers and transactions.')
  const { asOf, window, minOrders, customers, transactions } = input
  if (!isInt(asOf, 1, 60)) throw new Error('asOf is a whole day from 1 to 60.')
  if (!isInt(window, 1, asOf)) throw new Error('window is a whole number of days from 1 to asOf.')
  if (!isInt(minOrders, 1, 5)) throw new Error('minOrders is a whole number from 1 to 5.')
  if (!Array.isArray(customers) || customers.length < 1 || customers.length > 8) throw new Error('customers is a list of 1 to 8 entries.')
  const ids = new Set()
  for (const c of customers) {
    if (!c || typeof c !== 'object' || !isInt(c.id, 1, 8) || typeof c.name !== 'string' || !NAME.test(c.name)) throw new Error('Each customer has an id from 1 to 8 and a name of 1 to 12 letters.')
    if (ids.has(c.id)) throw new Error('Customer ids must be unique.')
    ids.add(c.id)
  }
  if (!Array.isArray(transactions) || transactions.length > 20) throw new Error('transactions is a list of at most 20 entries.')
  for (const t of transactions) {
    if (!t || typeof t !== 'object' || !ids.has(t.customer) || !isInt(t.day, 1, 60)) throw new Error('Each transaction names a known customer and a day from 1 to 60.')
  }
  return {
    asOf,
    window,
    minOrders,
    customers: customers.map(({ id, name }) => ({ id, name })),
    transactions: transactions.map(({ customer, day }) => ({ customer, day })),
  }
}

export function buildTrace({ asOf, window, minOrders, customers, transactions }) {
  const start = asOf - window + 1
  const counts = new Map(customers.map(c => [c.id, 0]))
  const status = new Map()
  const rows = () => customers.map(c => ({ id: c.id, name: c.name, count: counts.get(c.id), status: status.get(c.id) ?? 'open' }))
  const frames = []
  const push = frame => frames.push({ ...frame, rows: rows() })

  push({ pythonLine: 2, phase: 'start', activeLine: L('set start'), txIndex: -1, message: `The window is days ${start} to ${asOf}, which is ${window} days.` })
  push({ pythonLine: 3, phase: 'start', activeLine: L('give every customer'), txIndex: -1, message: 'Every customer starts with a count of 0.' })

  transactions.forEach((t, i) => {
    push({ pythonLine: 4, phase: 'scan', activeLine: L('for each transaction'), txIndex: i, message: `Read customer ${t.customer} on day ${t.day}.` })
    if (t.day >= start && t.day <= asOf) {
      counts.set(t.customer, counts.get(t.customer) + 1)
      push({ pythonLine: 6, phase: 'count', activeLine: L('add 1 to that'), txIndex: i, message: `Day ${t.day} is inside the window; customer ${t.customer} now has ${counts.get(t.customer)}.` })
    } else {
      push({ pythonLine: 5, phase: 'skip', activeLine: L('if the day is between'), txIndex: i, message: `Day ${t.day} is ${t.day < start ? 'before' : 'after'} the window, so it is not counted.` })
    }
  })

  const loyal = []
  for (const c of customers) {
    const count = counts.get(c.id)
    const ok = count >= minOrders
    status.set(c.id, ok ? 'loyal' : 'short')
    if (ok) loyal.push(c.id)
    push({ pythonLine: 7, phase: 'check', activeLine: L('reaches minOrders'), txIndex: -1, message: `${c.name} has ${count} in the window; ${ok ? 'at least' : 'below'} ${minOrders}, so ${ok ? 'loyal' : 'not loyal'}.` })
  }

  loyal.sort((a, b) => a - b)
  push({ pythonLine: 8, phase: 'done', activeLine: L('return the loyal'), txIndex: -1, message: loyal.length ? `Loyal ids: ${loyal.join(', ')}.` : 'No customer reaches the minimum.' })
  return { input: { asOf, window, minOrders, customers, transactions }, result: loyal, frames }
}

export const sql = `SELECT c.id, c.name
FROM customers AS c
JOIN transactions AS t ON t.customer_id = c.id
WHERE t.day BETWEEN :as_of - :window + 1 AND :as_of
GROUP BY c.id, c.name
HAVING COUNT(*) >= :min_orders
ORDER BY c.id;`

export const code = `loyal means at least minOrders purchases on days inside the window
set start to asOf minus window plus 1
give every customer a count of 0
for each transaction (customer, day)
if the day is between start and asOf then go on
add 1 to that customer's count
a customer whose count reaches minOrders is loyal
return the loyal ids in ascending order`.split('\n').map((text, index) => ({ line: index + 1, text }))

const L = s => {
  const index = code.findIndex(c => c.text.includes(s))
  if (index < 0) throw new Error(`Missing code line: ${s}`)
  return index + 1
}

export const python = `def loyal_customers(customers, transactions, as_of, window, min_orders):
    start = as_of - window + 1
    counts = {cid: 0 for cid, _ in customers}
    for cid, day in transactions:
        if start <= day <= as_of:
            counts[cid] += 1
    loyal = [cid for cid in counts if counts[cid] >= min_orders]
    return sorted(loyal)
`
