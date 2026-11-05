export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with prices, strategy and k.')
  const { prices, strategy, k } = input
  if (!Array.isArray(prices) || prices.length < 1 || prices.length > 12 || !prices.every(Number.isInteger)) throw new Error('prices is 1 to 12 integers.')
  if (!Array.isArray(strategy) || strategy.length !== prices.length || !strategy.every(v => v === -1 || v === 0 || v === 1)) throw new Error('strategy uses -1, 0 or 1 for each day.')
  if (!Number.isInteger(k) || k < 2 || k % 2 !== 0 || k > prices.length) throw new Error('k is an even integer from 2 to the number of days.')
  return { prices, strategy, k }
}

export function buildTrace({ prices, strategy, k }) {
  const frames = []
  const base = prices.reduce((sum, p, i) => sum + strategy[i] * p, 0)
  frames.push({ phase: 'base', pythonLine: 2, activeLine: L('const profit'), start: -1, mid: -1, end: -1, change: 0, best: 0, message: `Original profit is ${base}.` })
  let bestChange = 0
  let bestStart = -1
  for (let s = 0; s + k <= prices.length; s++) {
    const half = k / 2
    let change = 0
    for (let i = s; i < s + half; i++) change += 0 - strategy[i] * prices[i]
    for (let i = s + half; i < s + k; i++) change += prices[i] - strategy[i] * prices[i]
    if (change > bestChange) { bestChange = change; bestStart = s }
    frames.push({ phase: 'window', pythonLine: 4, activeLine: L('for (let start'), start: s, mid: s + half, end: s + k - 1, change, best: bestChange, message: `Window at ${s} changes profit by ${change}.` })
  }
  const result = base + bestChange
  frames.push({ phase: 'done', pythonLine: 12, activeLine: L('return profit + best'), start: bestStart, mid: bestStart >= 0 ? bestStart + k / 2 : -1, end: bestStart >= 0 ? bestStart + k - 1 : -1, change: bestChange, best: bestChange, message: `Best profit is ${result}.` })
  return { input: { prices, strategy, k }, base, result, frames }
}

export const code = `function bestProfit(prices, strategy, k) {
  const profit = prices.reduce((sum, p, i) => sum + strategy[i] * p, 0)
  let best = 0
  for (let start = 0; start + k <= prices.length; start++) {
    const half = k / 2
    let change = 0
    for (let i = start; i < start + half; i++) change += 0 - strategy[i] * prices[i]
    for (let i = start + half; i < start + k; i++) change += prices[i] - strategy[i] * prices[i]
    best = Math.max(best, change)
  }
  return profit + best
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def best_profit(prices, strategy, k):
    profit = sum(s * p for s, p in zip(strategy, prices))
    best = 0
    for start in range(len(prices) - k + 1):
        change = 0
        half = k // 2
        for i in range(start, start + half):
            change += 0 - strategy[i] * prices[i]
        for i in range(start + half, start + k):
            change += prices[i] - strategy[i] * prices[i]
        best = max(best, change)
    return profit + best
`
