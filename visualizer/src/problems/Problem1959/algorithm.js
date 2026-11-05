// LeetCode 1959: split the times into at most k + 1 consecutive blocks. Each block is sized to its largest need, so its waste is max * length - sum.
const SOURCE = [
  "function minSpaceWastedKResizing(nums, k) {",
  "  const n = nums.length",
  "  const dp = Array.from({ length: k + 2 }, () => new Array(n + 1).fill(Infinity))",
  "  dp[0][0] = 0",
  "  for (let blocks = 1; blocks <= k + 1; blocks++) {",
  "    for (let end = 1; end <= n; end++) {",
  "      let biggest = 0, total = 0, best = Infinity",
  "      for (let start = end - 1; start >= 0; start--) {",
  "        biggest = Math.max(biggest, nums[start])",
  "        total += nums[start]",
  "        best = Math.min(best, dp[blocks - 1][start] + biggest * (end - start) - total)",
  "      }",
  "      dp[blocks][end] = best",
  "    }",
  "  }",
  "  let result = Infinity",
  "  for (let blocks = 1; blocks <= k + 1; blocks++) result = Math.min(result, dp[blocks][n])",
  "  return result",
  "}",
]

export const code = SOURCE.map((text, index) => ({ line: index + 1, text }))

export const python = `def min_space_wasted_k_resizing(nums, k):
    n = len(nums)
    INF = float("inf")
    dp = [[INF] * (n + 1) for _ in range(k + 2)]
    dp[0][0] = 0
    for blocks in range(1, k + 2):
        for end in range(1, n + 1):
            biggest = 0
            total = 0
            best = INF
            for start in range(end - 1, -1, -1):
                biggest = max(biggest, nums[start])
                total += nums[start]
                cost = biggest * (end - start) - total
                best = min(best, dp[blocks - 1][start] + cost)
            dp[blocks][end] = best
    return min(dp[blocks][n] for blocks in range(1, k + 2))
`

const L = text => { const i = SOURCE.findIndex(line => line.includes(text)); if (i < 0) throw new Error(`no code line: ${text}`); return i + 1 }
const P = text => { const i = python.split('\n').findIndex(line => line.includes(text)); if (i < 0) throw new Error(`no python line: ${text}`); return i + 1 }

export const phases = [
  { id: 'fill', label: 'Fill table', description: 'Each cell: best split of the first end values into a given number of blocks.' },
  { id: 'done', label: 'Result', description: 'Smallest total waste with at most k resizings.' },
]

export function parseInput(text) {
  let input
  try { input = JSON.parse(text) } catch { throw new Error('Enter JSON like {"nums":[10,20,5],"k":1}.') }
  const { nums, k } = input || {}
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 8 || !nums.every(v => Number.isInteger(v) && v >= 1 && v <= 50)) throw new Error('nums holds 1 to 8 integers from 1 to 50.')
  if (!Number.isInteger(k) || k < 0 || k > nums.length - 1) throw new Error('k is an integer from 0 to length - 1.')
  return { nums, k }
}

export function buildTrace({ nums, k }) {
  const n = nums.length
  const INF = Infinity
  const dp = Array.from({ length: k + 2 }, () => new Array(n + 1).fill(INF))
  dp[0][0] = 0
  const frames = []
  const snap = () => dp.map(row => row.map(v => (v === INF ? null : v)))
  for (let blocks = 1; blocks <= k + 1; blocks++) {
    for (let end = 1; end <= n; end++) {
      let biggest = 0, total = 0, best = INF, bestStart = -1
      for (let start = end - 1; start >= 0; start--) {
        biggest = Math.max(biggest, nums[start])
        total += nums[start]
        const cost = biggest * (end - start) - total
        const candidate = dp[blocks - 1][start] + cost
        if (candidate < best) { best = candidate; bestStart = start }
      }
      dp[blocks][end] = best
      frames.push({ phase: 'fill', activeLine: L('dp[blocks][end] = best'), pythonLine: P('dp[blocks][end] = best'), message: `First ${end} value(s) in ${blocks} block(s): best waste ${best}${bestStart >= 0 ? ` (last block starts at ${bestStart})` : ''}.`, blocks, end, bestStart, table: snap() })
    }
  }
  let result = INF
  for (let blocks = 1; blocks <= k + 1; blocks++) result = Math.min(result, dp[blocks][n])
  frames.push({ phase: 'done', activeLine: L('return result'), pythonLine: P('return min'), message: `Minimum total waste: ${result}.`, blocks: -1, end: -1, bestStart: -1, table: snap(), result })
  return { input: { nums, k }, result, frames }
}
