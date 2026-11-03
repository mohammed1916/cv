// Knowledge-derived SQL walkthrough. The sample tables are invented for this visualization.
export const sql = `WITH visit_stats AS (
  SELECT v.member_id, COUNT(*) AS visits, COUNT(p.visit_id) AS purchases
  FROM Visits v
  LEFT JOIN Purchases p ON p.visit_id = v.visit_id
  GROUP BY v.member_id
)
SELECT m.member_id, m.name,
       CASE WHEN s.visits IS NULL THEN 'Inactive'
            WHEN 100.0 * s.purchases / s.visits >= 50 THEN 'Premium'
            WHEN s.purchases > 0 THEN 'Regular'
            ELSE 'Casual' END AS category
FROM Members m
LEFT JOIN visit_stats s ON s.member_id = m.member_id
ORDER BY m.member_id`

export const code = sql.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def member_category(members, visits, purchases):
    bought = visits.merge(purchases, on="visit_id", how="left")
    stats = bought.groupby("member_id").agg(visits=("visit_id", "count"), purchases=("charged_amount", "count"))
    out = members.merge(stats, on="member_id", how="left")
    rate = 100 * out.purchases / out.visits
    out["category"] = np.select([out.visits.isna(), rate >= 50, out.purchases > 0], ["Inactive", "Premium", "Regular"], "Casual")
    return out.sort_values("member_id")[["member_id", "name", "category"]]`

export const sampleText = '{"Members":[{"member_id":4,"name":"Dee"},{"member_id":1,"name":"Ana"},{"member_id":3,"name":"Cy"},{"member_id":2,"name":"Ben"}],"Visits":[{"visit_id":1,"member_id":1,"visit_date":"2026-01-01"},{"visit_id":2,"member_id":1,"visit_date":"2026-01-02"},{"visit_id":3,"member_id":1,"visit_date":"2026-01-03"},{"visit_id":4,"member_id":1,"visit_date":"2026-01-04"},{"visit_id":5,"member_id":1,"visit_date":"2026-01-05"},{"visit_id":6,"member_id":2,"visit_date":"2026-01-02"},{"visit_id":7,"member_id":2,"visit_date":"2026-01-06"},{"visit_id":8,"member_id":3,"visit_date":"2026-01-07"}],"Purchases":[{"visit_id":1,"charged_amount":20},{"visit_id":2,"charged_amount":35},{"visit_id":3,"charged_amount":10},{"visit_id":4,"charged_amount":5},{"visit_id":6,"charged_amount":50}]}'

const SQL = key => {
  const index = code.findIndex(line => line.text.includes(key))
  if (index < 0) throw new Error(`Missing SQL line: ${key}`)
  return index + 1
}
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
  { id: 'load', label: 'Load', description: 'Read the visit rows.' },
  { id: 'join', label: 'Join', description: 'Attach each purchase to its visit.' },
  { id: 'stats', label: 'Count', description: 'Count visits and purchases for each member.' },
  { id: 'classify', label: 'Classify', description: 'Give each member a category, including members with no visits.' },
  { id: 'done', label: 'Result', description: 'Output members in id order.' },
]

function tableRows(input, name, columns) {
  const rows = input[name]
  if (!Array.isArray(rows) || rows.length > 12) throw new Error(`${name} needs 0 to 12 rows.`)
  for (const row of rows) {
    if (!row || typeof row !== 'object' || columns.some(column => !(column in row))) throw new Error(`${name} rows need ${columns.join(', ')}.`)
  }
  return rows.map(row => Object.fromEntries(columns.map(column => [column, row[column]])))
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with Members, Visits and Purchases tables.')
  const Visits = tableRows(input, 'Visits', ['visit_id', 'member_id'])
  const visitIds = new Set(Visits.map(row => row.visit_id))
  if (visitIds.size !== Visits.length) throw new Error('visit_id must be unique.')
  return {
    Members: tableRows(input, 'Members', ['member_id', 'name']),
    Visits,
    Purchases: tableRows(input, 'Purchases', ['visit_id', 'charged_amount']),
  }
}

const categoryOf = stats => {
  if (!stats) return 'Inactive'
  const rate = 100 * stats.purchases / stats.visits
  if (rate >= 50) return 'Premium'
  if (stats.purchases > 0) return 'Regular'
  return 'Casual'
}

export function buildTrace(input) {
  const { Members, Visits, Purchases } = input
  const paid = new Map(Purchases.map(row => [row.visit_id, row.charged_amount]))
  const joined = Visits.map(row => ({
    visit_id: row.visit_id,
    member_id: row.member_id,
    charged_amount: paid.has(row.visit_id) ? paid.get(row.visit_id) : null,
  }))
  const frames = []
  frames.push(frame('load', 'FROM Visits v', 'def ', 'Read the visit rows. Purchases are attached next.', ['visit_id', 'member_id'], Visits))
  frames.push(frame('join', 'LEFT JOIN Purchases', 'bought = ', 'Keep every visit and attach its charged amount when one exists.', ['visit_id', 'member_id', 'charged_amount'], joined))

  const byMember = new Map()
  for (const row of joined) {
    const stats = byMember.get(row.member_id) ?? { member_id: row.member_id, visits: 0, purchases: 0 }
    stats.visits += 1
    if (row.charged_amount !== null) stats.purchases += 1
    byMember.set(row.member_id, stats)
  }
  const summary = [...byMember.values()].sort((a, b) => a.member_id - b.member_id)
  const counted = []
  for (const stats of summary) {
    counted.push({ ...stats })
    frames.push(frame('stats', 'GROUP BY v.member_id', 'stats = ', `Member ${stats.member_id} has ${stats.visits} visits and ${stats.purchases} purchases.`, ['member_id', 'visits', 'purchases'], counted))
  }

  const result = []
  const members = [...Members].sort((a, b) => a.member_id - b.member_id)
  for (const member of members) {
    const label = categoryOf(byMember.get(member.member_id))
    result.push({ member_id: member.member_id, name: member.name, category: label })
    frames.push(frame('classify', 'CASE WHEN', 'rate =', `Member ${member.member_id} is ${label}.`, ['member_id', 'name', 'category'], result))
  }
  frames.push(frame('done', 'ORDER BY m.member_id', 'return', `Return ${result.length} members with their categories.`, ['member_id', 'name', 'category'], result))
  return { input, result, frames }
}
