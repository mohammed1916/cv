export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Use an object with prices and k, for example {"prices":[1,7,9,8,2],"k":2}.')
  const { prices, k } = data
  if (!Array.isArray(prices) || prices.length < 2 || prices.length > 10) throw new Error('prices must have 2 to 10 entries.')
  if (prices.some(p => !Number.isInteger(p) || p < 1 || p > 100)) throw new Error('Each price is an integer from 1 to 100.')
  if (!Number.isInteger(k) || k < 1 || k > Math.floor(prices.length / 2)) throw new Error('k must be an integer from 1 to half the number of days.')
  return { prices: [...prices], k }
}

export function buildTrace(input) {
  const { prices, k } = input
  const NONE = -Infinity
  // free[t]: no open transaction after t transactions opened; longOpen[t]: a bought share is held; shortOpen[t]: a short sale is open.
  let free = Array(k + 1).fill(NONE)
  let longOpen = Array(k + 1).fill(NONE)
  let shortOpen = Array(k + 1).fill(NONE)
  free[0] = 0
  const frames = [{ phase: 'start', activeLine: L('set free[0] to 0'), day: -1, best: 0, message: 'Start with no open transaction and no transactions opened.' }]
  prices.forEach((p, day) => {
    const f = [...free]
    const lo = [...longOpen]
    const so = [...shortOpen]
    for (let t = 0; t <= k; t++) {
      if (free[t] !== NONE && t + 1 <= k) {
        lo[t + 1] = Math.max(lo[t + 1], free[t] - p)
        so[t + 1] = Math.max(so[t + 1], free[t] + p)
      }
      if (longOpen[t] !== NONE) f[t] = Math.max(f[t], longOpen[t] + p)
      if (shortOpen[t] !== NONE) f[t] = Math.max(f[t], shortOpen[t] - p)
    }
    free = f
    longOpen = lo
    shortOpen = so
    const best = Math.max(...free)
    frames.push({ phase: 'day', activeLine: L('for each day with price p'), day, best, message: `Day ${day} at price ${p}: the best closed profit so far is ${best}.` })
  })
  const result = Math.max(...free)
  frames.push({ phase: 'done', activeLine: L('return the best closed profit'), day: prices.length - 1, best: result, message: `The maximum profit with at most ${k} transactions is ${result}.` })
  return { input, result, frames }
}

export const code = `best stock profit with short sales (prices, k)
  set free[0] to 0 and every other entry to negative infinity
  set longOpen and shortOpen to negative infinity
  for each day with price p
    copy the three tables so that a day does one action only
    for each count t of transactions opened so far
      open a normal trade by buying p, or a short trade by selling p, if t + 1 is at most k
      close an open normal trade by selling p
      close an open short trade by buying back at p
    keep the copies as the new tables
  return the best closed profit over all counts`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def max_profit_with_shorts(prices, k):
    NONE = float('-inf')
    free = [NONE] * (k + 1)
    long_open = [NONE] * (k + 1)
    short_open = [NONE] * (k + 1)
    free[0] = 0
    for p in prices:
        f = list(free)
        lo = list(long_open)
        so = list(short_open)
        for t in range(k + 1):
            if free[t] != NONE and t + 1 <= k:
                lo[t + 1] = max(lo[t + 1], free[t] - p)
                so[t + 1] = max(so[t + 1], free[t] + p)
            if long_open[t] != NONE:
                f[t] = max(f[t], long_open[t] + p)
            if short_open[t] != NONE:
                f[t] = max(f[t], short_open[t] - p)
        free, long_open, short_open = f, lo, so
    return max(free)
`
