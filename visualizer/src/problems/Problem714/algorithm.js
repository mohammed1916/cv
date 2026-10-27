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

export const code = `set cash to 0 and hold to the negative of the first price
for each later price
  compute the new cash as the larger of cash and hold plus price minus fee (sell today)
  compute the new hold as the larger of hold and the previous cash minus price (buy today)
  replace cash and hold with the new values
return cash`.split('\n').map((text, index) => ({ line: index + 1, text }))

// Family line 4 compares keeping cash with selling and keeping stock with buying; line 5 is the return.
export const LINE_MAP = { 1: 1, 4: 5, 5: 6 }

export const python = `def max_profit(prices, fee):
    cash = 0
    hold = -prices[0]
    for price in prices[1:]:
        cash, hold = max(cash, hold + price - fee), max(hold, cash - price)
    return cash`
