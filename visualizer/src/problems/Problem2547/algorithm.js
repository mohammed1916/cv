export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with nums and k.')
  const { nums, k } = input
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 10) throw new Error('nums must have 1 to 10 entries.')
  if (nums.some(v => !Number.isInteger(v) || v < 0 || v > 9)) throw new Error('Each value must be an integer from 0 to 9.')
  if (!Number.isInteger(k) || k < 1 || k > 10) throw new Error('k must be an integer from 1 to 10.')
  return { nums, k }
}

// Values that appear at least twice in a part are kept; values that appear once are trimmed.
function trimmedLength(part) {
  return part.filter(v => part.filter(u => u === v).length >= 2).length
}

export function buildTrace(input) {
  const { nums, k } = input
  const n = nums.length
  const dp = Array(n + 1).fill(Infinity)
  dp[0] = 0
  const frames = [{ phase: 'start', activeLine: L('set dp[0] to 0'), end: 0, start: -1, dp: [...dp], cost: null, message: 'Splitting nothing costs 0.' }]
  for (let i = 1; i <= n; i++) {
    dp[i] = Infinity
    for (let j = 0; j < i; j++) {
      const cost = k + trimmedLength(nums.slice(j, i))
      dp[i] = Math.min(dp[i], dp[j] + cost)
      frames.push({ phase: 'piece', activeLine: L('set dp[i] to the smaller'), end: i, start: j, dp: [...dp], cost, message: `Piece from ${j} to ${i - 1} costs ${cost}; best total for the first ${i} values is ${dp[i]}.` })
    }
  }
  const result = dp[n]
  frames.push({ phase: 'done', activeLine: L('return dp[n]'), end: n, start: -1, dp: [...dp], cost: null, message: `Minimum total cost: ${result}.` })
  return { input, result, frames }
}

export const code = `minimum cost to split an array (nums, k):
  set dp[0] to 0
  for each end position i from 1 to n:
    set dp[i] to nothing
    for each start j from 0 to i - 1:
      count the values in nums from j to i - 1 that appear at least twice in that part
      set cost to k plus that count
      set dp[i] to the smaller of dp[i] and dp[j] + cost
  return dp[n]`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def min_cost_split(nums, k):
    n = len(nums)
    INF = float('inf')
    dp = [INF] * (n + 1)
    dp[0] = 0
    for i in range(1, n + 1):
        dp[i] = INF
        for j in range(i):
            part = nums[j:i]
            repeated = sum(1 for v in part if part.count(v) >= 2)
            cost = k + repeated
            dp[i] = min(dp[i], dp[j] + cost)
    return dp[n]
`
