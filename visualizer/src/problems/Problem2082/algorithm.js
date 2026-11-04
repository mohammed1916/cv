// SQL walkthrough. The sample tables are invented for this visualization.
export const sql = `SELECT COUNT(DISTINCT customer_id) AS rich_count
FROM Store
WHERE amount > 500`

export const code = sql.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def rich_customers(store):
    big = store[store.amount > 500]
    customers = big.customer_id.drop_duplicates()
    return pd.DataFrame({"rich_count": [customers.size]})`

export const sampleText = '{"Store":[{"bill_id":1,"customer_id":10,"amount":200},{"bill_id":2,"customer_id":10,"amount":400},{"bill_id":3,"customer_id":10,"amount":350},{"bill_id":4,"customer_id":20,"amount":600},{"bill_id":5,"customer_id":30,"amount":501},{"bill_id":6,"customer_id":30,"amount":501},{"bill_id":7,"customer_id":40,"amount":500},{"bill_id":8,"customer_id":20,"amount":120}]}'

const SQL = key => {
  const index = code.findIndex(line => line.text.includes(key))
  if (index < 0) throw new Error(`Missing SQL line: ${key}`)
  return index + 1
}
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
  { id: 'load', label: 'Load', description: 'Read the bills.' },
  { id: 'filter', label: 'Filter', description: 'Check each single bill against 500.' },
  { id: 'distinct', label: 'Distinct', description: 'Count each customer once, however many large bills they have.' },
  { id: 'done', label: 'Result', description: 'Return the number of distinct customers.' },
]

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
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with a Store table.')
  return { Store: tableRows(input, 'Store', ['bill_id', 'customer_id', 'amount']) }
}

export function buildTrace(input) {
  const { Store } = input
  const frames = []
  frames.push(frame('load', 'FROM Store', 'def ', 'Read every bill. A customer can have several bills.', ['bill_id', 'customer_id', 'amount'], Store))

  const checked = Store.map(row => ({ bill_id: row.bill_id, customer_id: row.customer_id, amount: row.amount, over_500: row.amount > 500 ? 'yes' : 'no' }))
  frames.push(frame('filter', 'WHERE amount', 'big = ', 'Only single bills above 500 pass. Summing a customer\'s smaller bills does not count.', ['bill_id', 'customer_id', 'amount', 'over_500'], checked))

  const rich = []
  for (const row of Store.filter(bill => bill.amount > 500)) {
    if (!rich.includes(row.customer_id)) rich.push(row.customer_id)
    frames.push(frame('distinct', 'COUNT(DISTINCT customer_id)', 'customers = ', `Customer ${row.customer_id} has bill ${row.bill_id} above 500. Distinct customers so far: ${rich.length}.`, ['customer_id'], rich.map(customer_id => ({ customer_id }))))
  }

  const result = [{ rich_count: rich.length }]
  frames.push(frame('done', 'SELECT COUNT', 'return', `Return rich_count = ${rich.length}.`, ['rich_count'], result))
  return { input, result, frames }
}
