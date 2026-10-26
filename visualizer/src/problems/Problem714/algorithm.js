export function parseInput(text) {
  const data = JSON.parse(text)
  const { prices, fee } = data ?? {}
  if (!Array.isArray(prices) || prices.length < 1 || prices.length > 20000 || prices.some(p => !Number.isInteger(p) || p < 1 || p > 50000)) throw new Error('prices must be 1–20,000 integers from 1 to 50,000.')
  if (!Number.isInteger(fee) || fee < 0 || fee > 50000) throw new Error('fee must be an integer from 0 to 50,000.')
  return { prices, fee }
}

// Two states per day: cash (not holding) and hold (holding one share). Selling pays the fee.
export function buildTrace({ prices, fee }) {
  let cash = 0, hold = -prices[0]
  const frames = [{ phase: 'start', day: 0, cash, hold, activeLine: 2, message: `Day 0: holding costs ${prices[0]}; holding nothing earns 0.` }]
  for (let i = 1; i < prices.length; i++) {
    const nextCash = Math.max(cash, hold + prices[i] - fee)
    const nextHold = Math.max(hold, cash - prices[i])
    cash = nextCash; hold = nextHold
    frames.push({ phase: 'day', day: i, cash, hold, price: prices[i], activeLine: 6, message: `Day ${i} at ${prices[i]}: best cash ${cash}, best hold ${hold}.` })
  }
  const result = cash
  frames.push({ phase: 'done', day: prices.length - 1, cash, hold, result, activeLine: 8, message: `Best profit: ${result}.` })
  return { input: { prices, fee }, result, frames }
}

export const code = `def maxProfit(prices, fee):
    cash, hold = 0, -prices[0]
    for p in prices[1:]:
        cash, hold = max(cash, hold + p - fee), max(hold, cash - p)
    return cash`.split('\n').map((text, index) => ({ line: index + 1, text }))
