// LeetCode 2291: Maximum Profit From Trading Stocks.
// Each stock is a 0/1 choice: buy it (cost present[i]) and earn future[i] - present[i], or skip it.
// The draft's profit is read as future minus purchase price per chosen stock (flagged for source check).
// dp[b] is the best profit with total purchase cost at most b; budgets are scanned downward so each stock is used once.

const MAX_ITEMS = 6
const MAX_BUDGET = 20
const MAX_PRICE = 20

export function parseInput(text) {
  let input
  try { input = JSON.parse(text) } catch { throw new Error('Use an object like {"present":[1,2],"future":[4,3],"budget":3}.') }
  const { present, future, budget } = input || {}
  if (!Array.isArray(present) || !Array.isArray(future) || present.length !== future.length) throw new Error('present and future are lists of equal length.')
  if (present.length < 1 || present.length > MAX_ITEMS) throw new Error(`Use 1 to ${MAX_ITEMS} stocks. The visualization caps the count at ${MAX_ITEMS}.`)
  if (!Number.isInteger(budget) || budget < 0 || budget > MAX_BUDGET) throw new Error(`budget is an integer from 0 to ${MAX_BUDGET}.`)
  for (const v of [...present, ...future]) if (!Number.isInteger(v) || v < 1 || v > MAX_PRICE) throw new Error(`Prices are integers from 1 to ${MAX_PRICE}.`)
  return { present, future, budget }
}

export const code = `FUNCTION maxProfit(present, future, budget)
    dp[b] ← 0 for every budget b from 0 to budget
    FOR each stock i
        profit ← future[i] - present[i]
        FOR b from budget DOWN TO present[i]
            dp[b] ← max(dp[b], dp[b - present[i]] + profit)
    RETURN dp[budget]`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def max_profit(present, future, budget):
    dp = [0] * (budget + 1)
    for cost, sale in zip(present, future):
        profit = sale - cost
        for b in range(budget, cost - 1, -1):
            dp[b] = max(dp[b], dp[b - cost] + profit)
    return dp[budget]
`

const L = text => {
  const index = code.findIndex(line => line.text.includes(text))
  if (index < 0) throw new Error(`Missing pseudocode line: ${text}`)
  return index + 1
}
const P = text => {
  const index = python.split('\n').findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`Missing python line: ${text}`)
  return index + 1
}

export const phases = [
  { id: 'start', label: 'Empty budget', description: 'With no stocks considered, every budget earns 0.' },
  { id: 'stock', label: 'Stock', description: 'Consider one stock for every budget that can afford it.' },
  { id: 'cell', label: 'Update', description: 'Compare skipping the stock with buying it.' },
  { id: 'done', label: 'Result', description: 'Best profit within the full budget.' },
]

export function buildTrace({ present, future, budget }) {
  const frames = []
  const dp = Array(budget + 1).fill(0)
  frames.push({ phase: 'start', activeLine: L('dp[b] ← 0 for every'), pythonLine: P('dp = [0] * (budget + 1)'), message: `dp has ${budget + 1} entries, all 0.`, stock: -1, b: -1, from: -1, skip: null, buy: null, dp: dp.slice() })
  present.forEach((cost, i) => {
    const profit = future[i] - cost
    frames.push({ phase: 'stock', activeLine: L('profit ← future[i]'), pythonLine: P('profit = sale - cost'), message: `Stock ${i}: buy ${cost}, sell ${future[i]}, profit ${profit}.`, stock: i, b: -1, from: -1, skip: null, buy: null, dp: dp.slice() })
    for (let b = budget; b >= cost; b--) {
      const skip = dp[b]
      const buy = dp[b - cost] + profit
      dp[b] = Math.max(skip, buy)
      frames.push({ phase: 'cell', activeLine: L('dp[b] ← max(dp[b]'), pythonLine: P('dp[b] = max(dp[b], dp[b - cost] + profit)'), message: `Budget ${b}: skip gives ${skip}, buy gives ${buy}; keep ${dp[b]}.`, stock: i, b, from: b - cost, skip, buy, dp: dp.slice() })
    }
  })
  frames.push({ phase: 'done', activeLine: L('RETURN dp[budget]'), pythonLine: P('return dp[budget]'), message: `Best profit with budget ${budget}: ${dp[budget]}.`, stock: -1, b: budget, from: -1, skip: null, buy: null, dp: dp.slice() })
  return { input: { present, future, budget }, result: dp[budget], frames }
}
