// LeetCode 2183: Count Array Pairs Divisible by K.
// A pair (i, j) with i < j works when nums[i] * nums[j] is divisible by k. Only gcd(nums[i], k) matters:
// the pair works when gcd(nums[i], k) * gcd(nums[j], k) is divisible by k. This page checks each pair directly
// so the product test is visible, and it also groups values by gcd for the table.

const MAX_LEN = 10
const MAX_VALUE = 30
const MAX_K = 30

function gcd(a, b) { while (b) { [a, b] = [b, a % b] } return a }

export function parseInput(text) {
  let spec
  try { spec = JSON.parse(text) } catch { throw new Error('Use JSON like {"nums":[1,2,3,4,5],"k":2}.') }
  if (!spec || !Array.isArray(spec.nums) || !Number.isInteger(spec.k)) throw new Error('Give a nums array and an integer k.')
  if (spec.nums.length < 1 || spec.nums.length > MAX_LEN) throw new Error(`Use 1 to ${MAX_LEN} values. The visualization caps the length there.`)
  if (!spec.nums.every(v => Number.isInteger(v) && v >= 1 && v <= MAX_VALUE)) throw new Error(`Each value is an integer from 1 to ${MAX_VALUE}.`)
  if (spec.k < 1 || spec.k > MAX_K) throw new Error(`k is an integer from 1 to ${MAX_K}.`)
  return { nums: spec.nums, k: spec.k }
}

export const code = `FUNCTION countPairs(nums, k)
    n ← length of nums
    ans ← 0
    FOR j from 1 to n - 1
        FOR i from 0 to j - 1
            IF (nums[i] * nums[j]) mod k = 0 THEN
                ans ← ans + 1
    RETURN ans`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def count_pairs(nums, k):
    n = len(nums)
    ans = 0
    for j in range(1, n):
        for i in range(j):
            if nums[i] * nums[j] % k == 0:
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
  { id: 'pair', label: 'Pairs', description: 'Multiply each pair and test divisibility by k.' },
  { id: 'done', label: 'Result', description: 'The number of pairs whose product is divisible by k.' },
]

export function buildTrace({ nums, k }) {
  const n = nums.length
  let ans = 0
  const frames = []
  const push = (phase, i, j, activeLine, pythonLine, message, extra = {}) => frames.push({
    phase, i, j, l: i, r: j, index: j, activeLine, pythonLine, message, nums, k, ans, ...extra,
  })
  push('start', -1, -1, L('n ← length'), P('n = len(nums)'), `Check every pair of ${n} values against k = ${k}.`)
  for (let j = 1; j < n; j++) {
    for (let i = 0; i < j; i++) {
      const product = nums[i] * nums[j]
      const ok = product % k === 0
      if (ok) ans += 1
      push('pair', i, j, L('IF (nums[i]'), P('if nums[i] * nums[j]'),
        `Pair (${i}, ${j}): ${nums[i]} × ${nums[j]} = ${product}; gcd with k gives ${gcd(nums[i], k)} and ${gcd(nums[j], k)}. ${ok ? `${product} is divisible by ${k}, so it counts.` : `${product} is not divisible by ${k}.`} Count ${ans}.`,
        { ok, product, gi: gcd(nums[i], k), gj: gcd(nums[j], k) })
    }
  }
  push('done', -1, -1, L('RETURN ans'), P('return ans'), `${ans} pairs have a product divisible by ${k}.`)
  return { input: { nums, k }, result: ans, frames }
}
