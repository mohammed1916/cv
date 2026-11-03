export const phases = [
  { id: 'start', label: 'Start', description: 'Begin with a best wealth of 0, since no balance is negative.' },
  { id: 'sum', label: 'Sum a customer', description: 'Add every bank balance of one customer to get that customer total.' },
  { id: 'compare', label: 'Compare best', description: 'Keep the larger of the best total so far and this customer total.' },
  { id: 'done', label: 'Complete', description: 'Return the largest customer total.' },
]

export function parseInput(text) {
  const accounts = JSON.parse(text)
  if (!Array.isArray(accounts) || accounts.length < 1 || accounts.length > 30) throw new Error('Enter a JSON array of 1 to 30 customers, each a list of non-negative balances.')
  accounts.forEach((row, i) => {
    if (!Array.isArray(row) || row.length < 1 || row.length > 30 || !row.every(v => Number.isInteger(v) && v >= 0 && v <= 100)) {
      throw new Error(`Customer ${i + 1}: enter 1 to 30 whole-number balances from 0 to 100.`)
    }
  })
  return accounts
}

// Pseudocode line numbers used by activeLine, and Python line numbers used by pythonLine.
const C = { start: 2, loop: 3, total: 4, check: 5, keep: 5, done: 6 }
const PY = { start: 2, loop: 3, total: 4, check: 5, keep: 6, done: 7 }

export function buildTrace(accounts) {
  const frames = []
  const totals = []
  let best = 0
  let bestIndex = null
  const push = (phase, line, message, snapshot) => frames.push({ phase, activeLine: C[line], pythonLine: PY[line], snapshot, message })

  push('start', 'start', `${accounts.length} customers. Start with a best total of 0.`, { row: null, total: null, best, bestIndex, totals: [] })
  accounts.forEach((row, i) => {
    const total = row.reduce((sum, v) => sum + v, 0)
    totals.push(total)
    push('sum', 'total', `Customer ${i + 1} holds ${row.join(' + ')} = ${total}.`, { row: i, total, best, bestIndex, totals: [...totals] })
    if (total > best) {
      best = total
      bestIndex = i
      push('compare', 'keep', `${total} beats the previous best, so the best becomes customer ${i + 1}.`, { row: i, total, best, bestIndex, totals: [...totals] })
    } else {
      push('compare', 'check', `${total} does not beat the best of ${best}, so the best stays unchanged.`, { row: i, total, best, bestIndex, totals: [...totals] })
    }
  })
  push('done', 'done', `Return ${best}, the wealth of customer ${bestIndex + 1}.`, { row: bestIndex, total: best, best, bestIndex, totals: [...totals] })
  return { input: accounts, result: best, frames }
}

export const code = `richest (accounts):
  best = 0
  for each customer row in accounts:
    total = sum of the row
    if total > best:
      best = total
  return best`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def max_wealth(accounts):
    best = 0
    for row in accounts:
        total = sum(row)
        if total > best:
            best = total
    return best
`
