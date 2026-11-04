// Teaching rule: a user is eligible when some purchase has a time inside [start, end] (both ends included)
// and an amount of at least minAmount. A user with several qualifying purchases is listed once.

export const phases = [
  { id: 'start', label: 'Start', description: 'Begin with no eligible users.' },
  { id: 'scan', label: 'Read row', description: 'Read the next purchase.' },
  { id: 'skip', label: 'Skip', description: 'The purchase is outside the interval, or its amount is too small.' },
  { id: 'qualify', label: 'Eligible', description: 'This purchase qualifies, so its user is eligible.' },
  { id: 'repeat', label: 'Already in', description: 'This user already qualified from an earlier purchase.' },
  { id: 'done', label: 'Result', description: 'Return the eligible users in ascending order.' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with purchases, start, end and minAmount.')
  const { purchases, start, end, minAmount } = input
  if (!Array.isArray(purchases) || purchases.length < 1 || purchases.length > 12) throw new Error('purchases is a list of 1 to 12 rows.')
  for (const row of purchases) {
    if (!Array.isArray(row) || row.length !== 3 || !row.every(Number.isInteger)) throw new Error('Each purchase is [user_id, time_stamp, amount] with whole numbers.')
    if (row[0] < 1 || row[2] < 0) throw new Error('user_id must be at least 1 and amount cannot be negative.')
  }
  for (const [name, value] of [['start', start], ['end', end], ['minAmount', minAmount]]) {
    if (!Number.isInteger(value)) throw new Error(`${name} must be a whole number.`)
  }
  if (start > end) throw new Error('start must not be after end.')
  if (minAmount < 0) throw new Error('minAmount is not negative.')
  return { purchases, start, end, minAmount }
}

function snapshotOf(eligible, row) {
  return { row, result: [...eligible] }
}

export function buildTrace({ purchases, start, end, minAmount }) {
  const frames = []
  const eligible = new Set()
  frames.push({ pythonLine: 2, phase: 'start', activeLine: L('const eligible = new Set()'), snapshot: snapshotOf(eligible, null), message: 'No user is eligible yet.' })

  for (const [user, time, amount] of purchases) {
    const row = { user, time, amount }
    frames.push({ pythonLine: 3, phase: 'scan', activeLine: L('for (const [user_id'), snapshot: snapshotOf(eligible, row), message: `Read user ${user} at time ${time} for ${amount}.` })
    if (time < start || time > end) {
      frames.push({ pythonLine: 4, phase: 'skip', activeLine: L('if (time_stamp < startDate'), snapshot: snapshotOf(eligible, row), message: `Time ${time} is outside ${start} to ${end}, so skip it.` })
      continue
    }
    if (amount < minAmount) {
      frames.push({ pythonLine: 6, phase: 'skip', activeLine: L('if (amount >= minAmount)'), snapshot: snapshotOf(eligible, row), message: `Amount ${amount} is below ${minAmount}, so this purchase does not count.` })
      continue
    }
    if (eligible.has(user)) {
      frames.push({ pythonLine: 7, phase: 'repeat', activeLine: L('eligible.add(user_id)'), snapshot: snapshotOf(eligible, row), message: `User ${user} already qualified, so the set does not change.` })
      continue
    }
    eligible.add(user)
    frames.push({ pythonLine: 7, phase: 'qualify', activeLine: L('eligible.add(user_id)'), snapshot: snapshotOf(eligible, row), message: `User ${user} has a purchase of ${amount} inside the interval, so the user is eligible.` })
  }

  const result = [...eligible].sort((a, b) => a - b)
  frames.push({ pythonLine: 8, phase: 'done', activeLine: L('return [...eligible]'), snapshot: snapshotOf(eligible, null), message: `Eligible users: ${result.length ? result.join(', ') : 'none'}.` })
  return { input: { purchases, start, end, minAmount }, result, frames }
}

export const code = `function eligibleUsers(purchases, startDate, endDate, minAmount) {
  const eligible = new Set()
  for (const [user_id, time_stamp, amount] of purchases) {
    if (time_stamp < startDate || time_stamp > endDate) continue
    if (amount >= minAmount) eligible.add(user_id)
  }
  return [...eligible].sort((a, b) => a - b)
}`.split('\n').map((text, index) => ({ line: index + 1, text }))

const L = s => {
  const line = code.findIndex(c => c.text.includes(s)) + 1
  if (line < 1) throw new Error(`Missing code line: ${s}`)
  return line
}

export const python = `def eligible_users(purchases, start, end, min_amount):
    eligible = set()
    for user_id, time_stamp, amount in purchases:
        if time_stamp < start or time_stamp > end:
            continue
        if amount >= min_amount:
            eligible.add(user_id)
    return sorted(eligible)
`
