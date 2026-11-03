// Knowledge-derived teaching model. The SQL, pandas code, sample rows and wording were written for this visualizer.
// The official statement is not reproduced here; the 30-day window and as-of date are this model's own rules.
const SQL = `WITH last_seen AS (
  SELECT customer_id, MAX(login_date) AS last_login
  FROM logins
  GROUP BY customer_id
)
SELECT customer_id, last_login,
  DATEDIFF(day, last_login, :as_of) AS days_idle
FROM last_seen
WHERE DATEDIFF(day, last_login, :as_of) >= 30
ORDER BY days_idle DESC, customer_id ASC`

export const code = SQL.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `import pandas as pd

def churn_risk_customers(logins, as_of):
    last = logins.groupby("customer_id", as_index=False)["login_date"].max()
    last = last.rename(columns={"login_date": "last_login"})
    last["days_idle"] = (pd.Timestamp(as_of) - pd.to_datetime(last["last_login"])).dt.days
    risk = last[last["days_idle"] >= 30]
    risk = risk.sort_values(["days_idle", "customer_id"], ascending=[False, True])
    return risk[["customer_id", "last_login", "days_idle"]]`

export const phases = [
  { id: 'load', label: 'Load', description: 'Read the login rows and the as-of date.' },
  { id: 'group', label: 'Latest login', description: 'Keep the latest login date for each customer.' },
  { id: 'check', label: 'Idle days', description: 'Count the days from the last login to the as-of date.' },
  { id: 'order', label: 'Order', description: 'Sort the at-risk customers by idle days, then id.' },
  { id: 'done', label: 'Result', description: 'Report the churn-risk customers.' },
]

const pythonLines = python.split('\n')

function lineOf(lines, fragment) {
  const index = lines.findIndex(text => text.includes(fragment))
  if (index < 0) throw new Error(`No line contains "${fragment}"`)
  return index + 1
}
const L = fragment => lineOf(code.map(entry => entry.text), fragment)
const P = fragment => lineOf(pythonLines, fragment)

const DATE = /^\d{4}-\d{2}-\d{2}$/
const COLUMNS = ['customer_id', 'last_login', 'days_idle']

function dayNumber(text) {
  if (!DATE.test(text)) throw new Error(`Dates use YYYY-MM-DD: ${text}`)
  const [year, month, day] = text.split('-').map(Number)
  const ms = Date.UTC(year, month - 1, day)
  const check = new Date(ms)
  if (check.getUTCFullYear() !== year || check.getUTCMonth() !== month - 1 || check.getUTCDate() !== day) {
    throw new Error(`Not a real calendar date: ${text}`)
  }
  return ms / 86400000
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with as_of and logins.')
  const { as_of: asOf, logins } = input
  if (typeof asOf !== 'string') throw new Error('as_of is a YYYY-MM-DD date.')
  const asOfDay = dayNumber(asOf)
  if (!Array.isArray(logins) || logins.length < 1 || logins.length > 30) throw new Error('logins is a list of 1 to 30 rows.')
  for (const row of logins) {
    if (!Number.isInteger(row.customer_id) || row.customer_id < 1) throw new Error('customer_id is a positive integer.')
    if (typeof row.login_date !== 'string') throw new Error('login_date is a YYYY-MM-DD date.')
    if (dayNumber(row.login_date) > asOfDay) throw new Error('A login cannot be after as_of.')
  }
  return { as_of: asOf, logins: logins.map(row => ({ customer_id: row.customer_id, login_date: row.login_date })) }
}

function snapshot(rows) {
  return { columns: COLUMNS, rows }
}

export function buildTrace({ as_of: asOf, logins }) {
  const asOfDay = dayNumber(asOf)
  const frames = []
  const latest = new Map()
  frames.push({
    pythonLine: P('groupby("customer_id"'), phase: 'load', activeLine: L('WITH last_seen'),
    message: `Read ${logins.length} login rows; the as-of date is ${asOf}.`,
    table: { columns: ['customer_id', 'login_date'], rows: logins.map(row => ({ customer_id: row.customer_id, login_date: row.login_date })) },
  })
  for (const row of logins) {
    const previous = latest.get(row.customer_id)
    if (!previous || dayNumber(row.login_date) > dayNumber(previous)) latest.set(row.customer_id, row.login_date)
    frames.push({
      pythonLine: P('groupby("customer_id"'), phase: 'group', activeLine: L('GROUP BY customer_id'),
      message: `Customer ${row.customer_id} logged in on ${row.login_date}; latest is now ${latest.get(row.customer_id)}.`,
      table: snapshot([...latest].map(([customer_id, last_login]) => ({ customer_id, last_login, days_idle: null }))),
    })
  }
  const checked = []
  const result = []
  for (const [customer_id, last_login] of latest) {
    const days_idle = asOfDay - dayNumber(last_login)
    const atRisk = days_idle >= 30
    const row = { customer_id, last_login, days_idle }
    checked.push(row)
    if (atRisk) result.push(row)
    frames.push({
      pythonLine: P('days_idle"] = '), phase: 'check', activeLine: L('WHERE DATEDIFF'),
      message: `Customer ${customer_id} is idle ${days_idle} days: ${atRisk ? 'at risk (30 or more)' : 'not at risk (under 30)'}.`,
      table: snapshot(checked.map(entry => ({ ...entry }))),
    })
  }
  result.sort((a, b) => b.days_idle - a.days_idle || a.customer_id - b.customer_id)
  frames.push({
    pythonLine: P('risk = risk.sort_values'), phase: 'order', activeLine: L('ORDER BY days_idle'),
    message: `Sort ${result.length} at-risk customer${result.length === 1 ? '' : 's'} by idle days, then id.`,
    table: snapshot(result.map(entry => ({ ...entry }))),
  })
  frames.push({
    pythonLine: P('return risk'), phase: 'done', activeLine: L('SELECT customer_id, last_login,'),
    message: result.length ? 'These customers have not logged in for 30 days or more.' : 'No customer is at risk.',
    table: snapshot(result.map(entry => ({ ...entry }))),
  })
  return { input: { as_of: asOf, logins }, result, frames }
}
