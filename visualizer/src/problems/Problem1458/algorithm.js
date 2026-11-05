export const phases = [
  { id: 'start', label: 'Empty borders', description: 'Prefixes with no elements cannot form a nonempty pair, so their table entries start at negative infinity.' },
  { id: 'inspect', label: 'Pair or skip', description: 'For each cell, compare pairing the current elements with skipping an element from either list.' },
  { id: 'update', label: 'Store best', description: 'Store the largest value that uses the first i and first j elements.' },
  { id: 'done', label: 'Complete', description: 'The bottom-right cell covers both full lists and gives the answer.' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object such as {"nums1": [...], "nums2": [...]}.')
  const { nums1, nums2 } = input
  const valid = a => Array.isArray(a) && a.length >= 1 && a.length <= 12 && a.every(v => Number.isInteger(v) && Math.abs(v) <= 10)
  if (!valid(nums1)) throw new Error('nums1 is a list of 1 to 12 integers from -10 to 10.')
  if (!valid(nums2)) throw new Error('nums2 is a list of 1 to 12 integers from -10 to 10.')
  return { nums1, nums2 }
}

const NEG = Number.NEGATIVE_INFINITY
const show = v => (v === NEG ? null : v)

export function buildTrace({ nums1, nums2 }) {
  const m = nums1.length
  const n = nums2.length
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(NEG))
  const snap = (i, j, pair, extra = {}) => ({ nums1, nums2, i, j, table: dp.map(row => row.map(show)), pair, ...extra })
  const frames = [{ phase: 'start', activeLine: L('const dp = Array'), pythonLine: P('dp = [[NEG]'), snapshot: snap(null, null, null), message: `Row 0 and column 0 stand for empty prefixes. They are -inf, so no nonempty pair can end there.` }]
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const a = nums1[i - 1]
      const b = nums2[j - 1]
      const prev = dp[i - 1][j - 1]
      const pair = a * b + Math.max(0, prev)
      const startsFresh = prev <= 0
      frames.push({ phase: 'inspect', activeLine: L('const pair = nums1'), pythonLine: P('pair = nums1'), snapshot: snap(i, j, pair, { a, b, prev: show(prev) }), message: `Pair ${a} with ${b}: product ${a * b}. ${startsFresh ? `The diagonal entry ${show(prev) ?? '-inf'} is not positive, so the pair starts a new subsequence.` : `The diagonal entry ${prev} is positive, so the pair extends it to ${pair}.`}` })
      dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1], pair)
      frames.push({ phase: 'update', activeLine: L('dp[i][j] = Math'), pythonLine: P('dp[i][j] = max'), snapshot: snap(i, j, pair, { a, b, prev: show(prev) }), message: `dp[${i}][${j}] = ${dp[i][j]}, the best of skipping either element or using this pair.` })
    }
  }
  const result = dp[m][n]
  frames.push({ phase: 'done', activeLine: L('return dp[m][n]'), pythonLine: P('return dp[m][n]'), snapshot: snap(m, n, null, { a: null, b: null, prev: null }), message: `Return ${result}, the best nonempty pair over both full lists.` })
  return { input: { nums1, nums2 }, result, frames }
}

export const code = `function maxDotProduct(nums1, nums2) {
  const m = nums1.length
  const n = nums2.length
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(-Infinity))
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const pair = nums1[i - 1] * nums2[j - 1] + Math.max(0, dp[i - 1][j - 1])
      dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1], pair)
    }
  }
  return dp[m][n]
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1

export const python = `def max_dot_product(nums1, nums2):
    m, n = len(nums1), len(nums2)
    NEG = float("-inf")
    dp = [[NEG] * (n + 1) for _ in range(m + 1)]
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            pair = nums1[i - 1] * nums2[j - 1] + max(0, dp[i - 1][j - 1])
            dp[i][j] = max(dp[i - 1][j], dp[i][j - 1], pair)


    return dp[m][n]
`
