const PHASES = [
  { id: 'open', label: 'Open', description: 'Before any day, nothing has been sold.' },
  { id: 'ready', label: 'Ready', description: 'Work out the best profit that is free to buy on this day.' },
  { id: 'sell', label: 'Sell', description: 'Try every earlier buy day and sell today.' },
  { id: 'done', label: 'Answer', description: 'Report the best total, allowing no trades.' },
]

export const phases = PHASES

const CODE_LINES = [
  'maximum total profit with one share at a time and a cooldown after each sale',
  'f[j] is the best profit whose last sale is on day j; G[j] is the best profit free to buy on day j',
  'best_sell is zero',
  'for each day j from 0 to n minus 1',
  '  if day j minus cooldown minus 1 is at least 0, let best_sell be the larger of best_sell and f of that day',
  '  G[j] = best_sell',
  '  for each buy day i below j',
  '    f[j] = the larger of f[j] and G[i] plus prices[j] minus prices[i] minus costs[j minus i]',
  'return the larger of 0 and the largest f',
]

export const code = CODE_LINES.map((text, index) => ({ line: index + 1, text }))

function L(fragment) {
  const index = code.findIndex(c => c.text.includes(fragment))
  if (index < 0) throw new Error(`Missing pseudocode line: ${fragment}`)
  return index + 1
}

export const python = `def max_profit(prices, costs, cooldown):
    n = len(prices)
    NEG = float('-inf')
    G = [0] * n
    f = [NEG] * n
    best_sell = 0
    for j in range(n):
        if j - cooldown - 1 >= 0:
            best_sell = max(best_sell, f[j - cooldown - 1])
        G[j] = best_sell
        for i in range(j):
            f[j] = max(f[j], G[i] + prices[j] - prices[i] - costs[j - i])
    return max(0, max(f))
`

const PY = python.split('\n')

function P(fragment) {
  const index = PY.findIndex(line => line.includes(fragment))
  if (index < 0) throw new Error(`Missing Python line: ${fragment}`)
  return index + 1
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with prices, costs and cooldown.')
  const { prices, costs, cooldown } = input
  if (!Array.isArray(prices) || prices.length < 1 || prices.length > 12) throw new Error('prices has 1 to 12 days.')
  if (!prices.every(p => Number.isInteger(p) && p >= 0 && p <= 100)) throw new Error('Each price is an integer from 0 to 100.')
  if (!Array.isArray(costs) || costs.length !== prices.length) throw new Error('costs has one entry per day; costs[d] is the fee for holding d days.')
  if (!costs.every(c => Number.isInteger(c) && c >= 0 && c <= 100)) throw new Error('Each cost is an integer from 0 to 100.')
  if (!Number.isInteger(cooldown) || cooldown < 0 || cooldown > 5) throw new Error('cooldown is an integer from 0 to 5.')
  return { prices, costs, cooldown }
}

export function buildTrace({ prices, costs, cooldown }) {
  const n = prices.length
  const NEG = -Infinity
  const G = Array(n).fill(0)
  const f = Array(n).fill(NEG)
  let bestSell = 0
  const frames = []
  const snap = () => ({ G: [...G], f: f.map(v => (v === NEG ? null : v)) })
  frames.push({ pythonLine: P('best_sell = 0'), phase: 'open', activeLine: L('best_sell is zero'), j: -1, i: -1, bestSell, ...snap(), message: `${n} day${n === 1 ? '' : 's'}; cooldown ${cooldown}. Nothing is sold yet.` })
  for (let j = 0; j < n; j++) {
    if (j - cooldown - 1 >= 0) bestSell = Math.max(bestSell, f[j - cooldown - 1])
    G[j] = bestSell
    frames.push({ pythonLine: P('G[j] = best_sell'), phase: 'ready', activeLine: L('G[j] = best_sell'), j, i: -1, bestSell, ...snap(), message: `Day ${j}: a purchase here can start from profit ${G[j]}.` })
    for (let i = 0; i < j; i++) {
      const candidate = G[i] + prices[j] - prices[i] - costs[j - i]
      if (candidate > f[j]) f[j] = candidate
      frames.push({ pythonLine: P('f[j] = max(f[j], G[i]'), phase: 'sell', activeLine: L('the larger of f[j] and G[i]'), j, i, bestSell, candidate, ...snap(), message: `Buy on day ${i}, sell on day ${j}: ${G[i]} + ${prices[j]} - ${prices[i]} - ${costs[j - i]} = ${candidate}.` })
    }
  }
  const answer = Math.max(0, ...f.filter(v => v !== NEG))
  frames.push({ pythonLine: P('return max(0, max(f))'), phase: 'done', activeLine: L('return the larger of 0'), j: -1, i: -1, bestSell, ...snap(), answer, message: `Best total profit is ${answer}.` })
  return { input: { prices, costs, cooldown }, result: answer, frames }
}
