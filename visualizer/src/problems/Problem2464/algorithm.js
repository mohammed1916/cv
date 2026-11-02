const CODE = [
  'FUNCTION minSubarrays(nums)',
  '    n ← length of nums ; dp[0] ← 0 ; dp[1..n] ← infinity',
  '    FOR i from 1 to n   (prefix of length i)',
  '        FOR j from 0 to i minus 1   (last piece is nums[j..i-1])',
  '            IF gcd(nums[j], nums[i-1]) > 1 AND dp[j] + 1 < dp[i] THEN dp[i] ← dp[j] + 1',
  '    RETURN dp[n] if it is finite, otherwise -1',
]

const PY = [
  'from math import gcd',
  'def min_subarrays(nums):',
  '    n = len(nums)',
  "    INF = float('inf')",
  '    dp = [0] + [INF] * n',
  '    for i in range(1, n + 1):',
  '        for j in range(i):',
  '            if gcd(nums[j], nums[i - 1]) > 1 and dp[j] + 1 < dp[i]:',
  '                dp[i] = dp[j] + 1',
  '    return dp[n] if dp[n] != INF else -1',
]

const at = (lines, text) => {
  const index = lines.findIndex(line => line.trim() === text.trim())
  if (index < 0) throw new Error(`Missing trace line: ${text}`)
  return index + 1
}
const codeLine = text => at(CODE, text)
const pyLine = text => at(PY, text)

const gcd = (a, b) => (b ? gcd(b, a % b) : a)

export const phases = [
  { id: 'start', label: 'Start', description: 'The empty prefix needs no pieces.' },
  { id: 'try', label: 'Try piece', description: 'Test a piece that ends at the current prefix.' },
  { id: 'update', label: 'Update', description: 'A valid piece gives a smaller count.' },
  { id: 'done', label: 'Result', description: 'Report the count for the whole array.' },
]

export function parseInput(text) {
  const nums = JSON.parse(text)
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 12) throw new Error('nums has 1 to 12 values in this visualization.')
  if (!nums.every(v => Number.isInteger(v) && v >= 1 && v <= 30)) throw new Error('Values are integers from 1 to 30 in this visualization.')
  return nums
}

const INF = Infinity

export function buildTrace(nums) {
  const n = nums.length
  const dp = Array(n + 1).fill(INF)
  dp[0] = 0
  const frames = []
  const shown = () => dp.map(v => (v === INF ? null : v))
  frames.push({ pythonLine: pyLine('dp = [0] + [INF] * n'), phase: 'start', activeLine: codeLine('n ← length of nums ; dp[0] ← 0 ; dp[1..n] ← infinity'), i: 0, j: null, dp: shown(), message: 'dp[k] is the fewest valid pieces covering the first k values. The empty prefix needs 0.' })
  for (let i = 1; i <= n; i++) {
    for (let j = 0; j < i; j++) {
      const g = gcd(nums[j], nums[i - 1])
      const valid = g > 1
      frames.push({ pythonLine: pyLine('if gcd(nums[j], nums[i - 1]) > 1 and dp[j] + 1 < dp[i]:'), phase: 'try', activeLine: codeLine('IF gcd(nums[j], nums[i-1]) > 1 AND dp[j] + 1 < dp[i] THEN dp[i] ← dp[j] + 1'), i, j, gcd: g, valid, dp: shown(), message: `Piece nums[${j}..${i - 1}] has ends ${nums[j]} and ${nums[i - 1]}, gcd ${g}. ${valid ? 'Valid.' : 'Not valid, since the gcd must exceed 1.'}` })
      if (valid && dp[j] + 1 < dp[i]) {
        dp[i] = dp[j] + 1
        frames.push({ pythonLine: pyLine('dp[i] = dp[j] + 1'), phase: 'update', activeLine: codeLine('IF gcd(nums[j], nums[i-1]) > 1 AND dp[j] + 1 < dp[i] THEN dp[i] ← dp[j] + 1'), i, j, gcd: g, valid, dp: shown(), message: `dp[${i}] improves to ${dp[i]} using the piece starting at index ${j}.` })
      }
    }
  }
  const result = dp[n] === INF ? -1 : dp[n]
  frames.push({ pythonLine: pyLine('return dp[n] if dp[n] != INF else -1'), phase: 'done', activeLine: codeLine('RETURN dp[n] if it is finite, otherwise -1'), i: n, j: null, dp: shown(), message: result === -1 ? 'No split works, so the answer is -1.' : `The whole array needs ${result} piece${result === 1 ? '' : 's'}.` })
  return { input: nums, result, dp: shown(), frames }
}

export const code = CODE.map((text, index) => ({ line: index + 1, text }))
export const python = PY.join('\n') + '\n'
