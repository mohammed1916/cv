// Knowledge-derived teaching model of a SQL check-and-count task. Not the official statement.
// Rule: an IPv4 string is valid when it has four dot-separated decimal octets, each 0 to 255 with no leading zero.
// Output: invalid ips with their row counts, most frequent first, then ip ascending.

const VALID = /^((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.){3}(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)$/

export const phases = [
  { id: 'load', label: 'Load', description: 'Read the logs table.' },
  { id: 'check', label: 'Check', description: 'Test each ip against the octet rules.' },
  { id: 'group', label: 'Group', description: 'Count the invalid rows for each ip.' },
  { id: 'order', label: 'Order', description: 'Sort by count, then ip.' },
]

export const sql = `SELECT ip, COUNT(*) AS invalid_count
FROM logs
WHERE NOT (ip REGEXP '^((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])[.]){3}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])$')
GROUP BY ip
ORDER BY invalid_count DESC, ip ASC;`

export const python = `def find_invalid_ips(logs):
    octet = r"(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])"
    valid = logs["ip"].str.fullmatch(octet + r"(\\." + octet + r"){3}")
    bad = logs[~valid]
    counts = bad.groupby("ip").size().reset_index(name="invalid_count")
    return counts.sort_values(["invalid_count", "ip"], ascending=[False, True])`

const sqlLines = sql.split('\n')
const pyLines = python.split('\n')
export const code = sqlLines.map((text, index) => ({ line: index + 1, text }))
function L(text) {
  const index = sqlLines.findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`No SQL line contains: ${text}`)
  return index + 1
}
function P(text) {
  const index = pyLines.findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`No Python line contains: ${text}`)
  return index + 1
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || !Array.isArray(input.logs) || input.logs.length > 12) throw new Error('Use an object with a logs list of at most 12 rows.')
  const logs = input.logs.map(row => {
    if (!Number.isInteger(row?.log_id) || typeof row.ip !== 'string' || !Number.isInteger(row.status_code)) throw new Error('Each log needs an integer log_id, a text ip and an integer status_code.')
    return { log_id: row.log_id, ip: row.ip, status_code: row.status_code }
  })
  return { logs }
}

// Names the first rule an ip breaks, or null when it is valid.
function reason(ip) {
  const parts = ip.split('.')
  if (parts.length !== 4) return 'does not have four octets'
  if (parts.some(part => !/^\d+$/.test(part))) return 'has a non-numeric octet'
  if (parts.some(part => part.length > 1 && part[0] === '0')) return 'has a leading zero'
  if (parts.some(part => Number(part) > 255)) return 'has an octet above 255'
  return null
}

const copy = list => list.map(row => ({ ...row }))

export function buildTrace(input) {
  const frames = []
  const bad = []
  frames.push({ phase: 'load', activeLine: L('FROM logs'), pythonLine: P('def find_invalid_ips'), message: `Loaded ${input.logs.length} log rows.`, rows: copy(input.logs) })
  for (const row of input.logs) {
    const valid = VALID.test(row.ip)
    if (!valid) bad.push({ log_id: row.log_id, ip: row.ip, status_code: row.status_code })
    frames.push({ phase: 'check', activeLine: L('WHERE NOT'), pythonLine: P('valid ='), message: `log ${row.log_id} ${row.ip}: ${valid ? 'valid, skipped' : `invalid, it ${reason(row.ip)}`}.`, rows: copy(bad) })
  }
  const counts = new Map()
  for (const row of bad) counts.set(row.ip, (counts.get(row.ip) || 0) + 1)
  const grouped = []
  for (const [ip, count] of counts) {
    grouped.push({ ip, invalid_count: count })
    frames.push({ phase: 'group', activeLine: L('GROUP BY'), pythonLine: P('counts ='), message: `${ip} appears ${count} time${count === 1 ? '' : 's'} as invalid.`, rows: copy(grouped) })
  }
  const result = [...grouped].sort((a, b) => b.invalid_count - a.invalid_count || (a.ip < b.ip ? -1 : a.ip > b.ip ? 1 : 0))
  frames.push({ phase: 'order', activeLine: L('ORDER BY'), pythonLine: P('return counts'), message: `Returned ${result.length} invalid ips in order.`, rows: copy(result) })
  return { input, result, frames }
}
