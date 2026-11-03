export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with a prices list.')
  const { prices } = input
  if (!Array.isArray(prices) || prices.length < 1 || prices.length > 12) throw new Error('prices has 1 to 12 entries.')
  if (!prices.every(p => Number.isInteger(p) && p >= 1 && p <= 30)) throw new Error('Each price is an integer from 1 to 30.')
  return { prices }
}

export function buildTrace({ prices }) {
  const sums = new Map()
  const frames = []
  let best = 0
  let bestKey = null
  const snapshot = () => [...sums].map(([key, total]) => ({ key, total }))
  const push = (phase, pythonLine, text, index, key, message) =>
    frames.push({ phase, pythonLine, activeLine: L(text), index, key, sums: snapshot(), best, bestKey, message })

  push('start', 2, 'set sums to an empty map', -1, null, 'Start with no groups and a best total of 0.')
  for (let i = 0; i < prices.length; i++) {
    const key = prices[i] - i
    push('key', 5, 'key is p minus i', i, key, `Index ${i} has price ${prices[i]}, so its key is ${prices[i]} minus ${i}, which is ${key}.`)
    sums.set(key, (sums.get(key) ?? 0) + prices[i])
    push('add', 6, 'add p to sums', i, key, `Group ${key} now totals ${sums.get(key)}.`)
    if (sums.get(key) > best) {
      best = sums.get(key)
      bestKey = key
      push('best', 7, 'best is the larger', i, key, `New best total ${best} from group ${key}.`)
    }
  }
  push('done', 8, 'return best', -1, null, `The best group totals ${best}.`)
  return { input: { prices }, result: best, frames }
}

export const code = `maximum linear stock score
  set sums to an empty map and best to 0
  for each index i with price p
    key is p minus i
    add p to sums at key
    best is the larger of best and sums at key
  return best`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => {
  const index = code.findIndex(c => c.text.includes(s))
  if (index < 0) throw new Error(`Missing pseudocode line: ${s}`)
  return index + 1
}

export const python = `def max_linear_stock_score(prices):
    sums = {}
    best = 0
    for i, price in enumerate(prices):
        key = price - i
        sums[key] = sums.get(key, 0) + price
        best = max(best, sums[key])
    return best
`
