export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || typeof input.customers !== 'string' || !/^[YN]{1,12}$/.test(input.customers)) throw new Error('Use an object with customers: a string of 1 to 12 characters, each Y or N.')
  return { customers: input.customers }
}

export function buildTrace(input) {
  const { customers } = input
  const n = customers.length
  // Closing at hour 0 penalises every Y customer.
  let penalty = 0
  for (const c of customers) if (c === 'Y') penalty++
  let best = penalty
  let bestHour = 0
  const frames = [{ phase: 'start', activeLine: L('set penalty to the number of Y'), index: -1, hour: 0, penalty, best, bestHour, message: `Closing at hour 0 gives penalty ${penalty}.` }]
  for (let i = 0; i < n; i++) {
    // Moving the closing hour past customer i: a Y leaves the closed side, an N joins the open side.
    penalty += customers[i] === 'Y' ? -1 : 1
    if (penalty < best) {
      best = penalty
      bestHour = i + 1
    }
    frames.push({ phase: 'hour', activeLine: L('if penalty is less than best'), index: i, hour: i + 1, penalty, best, bestHour, message: `Closing at hour ${i + 1} gives penalty ${penalty}. Best ${best} at hour ${bestHour}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return best_hour'), index: n, hour: n, penalty, best, bestHour, message: `Earliest hour with the minimum penalty: ${bestHour}.` })
  return { input, result: bestHour, frames }
}

export const code = `earliest hour with the minimum penalty
  set penalty to the number of Y customers, and best to penalty
  set best_hour to 0
  for each customer i from 0 to n minus 1 do
    if customer i is Y then subtract 1 from penalty, otherwise add 1 to penalty
    if penalty is less than best then update best and best_hour to i plus 1
  return best_hour`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def earliest_closing_hour(customers):
    penalty = customers.count('Y')
    best = penalty
    best_hour = 0
    for i, ch in enumerate(customers):
        penalty += -1 if ch == 'Y' else 1
        if penalty < best:
            best = penalty
            best_hour = i + 1
    return best_hour
`
