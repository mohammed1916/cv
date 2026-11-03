const PRIMES = new Set([2, 3, 5, 7, 11, 13, 17])

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with a coins pair.')
  const { coins } = input
  if (!Array.isArray(coins) || coins.length !== 2) throw new Error('coins is a pair of two distinct primes.')
  const [a, b] = coins
  if (![a, b].every(v => PRIMES.has(v))) throw new Error('Each coin is a prime from 2 to 17 (visualization cap).')
  if (a === b) throw new Error('The two coins must be distinct.')
  return { coins: [a, b] }
}

// Two distinct primes are coprime, so every cost from a*b onward is payable. Mark each cost up to a*b:
// x is payable when x - a or x - b is payable. The largest unpayable cost below a*b is the answer.
export function buildTrace({ coins }) {
  const [a, b] = coins
  const limit = a * b
  const reach = Array(limit + 1).fill(false)
  reach[0] = true
  let largest = 0
  const frames = []
  const push = (phase, pythonLine, text, x, message) =>
    frames.push({ phase, pythonLine, activeLine: L(text), x, reach: reach.slice(0, Math.min(x, limit) + 1), largest, a, b, limit, message })

  push('start', 4, 'reach[0] is true', 0, `Coins ${a} and ${b}; check every cost from 1 to ${limit}.`)
  for (let x = 1; x <= limit; x++) {
    const payable = (x >= a && reach[x - a]) || (x >= b && reach[x - b])
    reach[x] = payable
    if (payable) {
      push('reach', 8, 'x is reachable', x, `${x} is payable: it is ${x >= a && reach[x - a] ? `${a} more than a payable cost` : `${b} more than a payable cost`}.`)
    } else {
      largest = x
      push('gap', 10, 'remember the largest unreachable', x, `${x} cannot be paid with ${a} and ${b}, so it is the largest gap so far.`)
    }
  }
  push('done', 11, 'return the largest unreachable', limit, `The most expensive item that cannot be bought is ${largest}.`)
  return { input: { coins }, result: largest, frames }
}

export const code = `largest positive cost that two prime coins cannot make
  reach[0] is true and every other cost starts unpayable
  for each cost x from 1 up to a times b
    x is reachable when x minus a or x minus b is reachable
    otherwise remember the largest unreachable x
  return the largest unreachable x`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => {
  const index = code.findIndex(c => c.text.includes(s))
  if (index < 0) throw new Error(`Missing pseudocode line: ${s}`)
  return index + 1
}

export const python = `def most_expensive_unbuyable(a, b):
    limit = a * b
    reach = [False] * (limit + 1)
    reach[0] = True
    largest = 0
    for x in range(1, limit + 1):
        if (x >= a and reach[x - a]) or (x >= b and reach[x - b]):
            reach[x] = True
        else:
            largest = x
    return largest
`
