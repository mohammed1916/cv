// Teaching rule (official signature not verified): count distinct users with a purchase
// whose time_stamp is inside the inclusive interval and whose amount is at least minAmount.
const DATE = /^\d{4}-\d{2}-\d{2}$/

export const phases = [
  { id: 'start', label: 'Setup', description: 'Start with an empty set of user ids.' },
  { id: 'scan', label: 'Scan', description: 'Read one purchase row.' },
  { id: 'qualify', label: 'Qualify', description: 'The row is inside the interval and meets minAmount.' },
  { id: 'skip', label: 'Skip', description: 'The row fails the date or amount test.' },
  { id: 'done', label: 'Result', description: 'Report the number of distinct users.' },
]

export const sql = `SELECT COUNT(DISTINCT user_id) AS user_count
FROM Purchases
WHERE time_stamp BETWEEN :start_date AND :end_date
  AND amount >= :min_amount;`

export const code = `count distinct users with a qualifying purchase
  start an empty set of user ids
  for each purchase row
    if time_stamp is inside the interval and amount is at least minAmount
      add user_id to the set
    otherwise skip the row
  return the size of the set`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def count_eligible_users(purchases, start_date, end_date, min_amount):
    eligible = set()
    for user_id, time_stamp, amount in purchases:
        if start_date <= time_stamp <= end_date and amount >= min_amount:
            eligible.add(user_id)
    return len(eligible)
`

const PY_LINES = python.split('\n')
const L = text => {
  const index = code.findIndex(line => line.text.trim().startsWith(text))
  if (index < 0) throw new Error(`Missing pseudocode line: ${text}`)
  return index + 1
}
const P = text => {
  const index = PY_LINES.findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`Missing Python line: ${text}`)
  return index + 1
}

function isDate(text) {
  if (typeof text !== 'string' || !DATE.test(text)) return false
  const date = new Date(text)
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === text
}

const isWhole = (value, low, high) => Number.isInteger(value) && value >= low && value <= high

function validate(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with purchases, startDate, endDate and minAmount.')
  const { purchases, startDate, endDate, minAmount } = input
  if (!Array.isArray(purchases) || purchases.length < 1 || purchases.length > 10) throw new Error('purchases is a list of 1 to 10 rows.')
  const rows = purchases.map((row, index) => {
    if (!row || typeof row !== 'object' || !isWhole(row.user_id, 1, 99)) throw new Error(`Row ${index + 1} needs an integer user_id from 1 to 99.`)
    if (!isDate(row.time_stamp)) throw new Error(`Row ${index + 1} needs a real time_stamp such as 2024-01-31.`)
    if (!isWhole(row.amount, 0, 100)) throw new Error(`Row ${index + 1} needs an integer amount from 0 to 100.`)
    return { user_id: row.user_id, time_stamp: row.time_stamp, amount: row.amount }
  })
  if (!isDate(startDate) || !isDate(endDate)) throw new Error('startDate and endDate are real dates such as 2024-01-01.')
  if (startDate > endDate) throw new Error('startDate must not be after endDate.')
  if (!isWhole(minAmount, 0, 100)) throw new Error('minAmount is an integer from 0 to 100.')
  return { purchases: rows, startDate, endDate, minAmount }
}

export function parseInput(text) {
  return validate(JSON.parse(text))
}

export function buildTrace(raw) {
  const input = validate(raw)
  const { purchases, startDate, endDate, minAmount } = input
  const status = purchases.map(() => 'pending')
  const eligible = new Set()
  const frames = []
  const snap = (phase, activeLine, pythonLine, at, message) => frames.push({
    phase,
    activeLine: L(activeLine),
    pythonLine: P(pythonLine),
    at,
    message,
    rows: purchases.map((row, index) => ({ ...row, status: status[index] })),
    users: [...eligible].sort((a, b) => a - b),
  })

  snap('start', 'start an empty set', 'eligible = set()', -1,
    `Start with no users. The interval ${startDate} to ${endDate} includes both ends, and amount must be at least ${minAmount}.`)

  purchases.forEach((row, index) => {
    status[index] = 'scanning'
    snap('scan', 'for each purchase row', 'for user_id, time_stamp', index,
      `Row ${index + 1}: user ${row.user_id} on ${row.time_stamp} paid ${row.amount}.`)
    const inside = row.time_stamp >= startDate && row.time_stamp <= endDate
    const enough = row.amount >= minAmount
    if (inside && enough) {
      snap('qualify', 'if time_stamp is inside', 'if start_date', index,
        `${row.time_stamp} is inside the interval and ${row.amount} meets ${minAmount}.`)
      if (eligible.has(row.user_id)) {
        status[index] = 'repeat'
        snap('qualify', 'add user_id', 'eligible.add', index, `User ${row.user_id} is already counted, so the set does not grow.`)
      } else {
        eligible.add(row.user_id)
        status[index] = 'counted'
        snap('qualify', 'add user_id', 'eligible.add', index, `User ${row.user_id} joins the set; its size is now ${eligible.size}.`)
      }
    } else {
      status[index] = 'skipped'
      const reason = inside ? `Amount ${row.amount} is below ${minAmount}.` : `${row.time_stamp} is outside the interval.`
      snap('skip', 'otherwise skip', 'if start_date', index, `Row ${index + 1} is skipped. ${reason}`)
    }
  })

  const count = eligible.size
  snap('done', 'return the size', 'return len', -1,
    `Result: ${count} distinct user${count === 1 ? '' : 's'} with a qualifying purchase.`)
  return { input, result: count, frames }
}
