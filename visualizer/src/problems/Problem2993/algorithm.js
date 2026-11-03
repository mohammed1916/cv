// Knowledge-derived SQL walkthrough. The sample tables are invented for this visualization.
// The day-of-week call uses MySQL numbering, where 6 is Friday.
export const sql = `SELECT CEIL(DAY(purchase_date) / 7) AS week_of_month,
       purchase_date,
       SUM(amount_spend) AS total_amount
FROM Purchases
WHERE purchase_date BETWEEN '2023-11-01' AND '2023-11-30'
  AND DAYOFWEEK(purchase_date) = 6
GROUP BY purchase_date
ORDER BY purchase_date`

export const code = sql.split('\n').map((text, index) => ({ line: index + 1, text }))
const SQL = key => {
  const index = code.findIndex(line => line.text.includes(key))
  if (index < 0) throw new Error(`Missing SQL line: ${key}`)
  return index + 1
}

export const python = `def friday_purchases(purchases):
    days = pd.to_datetime(purchases["purchase_date"])
    november = purchases[days.between("2023-11-01", "2023-11-30")]
    fridays = november[days.loc[november.index].dt.dayofweek == 4]
    totals = fridays.groupby("purchase_date", as_index=False)["amount_spend"].sum()
    totals["week_of_month"] = np.ceil(pd.to_datetime(totals["purchase_date"]).dt.day / 7).astype(int)
    return totals.rename(columns={"amount_spend": "total_amount"})[["week_of_month", "purchase_date", "total_amount"]]`
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
  { id: 'load', label: 'Load', description: 'Read every purchase.' },
  { id: 'window', label: 'November', description: 'Keep purchases dated 1 to 30 November 2023.' },
  { id: 'friday', label: 'Friday', description: 'Keep only the Friday purchases.' },
  { id: 'group', label: 'Group', description: 'Total each Friday and label its week.' },
  { id: 'done', label: 'Result', description: 'Report the Friday totals in date order.' },
]

const isDate = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)

function tableRows(input, name, columns) {
  const rows = input[name]
  if (!Array.isArray(rows) || rows.length < 1 || rows.length > 20) throw new Error(`${name} needs 1 to 20 rows.`)
  return rows.map(row => {
    if (!row || typeof row !== 'object' || columns.some(column => !(column in row))) throw new Error(`${name} rows need ${columns.join(', ')}.`)
    if (!isDate(row.purchase_date)) throw new Error('purchase_date must look like 2023-11-03.')
    return Object.fromEntries(columns.map(column => [column, row[column]]))
  })
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with a Purchases table.')
  return { Purchases: tableRows(input, 'Purchases', ['user_id', 'purchase_date', 'amount_spend']) }
}

const weekdayOf = date => new Date(`${date}T00:00:00Z`).getUTCDay()

export function buildTrace(input) {
  const rows = input.Purchases
  const frames = []
  frames.push(frame('load', 'FROM Purchases', 'def friday', 'Read every purchase.', ['user_id', 'purchase_date', 'amount_spend'], rows))

  const november = rows.filter(row => row.purchase_date >= '2023-11-01' && row.purchase_date <= '2023-11-30')
  frames.push(frame('window', 'WHERE purchase_date BETWEEN', 'november = ', `Keep ${november.length} purchases dated in November 2023. Other months are skipped.`, ['user_id', 'purchase_date', 'amount_spend'], november))

  const fridays = november.filter(row => weekdayOf(row.purchase_date) === 5)
  frames.push(frame('friday', 'AND DAYOFWEEK(purchase_date)', 'fridays = ', `Keep ${fridays.length} purchases that fell on a Friday.`, ['user_id', 'purchase_date', 'amount_spend'], fridays))

  const byDay = new Map()
  for (const row of fridays) byDay.set(row.purchase_date, (byDay.get(row.purchase_date) || 0) + row.amount_spend)
  const summary = []
  const result = []
  for (const date of [...byDay.keys()].sort()) {
    const week = Math.ceil(Number(date.slice(8, 10)) / 7)
    const total = byDay.get(date)
    summary.push({ week_of_month: week, purchase_date: date, total_amount: total })
    result.push({ week_of_month: week, purchase_date: date, total_amount: total })
    frames.push(frame('group', 'GROUP BY purchase_date', 'totals = ', `${date} is in week ${week} and totals ${total}.`, ['week_of_month', 'purchase_date', 'total_amount'], summary))
  }
  frames.push(frame('done', 'ORDER BY purchase_date', 'return', `Return ${result.length} Friday total${result.length === 1 ? '' : 's'}.`, ['week_of_month', 'purchase_date', 'total_amount'], result))
  return { input, result, frames }
}
