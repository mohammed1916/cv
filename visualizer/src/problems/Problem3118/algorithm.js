// Teaching walkthrough. The users and purchases are invented for this visualization.
export const sql = `WITH premium_fridays AS (
  SELECT CEIL(DAY(p.purchase_date) / 7) AS week_of_month, u.membership, p.amount_spend
  FROM Purchases p
  JOIN Users u ON u.user_id = p.user_id
  WHERE u.membership IN ('Premium', 'VIP')
    AND p.purchase_date BETWEEN '2023-11-01' AND '2023-11-30'
    AND DAYOFWEEK(p.purchase_date) = 6
)
SELECT w.week_of_month, m.membership, COALESCE(SUM(f.amount_spend), 0) AS total_amount
FROM (SELECT 1 AS week_of_month UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4) w
CROSS JOIN (SELECT 'Premium' AS membership UNION ALL SELECT 'VIP') m
LEFT JOIN premium_fridays f
  ON f.week_of_month = w.week_of_month AND f.membership = m.membership
GROUP BY w.week_of_month, m.membership
ORDER BY w.week_of_month, m.membership`

export const code = sql.split('\n').map((text, index) => ({ line: index + 1, text }))
const SQL = key => {
  const index = code.findIndex(line => line.text.includes(key))
  if (index < 0) throw new Error(`Missing SQL line: ${key}`)
  return index + 1
}

export const python = `def friday_spend(users, purchases):
    members = users.set_index("user_id")["membership"]
    days = pd.to_datetime(purchases["purchase_date"])
    nov = purchases[days.between("2023-11-01", "2023-11-30") & (days.dt.dayofweek == 4)].copy()
    nov["membership"] = nov["user_id"].map(members)
    nov = nov[nov["membership"].isin(["Premium", "VIP"])]
    nov["week_of_month"] = np.ceil(pd.to_datetime(nov["purchase_date"]).dt.day / 7).astype(int)
    totals = nov.groupby(["week_of_month", "membership"])["amount_spend"].sum()
    rows = []
    for week in range(1, 5):
        for member in ["Premium", "VIP"]:
            rows.append({"week_of_month": week, "membership": member, "total_amount": int(totals.get((week, member), 0))})
    return rows`
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
  { id: 'filter', label: 'Filter', description: 'Keep Premium and VIP purchases made on a Friday in November 2023.' },
  { id: 'group', label: 'Group', description: 'Total each Friday week for each membership, using zero when empty.' },
  { id: 'done', label: 'Result', description: 'Output every week and membership in order.' },
]

const USER_COLUMNS = ['user_id', 'membership']
const PURCHASE_COLUMNS = ['user_id', 'purchase_date', 'amount_spend']
const MEMBERSHIPS = ['Standard', 'Premium', 'VIP']
const isDate = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
const weekdayOf = date => new Date(`${date}T00:00:00Z`).getUTCDay()

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with Users and Purchases tables.')
  const { Users, Purchases } = input
  if (!Array.isArray(Users) || Users.length < 1 || Users.length > 10) throw new Error('Users needs 1 to 10 rows.')
  if (!Array.isArray(Purchases) || Purchases.length < 1 || Purchases.length > 12) throw new Error('Purchases needs 1 to 12 rows.')
  const parsedUsers = Users.map(row => {
    if (!row || typeof row !== 'object' || USER_COLUMNS.some(column => !(column in row))) throw new Error(`Users rows need ${USER_COLUMNS.join(', ')}.`)
    if (!MEMBERSHIPS.includes(row.membership)) throw new Error('membership must be Standard, Premium or VIP.')
    return { user_id: row.user_id, membership: row.membership }
  })
  const known = new Set(parsedUsers.map(row => row.user_id))
  const parsedPurchases = Purchases.map(row => {
    if (!row || typeof row !== 'object' || PURCHASE_COLUMNS.some(column => !(column in row))) throw new Error(`Purchases rows need ${PURCHASE_COLUMNS.join(', ')}.`)
    if (!isDate(row.purchase_date)) throw new Error('purchase_date must look like 2023-11-03.')
    if (!known.has(row.user_id)) throw new Error('Every purchase user_id must appear in Users.')
    return { user_id: row.user_id, purchase_date: row.purchase_date, amount_spend: Number(row.amount_spend) }
  })
  return { Users: parsedUsers, Purchases: parsedPurchases }
}

export function buildTrace(input) {
  const { Users, Purchases } = input
  const membershipOf = new Map(Users.map(row => [row.user_id, row.membership]))
  const frames = []
  frames.push(frame('load', 'FROM Purchases', 'def friday_spend', `Read ${Users.length} users and ${Purchases.length} purchases.`, PURCHASE_COLUMNS, Purchases))

  const kept = []
  for (const row of Purchases) {
    const membership = membershipOf.get(row.user_id)
    const inNovember = row.purchase_date >= '2023-11-01' && row.purchase_date <= '2023-11-30'
    const friday = weekdayOf(row.purchase_date) === 5
    if (membership !== 'Premium' && membership !== 'VIP') continue
    if (!inNovember || !friday) continue
    kept.push({ week_of_month: Math.ceil(Number(row.purchase_date.slice(8, 10)) / 7), membership, purchase_date: row.purchase_date, amount_spend: row.amount_spend })
  }
  frames.push(frame('filter', 'WHERE u.membership IN', 'nov = ', `Keep ${kept.length} Premium or VIP purchase${kept.length === 1 ? '' : 's'} on a November Friday.`,
    ['week_of_month', 'membership', 'purchase_date', 'amount_spend'], kept))

  const result = []
  const summary = []
  for (let week = 1; week <= 4; week++) {
    for (const membership of ['Premium', 'VIP']) {
      const total = kept
        .filter(row => row.week_of_month === week && row.membership === membership)
        .reduce((sum, row) => sum + row.amount_spend, 0)
      const out = { week_of_month: week, membership, total_amount: total }
      result.push(out)
      summary.push(out)
      frames.push(frame('group', 'GROUP BY w.week_of_month', 'totals = ', `Week ${week}, ${membership}: ${total}${total === 0 ? ' (no Friday purchase, so zero)' : ''}.`,
        ['week_of_month', 'membership', 'total_amount'], summary))
    }
  }
  frames.push(frame('done', 'ORDER BY w.week_of_month', 'return rows', `Return ${result.length} rows: four weeks for each of two memberships.`,
    ['week_of_month', 'membership', 'total_amount'], result))
  return { input, result, frames }
}
