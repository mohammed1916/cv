export const sql = `select u.name, sum(t.amount) as balance
from Users u
join Transactions t on t.account = u.account
group by u.account, u.name
having sum(t.amount) > 10000`
export const code = sql.split('\n').map((text, index) => ({ line: index + 1, text }))
export const python = `def large_balances(users, transactions):
    merged = users.merge(transactions, on='account')
    totals = merged.groupby(['account', 'name'], as_index=False)['amount'].sum()
    kept = totals[totals['amount'] > 10000]
    return kept.rename(columns={'amount': 'balance'})[['name', 'balance']]`
export const phases = [
  { id: 'load', label: 'Load', description: 'Read the Users rows.' },
  { id: 'join', label: 'Join', description: 'Attach every transaction to its account owner.' },
  { id: 'group', label: 'Sum', description: 'Add each account total, withdrawals included.' },
  { id: 'having', label: 'Threshold', description: 'Keep totals strictly above 10000.' },
  { id: 'done', label: 'Result', description: 'Report the qualifying accounts.' },
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
  if (!Array.isArray(input.transactions) || input.transactions.length > 16) throw new Error('transactions is a list of at most 16 rows.')
  for (const u of input.users) {
    if (typeof u.account !== 'number' || typeof u.name !== 'string') throw new Error('Each user has account and name.')
  }
  for (const t of input.transactions) {
    if (typeof t.trans_id !== 'number' || typeof t.account !== 'number' || !Number.isInteger(t.amount)) throw new Error('Each transaction has trans_id, account and a whole-number amount. Negative amounts are withdrawals.')
  }
  return input
}

export function buildTrace(input) {
  const frames = []
  const users = input.users.map(u => ({ ...u }))
  frames.push(frame('load', 'from Users u', 'def large_balances', users, [], `Read ${users.length} users.`))
  const owners = new Map(users.map(u => [u.account, u.name]))
  const joined = input.transactions.map(t => ({ trans_id: t.trans_id, account: t.account, name: owners.get(t.account), amount: t.amount }))
  frames.push(frame('join', 'join Transactions t', 'merge(', joined, [], 'Each transaction now carries its owner name.'))
  const totals = new Map()
  for (const row of joined) {
    const entry = totals.get(row.account) ?? { account: row.account, name: row.name, balance: 0 }
    entry.balance += row.amount
    totals.set(row.account, entry)
  }
  const sums = [...totals.values()]
  frames.push(frame('group', 'group by u.account', "groupby(['account'", sums, [], 'Each account balance is the sum of its amounts.'))
  const checked = sums.map(s => ({ ...s, passes: s.balance > 10000 }))
  frames.push(frame('having', 'having sum', 'kept = totals', checked, [], `${checked.filter(c => c.passes).length} accounts pass the threshold.`))
  const result = checked.filter(c => c.passes).map(c => ({ name: c.name, balance: c.balance }))
  frames.push(frame('done', 'select u.name', 'return kept', result, result, `Returned ${result.length} accounts.`))
  return { input, result, frames }
}
