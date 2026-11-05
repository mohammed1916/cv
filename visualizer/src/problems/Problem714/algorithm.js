export function parseInput(text) {
  const data = JSON.parse(text)
  const { prices, fee } = data ?? {}
  if (!Array.isArray(prices) || prices.length < 1 || prices.length > 20000 || prices.some(p => !Number.isInteger(p) || p < 1 || p > 50000)) throw new Error('prices must be 1–20,000 integers from 1 to 50,000.')
  if (!Number.isInteger(fee) || fee < 0 || fee > 50000) throw new Error('fee must be an integer from 0 to 50,000.')
  return { prices, fee }
}

const JS_LINES = [
  'function maxProfit(prices, fee) {',
  '  let cash = 0 // best profit after the day while holding no stock',
  '  let hold = -prices[0] // best profit after the day while holding one share',
  '  for (let i = 1; i < prices.length; i++) {',
  '    const nextCash = Math.max(cash, hold + prices[i] - fee) // sell today and pay the fee',
  '    const nextHold = Math.max(hold, cash - prices[i]) // buy today from the cash state',
  '    cash = nextCash',
  '    hold = nextHold',
  '  }',
  '  return cash // holding a share at the end is never better than selling it',
  '}',
]
const PY_LINES = [
  'def max_profit(prices, fee):',
  '    cash = 0',
  '    hold = -prices[0]',
  '    for price in prices[1:]:',
  '        next_cash = max(cash, hold + price - fee)',
  '        next_hold = max(hold, cash - price)',
  '        cash, hold = next_cash, next_hold',
  '    return cash',
]
const L = s => JS_LINES.findIndex(t => t.includes(s)) + 1
const P = s => PY_LINES.findIndex(t => t.includes(s)) + 1

export const code = JS_LINES.map((text, index) => ({ line: index + 1, text }))
export const python = PY_LINES.join('\n')

// Two states per day: cash (no share) and hold (one share). Each day both states are recomputed from yesterday's pair.
export function buildTrace({ prices, fee }) {
  let cash = 0, hold = -prices[0]
  const cashRow = [cash], holdRow = [hold], actions = ['start']
  const frames = [{ phase: 'start', day: 0, cashRow: [...cashRow], holdRow: [...holdRow], actions: [...actions], activeLine: L('let cash'), pythonLine: P('cash = 0'), message: `Day 0 at price ${prices[0]}: buying gives hold = -${prices[0]}; not buying keeps cash = 0.` }]
  for (let i = 1; i < prices.length; i++) {
    const sell = hold + prices[i] - fee
    const nextCash = Math.max(cash, sell)
    const buy = cash - prices[i]
    const nextHold = Math.max(hold, buy)
    const action = nextCash === sell && sell > cash ? 'sell' : nextHold === buy && buy > hold ? 'buy' : 'wait'
    cash = nextCash
    hold = nextHold
    cashRow.push(cash)
    holdRow.push(hold)
    actions.push(action)
    frames.push({ phase: action, day: i, cashRow: [...cashRow], holdRow: [...holdRow], actions: [...actions], activeLine: L('const nextCash'), pythonLine: P('next_cash ='),
      message: action === 'sell' ? `Day ${i} (price ${prices[i]}): selling the share gives ${sell}, which beats cash ${nextCash === sell ? cashRow[i - 1] : cashRow[i - 1]}; the fee is paid.`
        : action === 'buy' ? `Day ${i} (price ${prices[i]}): buying from cash gives ${buy}, better than keeping the share.`
          : `Day ${i} (price ${prices[i]}): neither move beats yesterday, so both states carry over.` })
  }
  const result = cash
  frames.push({ phase: 'done', day: prices.length - 1, cashRow: [...cashRow], holdRow: [...holdRow], actions: [...actions], result, activeLine: L('return cash'), pythonLine: P('return cash'), message: `Best profit with no share in hand at the end: ${result}.` })
  return { input: { prices, fee }, result, frames }
}
