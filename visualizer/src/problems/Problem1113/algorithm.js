// Knowledge-derived teaching model. The sample tables are invented for this visualization.
export function snap(rows) {
  return rows.map(row => ({ ...row }))
}

export function lineOf(lines, text) {
  const index = lines.findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`Missing code line for: ${text}`)
  return index + 1
}

export function parseJsonObject(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use a JSON object whose keys name the tables.')
  return input
}

export function requireRows(input, name, columns, maxRows = 12) {
  const rows = input[name]
  if (!Array.isArray(rows) || rows.length > maxRows) throw new Error(`${name} must be a list of at most ${maxRows} rows.`)
  rows.forEach((row, index) => {
    if (!row || typeof row !== 'object' || Array.isArray(row)) throw new Error(`${name} row ${index + 1} must be an object.`)
    columns.forEach(column => { if (!(column in row)) throw new Error(`${name} row ${index + 1} needs ${column}.`) })
  })
  return rows
}

export const sql = `SELECT extra AS report_reason, COUNT(*) AS report_count
FROM (
  SELECT DISTINCT post_id, extra
  FROM Actions
  WHERE action = 'report' AND action_date = '2019-07-04'
) AS reported
GROUP BY extra
ORDER BY report_reason`
const sqlLines = sql.split('\n')
export const code = sqlLines.map((text, index) => ({ line: index + 1, text }))
export const python = `def reported_posts(actions):
    day = actions[(actions["action"] == "report") & (actions["action_date"] == "2019-07-04")]
    unique = day[["post_id", "extra"]].drop_duplicates()
    counts = unique.groupby("extra").size().reset_index(name="report_count")
    counts = counts.rename(columns={"extra": "report_reason"})
    return counts.sort_values("report_reason")`
const pyLines = python.split('\n')
const L = text => lineOf(sqlLines, text)
const P = text => lineOf(pyLines, text)
const frameAt = (phase, sqlText, pyText, message, columns, rows) => ({ phase, activeLine: L(sqlText), pythonLine: P(pyText), message, columns, rows: snap(rows) })

export const phases = [
  { id: 'load', label: 'Load', description: 'Read the action rows.' },
  { id: 'filter', label: 'Filter', description: 'Keep report rows on the target day.' },
  { id: 'distinct', label: 'Distinct', description: 'Keep one row per post and reason.' },
  { id: 'group', label: 'Group', description: 'Count the posts for each reason.' },
  { id: 'order', label: 'Order', description: 'Sort the reasons.' },
  { id: 'done', label: 'Result', description: 'Output the rows.' },
]
export const inputLabel = 'JSON object with an actions table'
export const complexity = 'Linear in the number of action rows, plus sorting the distinct reasons.'
const COLS = ['user_id', 'post_id', 'action_date', 'action', 'extra']
const SAMPLE = { actions: [
  { user_id: 1, post_id: 10, action_date: '2019-07-04', action: 'report', extra: 'spam' },
  { user_id: 2, post_id: 10, action_date: '2019-07-04', action: 'report', extra: 'spam' },
  { user_id: 3, post_id: 11, action_date: '2019-07-04', action: 'report', extra: 'abuse' },
  { user_id: 1, post_id: 12, action_date: '2019-07-03', action: 'report', extra: 'spam' },
  { user_id: 4, post_id: 13, action_date: '2019-07-04', action: 'view', extra: 'spam' },
  { user_id: 5, post_id: 14, action_date: '2019-07-04', action: 'report', extra: 'spam' },
] }
export const examples = [{ label: 'Teaching sample', input: JSON.stringify(SAMPLE) }]

export function parseInput(text) {
  const input = parseJsonObject(text)
  requireRows(input, 'actions', COLS)
  return input
}

export function buildTrace(input) {
  const actions = input.actions
  const frames = [frameAt('load', 'FROM Actions', 'def reported_posts', `Load ${actions.length} action rows.`, COLS, actions)]
  const day = actions.filter(row => row.action === 'report' && row.action_date === '2019-07-04')
  frames.push(frameAt('filter', 'WHERE action', 'day = actions', `${day.length} report rows fall on 2019-07-04.`, COLS, day))
  const seen = new Set()
  const unique = []
  for (const row of day) {
    const key = `${row.post_id}|${row.extra}`
    if (!seen.has(key)) { seen.add(key); unique.push({ post_id: row.post_id, extra: row.extra }) }
  }
  frames.push(frameAt('distinct', 'SELECT DISTINCT', 'unique = day', `Keep one row per post and reason; ${unique.length} remain.`, ['post_id', 'extra'], unique))
  const byReason = new Map()
  for (const row of unique) byReason.set(row.extra, (byReason.get(row.extra) || 0) + 1)
  const grouped = [...byReason].map(([report_reason, report_count]) => ({ report_reason, report_count }))
  frames.push(frameAt('group', 'GROUP BY extra', 'groupby("extra")', `Count the distinct posts for ${grouped.length} reasons.`, ['report_reason', 'report_count'], grouped))
  const result = [...grouped].sort((a, b) => (a.report_reason < b.report_reason ? -1 : a.report_reason > b.report_reason ? 1 : 0))
  frames.push(frameAt('order', 'ORDER BY report_reason', 'sort_values("report_reason")', 'Sort the reasons alphabetically.', ['report_reason', 'report_count'], result))
  frames.push(frameAt('done', 'SELECT extra AS report_reason', 'return counts', 'Output report_reason and report_count.', ['report_reason', 'report_count'], result))
  return { input, result, frames }
}
