// LeetCode 2170: Minimum Operations to Make the Array Alternating.
// The even positions must share one value, the odd positions must share one value, and the two values must differ.
// Keep the most frequent value in each parity class; if both classes peak on the same value, keep the better pairing.

const MAX_LEN = 12
const MAX_VALUE = 9

export function parseInput(text) {
  let nums
  try { nums = JSON.parse(text) } catch { throw new Error('Use a JSON array of positive integers, e.g. [3,1,3,2,4,3].') }
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > MAX_LEN) throw new Error(`Use 1 to ${MAX_LEN} integers. The visualization caps the length there.`)
  if (!nums.every(v => Number.isInteger(v) && v >= 1 && v <= MAX_VALUE)) throw new Error(`Each value is an integer from 1 to ${MAX_VALUE}.`)
  return { nums }
}

export const code = `FUNCTION minimumOperations(nums)
    n ← length of nums
    evens ← count each value at indices 0, 2, 4, ...
    odds ← count each value at indices 1, 3, 5, ...
    (a0, a1, a2, a3) ← two most frequent values of evens with their counts
    (b0, b1, b2, b3) ← two most frequent values of odds with their counts
    IF a0 is not b0 THEN
        RETURN n - (a1 + b1)
    RETURN n - max(a1 + b3, a3 + b1)`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `from collections import Counter

def minimum_operations(nums):
    def top_two(start):
        cnt = Counter(nums[start::2])
        best = sorted(cnt.items(), key=lambda kv: (-kv[1], kv[0]))[:2]
        best += [(None, 0)] * (2 - len(best))
        return best[0][0], best[0][1], best[1][0], best[1][1]
    a0, a1, a2, a3 = top_two(0)
    b0, b1, b2, b3 = top_two(1)
    n = len(nums)
    if a0 != b0:
        return n - (a1 + b1)
    return n - max(a1 + b3, a3 + b1)
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
  { id: 'start', label: 'Parity', description: 'Split the positions into even and odd classes.' },
  { id: 'count', label: 'Count', description: 'Count each value inside its parity class.' },
  { id: 'pick', label: 'Pick', description: 'Choose the target value for each class.' },
  { id: 'done', label: 'Result', description: 'The fewest changes.' },
]

function topTwo(values) {
  const cnt = new Map()
  for (const v of values) cnt.set(v, (cnt.get(v) || 0) + 1)
  const sorted = [...cnt.entries()].sort((x, y) => y[1] - x[1] || x[0] - y[0])
  const first = sorted[0] ?? [null, 0]
  const second = sorted[1] ?? [null, 0]
  return { v0: first[0], c0: first[1], v1: second[0], c1: second[1] }
}

export function buildTrace({ nums }) {
  const n = nums.length
  const evens = nums.filter((_, i) => i % 2 === 0)
  const odds = nums.filter((_, i) => i % 2 === 1)
  const even = topTwo(evens)
  const odd = topTwo(odds)
  const frames = []
  const push = (phase, index, activeLine, pythonLine, message, extra = {}) => frames.push({ phase, index, activeLine, pythonLine, message, nums, even, odd, ...extra })
  push('start', -1, L('n ← length'), P('n = len(nums)'), `${n} positions. Even positions: ${evens.length}. Odd positions: ${odds.length}.`)
  nums.forEach((v, i) => push('count', i, L('evens ← count'), P('cnt = Counter'),
    `Position ${i} holds ${v}; it belongs to the ${i % 2 === 0 ? 'even' : 'odd'} class.`, { counted: i }))
  push('pick', -1, L('IF a0 is not b0'), P('if a0 != b0'),
    `Even class: most common ${even.v0} (${even.c0}), runner-up ${even.v1 ?? 'none'} (${even.c1}). Odd class: most common ${odd.v0} (${odd.c0}), runner-up ${odd.v1 ?? 'none'} (${odd.c1}).`)
  let result
  if (even.v0 !== odd.v0) {
    result = n - (even.c0 + odd.c0)
    push('done', -1, L('RETURN n - (a1 + b1)'), P('return n - (a1 + b1)'), `The modes differ, so keep both: ${n} - (${even.c0} + ${odd.c0}) = ${result} changes.`)
  } else {
    const pairA = even.c0 + odd.c1
    const pairB = even.c1 + odd.c0
    result = n - Math.max(pairA, pairB)
    push('done', -1, L('RETURN n - max'), P('return n - max'), `Both modes are ${even.v0}. Keep ${even.v0} for even and ${odd.v1 ?? 'any other value'} for odd, or the swap, whichever keeps more. Result: ${result} changes.`)
  }
  return { input: { nums }, result, frames }
}
