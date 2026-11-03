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

export const sql = `WITH per_user AS (
  SELECT user_id, spend_date, SUM(amount) AS amount, COUNT(DISTINCT platform) AS platforms,
         MIN(platform) AS only_platform
  FROM Spending
  GROUP BY user_id, spend_date
),
labelled AS (
  SELECT user_id, spend_date, amount,
         CASE WHEN platforms = 2 THEN 'both' ELSE only_platform END AS category
  FROM per_user
),
dates AS (SELECT DISTINCT spend_date FROM Spending),
categories AS (SELECT 'both' AS platform UNION ALL SELECT 'desktop' UNION ALL SELECT 'mobile')
SELECT d.spend_date, c.platform,
       COALESCE(SUM(l.amount), 0) AS total_amount,
       COUNT(l.user_id) AS total_users
FROM dates d
CROSS JOIN categories c
LEFT JOIN labelled l ON l.spend_date = d.spend_date AND l.category = c.platform
GROUP BY d.spend_date, c.platform
ORDER BY d.spend_date, c.platform`
const sqlLines = sql.split('\n')
export const code = sqlLines.map((text, index) => ({ line: index + 1, text }))
export const python = `import pandas as pd

def user_purchase_platform(spending):
    per_user = spending.groupby(["user_id", "spend_date"]).agg(amount=("amount", "sum"), platforms=("platform", "nunique"), only_platform=("platform", "min")).reset_index()
    per_user["category"] = per_user["only_platform"].where(per_user["platforms"] == 1, "both")
    dates = spending[["spend_date"]].drop_duplicates()
    categories = pd.DataFrame({"platform": ["both", "desktop", "mobile"]})
    grid = dates.merge(categories, how="cross")
    totals = grid.merge(per_user, left_on=["spend_date", "platform"], right_on=["spend_date", "category"], how="left")
    summary = totals.groupby(["spend_date", "platform"]).agg(total_amount=("amount", "sum"), total_users=("user_id", "count")).reset_index()
    return summary.sort_values(["spend_date", "platform"])`
const pyLines = python.split('\n')
const L = text => lineOf(sqlLines, text)
const P = text => lineOf(pyLines, text)
const frameAt = (phase, sqlText, pyText, message, columns, rows) => ({ phase, activeLine: L(sqlText), pythonLine: P(pyText), message, columns, rows: snap(rows) })

export const phases = [
  { id: 'load', label: 'Load', description: 'Read the spending rows.' },
  { id: 'classify', label: 'Classify', description: 'Label each user-day by the platforms used.' },
  { id: 'grid', label: 'Grid', description: 'Pair every date with all three categories.' },
  { id: 'sum', label: 'Sum', description: 'Add amounts and users, zero when nothing matches.' },
  { id: 'order', label: 'Order', description: 'Sort by date and category.' },
  { id: 'done', label: 'Result', description: 'Output the summary rows.' },
]
export const inputLabel = 'JSON object with a spending table'
export const complexity = 'Linear in the spending rows, plus a fixed three categories per date.'
const COLS = ['user_id', 'spend_date', 'platform', 'amount']
const SAMPLE = { spending: [
  { user_id: 1, spend_date: '2019-07-01', platform: 'mobile', amount: 100 },
  { user_id: 1, spend_date: '2019-07-01', platform: 'desktop', amount: 50 },
  { user_id: 2, spend_date: '2019-07-01', platform: 'mobile', amount: 200 },
  { user_id: 3, spend_date: '2019-07-01', platform: 'desktop', amount: 300 },
  { user_id: 2, spend_date: '2019-07-02', platform: 'desktop', amount: 10 },
] }
export const examples = [{ label: 'Teaching sample', input: JSON.stringify(SAMPLE) }]
const CATEGORIES = ['both', 'desktop', 'mobile']

export function parseInput(text) {
  const input = parseJsonObject(text)
  const rows = requireRows(input, 'spending', COLS)
  rows.forEach((row, index) => {
    if (!['mobile', 'desktop'].includes(row.platform)) throw new Error(`spending row ${index + 1} platform must be mobile or desktop.`)
  })
  return input
}

export function buildTrace(input) {
  const spending = input.spending
  const frames = [frameAt('load', 'FROM Spending', 'def user_purchase_platform', `Load ${spending.length} spending rows.`, COLS, spending)]
  const perUser = new Map()
  for (const row of spending) {
    const key = `${row.user_id}|${row.spend_date}`
    const entry = perUser.get(key) || { user_id: row.user_id, spend_date: row.spend_date, amount: 0, platforms: new Set() }
    entry.amount += row.amount
    entry.platforms.add(row.platform)
    perUser.set(key, entry)
  }
  const labelled = [...perUser.values()].map(entry => ({
    user_id: entry.user_id,
    spend_date: entry.spend_date,
    amount: entry.amount,
    category: entry.platforms.size === 2 ? 'both' : [...entry.platforms][0],
  }))
  frames.push(frameAt('classify', 'CASE WHEN platforms = 2', 'per_user["category"]', 'A user with both platforms on a day belongs only to both.', ['user_id', 'spend_date', 'amount', 'category'], labelled))
  const dates = [...new Set(spending.map(row => row.spend_date))].sort()
  const grid = dates.flatMap(spend_date => CATEGORIES.map(platform => ({ spend_date, platform })))
  frames.push(frameAt('grid', 'CROSS JOIN categories', 'grid = dates', `${dates.length} dates times three categories.`, ['spend_date', 'platform'], grid))
  const summary = grid.map(({ spend_date, platform }) => {
    const matches = labelled.filter(row => row.spend_date === spend_date && row.category === platform)
    return {
      spend_date,
      platform,
      total_amount: matches.reduce((sum, row) => sum + row.amount, 0),
      total_users: matches.length,
    }
  })
  frames.push(frameAt('sum', 'COALESCE(SUM(l.amount), 0)', 'summary = totals', 'Sum amounts and count users; empty categories stay at zero.', ['spend_date', 'platform', 'total_amount', 'total_users'], summary))
  const result = [...summary].sort((a, b) => (a.spend_date < b.spend_date ? -1 : a.spend_date > b.spend_date ? 1 : a.platform < b.platform ? -1 : a.platform > b.platform ? 1 : 0))
  frames.push(frameAt('order', 'ORDER BY d.spend_date', 'sort_values(["spend_date", "platform"])', 'Sort by date, then category.', ['spend_date', 'platform', 'total_amount', 'total_users'], result))
  frames.push(frameAt('done', 'SELECT d.spend_date', 'return summary', 'Output the summary for every date and category.', ['spend_date', 'platform', 'total_amount', 'total_users'], result))
  return { input, result, frames }
}
