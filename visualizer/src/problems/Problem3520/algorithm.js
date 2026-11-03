export const phases = [
  { id: 'start', label: 'Read', description: 'Read the numbers and k.' },
  { id: 'total', label: 'Total', description: 'Count every inversion to see whether k is reachable.' },
  { id: 'search', label: 'Search', description: 'Narrow the threshold range around the midpoint.' },
  { id: 'pair', label: 'Pair', description: 'Test one index pair against the threshold.' },
  { id: 'done', label: 'Result', description: 'Return the smallest threshold, or -1.' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with nums and k.')
  const { nums, k } = input
  if (!Array.isArray(nums) || nums.length < 2 || nums.length > 8) throw new Error('nums has 2 to 8 integers.')
  if (!nums.every(v => Number.isInteger(v) && v >= -9 && v <= 9)) throw new Error('Each value is an integer from -9 to 9.')
  if (!Number.isInteger(k) || k < 1 || k > 28) throw new Error('k is an integer from 1 to 28.')
  return { nums: nums.slice(), k }
}

export const code = [
  'minimum threshold for inversion pairs count',
  '  total = number of pairs i < j with nums[i] greater than nums[j]',
  '  if total < k, return -1',
  '  lo = 1, hi = max(nums) minus min(nums)',
  '  while lo < hi',
  '    mid = (lo + hi) // 2, then count the pairs with a gap in (0, mid]',
  '    if that count is at least k, hi = mid, else lo = mid + 1',
  '  return lo',
].map((text, index) => ({ line: index + 1, text }))

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

export function buildTrace({ nums, k }) {
  const n = nums.length
  const frames = []
  const push = (phase, activeLine, pythonLine, message, extra = {}) => frames.push({
    phase, activeLine, pythonLine, message, nums, k, lo: null, hi: null, mid: null, pair: null, counted: 0, ...extra,
  })
  // Count pairs with 0 < gap <= limit, emitting one frame per pair examined.
  const countPairs = (limit, phase, pythonLine, activeLine, label) => {
    let count = 0
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const gap = nums[i] - nums[j]
        const hit = gap > 0 && gap <= limit
        if (hit) count++
        push(phase, activeLine, pythonLine, `${label}: pair (${i}, ${j}) has gap ${gap}; ${hit ? 'counted' : 'not counted'}.`, { pair: [i, j], gap, counted: count, limit })
      }
    }
    return count
  }
  push('start', L('minimum threshold'), P('def min_threshold'), `Read ${n} numbers and k = ${k}.`)
  const total = countPairs(Infinity, 'total', P('if count_pairs(float'), L('total = number'), 'total')
  if (total < k) {
    push('done', L('if total < k'), P('return -1'), `Only ${total} inversion${total === 1 ? '' : 's'} exist, fewer than k = ${k}. The answer is -1.`, { result: -1, counted: total })
    return { input: { nums, k }, result: -1, frames }
  }
  let lo = 1
  let hi = Math.max(...nums) - Math.min(...nums)
  push('search', L('lo = 1'), P('lo, hi = 1'), `At least k pairs exist. Search thresholds from ${lo} to ${hi}.`, { lo, hi })
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2)
    push('search', L('mid = (lo + hi)'), P('mid = (lo + hi)'), `Try threshold ${mid}.`, { lo, hi, mid })
    const count = countPairs(mid, 'pair', P('if count_pairs(mid)'), L('mid = (lo + hi)'), `threshold ${mid}`)
    if (count >= k) {
      hi = mid
      push('search', L('if that count is at least k'), P('hi = mid'), `${count} pairs reach k = ${k}, so the answer is at most ${mid}.`, { lo, hi, mid, counted: count })
    } else {
      lo = mid + 1
      push('search', L('if that count is at least k'), P('lo = mid + 1'), `${count} pairs fall short of k = ${k}, so the answer is above ${mid}.`, { lo, hi, mid, counted: count })
    }
  }
  push('done', L('return lo'), P('return lo'), `The smallest threshold is ${lo}.`, { result: lo, lo, hi, mid: null })
  return { input: { nums, k }, result: lo, frames }
}

export const python = `def min_threshold(nums, k):
    def count_pairs(x):
        total = 0
        for i in range(len(nums)):
            for j in range(i + 1, len(nums)):
                if 0 < nums[i] - nums[j] <= x:
                    total += 1
        return total

    if count_pairs(float('inf')) < k:
        return -1
    lo, hi = 1, max(nums) - min(nums)
    while lo < hi:
        mid = (lo + hi) // 2
        if count_pairs(mid) >= k:
            hi = mid
        else:
            lo = mid + 1
    return lo
`
