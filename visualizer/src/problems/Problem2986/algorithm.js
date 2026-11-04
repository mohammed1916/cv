// SQL walkthrough with invented sample tables.
export const sql = `WITH ranked AS (
  SELECT user_id, spend, transaction_date,
         ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY transaction_date) AS nth
  FROM Transactions
),
pivoted AS (
  SELECT user_id,
         MAX(CASE WHEN nth = 1 THEN spend END) AS first_spend,
         MAX(CASE WHEN nth = 2 THEN spend END) AS second_spend,
         MAX(CASE WHEN nth = 3 THEN spend END) AS third_spend,
         MAX(CASE WHEN nth = 3 THEN transaction_date END) AS third_date
  FROM ranked
  GROUP BY user_id
)
SELECT user_id,
       third_spend AS third_transaction_spend,
       third_date AS third_transaction_date
FROM pivoted
WHERE third_spend > first_spend AND third_spend > second_spend
ORDER BY user_id`

export const code = sql.split('\n').map((text, index) => ({ line: index + 1, text }))
const SQL = key => {
  const index = code.findIndex(line => line.text.includes(key))
  if (index < 0) throw new Error(`Missing SQL line: ${key}`)
  return index + 1
}

export const python = `def third_transactions(transactions):
    ordered = transactions.sort_values(["user_id", "transaction_date"])
    ordered = ordered.assign(nth=ordered.groupby("user_id").cumcount() + 1)
    wide = ordered.pivot(index="user_id", columns="nth", values="spend")
    dates = ordered[ordered["nth"] == 3].set_index("user_id")["transaction_date"]
    keep = wide[3] > wide[[1, 2]].max(axis=1)
    out = wide.loc[keep.fillna(False), [3]].rename(columns={3: "third_transaction_spend"})
    out["third_transaction_date"] = dates
    return out.reset_index()`
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
  { id: 'rank', label: 'Number', description: 'Number each user’s purchases by date.' },
  { id: 'pivot', label: 'Compare', description: 'Check the third purchase against the first two.' },
  { id: 'done', label: 'Result', description: 'Report the users whose third purchase wins.' },
]

function tableRows(input, name, columns) {
  const rows = input[name]
  if (!Array.isArray(rows) || rows.length < 1 || rows.length > 20) throw new Error(`${name} needs 1 to 20 rows.`)
  return rows.map(row => {
    if (!row || typeof row !== 'object' || columns.some(column => !(column in row))) throw new Error(`${name} rows need ${columns.join(', ')}.`)
    return Object.fromEntries(columns.map(column => [column, row[column]]))
  })
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with a Transactions table.')
  return { Transactions: tableRows(input, 'Transactions', ['user_id', 'spend', 'transaction_date']) }
}

export function buildTrace(input) {
  const rows = input.Transactions
  const frames = []
  frames.push(frame('load', 'FROM Transactions', 'def third', 'Read the transactions in the order they were stored.', ['user_id', 'spend', 'transaction_date'], rows))

  const counts = new Map()
  const ranked = [...rows]
    .sort((a, b) => a.user_id - b.user_id || a.transaction_date.localeCompare(b.transaction_date))
    .map(row => {
      const nth = (counts.get(row.user_id) || 0) + 1
      counts.set(row.user_id, nth)
      return { ...row, nth }
    })
  frames.push(frame('rank', 'ROW_NUMBER', 'ordered = ', 'Number each user’s transactions by date, oldest first.', ['user_id', 'spend', 'transaction_date', 'nth'], ranked))

  const summary = []
  const result = []
  for (const user of [...counts.keys()].sort((a, b) => a - b)) {
    const mine = ranked.filter(row => row.user_id === user)
    const at = n => mine.find(row => row.nth === n)
    const first = at(1)?.spend ?? null
    const second = at(2)?.spend ?? null
    const third = at(3)
    let kept = 'none'
    let message
    if (!third) {
      message = `User ${user} has only ${mine.length} transaction${mine.length === 1 ? '' : 's'}, so there is no third one.`
    } else if (third.spend > first && third.spend > second) {
      kept = 'yes'
      message = `User ${user}: third spend ${third.spend} beats ${first} and ${second}, so it stays.`
      result.push({ user_id: user, third_transaction_spend: third.spend, third_transaction_date: third.transaction_date })
    } else {
      kept = 'no'
      message = `User ${user}: third spend ${third.spend} does not beat both ${first} and ${second}, so it is dropped.`
    }
    summary.push({ user_id: user, first_spend: first, second_spend: second, third_spend: third?.spend ?? null, third_date: third?.transaction_date ?? null, kept })
    frames.push(frame('pivot', 'AS first_spend', 'wide = ', message, ['user_id', 'first_spend', 'second_spend', 'third_spend', 'third_date', 'kept'], summary))
  }
  frames.push(frame('done', 'ORDER BY user_id', 'return', `Return ${result.length} user${result.length === 1 ? '' : 's'}.`, ['user_id', 'third_transaction_spend', 'third_transaction_date'], result))
  return { input, result, frames }
}
