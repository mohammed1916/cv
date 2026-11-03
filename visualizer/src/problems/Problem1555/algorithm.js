// Knowledge-derived SQL lesson. The sample tables are invented for this visualization.
export const sql = `select u.user_id, u.user_name,
       u.credit - coalesce(out.paid, 0) + coalesce(inn.received, 0) as credit,
       case when u.credit - coalesce(out.paid, 0) + coalesce(inn.received, 0) < 0 then 'Yes' else 'No' end as credit_limit_breached
from Users u
left join (select paid_by as user_id, sum(amount) as paid from Transactions group by paid_by) out on out.user_id = u.user_id
left join (select paid_to as user_id, sum(amount) as received from Transactions group by paid_to) inn on inn.user_id = u.user_id
order by u.user_id`
export const code = sql.split('\n').map((text, index) => ({ line: index + 1, text }))
export const python = `def account_summary(users, transactions):
    paid = transactions.groupby('paid_by')['amount'].sum()
    received = transactions.groupby('paid_to')['amount'].sum()
    out = users.copy()
    out['credit'] = out['credit'] - out['user_id'].map(paid).fillna(0) + out['user_id'].map(received).fillna(0)
    out['credit_limit_breached'] = np.where(out['credit'] < 0, 'Yes', 'No')
    return out[['user_id', 'user_name', 'credit', 'credit_limit_breached']].sort_values('user_id')`
export const phases = [
  { id: 'load', label: 'Load', description: 'Start every user from their stored credit.' },
  { id: 'paid', label: 'Outgoing', description: 'Total what each user paid out.' },
  { id: 'received', label: 'Incoming', description: 'Total what each user received.' },
  { id: 'final', label: 'Final', description: 'Apply both totals and flag negative credit.' },
  { id: 'order', label: 'Order', description: 'Sort by user id.' },
  { id: 'done', label: 'Result', description: 'Report every user, including those with no transfers.' },
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
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with users and transactions lists.')
  if (!Array.isArray(input.users) || input.users.length > 8) throw new Error('users is a list of at most 8 rows.')
  if (!Array.isArray(input.transactions) || input.transactions.length > 12) throw new Error('transactions is a list of at most 12 rows.')
  for (const u of input.users) {
    if (typeof u.user_id !== 'number' || typeof u.user_name !== 'string' || typeof u.credit !== 'number') throw new Error('Each user has user_id, user_name and a numeric credit.')
  }
  for (const t of input.transactions) {
    if (typeof t.paid_by !== 'number' || typeof t.paid_to !== 'number' || typeof t.amount !== 'number') throw new Error('Each transaction has numeric paid_by, paid_to and amount.')
  }
  return input
}

export function buildTrace(input) {
  const frames = []
  const users = input.users.map(u => ({ user_id: u.user_id, user_name: u.user_name, credit: u.credit }))
  frames.push(frame('load', 'from Users u', 'def account_summary', users, [], `Start ${users.length} users from their stored credit.`))
  const paid = new Map()
  const received = new Map()
  for (const t of input.transactions) {
    paid.set(t.paid_by, (paid.get(t.paid_by) ?? 0) + t.amount)
    received.set(t.paid_to, (received.get(t.paid_to) ?? 0) + t.amount)
  }
  const withPaid = users.map(u => ({ ...u, paid_out: paid.get(u.user_id) ?? 0 }))
  frames.push(frame('paid', 'group by paid_by', 'paid = transactions', withPaid, [], 'Users with no outgoing transfer keep a zero.'))
  const withBoth = withPaid.map(u => ({ ...u, received_in: received.get(u.user_id) ?? 0 }))
  frames.push(frame('received', 'group by paid_to', 'received = transactions', withBoth, [], 'Users with no incoming transfer keep a zero.'))
  const finals = withBoth.map(u => {
    const credit = u.credit - u.paid_out + u.received_in
    return { user_id: u.user_id, user_name: u.user_name, credit, credit_limit_breached: credit < 0 ? 'Yes' : 'No' }
  })
  frames.push(frame('final', "u.credit -", "out['credit'] =", finals, [], 'Final credit is stored credit minus outgoing plus incoming.'))
  const ordered = [...finals].sort((a, b) => a.user_id - b.user_id)
  frames.push(frame('order', 'order by u.user_id', "sort_values('user_id')", ordered, [], 'Sort the summary by user id.'))
  const result = ordered.map(row => ({ ...row }))
  frames.push(frame('done', 'select u.user_id', 'return out', result, result, `Returned ${result.length} users.`))
  return { input, result, frames }
}
