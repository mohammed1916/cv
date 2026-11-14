export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with nums, l and r.')
  const { nums, l, r } = input
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 12) throw new Error('nums has 1 to 12 integers.')
  if (!nums.every(v => Number.isInteger(v) && v >= -100 && v <= 100)) throw new Error('Each value is an integer from -100 to 100.')
  if (!Number.isInteger(l) || !Number.isInteger(r) || l < 1 || r < l || r > nums.length) throw new Error('Use 1 <= l <= r <= nums.length.')
  return { nums, l, r }
}

// prefix[i] is the sum of the first i values, so the window [left, right) sums to prefix[right] - prefix[left].
export function buildPrefix(nums) {
  const prefix = [0]
  for (const value of nums) prefix.push(prefix[prefix.length - 1] + value)
  return prefix
}

export function buildTrace({ nums, l, r }) {
  const prefix = buildPrefix(nums)
  const frames = []
  let best = -1
  frames.push({ pythonLine: PY('acc = list'), phase: 'prefix', activeLine: L('const prefix = [0]'), window: null, total: null, best, length: null, inRange: null, positive: null,
    message: `Build the prefix sums. prefix[i] is the total of the first i values, so any window sum is one subtraction.` })
  frames.push({ pythonLine: PY('n, mn = len'), phase: 'start', activeLine: L('let best = Infinity'), window: null, total: null, best, length: null, inRange: null, positive: null,
    message: `Allowed lengths are ${l} to ${r}. No positive sum has been found yet.` })
  for (let left = 0; left < nums.length; left++) {
    for (let right = left + 1; right <= nums.length; right++) {
      const total = prefix[right] - prefix[left]
      const length = right - left
      const inRange = length >= l && length <= r
      const positive = total > 0
      const improves = inRange && positive && (best === -1 || total < best)
      const reason = !inRange ? `Length ${length} is outside [${l}, ${r}], so it is skipped.`
        : !positive ? `Length ${length} is allowed, but the sum ${total} is not positive.`
        : `Length ${length} is allowed and the sum ${total} is positive.`
      frames.push({ pythonLine: PY('sm, length'), phase: 'window', activeLine: L('const sum = prefix[right]'), window: [left, right], total, best, length, inRange, positive,
        message: `Window [${left}, ${right}): prefix[${right}] - prefix[${left}] = ${total}. ${reason}` })
      if (improves) {
        best = total
        frames.push({ pythonLine: PY('mn = sm'), phase: 'better', activeLine: L('best = sum'), window: [left, right], total, best, length, inRange, positive,
          message: `${total} is smaller than the best so far, so the running minimum becomes ${best}.` })
      }
    }
  }
  frames.push({ pythonLine: PY('return -1'), phase: 'done', activeLine: L('return best'), window: null, total: null, best, length: null, inRange: null, positive: null, result: best,
    message: best === -1 ? 'No allowed window has a positive sum, so the answer is -1.' : `Answer: ${best}.` })
  return { input: { nums, l, r }, prefix, result: best, frames }
}

export const code = `function minimumPositiveSum(nums, l, r) {
  const prefix = [0]
  for (const value of nums) prefix.push(prefix[prefix.length - 1] + value)
  let best = Infinity
  for (let left = 0; left < nums.length; left++) {
    for (let right = left + 1; right <= nums.length; right++) {
      const sum = prefix[right] - prefix[left]
      const length = right - left
      if (length >= l && length <= r && sum > 0 && sum < best) best = sum
    }
  }
  return best === Infinity ? -1 : best
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `from itertools import accumulate
from math import inf

def minimum_positive_sum_subarray(nums, l, r):
    n, mn = len(nums), inf
    acc = list(accumulate(nums, initial = 0))
    for left in range(n):
        for rght in range(left + 1, n + 1):
            sm, length = acc[rght] - acc[left], rght - left
            if l <= length <= r and 0 < sm < mn: mn = sm
    return -1 if mn == inf else mn
`
const PY = s => python.split('\n').findIndex(line => line.includes(s)) + 1
