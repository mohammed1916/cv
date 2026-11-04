export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || !Array.isArray(input.nums1) || !Array.isArray(input.nums2)) throw new Error('Use an object with nums1, nums2 and k.')
  const { nums1, nums2, k } = input
  for (const list of [nums1, nums2]) {
    if (list.length < 1 || list.length > 5 || !list.every(v => Number.isInteger(v) && v >= -9 && v <= 9)) throw new Error('Each list has 1 to 5 integers from -9 to 9.')
  }
  if (!Number.isInteger(k) || k < 1 || k > Math.min(nums1.length, nums2.length)) throw new Error('k is an integer from 1 to the shorter list length.')
  return { nums1, nums2, k }
}

export function buildTrace({ nums1, nums2, k }) {
  const n = nums1.length
  const m = nums2.length
  const NEG = -Infinity
  const dp = [Array.from({ length: n + 1 }, () => Array(m + 1).fill(0))]
  const frames = []
  for (let t = 1; t <= k; t++) {
    const cur = Array.from({ length: n + 1 }, () => Array(m + 1).fill(NEG))
    dp.push(cur)
    for (let i = 1; i <= n; i++) {
      for (let j = 1; j <= m; j++) {
        let value = Math.max(cur[i - 1][j], cur[i][j - 1])
        const prev = dp[t - 1][i - 1][j - 1]
        const takePair = prev > NEG
        if (takePair) value = Math.max(value, prev + nums1[i - 1] * nums2[j - 1])
        cur[i][j] = value
        frames.push({ pythonLine: P('cur[i][j] = max(cur[i - 1][j]'), phase: 'cell', activeLine: C('dp[t][i][j] = max of'), layer: t, i, j, value: value === NEG ? null : value,
          grid: cur.map(row => row.map(v => (v === NEG ? null : v))), pair: takePair ? [i - 1, j - 1] : null,
          message: `${t} pair${t === 1 ? '' : 's'}, first ${i} and ${j}: best ${value === NEG ? 'impossible' : value}.` })
      }
    }
  }
  const result = dp[k][n][m]
  frames.push({ pythonLine: P('return dp[k][n][m]'), phase: 'done', activeLine: C('return dp[k][n][m]'), layer: k, i: n, j: m, value: result, grid: dp[k].map(row => row.map(v => (v === NEG ? null : v))), pair: null,
    message: `Maximum score ${result}.` })
  return { input: { nums1, nums2, k }, result, frames }
}

export function solve(input) {
  return buildTrace(input).result
}

export const code = `function maxScore(nums1, nums2, k) {
  const n = nums1.length
  const m = nums2.length
  const NEG = -Infinity
  // dp[t][i][j] is the best score with exactly t pairs among the first i and first j numbers
  // dp[0][i][j] is zero for every i and j, so the previous layer starts as all zeros
  let prev = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0))
  for (let t = 1; t <= k; t++) {
    const cur = Array.from({ length: n + 1 }, () => Array(m + 1).fill(NEG))
    for (let i = 1; i <= n; i++) {
      for (let j = 1; j <= m; j++) {
        // dp[t][i][j] = max of dp[t][i-1][j] and dp[t][i][j-1]
        let value = Math.max(cur[i - 1][j], cur[i][j - 1])
        // and dp[t-1][i-1][j-1] plus nums1[i-1] times nums2[j-1] when that is possible
        if (prev[i - 1][j - 1] > NEG) value = Math.max(value, prev[i - 1][j - 1] + nums1[i - 1] * nums2[j - 1])
        cur[i][j] = value
      }
    }
    prev = cur
  }
  // return dp[k][n][m]
  return prev[n][m]
}`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def max_score(nums1, nums2, k):
    n, m = len(nums1), len(nums2)
    NEG = float("-inf")
    dp = [[[0] * (m + 1) for _ in range(n + 1)]]
    for t in range(1, k + 1):
        cur = [[NEG] * (m + 1) for _ in range(n + 1)]
        for i in range(1, n + 1):
            for j in range(1, m + 1):
                cur[i][j] = max(cur[i - 1][j], cur[i][j - 1])
                if dp[t - 1][i - 1][j - 1] > NEG:
                    cur[i][j] = max(cur[i][j], dp[t - 1][i - 1][j - 1] + nums1[i - 1] * nums2[j - 1])
        dp.append(cur)
    return dp[k][n][m]
`

const PY = python.split('\n')
const CODE = code.map(c => c.text)
function P(text) { return PY.findIndex(line => line.includes(text)) + 1 }
function C(text) { return CODE.findIndex(line => line.includes(text)) + 1 }
