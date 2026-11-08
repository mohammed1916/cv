// Walkthrough of the query stages on invented sample rows. The sample tables are invented.
const SQL_TEXT = `WITH per_visit AS (
  SELECT v.user_id, v.visit_date,
         COUNT(t.amount) AS transactions_count
  FROM Visits AS v
  LEFT JOIN Transactions AS t
    ON t.user_id = v.user_id AND t.transaction_date = v.visit_date
  GROUP BY v.user_id, v.visit_date
), buckets AS (
  SELECT 0 AS transactions_count
  UNION ALL
  SELECT transactions_count + 1 FROM buckets
  WHERE transactions_count < (SELECT MAX(transactions_count) FROM per_visit)
)
SELECT b.transactions_count, COUNT(p.user_id) AS visits_count
FROM buckets AS b
LEFT JOIN per_visit AS p ON p.transactions_count = b.transactions_count
GROUP BY b.transactions_count
ORDER BY b.transactions_count`

export const sql = SQL_TEXT
export const code = SQL_TEXT.split('\n').map((text, index) => ({ line: index + 1, text }))
export const python = `import pandas as pd

def transactions_per_visit(visits, transactions):
    merged = visits.merge(transactions.rename(columns={"transaction_date": "visit_date"}),
                          on=["user_id", "visit_date"], how="left")
    per_visit = merged.groupby(["user_id", "visit_date"])["amount"].count().reset_index(name="transactions_count")
    top = per_visit["transactions_count"].max()
    buckets = pd.DataFrame({"transactions_count": range(top + 1)})
    counted = per_visit.groupby("transactions_count").size().reset_index(name="visits_count")
    hist = buckets.merge(counted, on="transactions_count", how="left")
    hist["visits_count"] = hist["visits_count"].fillna(0).astype(int)
    return hist
`

export const phases = [
  { id: 'load', label: 'Visits', description: 'Read the visits and transactions.' },
  { id: 'count', label: 'Per visit', description: 'Count same-day transactions for each visit.' },
  { id: 'histogram', label: 'Histogram', description: 'Create a bucket for every count, empty ones included.' },
  { id: 'done', label: 'Result', description: 'Show the rows the query returns.' },
]

export const sample = {
  Visits: [
    { user_id: 1, visit_date: '2020-01-01' },
    { user_id: 1, visit_date: '2020-01-02' },
    { user_id: 2, visit_date: '2020-01-01' },
    { user_id: 3, visit_date: '2020-01-03' },
  ],
  Transactions: [
    { user_id: 1, transaction_date: '2020-01-01', amount: 10 },
    { user_id: 1, transaction_date: '2020-01-01', amount: 5 },
    { user_id: 2, transaction_date: '2020-01-01', amount: 7 },
    { user_id: 1, transaction_date: '2020-01-02', amount: 3 },
    { user_id: 3, transaction_date: '2020-01-04', amount: 9 },
  ],
}

export const examples = [{ label: 'Four visits', input: JSON.stringify(sample) },
    { label: "Single visit, no transactions", input: "{\"Visits\":[{\"user_id\":1,\"visit_date\":\"2020-01-01\"}],\"Transactions\":[]}" },
    { label: "Two users, equal totals", input: "{\"Visits\":[{\"user_id\":1,\"visit_date\":\"2020-01-01\"},{\"user_id\":2,\"visit_date\":\"2020-01-01\"}],\"Transactions\":[{\"user_id\":1,\"transaction_date\":\"2020-01-01\",\"amount\":5},{\"user_id\":2,\"transaction_date\":\"2020-01-01\",\"amount\":5}]}" },
    { label: "Twelve rows in each table", input: "{\"Visits\":[{\"user_id\":1,\"visit_date\":\"2020-01-01\"},{\"user_id\":2,\"visit_date\":\"2020-01-02\"},{\"user_id\":3,\"visit_date\":\"2020-01-03\"},{\"user_id\":1,\"visit_date\":\"2020-01-04\"},{\"user_id\":2,\"visit_date\":\"2020-01-05\"},{\"user_id\":3,\"visit_date\":\"2020-01-06\"},{\"user_id\":1,\"visit_date\":\"2020-01-07\"},{\"user_id\":2,\"visit_date\":\"2020-01-08\"},{\"user_id\":3,\"visit_date\":\"2020-01-09\"},{\"user_id\":1,\"visit_date\":\"2020-01-10\"},{\"user_id\":2,\"visit_date\":\"2020-01-11\"},{\"user_id\":3,\"visit_date\":\"2020-01-12\"}],\"Transactions\":[{\"user_id\":1,\"transaction_date\":\"2020-01-01\",\"amount\":1000},{\"user_id\":2,\"transaction_date\":\"2020-01-02\",\"amount\":1000},{\"user_id\":3,\"transaction_date\":\"2020-01-03\",\"amount\":1000},{\"user_id\":1,\"transaction_date\":\"2020-01-04\",\"amount\":1000},{\"user_id\":2,\"transaction_date\":\"2020-01-05\",\"amount\":1000},{\"user_id\":3,\"transaction_date\":\"2020-01-06\",\"amount\":1000},{\"user_id\":1,\"transaction_date\":\"2020-01-07\",\"amount\":1000},{\"user_id\":2,\"transaction_date\":\"2020-01-08\",\"amount\":1000},{\"user_id\":3,\"transaction_date\":\"2020-01-09\",\"amount\":1000},{\"user_id\":1,\"transaction_date\":\"2020-01-10\",\"amount\":1000},{\"user_id\":2,\"transaction_date\":\"2020-01-11\",\"amount\":1000},{\"user_id\":3,\"transaction_date\":\"2020-01-12\",\"amount\":1000}]}" },
    { label: "Long run: twelve random rows each", input: "{\"Visits\":[{\"user_id\":2,\"visit_date\":\"2020-01-05\"},{\"user_id\":3,\"visit_date\":\"2020-01-04\"},{\"user_id\":2,\"visit_date\":\"2020-01-05\"},{\"user_id\":3,\"visit_date\":\"2020-01-02\"},{\"user_id\":4,\"visit_date\":\"2020-01-02\"},{\"user_id\":4,\"visit_date\":\"2020-01-01\"},{\"user_id\":4,\"visit_date\":\"2020-01-03\"},{\"user_id\":1,\"visit_date\":\"2020-01-04\"},{\"user_id\":2,\"visit_date\":\"2020-01-01\"},{\"user_id\":2,\"visit_date\":\"2020-01-06\"},{\"user_id\":2,\"visit_date\":\"2020-01-06\"},{\"user_id\":1,\"visit_date\":\"2020-01-02\"}],\"Transactions\":[{\"user_id\":2,\"transaction_date\":\"2020-01-01\",\"amount\":210},{\"user_id\":3,\"transaction_date\":\"2020-01-05\",\"amount\":304},{\"user_id\":3,\"transaction_date\":\"2020-01-04\",\"amount\":213},{\"user_id\":1,\"transaction_date\":\"2020-01-02\",\"amount\":190},{\"user_id\":2,\"transaction_date\":\"2020-01-04\",\"amount\":14},{\"user_id\":4,\"transaction_date\":\"2020-01-04\",\"amount\":431},{\"user_id\":1,\"transaction_date\":\"2020-01-05\",\"amount\":394},{\"user_id\":4,\"transaction_date\":\"2020-01-06\",\"amount\":217},{\"user_id\":4,\"transaction_date\":\"2020-01-01\",\"amount\":88},{\"user_id\":1,\"transaction_date\":\"2020-01-01\",\"amount\":172},{\"user_id\":4,\"transaction_date\":\"2020-01-02\",\"amount\":46},{\"user_id\":1,\"transaction_date\":\"2020-01-03\",\"amount\":378}]}" }]
