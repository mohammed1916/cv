export function parseInput(text) {
  const data = JSON.parse(text)
  const { nums1, nums2 } = data ?? {}
  const ok = a => Array.isArray(a) && a.length >= 1 && a.length <= 60 && a.every(v => Number.isInteger(v) && v >= 0 && v <= 100)
  if (!ok(nums1) || !ok(nums2)) throw new Error('nums1 and nums2 must be arrays of 1–60 integers from 0 to 100.')
  return { nums1, nums2 }
}

const JS_LINES = [
  'function findLength(nums1, nums2) {',
  '  const m = nums1.length, n = nums2.length',
  '  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0)) // dp[i][j] = longest common run ending at i and j',
  '  let best = 0',
  '  for (let i = 1; i <= m; i++) {',
  '    for (let j = 1; j <= n; j++) {',
  '      if (nums1[i - 1] === nums2[j - 1]) dp[i][j] = dp[i - 1][j - 1] + 1 // extend the run on the diagonal',
  '      else dp[i][j] = 0 // a mismatch ends every run here',
  '      best = Math.max(best, dp[i][j])',
  '    }',
  '  }',
  '  return best',
  '}',
]
const PY_LINES = [
  'def find_length(nums1, nums2):',
  '    m, n = len(nums1), len(nums2)',
  '    dp = [[0] * (n + 1) for _ in range(m + 1)]',
  '    best = 0',
  '    for i in range(1, m + 1):',
  '        for j in range(1, n + 1):',
  '            if nums1[i - 1] == nums2[j - 1]:',
  '                dp[i][j] = dp[i - 1][j - 1] + 1',
  '            else:',
  '                dp[i][j] = 0',
  '            best = max(best, dp[i][j])',
  '    return best',
]
const L = s => JS_LINES.findIndex(t => t.includes(s)) + 1
const P = s => PY_LINES.findIndex(t => t.includes(s)) + 1

export const code = JS_LINES.map((text, index) => ({ line: index + 1, text }))
export const python = PY_LINES.join('\n')

// dp[i][j] is the length of the common run that ends at nums1[i - 1] and nums2[j - 1]. A run extends only along the diagonal.
export function buildTrace({ nums1, nums2 }) {
  const m = nums1.length, n = nums2.length
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0))
  let best = 0, bestEnd = null
  const frames = [{ phase: 'start', row: 0, column: 0, sources: [], table: dp.map(r => [...r]), best, activeLine: L('let best'), pythonLine: P('best = 0'), message: 'Row 0 and column 0 are empty: a run cannot end before the first element.' }]
  for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++) {
    const match = nums1[i - 1] === nums2[j - 1]
    dp[i][j] = match ? dp[i - 1][j - 1] + 1 : 0
    if (dp[i][j] > best) { best = dp[i][j]; bestEnd = [i, j] }
    frames.push({ phase: match ? 'match' : 'break', row: i, column: j, sources: match ? [[i - 1, j - 1]] : [], table: dp.map(r => [...r]), best, bestEnd,
      activeLine: L(match ? 'extend the run' : 'a mismatch ends'), pythonLine: P(match ? 'dp[i][j] = dp[i - 1][j - 1] + 1' : 'dp[i][j] = 0'),
      message: match ? `nums1[${i - 1}] = nums2[${j - 1}] = ${nums1[i - 1]}: the run grows to ${dp[i][j]}.` : `nums1[${i - 1}] = ${nums1[i - 1]} and nums2[${j - 1}] = ${nums2[j - 1]} differ: no run ends here.` })
  }
  frames.push({ phase: 'done', row: m, column: n, sources: [], table: dp.map(r => [...r]), best, bestEnd, result: best, activeLine: L('return best'), pythonLine: P('return best'), message: `Longest common subarray: ${best}.` })
  return { input: { nums1, nums2 }, result: best, frames }
}
