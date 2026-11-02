// LeetCode 2219: Maximum Sum Score of Array.
// At index i the score is the larger of prefix(i) = nums[0..i] and suffix(i) = nums[i..n-1].
// The prefix grows left to right while the suffix shrinks, so one pass tracks both.

const MAX_LEN = 12
const MAX_ABS = 100

export function parseInput(text) {
  let nums
  try { nums = JSON.parse(text) } catch { throw new Error('Use a JSON array of integers, e.g. [4,3,-2,5].') }
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > MAX_LEN) throw new Error(`Use 1 to ${MAX_LEN} integers. The visualization caps the length at ${MAX_LEN}.`)
  if (!nums.every(v => Number.isInteger(v) && Math.abs(v) <= MAX_ABS)) throw new Error(`Each value is an integer from -${MAX_ABS} to ${MAX_ABS}.`)
  return { nums }
}

export const code = `FUNCTION maximumSumScore(nums)
    suffix ← sum of all nums
    prefix ← 0
    best ← negative infinity
    FOR each index i from 0 to len(nums) - 1
        prefix ← prefix + nums[i]
        score ← max(prefix, suffix)
        best ← max(best, score)
        suffix ← suffix - nums[i]
    RETURN best`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def maximum_sum_score(nums):
    suffix = sum(nums)
    prefix = 0
    best = float('-inf')
    for i in range(len(nums)):
        prefix += nums[i]
        score = max(prefix, suffix)
        best = max(best, score)
        suffix -= nums[i]
    return best
`

const L = text => {
  const index = code.findIndex(line => line.text.includes(text))
  if (index < 0) throw new Error(`Missing pseudocode line: ${text}`)
  return index + 1
}
const P = text => {
  const index = python.split('\n').findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`Missing python line: ${text}`)
  return index + 1
}

export const phases = [
  { id: 'start', label: 'Totals', description: 'Start with the whole array as the suffix.' },
  { id: 'index', label: 'Index', description: 'Extend the prefix and shrink the suffix at this index.' },
  { id: 'done', label: 'Result', description: 'The best score over all indices.' },
]

export function buildTrace({ nums }) {
  const n = nums.length
  const frames = []
  let suffix = nums.reduce((a, b) => a + b, 0)
  let prefix = 0
  let best = -Infinity
  frames.push({ phase: 'start', activeLine: L('suffix ← sum of all'), pythonLine: P('suffix = sum(nums)'), message: `The suffix starts as the total ${suffix}; the prefix starts at 0.`, index: -1, prefix, suffix, score: null, best: null, rows: [] })
  const rows = []
  for (let i = 0; i < n; i++) {
    prefix += nums[i]
    const score = Math.max(prefix, suffix)
    best = Math.max(best, score)
    rows.push({ i, prefix, suffix, score })
    frames.push({ phase: 'index', activeLine: L('score ← max(prefix'), pythonLine: P('score = max(prefix, suffix)'), message: `Index ${i}: prefix ${prefix}, suffix ${suffix}, score ${score}. Best so far ${best}.`, index: i, prefix, suffix, score, best, rows: rows.slice() })
    suffix -= nums[i]
  }
  frames.push({ phase: 'done', activeLine: L('RETURN best'), pythonLine: P('return best'), message: `The maximum sum score is ${best}.`, index: n, prefix, suffix, score: null, best, rows: rows.slice() })
  return { input: { nums }, result: best, frames }
}