export const inputLabel = 'Object with Visits and Transactions lists (dates as YYYY-MM-DD)'
export const complexity = 'O(v + t) with a hash join on user and date, plus one bucket per count from zero to the maximum. The visualization caps each table at 12 rows.'
export const reasoning = [
  'A visit matches a transaction when both the user and the date agree. A left join keeps visits that have no transactions.',
  'The histogram must show every count from zero to the largest one, so buckets with no visits still appear with a zero.',
  'Generating the bucket list separately from the visit counts is what keeps the empty buckets in the output.',
]

const L = key => {
  const index = code.findIndex(line => line.text.includes(key))
  if (index < 0) throw new Error(`No SQL line contains "${key}".`)
  return index + 1
}
const P = key => {
  const index = python.split('\n').findIndex(line => line.includes(key))
  if (index < 0) throw new Error(`No Python line contains "${key}".`)
  return index + 1
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || !Array.isArray(input.Visits) || !Array.isArray(input.Transactions)) throw new Error('Use an object with Visits and Transactions lists.')
  if (input.Visits.length > 12 || input.Transactions.length > 12) throw new Error('Keep each table to 12 rows.')
  for (const row of [...input.Visits, ...input.Transactions]) {
    if (!Number.isInteger(row.user_id)) throw new Error('Each row needs an integer user_id.')
  }
  for (const row of input.Transactions) {
    if (!Number.isInteger(row.amount)) throw new Error('Each transaction needs an integer amount.')
  }
  return { Visits: input.Visits, Transactions: input.Transactions }
}

export function buildTrace({ Visits, Transactions }) {
  const frames = []
  const push = (phase, sqlKey, pyKey, message, caption, columns, rows) => frames.push({
    phase, activeLine: L(sqlKey), pythonLine: P(pyKey), message,
    view: { caption, columns, rows: rows.map(row => ({ ...row })) },
  })
  push('load', 'FROM Visits', 'def transactions_per_visit', `Read ${Visits.length} visits and ${Transactions.length} transactions.`, 'Visits', ['user_id', 'visit_date'], Visits)
  const perVisit = []
  for (const visit of Visits) {
    const transactions_count = Transactions.filter(t => t.user_id === visit.user_id && t.transaction_date === visit.visit_date).length
    perVisit.push({ user_id: visit.user_id, visit_date: visit.visit_date, transactions_count })
    push('count', 'COUNT(t.amount)', 'per_visit = merged', `Visit by user ${visit.user_id} on ${visit.visit_date} has ${transactions_count} transaction(s).`, 'Per visit', ['user_id', 'visit_date', 'transactions_count'], perVisit)
  }
  const top = Math.max(...perVisit.map(row => row.transactions_count))
  const buckets = []
  for (let count = 0; count <= top; count++) {
    const visits_count = perVisit.filter(row => row.transactions_count === count).length
    buckets.push({ transactions_count: count, visits_count })
  }
  push('histogram', 'UNION ALL', 'buckets = pd.DataFrame', `Build buckets 0 to ${top}; empty buckets stay at zero.`, 'Histogram', ['transactions_count', 'visits_count'], buckets)
  const result = buckets
  push('done', 'ORDER BY b.transactions_count', 'return hist', `Return ${result.length} buckets.`, 'Result', ['transactions_count', 'visits_count'], result)
  return { input: { Visits, Transactions }, result, frames }
}
