export function parseInput(text) {
  const obj = JSON.parse(text)
  if (!obj || typeof obj !== 'object' || !Array.isArray(obj.prices) || !Array.isArray(obj.discounts)) throw new Error('Use an object with prices and discounts arrays.')
  const { prices, discounts } = obj
  if (prices.length < 1 || prices.length > 8 || discounts.length < 1 || discounts.length > 8) throw new Error('Use 1 to 8 prices and 1 to 8 discounts for the visualization.')
  if (prices.some(v => !Number.isInteger(v) || v < 1 || v > 100000)) throw new Error('Each price must be an integer from 1 to 100000.')
  if (discounts.some(v => !Number.isInteger(v) || v < 1 || v > 100)) throw new Error('Each discount must be an integer from 1 to 100.')
  return { prices, discounts }
}

export function buildTrace(input) {
  const { prices, discounts } = input
  const p = [...prices].sort((x, y) => y - x)
  const d = [...discounts].sort((x, y) => y - x)
  // Work in hundredths so the total stays an integer until the final division.
  let total = 100 * p.reduce((sum, v) => sum + v, 0)
  const frames = [{ phase: 'start', activeLine: L('set total to 100 times'), index: -1, price: null, discount: null, total, message: 'Start with every price at full value, in hundredths.' }]
  const k = Math.min(p.length, d.length)
  for (let i = 0; i < k; i++) {
    total -= p[i] * d[i]
    frames.push({ phase: 'apply', activeLine: L('subtract prices[i] times'), index: i, price: p[i], discount: d[i], total, message: `Apply ${d[i]}% to ${p[i]}, saving ${p[i] * d[i] / 100}.` })
  }
  const result = total / 100
  frames.push({ phase: 'done', activeLine: L('return total divided by 100'), index: -1, price: null, discount: null, total, message: `Minimum total price: ${result}.` })
  return { input, result, frames }
}

export const code = `minimum total price after applying discounts(prices, discounts)
  sort prices from largest to smallest
  sort discounts from largest to smallest
  set total to 100 times the sum of prices
  for each position i that both lists have do
    subtract prices[i] times discounts[i] from total
  return total divided by 100`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def min_total_price(prices, discounts):
    p = sorted(prices, reverse=True)
    d = sorted(discounts, reverse=True)
    total = 100 * sum(p)
    for i in range(min(len(p), len(d))):
        total -= p[i] * d[i]
    return total / 100
`
