export const sql = `select v.customer_id, count(*) as count_no_trans
from Visits v
left join Transactions t on t.visit_id = v.visit_id
where t.transaction_id is null
group by v.customer_id
order by v.customer_id`
export const code = sql.split('\n').map((text, index) => ({ line: index + 1, text }))
export const python = `def silent_visits(visits, transactions):
    has_trans = transactions[['visit_id']].drop_duplicates()
    merged = visits.merge(has_trans, on='visit_id', how='left', indicator=True)
    empty = merged[merged['_merge'] == 'left_only']
    grouped = empty.groupby('customer_id').size().reset_index(name='count_no_trans')
    return grouped.sort_values('customer_id')`
export const phases = [
  { id: 'load', label: 'Load', description: 'Read the Visits rows.' },
  { id: 'join', label: 'Match', description: 'Mark the visits that have at least one transaction.' },
  { id: 'filter', label: 'Silent', description: 'Keep visits with no transaction row.' },
  { id: 'group', label: 'Count', description: 'Count the silent visits for each customer.' },
  { id: 'order', label: 'Order', description: 'Sort by customer id.' },
  { id: 'done', label: 'Result', description: 'Report one row per customer with silent visits.' },
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
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with visits and transactions lists.')
  if (!Array.isArray(input.visits) || input.visits.length > 12) throw new Error('visits is a list of at most 12 rows.')
  if (!Array.isArray(input.transactions) || input.transactions.length > 12) throw new Error('transactions is a list of at most 12 rows.')
  for (const v of input.visits) {
    if (typeof v.visit_id !== 'number' || typeof v.customer_id !== 'number') throw new Error('Each visit has visit_id and customer_id.')
  }
  for (const t of input.transactions) {
    if (typeof t.transaction_id !== 'number' || typeof t.visit_id !== 'number') throw new Error('Each transaction has transaction_id and visit_id.')
  }
  return input
}

export function buildTrace(input) {
  const frames = []
  const visits = input.visits.map(v => ({ ...v }))
  frames.push(frame('load', 'from Visits v', 'def silent_visits', visits, [], `Read ${visits.length} visits.`))
  const transactionCount = new Map()
  for (const t of input.transactions) transactionCount.set(t.visit_id, (transactionCount.get(t.visit_id) ?? 0) + 1)
  const matched = visits.map(v => ({ visit_id: v.visit_id, customer_id: v.customer_id, transactions: transactionCount.get(v.visit_id) ?? 0 }))
  frames.push(frame('join', 'left join Transactions', "how='left'", matched, [], 'Count the transactions attached to each visit.'))
  const silent = matched.filter(v => v.transactions === 0)
  frames.push(frame('filter', 'where t.transaction_id is null', "empty = merged", silent, [], `${silent.length} visits have no transaction.`))
  const sums = new Map()
  for (const v of silent) sums.set(v.customer_id, (sums.get(v.customer_id) ?? 0) + 1)
  const grouped = [...sums.entries()].map(([customer_id, count]) => ({ customer_id, count_no_trans: count }))
  frames.push(frame('group', 'group by v.customer_id', "groupby('customer_id')", grouped, [], 'Count silent visits per customer.'))
  const ordered = [...grouped].sort((a, b) => a.customer_id - b.customer_id)
  frames.push(frame('order', 'order by v.customer_id', "sort_values('customer_id')", ordered, [], 'Sort by customer id.'))
  const result = ordered.map(row => ({ ...row }))
  frames.push(frame('done', 'select v.customer_id', 'return grouped', result, result, `Returned ${result.length} customers.`))
  return { input, result, frames }
}
