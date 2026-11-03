// Knowledge-derived SQL walkthrough. The purchase rows are invented for this visualization.
export const sql = `SELECT DISTINCT p1.user_id
FROM Purchases AS p1
JOIN Purchases AS p2
  ON p1.user_id = p2.user_id
 AND p1.purchase_id <> p2.purchase_id
 AND ABS(DATEDIFF(p1.purchase_date, p2.purchase_date)) <= 7
ORDER BY p1.user_id`

export const code = sql.split('\n').map((text, index) => ({ line: index + 1, text }))
const SQL = key => {
  const index = code.findIndex(line => line.text.includes(key))
  if (index < 0) throw new Error(`Missing SQL line: ${key}`)
  return index + 1
}

export const python = `import pandas as pd

def users_two_purchases_within_week(purchases):
    dates = purchases.assign(day=pd.to_datetime(purchases.purchase_date))
    pairs = dates.merge(dates, on="user_id", suffixes=("_a", "_b"))
    pairs = pairs[pairs.purchase_id_a != pairs.purchase_id_b]
    gap = (pairs.day_a - pairs.day_b).abs().dt.days
    return sorted(pairs.loc[gap <= 7, "user_id"].unique().tolist())`
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
  { id: 'load', label: 'Load', description: 'Read the purchase rows.' },
  { id: 'pair', label: 'Pair', description: 'Check each user for two distinct purchases at most seven days apart.' },
  { id: 'done', label: 'Result', description: 'Return the qualifying users in ascending order.' },
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
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with a Purchases table.')
  const Purchases = tableRows(input, 'Purchases', ['purchase_id', 'user_id', 'purchase_date'])
  for (const row of Purchases) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(row.purchase_date)) throw new Error('purchase_date must use YYYY-MM-DD.')
  }
  return { Purchases }
}

const dayNumber = text => Date.parse(`${text}T00:00:00Z`) / 86400000

export function buildTrace(input) {
  const { Purchases } = input
  const frames = []
  frames.push(frame('load', 'FROM Purchases', 'def ', `Load ${Purchases.length} purchases.`, ['purchase_id', 'user_id', 'purchase_date'], Purchases))

  const byUser = new Map()
  for (const row of Purchases) {
    if (!byUser.has(row.user_id)) byUser.set(row.user_id, [])
    byUser.get(row.user_id).push(row)
  }
  const summary = []
  const result = []
  for (const [userId, rows] of [...byUser].sort((a, b) => a[0] - b[0])) {
    const days = rows.map(row => dayNumber(row.purchase_date)).sort((a, b) => a - b)
    let closest = Infinity
    for (let i = 1; i < days.length; i += 1) closest = Math.min(closest, days[i] - days[i - 1])
    const ok = closest <= 7
    summary.push({ user_id: userId, purchases: rows.length, closest_gap_days: Number.isFinite(closest) ? closest : 'none', kept: ok ? 'yes' : 'no' })
    if (ok) result.push({ user_id: userId })
    const message = Number.isFinite(closest)
      ? `User ${userId} has a closest gap of ${closest} day${closest === 1 ? '' : 's'}, so ${ok ? 'the user qualifies' : 'the user does not qualify'}.`
      : `User ${userId} has only one purchase, so the user does not qualify.`
    frames.push(frame('pair', 'ABS(DATEDIFF', 'pairs = dates.merge', message, ['user_id', 'purchases', 'closest_gap_days', 'kept'], summary))
  }

  result.sort((a, b) => a.user_id - b.user_id)
  frames.push(frame('done', 'ORDER BY', 'return sorted(', `Return ${result.length} user${result.length === 1 ? '' : 's'}.`, ['user_id'], result))
  return { input, result, frames }
}
