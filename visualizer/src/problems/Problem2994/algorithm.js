// Teaching SQL walkthrough. The purchase rows and the calendar are invented for this visualization.
export const sql = `WITH Fridays AS (
  SELECT DATE '2023-11-03' AS purchase_date
  UNION ALL SELECT DATE '2023-11-10'
  UNION ALL SELECT DATE '2023-11-17'
  UNION ALL SELECT DATE '2023-11-24'
)
SELECT f.purchase_date,
       FLOOR((DAY(f.purchase_date) + 6) / 7) AS week_of_month,
       COALESCE(SUM(p.amount_spend), 0) AS total_amount
FROM Fridays f
LEFT JOIN Purchases p ON p.purchase_date = f.purchase_date
GROUP BY f.purchase_date
ORDER BY f.purchase_date`

export const code = sql.split('\n').map((text, index) => ({ line: index + 1, text }))
const SQL = key => {
  const index = code.findIndex(line => line.text.includes(key))
  if (index < 0) throw new Error(`Missing SQL line: ${key}`)
  return index + 1
}

export const python = `import pandas as pd

def friday_purchases(purchases):
    days = pd.date_range("2023-11-01", "2023-11-30")
    fridays = days[days.dayofweek == 4]
    spent = purchases.groupby("purchase_date")["amount_spend"].sum()
    rows = []
    for day in fridays:
        key = day.strftime("%Y-%m-%d")
        total = int(spent.get(key, 0))
        rows.append({"purchase_date": key, "week_of_month": (day.day + 6) // 7, "total_amount": total})
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
  { id: 'load', label: 'Load', description: 'Read the purchase records.' },
  { id: 'calendar', label: 'Calendar', description: 'List the Fridays of November 2023 with their week numbers.' },
  { id: 'match', label: 'Match', description: 'Attach each Friday\'s spending total, using zero when there are no purchases.' },
  { id: 'done', label: 'Result', description: 'Return every Friday in date order.' },
]

const PURCHASE_COLUMNS = ['user_id', 'purchase_date', 'amount_spend']
const SUMMARY_COLUMNS = ['purchase_date', 'week_of_month', 'total_amount']

// Fridays of November 2023, with the week of the month as (day + 6) div 7.
export function novemberFridays() {
  const out = []
  for (let day = 1; day <= 30; day += 1) {
    if (new Date(Date.UTC(2023, 10, day)).getUTCDay() === 5) {
      out.push({ purchase_date: `2023-11-${String(day).padStart(2, '0')}`, week_of_month: Math.floor((day + 6) / 7) })
    }
  }
  return out
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input) || !Array.isArray(input.Purchases)) {
    throw new Error('Use an object with a Purchases array.')
  }
  const rows = input.Purchases
  if (rows.length < 1 || rows.length > 12) throw new Error('Purchases needs 1 to 12 rows.')
  const Purchases = rows.map(row => {
    if (!row || typeof row !== 'object' || PURCHASE_COLUMNS.some(column => !(column in row))) {
      throw new Error('Purchases rows need user_id, purchase_date and amount_spend.')
    }
    if (typeof row.purchase_date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(row.purchase_date)) {
      throw new Error('purchase_date must look like 2023-11-03.')
    }
    return { user_id: row.user_id, purchase_date: row.purchase_date, amount_spend: Number(row.amount_spend) }
  })
  return { Purchases }
}

export function buildTrace(input) {
  const { Purchases } = input
  const fridays = novemberFridays()
  const frames = []
  frames.push(frame('load', 'WITH Fridays', 'def friday', 'Read the purchase records.', PURCHASE_COLUMNS, Purchases))
  frames.push(frame('calendar', 'FROM Fridays', 'days =', 'November 2023 has Fridays on the 3rd, 10th, 17th and 24th.', ['purchase_date', 'week_of_month'], fridays))

  const summary = []
  for (const friday of fridays) {
    const total = Purchases
      .filter(row => row.purchase_date === friday.purchase_date)
      .reduce((sum, row) => sum + row.amount_spend, 0)
    summary.push({ purchase_date: friday.purchase_date, week_of_month: friday.week_of_month, total_amount: total })
    frames.push(frame('match', 'LEFT JOIN', 'total =', `${friday.purchase_date} has purchases totalling ${total}.`, SUMMARY_COLUMNS, summary))
  }
  const result = summary.map(row => ({ ...row }))
  frames.push(frame('done', 'ORDER BY', 'return rows', `Return ${result.length} Fridays, with 0 where nothing was bought.`, SUMMARY_COLUMNS, result))
  return { input, result, frames }
}
