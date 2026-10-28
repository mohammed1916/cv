export function parseInput(text) {
  const obj = JSON.parse(text)
  if (!obj || typeof obj !== 'object' || !Array.isArray(obj.nums) || !Number.isInteger(obj.k)) throw new Error('Use a JSON object with a nums array and an integer k.')
  const { nums, k } = obj
  if (nums.length < 1 || nums.length > 20) throw new Error('nums must have 1 to 20 entries (visualization cap).')
  if (nums.some(v => !Number.isInteger(v) || v < 0 || v > 20)) throw new Error('Each value is an integer from 0 to 20 (visualization cap).')
  if (k < 1 || k > 20) throw new Error('k is an integer from 1 to 20 (visualization cap).')
  return { nums, k }
}

export function buildTrace(input) {
  const { nums, k } = input
  const n = nums.length
  const frames = []
  if (n < 3) {
    frames.push({ phase: 'short', activeLine: L('if n is less than 3'), index: -1, dp: [], cost: 0, result: 0, message: 'No subarray has length 3, so the array is already beautiful.' })
    frames.push({ phase: 'done', activeLine: L('return 0'), index: -1, dp: [], cost: 0, result: 0, message: 'Operations needed: 0.' })
    return { input, nums, k, result: 0, frames }
  }
  const dp = []
  const costs = nums.map(v => Math.max(0, k - v))
  for (let i = 0; i < n; i++) {
    let best = i <= 2 ? 0 : Infinity
    for (let p = Math.max(0, i - 3); p < i; p++) best = Math.min(best, dp[p])
    dp[i] = costs[i] + best
    frames.push({ phase: 'cover', activeLine: L('dp[i] = cost + best'), index: i, dp: [...dp], cost: costs[i], result: null, message: `Raising index ${i} to ${k} costs ${costs[i]}. Best total ending here: ${dp[i]}.` })
  }
  const result = Math.min(...dp.slice(n - 3))
  frames.push({ phase: 'done', activeLine: L('return the minimum'), index: -1, dp: [...dp], cost: 0, result, message: `Minimum increments: ${result}.` })
  return { input, nums, k, result, frames }
}

export const code = `minimum increments so every window of 3 has a raised index
  if n is less than 3 then return 0
  for each index i from 0 to n-1 do
    cost = max(0, k minus nums[i])
    best = 0 if i is at most 2, otherwise infinity
    for p from i-1 down to i-3 that exist do
      best = min(best, dp[p])
    dp[i] = cost + best
  return the minimum of dp[i] for i from n-3 to n-1`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def min_increments(nums, k):
    n = len(nums)
    if n < 3:
        return 0
    INF = float('inf')
    dp = [0] * n
    for i in range(n):
        cost = max(0, k - nums[i])
        best = 0 if i <= 2 else INF
        for p in range(max(0, i - 3), i):
            best = min(best, dp[p])
        dp[i] = cost + best
    return min(dp[n - 3:])
`
