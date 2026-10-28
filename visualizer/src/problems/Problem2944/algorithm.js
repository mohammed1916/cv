export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with a prices array.')
  const { prices } = input
  if (!Array.isArray(prices) || prices.length < 1 || prices.length > 10) throw new Error('prices must have 1 to 10 entries.')
  if (prices.some(v => !Number.isInteger(v) || v < 1 || v > 20)) throw new Error('Each price must be an integer from 1 to 20.')
  return { prices }
}

export function buildTrace(input) {
  const { prices } = input
  const n = prices.length
  // dp[i] is the fewest coins needed to get fruits i..n when fruit i is bought; dp[n + 1] is 0.
  const dp = Array(n + 2).fill(0)
  const shown = () => dp.slice(1, n + 1)
  const frames = [{ phase: 'start', activeLine: L('set dp[n + 1] to 0'), fruit: n + 1, lo: -1, hi: -1, values: shown(), message: 'Nothing is left to get after the last fruit, so that costs 0.' }]
  for (let i = n; i >= 1; i--) {
    const hi = Math.min(2 * i + 1, n + 1)
    let best = Infinity
    for (let j = i + 1; j <= hi; j++) best = Math.min(best, dp[j])
    dp[i] = prices[i - 1] + best
    frames.push({ phase: 'fruit', activeLine: L('set dp[i] to'), fruit: i, lo: i + 1, hi, values: shown(), message: `Buy fruit ${i} for ${prices[i - 1]}; the next purchase is among fruits ${i + 1} to ${Math.min(hi, n)}, so dp[${i}] = ${dp[i]}.` })
  }
  const result = dp[1]
  frames.push({ phase: 'done', activeLine: L('return dp[1]'), fruit: 1, lo: -1, hi: -1, values: shown(), message: `Fewest coins: ${result}.` })
  return { input, result, frames }
}

export const code = `minimum coins for fruits (prices):
  let n be the number of fruits
  set dp[n + 1] to 0
  for each fruit i from n down to 1:
    set best to the smallest dp[j] for j from i + 1 to min(2i + 1, n + 1)
    set dp[i] to prices[i] + best
  return dp[1]`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def minimum_coins(prices):
    n = len(prices)
    dp = [0] * (n + 2)
    for i in range(n, 0, -1):
        best = min(dp[j] for j in range(i + 1, min(2 * i + 1, n + 1) + 1))
        dp[i] = prices[i - 1] + best
    return dp[1]
`
