export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with n and limit.')
  const { n, limit } = input
  if (!Number.isInteger(n) || n < 0 || n > 30) throw new Error('n is an integer from 0 to 30.')
  if (!Number.isInteger(limit) || limit < 0 || limit > 30) throw new Error('limit is an integer from 0 to 30.')
  return { n, limit }
}

// Fix the first child's amount a. The other two amounts b and c must add to rest = n - a,
// with b in [max(0, rest - limit), min(limit, rest)] so that c = rest - b also stays within the limit.
export function buildTrace({ n, limit }) {
  const frames = []
  let total = 0
  const push = (phase, pythonLine, text, state, message) =>
    frames.push({ phase, pythonLine, activeLine: L(text), total, ...state, message })

  push('start', 2, 'total is zero', { a: -1, rest: null, low: null, high: null, count: 0 }, `Split ${n} candies with at most ${limit} for each child.`)
  for (let a = 0; a <= Math.min(limit, n); a++) {
    const rest = n - a
    const low = Math.max(0, rest - limit)
    const high = Math.min(limit, rest)
    const count = high >= low ? high - low + 1 : 0
    push('window', 6, 'high is the smaller', { a, rest, low, high, count },
      count > 0 ? `First child takes ${a}; the second child can take ${low} to ${high}, which is ${count} ways.`
        : `First child takes ${a}; no second amount keeps the third child within ${limit}.`)
    total += count
    push('add', 7, 'add the count', { a, rest, low, high, count }, `Running total is ${total}.`)
  }
  push('done', 9, 'return total', { a: -1, rest: null, low: null, high: null, count: 0 }, `There are ${total} valid splits.`)
  return { input: { n, limit }, result: total, frames }
}

export const code = `ways to split n candies among three children with at most limit each
  total is zero
  for each amount a for the first child from zero to the smaller of limit and n
    rest is n minus a
    low is the larger of zero and rest minus limit
    high is the smaller of limit and rest
    add the count of second amounts, high minus low plus one, when the range is not empty
  return total`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => {
  const index = code.findIndex(c => c.text.includes(s))
  if (index < 0) throw new Error(`Missing pseudocode line: ${s}`)
  return index + 1
}

export const python = `def distribute_candies(n, limit):
    total = 0
    for a in range(min(limit, n) + 1):
        rest = n - a
        low = max(0, rest - limit)
        high = min(limit, rest)
        if high >= low:
            total += high - low + 1
    return total
`
