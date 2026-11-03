export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || !Array.isArray(input.nums)) throw new Error('Use an object with nums and k.')
  const { nums, k } = input
  if (nums.length < 1 || nums.length > 8 || !nums.every(v => Number.isInteger(v) && v >= 1 && v <= 9)) throw new Error('nums has 1 to 8 integers from 1 to 9.')
  if (!Number.isInteger(k) || k < 1 || k > nums.length) throw new Error('k is an integer from 1 to the length of nums.')
  return { nums, k }
}

const cost = s => (s * (s + 1)) / 2

export function buildTrace({ nums, k }) {
  const n = nums.length
  const prefix = [0]
  for (const v of nums) prefix.push(prefix[prefix.length - 1] + v)
  const INF = Infinity
  // dp[j][i]: least score splitting the first i numbers into exactly j blocks.
  const dp = Array.from({ length: k + 1 }, () => Array(n + 1).fill(INF))
  const from = Array.from({ length: k + 1 }, () => Array(n + 1).fill(-1))
  dp[0][0] = 0
  const frames = [{ pythonLine: P('dp = [['), phase: 'table', activeLine: C('set up the table'), layer: 0, end: 0, cut: -1, value: 0, dp: snapshot(dp),
    message: 'Zero blocks cover zero numbers at cost zero.' }]
  for (let j = 1; j <= k; j++) {
    for (let i = j; i <= n; i++) {
      for (let p = j - 1; p < i; p++) {
        const candidate = dp[j - 1][p] + cost(prefix[i] - prefix[p])
        if (candidate < dp[j][i]) { dp[j][i] = candidate; from[j][i] = p }
      }
      frames.push({ pythonLine: P('dp[j][i] = min'), phase: 'cell', activeLine: C('try every last block'), layer: j, end: i, cut: from[j][i], value: dp[j][i], dp: snapshot(dp),
        message: `Blocks ${j}, first ${i} numbers: best score ${dp[j][i]}, last block starts after position ${from[j][i]}.` })
    }
  }
  const result = dp[k][n]
  const split = []
  let i = n
  for (let j = k; j >= 1; j--) { const p = from[j][i]; split.unshift(nums.slice(p, i)); i = p }
  frames.push({ pythonLine: P('return dp[k][n]'), phase: 'done', activeLine: C('return dp[k][n]'), layer: k, end: n, cut: -1, value: result, dp: snapshot(dp), split,
    message: `Minimum score ${result}.` })
  return { input: { nums, k }, result, frames }
}

function snapshot(dp) {
  return dp.map(row => row.map(v => (v === Infinity ? null : v)))
}

export function solve(input) {
  return buildTrace(input).result
}

export const code = `minimum score when splitting nums into exactly k contiguous blocks
  prefix sums give the sum of any block in constant time
  dp[j][i] is the best score for the first i numbers in j blocks
  set up the table with dp[0][0] equal to 0
  for each block count j and each end i
    try every last block that starts after some position p
    dp[j][i] = min of dp[j - 1][p] plus the block cost
  return dp[k][n]`.split('\n').map((text, index) => ({ line: index + 1, text: text.trim() }))

export const python = `def minimum_partition_score(nums, k):
    n = len(nums)
    prefix = [0]
    for v in nums:
        prefix.append(prefix[-1] + v)
    INF = float("inf")
    dp = [[INF] * (n + 1) for _ in range(k + 1)]
    dp[0][0] = 0
    for j in range(1, k + 1):
        for i in range(j, n + 1):
            for p in range(j - 1, i):
                s = prefix[i] - prefix[p]
                dp[j][i] = min(dp[j][i], dp[j - 1][p] + s * (s + 1) // 2)
    return dp[k][n]
`

const PY = python.split('\n')
const CODE = code.map(c => c.text)
function P(text) { return PY.findIndex(line => line.includes(text)) + 1 }
function C(text) { return CODE.findIndex(line => line.includes(text)) + 1 }
