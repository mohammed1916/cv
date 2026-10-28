export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with n and costs.')
  if (Object.keys(input).sort().join(',') !== 'costs,n') throw new Error('The object must have exactly the keys n and costs.')
  const { n, costs } = input
  if (!Number.isInteger(n) || n < 1 || n > 12) throw new Error('Use n from 1 to 12 for this visualization.')
  if (!Array.isArray(costs) || costs.length !== n) throw new Error('costs must have exactly n entries.')
  if (costs.some(c => !Number.isInteger(c) || c < 1 || c > 10000)) throw new Error('Each cost is an integer from 1 to 10000.')
  return { n, costs }
}

export function buildTrace(input) {
  const { n, costs } = input
  const dp = Array(n + 1).fill(null)
  dp[0] = 0
  const frames = [{ phase: 'start', activeLine: L('set dp[0] to 0'), step: 0, from: null, dp: [...dp], result: null, message: 'Step 0 costs nothing to reach.' }]
  for (let j = 1; j <= n; j++) {
    let best = Infinity
    let from = -1
    for (let i = j - 1; i >= Math.max(0, j - 3); i--) {
      const candidate = dp[i] + costs[j - 1] + (j - i) * (j - i)
      if (candidate < best) { best = candidate; from = i }
    }
    dp[j] = best
    frames.push({ phase: 'step', activeLine: L('keep the smallest candidate'), step: j, from, dp: [...dp], result: null, message: `Reach step ${j} from step ${from} for a total of ${best}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return dp[n]'), step: n, from: null, dp: [...dp], result: dp[n], message: `Minimum cost to reach step ${n}: ${dp[n]}.` })
  return { input, result: dp[n], frames }
}

export const code = `minimum cost to reach step n
  set dp[0] to 0 and every other dp entry to infinity
  for each step j from 1 to n
    for each jump from i = j - 1, j - 2, j - 3 that stays at 0 or above
      candidate = dp[i] + costs[j] + (j - i) squared
      keep the smallest candidate in dp[j]
  return dp[n]`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def climbing_stairs_ii(n, costs):
    INF = float('inf')
    dp = [INF] * (n + 1)
    dp[0] = 0
    for j in range(1, n + 1):
        for i in range(j - 1, max(0, j - 3) - 1, -1):
            candidate = dp[i] + costs[j - 1] + (j - i) ** 2
            if candidate < dp[j]:
                dp[j] = candidate
    return dp[n]
`
