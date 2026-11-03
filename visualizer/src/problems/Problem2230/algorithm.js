// Teaching rule: a user is eligible when, inside [start, end], they have at least minCount purchases and a total of at least minTotal.

export const phases = [
  { id: 'start', label: 'Totals', description: 'Begin with no user totals.' },
  { id: 'scan', label: 'Read row', description: 'Read the next purchase.' },
  { id: 'skip', label: 'Outside', description: 'The purchase time is outside the interval.' },
  { id: 'include', label: 'Add', description: 'Add the purchase to its user total.' },
  { id: 'tally', label: 'Check user', description: 'Compare a user total with both thresholds.' },
  { id: 'reject', label: 'Too few', description: 'This user misses a threshold.' },
  { id: 'qualify', label: 'Eligible', description: 'This user meets both thresholds.' },
  { id: 'done', label: 'Result', description: 'Return the eligible users in ascending order.' },
]

const INTEGER = /^-?\d+$/

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with purchases, start, end, minCount and minTotal.')
  const { purchases, start, end, minCount, minTotal } = input
  if (!Array.isArray(purchases) || purchases.length < 1 || purchases.length > 12) throw new Error('purchases is a list of 1 to 12 rows.')
  for (const row of purchases) {
    if (!Array.isArray(row) || row.length !== 3 || !row.every(Number.isInteger)) throw new Error('Each purchase is [user_id, time_stamp, amount] with whole numbers.')
    if (row[0] < 1 || row[2] < 0) throw new Error('user_id must be at least 1 and amount cannot be negative.')
  }
  for (const [name, value] of [['start', start], ['end', end], ['minCount', minCount], ['minTotal', minTotal]]) {
    if (!Number.isInteger(value)) throw new Error(`${name} must be a whole number.`)
  }
  if (start > end) throw new Error('start must not be after end.')
  if (minCount < 1 || minTotal < 0) throw new Error('minCount is at least 1 and minTotal is not negative.')
  return { purchases, start, end, minCount, minTotal }
}

function snapshotOf(totals, row, result) {
  return {
    row,
    totals: [...totals.entries()].map(([user, [count, total]]) => ({ user, count, total })),
    result: [...result],
  }
}

export function buildTrace({ purchases, start, end, minCount, minTotal }) {
  const frames = []
  const totals = new Map()
  const result = []
  frames.push({ pythonLine: 2, phase: 'start', activeLine: L('build the totals'), snapshot: snapshotOf(totals, null, result), message: 'No user has a total yet.' })

  for (const [user, time, amount] of purchases) {
    const row = { user, time, amount }
    frames.push({ pythonLine: 3, phase: 'scan', activeLine: L('for each purchase'), snapshot: snapshotOf(totals, row, result), message: `Read user ${user} at time ${time} for ${amount}.` })
    if (time < start || time > end) {
      frames.push({ pythonLine: 4, phase: 'skip', activeLine: L('if the time is outside'), snapshot: snapshotOf(totals, row, result), message: `Time ${time} is outside ${start} to ${end}, so skip it.` })
      continue
    }
    const [count, total] = totals.get(user) || [0, 0]
    totals.set(user, [count + 1, total + amount])
    frames.push({ pythonLine: 7, phase: 'include', activeLine: L('add one purchase'), snapshot: snapshotOf(totals, row, result), message: `User ${user} now has ${count + 1} purchase${count + 1 === 1 ? '' : 's'} totalling ${total + amount}.` })
  }

  for (const [user, [count, total]] of totals) {
    frames.push({ pythonLine: 9, phase: 'tally', activeLine: L('for each user'), snapshot: snapshotOf(totals, null, result), message: `Check user ${user}: ${count} purchases, total ${total}.` })
    if (count >= minCount && total >= minTotal) {
      result.push(user)
      frames.push({ pythonLine: 11, phase: 'qualify', activeLine: L('if count is at least minCount'), snapshot: snapshotOf(totals, null, result), message: `User ${user} meets both thresholds.` })
    } else {
      frames.push({ pythonLine: 10, phase: 'reject', activeLine: L('if count is at least minCount'), snapshot: snapshotOf(totals, null, result), message: `User ${user} misses a threshold.` })
    }
  }

  result.sort((a, b) => a - b)
  frames.push({ pythonLine: 12, phase: 'done', activeLine: L('return the result sorted'), snapshot: snapshotOf(totals, null, result), message: `Eligible users: ${result.length ? result.join(', ') : 'none'}.` })
  return { input: { purchases, start, end, minCount, minTotal }, result, frames }
}

export const code = `eligible users for purchases inside an interval
  build the totals of count and sum per user
  for each purchase (user, time, amount)
    if the time is outside start to end then skip it
    add one purchase and the amount to that user total
  result = empty list
  for each user total
    if count is at least minCount and total is at least minTotal then add the user
  return the result sorted ascending`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => {
  const line = code.findIndex(c => c.text.includes(s))
  if (line < 0) throw new Error(`Missing code line: ${s}`)
  return line + 1
}

export const python = `def eligible_users(purchases, start, end, min_count, min_total):
    totals = {}
    for user, time, amount in purchases:
        if time < start or time > end:
            continue
        count, total = totals.get(user, (0, 0))
        totals[user] = (count + 1, total + amount)
    result = []
    for user, (count, total) in totals.items():
        if count >= min_count and total >= min_total:
            result.append(user)
    return sorted(result)
`
