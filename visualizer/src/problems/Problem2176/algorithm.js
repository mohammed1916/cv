// LeetCode 2176: Count Equal and Divisible Pairs in an Array.
// Check every pair i < j. The pair counts when the values match and i * j is divisible by k.

const MAX_LEN = 12
const MAX_VALUE = 9
const MAX_K = 12

export function parseInput(text) {
  let spec
  try { spec = JSON.parse(text) } catch { throw new Error('Use JSON like {"nums":[3,1,3,1,3],"k":2}.') }
  if (!spec || !Array.isArray(spec.nums) || !Number.isInteger(spec.k)) throw new Error('Give an nums array and an integer k.')
  if (spec.nums.length < 1 || spec.nums.length > MAX_LEN) throw new Error(`Use 1 to ${MAX_LEN} values. The visualization caps the length there.`)
  if (!spec.nums.every(v => Number.isInteger(v) && v >= 1 && v <= MAX_VALUE)) throw new Error(`Each value is an integer from 1 to ${MAX_VALUE}.`)
  if (spec.k < 1 || spec.k > MAX_K) throw new Error(`k is an integer from 1 to ${MAX_K}.`)
  return { nums: spec.nums, k: spec.k }
}

export const code = `FUNCTION countPairs(nums, k)
    ans ← 0
    n ← length of nums
    FOR j from 1 to n - 1
        FOR i from 0 to j - 1
            IF nums[i] = nums[j] AND (i * j) mod k = 0 THEN
                ans ← ans + 1
    RETURN ans`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def count_pairs(nums, k):
    ans = 0
    n = len(nums)
    for j in range(1, n):
        for i in range(j):
            if nums[i] == nums[j] and i * j % k == 0:
                ans += 1
    return ans
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
  { id: 'start', label: 'Start', description: 'No pairs counted yet.' },
  { id: 'pair', label: 'Pairs', description: 'Compare nums[i] with nums[j] for each i below the current j.' },
  { id: 'done', label: 'Result', description: 'Every pair has been checked.' },
]

export function buildTrace({ nums, k }) {
  const n = nums.length
  let ans = 0
  const frames = []
  const push = (phase, i, j, activeLine, pythonLine, message, extra = {}) => frames.push({ phase, i, j, l: i, r: j, index: j, activeLine, pythonLine, message, nums, k, ans, ...extra })
  push('start', -1, -1, L('ans ← 0'), P('ans = 0'), `Check ${n * (n - 1) / 2} pairs with the divisibility test i * j mod ${k}.`)
  for (let j = 1; j < n; j++) {
    for (let i = 0; i < j; i++) {
      const same = nums[i] === nums[j]
      const divisible = (i * j) % k === 0
      const counts = same && divisible
      if (counts) ans += 1
      const why = !same ? `values ${nums[i]} and ${nums[j]} differ` : !divisible ? `${i} * ${j} = ${i * j} is not divisible by ${k}` : `values match and ${i} * ${j} = ${i * j} is divisible by ${k}`
      push('pair', i, j, L('IF nums[i] = nums[j]'), P('if nums[i] == nums[j]'),
        `Pair (${i}, ${j}): ${why}. ${counts ? 'It counts.' : 'It does not count.'} Total ${ans}.`, { same, divisible, counts })
    }
  }
  push('done', -1, -1, L('RETURN ans'), P('return ans'), `${ans} pairs are equal and divisible.`)
  return { input: { nums, k }, result: ans, frames }
}
