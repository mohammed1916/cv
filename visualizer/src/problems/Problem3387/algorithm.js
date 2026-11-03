const CODE = /^[A-Z]{1,3}$/

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with initialCurrency, pairs1, rates1, pairs2 and rates2.')
  const { initialCurrency, pairs1, rates1, pairs2, rates2 } = input
  if (typeof initialCurrency !== 'string' || !CODE.test(initialCurrency)) throw new Error('initialCurrency is 1 to 3 uppercase letters.')
  for (const [pairs, rates] of [[pairs1, rates1], [pairs2, rates2]]) {
    if (!Array.isArray(pairs) || !Array.isArray(rates) || pairs.length !== rates.length || pairs.length > 5) throw new Error('Each day has at most 5 pairs with one rate per pair.')
    pairs.forEach(([a, b]) => { if (!CODE.test(a) || !CODE.test(b)) throw new Error('Currency codes are 1 to 3 uppercase letters.') })
    if (!rates.every(r => typeof r === 'number' && r > 0 && r <= 10)) throw new Error('Rates are positive numbers up to 10.')
  }
  return { initialCurrency, pairs1, rates1, pairs2, rates2 }
}

// Each pair works both ways: a to b at rate r, and b to a at 1 / r.
function edges(pairs, rates) {
  return pairs.flatMap(([a, b], i) => [[a, b, rates[i]], [b, a, 1 / rates[i]]])
}

function relaxForward(start, list, names) {
  const best = new Map(names.map(name => [name, 0]))
  best.set(start, 1)
  for (let round = 0; round < names.length; round++) {
    for (const [from, to, rate] of list) {
      const candidate = best.get(from) * rate
      if (candidate > best.get(to)) best.set(to, candidate)
    }
  }
  return best
}

function relaxBackward(target, list, names) {
  // best[x] = most target currency one unit of x can become on this day
  const best = new Map(names.map(name => [name, 0]))
  best.set(target, 1)
  for (let round = 0; round < names.length; round++) {
    for (const [from, to, rate] of list) {
      const candidate = rate * best.get(to)
      if (candidate > best.get(from)) best.set(from, candidate)
    }
  }
  return best
}

function namesOf({ initialCurrency, pairs1, pairs2 }) {
  return [...new Set([initialCurrency, ...pairs1.flat(), ...pairs2.flat()])]
}

export function buildTrace(input) {
  const { initialCurrency, pairs1, rates1, pairs2, rates2 } = input
  const names = namesOf(input)
  const list1 = edges(pairs1, rates1)
  const list2 = edges(pairs2, rates2)
  const day1 = relaxForward(initialCurrency, list1, names)
  const day2 = relaxBackward(initialCurrency, list2, names)
  const frames = []
  frames.push({ pythonLine: P('day1 ='), phase: 'day1', activeLine: L('best amount on day 1'), at: -1, rows: [], message: `Starting with 1 ${initialCurrency}; find the best day 1 amount of each currency.` })
  const rows = names.map(name => ({ name, day1: day1.get(name), day2: day2.get(name), product: day1.get(name) * day2.get(name) }))
  frames.push({ pythonLine: P('day2 ='), phase: 'day2', activeLine: L('best return on day 2'), at: -1, rows, message: 'For each currency, the best day 2 route back to the initial currency.' })
  const result = Math.max(...rows.map(r => r.product))
  const winner = rows.find(r => r.product === result)
  frames.push({ pythonLine: P('return best'), phase: 'done', activeLine: L('return the largest'), at: -1, rows, result, message: `Best: go through ${winner.name}, ending with ${result.toFixed(4)} ${initialCurrency}.` })
  return { input, result, frames }
}

export const code = `maximum amount of the initial currency after two days
  day1 = best amount of each currency reached from the initial one on day 1
  day2 = best amount of the initial currency reached from each currency on day 2
  return the largest day1[c] times day2[c]`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def max_amount(initial, pairs1, rates1, pairs2, rates2):
    day1 = relax_forward(initial, edges(pairs1, rates1))
    day2 = relax_backward(initial, edges(pairs2, rates2))
    return max(day1[c] * day2[c] for c in day1)`
const P = s => python.split('\n').findIndex(line => line.includes(s)) + 1
