export const sql = `with recursive numbers as (
  select 1 as id
  union all
  select id + 1 from numbers where id < (select max(customer_id) from Customers)
)
select n.id as ids
from numbers n
left join Customers c on c.customer_id = n.id
where c.customer_id is null
order by ids`
export const code = sql.split('\n').map((text, index) => ({ line: index + 1, text }))
export const python = `def missing_ids(customers):
    limit = customers['customer_id'].max()
    numbers = pd.DataFrame({'id': range(1, limit + 1)})
    merged = numbers.merge(customers, left_on='id', right_on='customer_id', how='left')
    missing = merged[merged['customer_id'].isna()]
    return missing[['id']].rename(columns={'id': 'ids'}).sort_values('ids')`
export const phases = [
  { id: 'load', label: 'Load', description: 'Read the Customers ids.' },
  { id: 'bound', label: 'Bound', description: 'Find the largest customer id.' },
  { id: 'generate', label: 'Generate', description: 'Count from 1 up to that bound.' },
  { id: 'join', label: 'Match', description: 'Check each number against Customers.' },
  { id: 'filter', label: 'Missing', description: 'Keep numbers with no customer.' },
  { id: 'order', label: 'Order', description: 'Sort the missing ids ascending.' },
  { id: 'done', label: 'Result', description: 'Report the missing ids.' },
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
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with a customers list.')
  if (!Array.isArray(input.customers) || input.customers.length < 1 || input.customers.length > 12) throw new Error('customers is a list of 1 to 12 rows.')
  const seen = new Set()
  for (const c of input.customers) {
    if (!Number.isInteger(c.customer_id) || c.customer_id < 1 || c.customer_id > 60 || seen.has(c.customer_id)) {
      throw new Error('Each customer_id is a distinct whole number from 1 to 60.')
    }
    seen.add(c.customer_id)
  }
  return input
}

export function buildTrace(input) {
  const frames = []
  const customers = input.customers.map(c => ({ customer_id: c.customer_id, customer_name: c.customer_name ?? '' }))
  frames.push(frame('load', 'from Customers', 'def missing_ids', customers, [], `Read ${customers.length} customer ids.`))
  const limit = Math.max(...customers.map(c => c.customer_id))
  frames.push(frame('bound', 'select max(customer_id)', "limit = customers", [{ limit }], [], `The largest customer id is ${limit}.`))
  const numbers = Array.from({ length: limit }, (_, i) => ({ id: i + 1 }))
  frames.push(frame('generate', 'union all', "numbers = pd.DataFrame", numbers, [], `Generate the numbers 1 to ${limit}.`))
  const present = new Set(customers.map(c => c.customer_id))
  const matched = numbers.map(n => ({ id: n.id, has_customer: present.has(n.id) }))
  frames.push(frame('join', 'left join Customers', "merge(customers", matched, [], 'Mark which numbers appear in Customers.'))
  const missing = matched.filter(m => !m.has_customer).map(m => ({ id: m.id }))
  frames.push(frame('filter', 'where c.customer_id is null', "missing = merged", missing, [], `${missing.length} numbers are missing.`))
  const ordered = [...missing].sort((a, b) => a.id - b.id)
  frames.push(frame('order', 'order by ids', "sort_values('ids')", ordered, [], 'Sort ascending.'))
  const result = ordered.map(m => ({ ids: m.id }))
  frames.push(frame('done', 'select n.id', 'return missing', result, result, `Returned ${result.length} ids.`))
  return { input, result, frames }
}
