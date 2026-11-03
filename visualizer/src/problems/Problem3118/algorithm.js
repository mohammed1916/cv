// Knowledge-derived SQL walkthrough. The sample tables and membership names are invented for this visualization.
export const sql = `SELECT u.membership, COALESCE(SUM(p.amount_spend), 0) AS total_spend
FROM Users u
LEFT JOIN Purchases p
  ON p.user_id = u.user_id
  AND p.purchase_date BETWEEN '2023-11-01' AND '2023-11-30'
  AND DAYNAME(p.purchase_date) = 'Friday'
GROUP BY u.membership
ORDER BY u.membership`

export const code = sql.split('\n').map((text, index) => ({ line: index + 1, text }))
const SQL = key => {
  const index = code.findIndex(line => line.text.includes(key))
  if (index < 0) throw new Error(`Missing SQL line: ${key}`)
  return index + 1
}

export const python = `def friday_spend(users, purchases):
    days = purchases["purchase_date"].dt.day_name() == "Friday"
    nov = purchases["purchase_date"].between("2023-11-01", "2023-11-30")
    picked = purchases[days & nov]
    joined = users.merge(picked, on="user_id", how="left")
    totals = joined.groupby("membership")["amount_spend"].sum().fillna(0)
    return totals.sort_index().reset_index().to_dict("records")`
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
  { id: 'load', label: 'Load', description: 'Read the users and purchases.' },
  { id: 'filter', label: 'Filter', description: 'Keep purchases made on a Friday in November 2023.' },
  { id: 'group', label: 'Group', description: 'Total the kept spending for each membership.' },
  { id: 'done', label: 'Result', description: 'Output every membership, including zero totals.' },
]

const USER_COLUMNS = ['user_id', 'membership']
const PURCHASE_COLUMNS = ['user_id', 'purchase_date', 'amount_spend']
const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with Users and Purchases tables.')
  const users = input.Users
  const purchases = input.Purchases
  if (!Array.isArray(users) || users.length < 1 || users.length > 12) throw new Error('Users needs 1 to 12 rows.')
  if (!Array.isArray(purchases) || purchases.length < 1 || purchases.length > 12) throw new Error('Purchases needs 1 to 12 rows.')
  const parsedUsers = users.map(row => {
    if (!row || typeof row !== 'object' || USER_COLUMNS.some(column => !(column in row))) throw new Error(`Users rows need ${USER_COLUMNS.join(', ')}.`)
    return Object.fromEntries(USER_COLUMNS.map(column => [column, row[column]]))
  })
  const known = new Set(parsedUsers.map(row => row.user_id))
  const parsedPurchases = purchases.map(row => {
    if (!row || typeof row !== 'object' || PURCHASE_COLUMNS.some(column => !(column in row))) throw new Error(`Purchases rows need ${PURCHASE_COLUMNS.join(', ')}.`)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(row.purchase_date)) throw new Error('purchase_date must look like 2023-11-03.')
    if (!known.has(row.user_id)) throw new Error('Every purchase user_id must appear in Users.')
    return Object.fromEntries(PURCHASE_COLUMNS.map(column => [column, row[column]]))
  })
  return { Users: parsedUsers, Purchases: parsedPurchases }
}

export function buildTrace(input) {
  const { Users, Purchases } = input
  const membershipOf = new Map(Users.map(row => [row.user_id, row.membership]))
  const frames = []
  frames.push(frame('load', 'FROM Users', 'def ', `Read ${Users.length} users.`, USER_COLUMNS, Users))
  frames.push(frame('load', 'LEFT JOIN', 'joined =', `Read ${Purchases.length} purchases to join against the users.`, PURCHASE_COLUMNS, Purchases))

  const judged = []
  const kept = []
  for (const row of Purchases) {
    const weekday = WEEKDAYS[new Date(`${row.purchase_date}T00:00:00Z`).getUTCDay()]
    const ok = weekday === 'Friday' && row.purchase_date >= '2023-11-01' && row.purchase_date <= '2023-11-30'
    judged.push({ purchase_date: row.purchase_date, weekday, amount_spend: row.amount_spend, kept: ok ? 'yes' : 'no' })
    if (ok) kept.push({ user_id: row.user_id, membership: membershipOf.get(row.user_id), amount_spend: row.amount_spend })
    frames.push(frame('filter', 'AND DAYNAME', 'days =', `${row.purchase_date} is a ${weekday}; it ${ok ? 'counts' : 'is skipped'}.`, ['purchase_date', 'weekday', 'amount_spend', 'kept'], judged))
  }

  const groups = [...new Set(Users.map(row => row.membership))].sort()
  const summary = []
  const result = []
  for (const membership of groups) {
    const total = kept.filter(row => row.membership === membership).reduce((sum, row) => sum + row.amount_spend, 0)
    summary.push({ membership, total_spend: total })
    result.push({ membership, total_spend: total })
    frames.push(frame('group', 'GROUP BY', 'totals =', `${membership} totals ${total}${total === 0 ? ', so it stays as zero' : ''}.`, ['membership', 'total_spend'], summary))
  }
  frames.push(frame('done', 'ORDER BY', 'return', `Return ${result.length} membership group${result.length === 1 ? '' : 's'}.`, ['membership', 'total_spend'], result))
  return { input, result, frames }
}
