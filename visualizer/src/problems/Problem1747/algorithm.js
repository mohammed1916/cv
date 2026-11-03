// Knowledge-derived SQL walkthrough. The sample rows are invented for this visualization.
export const phases = [
  { id: 'load', label: 'Load', description: 'Read the login sessions.' },
  { id: 'pair', label: 'Pair', description: 'Compare two sessions of one account that used different IP addresses.' },
  { id: 'done', label: 'Result', description: 'Return each account that has an overlapping pair.' },
]

export const sql = `SELECT DISTINCT a.account_id
FROM LogInfo a
JOIN LogInfo b
  ON a.account_id = b.account_id
 AND a.ip_address <> b.ip_address
 AND a.login <= b.logout
 AND b.login <= a.logout
ORDER BY a.account_id`

export const code = sql.split('\n').map((text, index) => ({ line: index + 1, text }))
const SQL = key => {
  const index = code.findIndex(line => line.text.includes(key))
  if (index < 0) throw new Error(`Missing SQL line: ${key}`)
  return index + 1
}

export const python = `def banned_accounts(log_info):
    pairs = log_info.merge(log_info, on="account_id", suffixes=("_a", "_b"))
    pairs = pairs[pairs["ip_address_a"] != pairs["ip_address_b"]]
    overlap = (pairs["login_a"] <= pairs["logout_b"]) & (pairs["login_b"] <= pairs["logout_a"])
    ids = pairs.loc[overlap, "account_id"].drop_duplicates().sort_values()
    return ids.to_frame()`
const PY_LINES = python.split('\n')
const PY = key => {
  const index = PY_LINES.findIndex(line => line.includes(key))
  if (index < 0) throw new Error(`Missing Python line: ${key}`)
  return index + 1
}

const COLUMNS = ['account_id', 'ip_address', 'login', 'logout']
const frame = (phase, sqlKey, pyKey, message, columns, rows) => ({
  phase, activeLine: SQL(sqlKey), pythonLine: PY(pyKey), message, columns, rows: rows.map(row => ({ ...row })),
})

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!Array.isArray(input) || input.length < 1 || input.length > 12) throw new Error('Use 1 to 12 login rows.')
  return input.map(row => {
    if (!row || typeof row !== 'object' || COLUMNS.some(column => !(column in row))) throw new Error(`Each row needs ${COLUMNS.join(', ')}.`)
    if (!Number.isInteger(row.login) || !Number.isInteger(row.logout) || row.login > row.logout) throw new Error('login must be a whole number no later than logout.')
    return Object.fromEntries(COLUMNS.map(column => [column, row[column]]))
  })
}

export function buildTrace(input) {
  const frames = [frame('load', 'FROM LogInfo a', 'def ', 'Load the login sessions.', COLUMNS, input)]
  const accounts = [...new Set(input.map(row => row.account_id))].sort((x, y) => x - y)
  const result = []
  for (const account of accounts) {
    const sessions = input.filter(row => row.account_id === account)
    let flagged = false
    for (let i = 0; i < sessions.length; i++) {
      for (let j = i + 1; j < sessions.length; j++) {
        const a = sessions[i]
        const b = sessions[j]
        if (a.ip_address === b.ip_address) continue
        const overlap = a.login <= b.logout && b.login <= a.logout
        if (overlap) flagged = true
        frames.push(frame('pair', 'ON a.account_id', 'overlap =', `Account ${account}: IP ${a.ip_address} [${a.login}, ${a.logout}] and IP ${b.ip_address} [${b.login}, ${b.logout}] ${overlap ? 'overlap or touch' : 'do not overlap'}.`, COLUMNS, [a, b]))
      }
    }
    if (flagged) result.push({ account_id: account })
  }
  frames.push(frame('done', 'ORDER BY a.account_id', 'return', `Return ${result.length} banned account${result.length === 1 ? '' : 's'}.`, ['account_id'], result))
  return { input, result, frames }
}
