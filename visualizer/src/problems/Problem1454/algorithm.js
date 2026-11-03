// Knowledge-derived teaching version. The sample tables are invented for this visualization.
const SQL = `WITH days AS (
  SELECT DISTINCT id, login_date FROM Logins
),
islands AS (
  SELECT id, login_date,
    DATE_SUB(login_date, INTERVAL ROW_NUMBER() OVER (PARTITION BY id ORDER BY login_date) DAY) AS island
  FROM days
),
runs AS (
  SELECT id, island, COUNT(*) AS run_length
  FROM islands
  GROUP BY id, island
  HAVING COUNT(*) >= 5
)
SELECT a.id, a.name
FROM Accounts AS a
WHERE a.id IN (SELECT id FROM runs)
ORDER BY a.id`

const PANDAS = `import pandas as pd

def active_users(accounts, logins):
    days = logins.drop_duplicates(["id", "login_date"]).sort_values(["id", "login_date"])
    days["rn"] = days.groupby("id").cumcount()
    days["island"] = days["login_date"] - pd.to_timedelta(days["rn"], unit="D")
    runs = days.groupby(["id", "island"]).size()
    long_ids = runs[runs >= 5].reset_index()["id"].unique()
    return accounts[accounts["id"].isin(long_ids)].sort_values("id")`

const SQL_LINES = SQL.split('\n')
const PY_LINES = PANDAS.split('\n')

function lineOf(lines, text) {
  const index = lines.findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`Missing line: ${text}`)
  return index + 1
}

export const sql = SQL
export const python = PANDAS
export const code = SQL_LINES.map((text, index) => ({ line: index + 1, text }))

const frame = (phase, sqlText, pyText, message, columns, rows) => ({
  phase,
  activeLine: lineOf(SQL_LINES, sqlText),
  pythonLine: lineOf(PY_LINES, pyText),
  message,
  columns: [...columns],
  rows: rows.map(row => ({ ...row })),
})

const DATE = /^\d{4}-\d{2}-\d{2}$/

// Length of the longest run of consecutive calendar days; repeated logins on one day count once.
function longestRun(dates) {
  const days = [...new Set(dates)].sort().map(day => Date.parse(`${day}T00:00:00Z`) / 86400000)
  let best = 0
  let run = 0
  let previous = null
  for (const day of days) {
    run = previous !== null && day === previous + 1 ? run + 1 : 1
    best = Math.max(best, run)
    previous = day
  }
  return best
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || !Array.isArray(input.Accounts) || !Array.isArray(input.Logins)) throw new Error('Use Accounts and Logins lists.')
  if (input.Accounts.length > 12 || input.Logins.length > 60) throw new Error('Use at most 12 accounts and 60 logins.')
  const Accounts = input.Accounts.map(row => {
    if (!row || !Number.isInteger(row.id) || typeof row.name !== 'string') throw new Error('Each account needs an integer id and a name.')
    return { id: row.id, name: row.name }
  })
  const Logins = input.Logins.map(row => {
    if (!row || !Number.isInteger(row.id) || typeof row.login_date !== 'string' || !DATE.test(row.login_date) || Number.isNaN(Date.parse(row.login_date))) {
      throw new Error('Each login needs an integer id and a YYYY-MM-DD login_date.')
    }
    return { id: row.id, login_date: row.login_date }
  })
  return { Accounts, Logins }
}

export function buildTrace({ Accounts, Logins }) {
  const frames = [frame('load', 'FROM Accounts', 'def active_users', `Read ${Accounts.length} accounts and ${Logins.length} logins.`, ['id', 'name'], Accounts)]
  const ordered = [...Accounts].sort((a, b) => a.id - b.id)
  const scanned = []
  const result = []
  for (const account of ordered) {
    const dates = Logins.filter(row => row.id === account.id).map(row => row.login_date)
    const best = longestRun(dates)
    const keep = best >= 5
    scanned.push({ id: account.id, name: account.name, longest_run: best })
    if (keep) result.push({ id: account.id, name: account.name })
    frames.push(frame('scan', 'HAVING', 'cumcount',
      `${account.name} has a longest run of ${best} days, so ${keep ? 'keep' : 'drop'} the account.`,
      ['id', 'name', 'longest_run'], scanned))
  }
  frames.push(frame('done', 'ORDER BY', 'return accounts', `Returned ${result.length} active accounts in id order.`, ['id', 'name'], result))
  return { input: { Accounts, Logins }, result, frames }
}
