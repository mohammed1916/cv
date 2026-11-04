// LeetCode 1918: Kth Smallest Subarray Sum.
// Input: { nums, k }: nums are positive integers (visualization cap: 10 entries, each 1 to 9). Sums of all nonempty
// contiguous subarrays are taken with duplicates; return the kth smallest. 1 <= k <= n(n+1)/2.
// Binary search on the answer value; counting subarrays with sum at most a limit uses a sliding window (values are positive).

const CODE_TEXT = `function countAtMost(nums, limit) {
  let total = 0, sum = 0, left = 0
  for (let right = 0; right < nums.length; right++) {
    sum += nums[right]
    while (sum > limit) { sum -= nums[left]; left++ }
    total += right - left + 1 // total ← total + (right - left + 1)
  }
  return total
}

export function kthSmallestSubarraySum(nums, k) {
  let lo = Math.min(...nums) // lo ← smallest element
  let hi = nums.reduce((a, b) => a + b, 0)
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2) // mid ← floor of (lo + hi) / 2
    if (countAtMost(nums, mid) >= k) hi = mid // IF countAtMost(nums, mid) is at least k
    else lo = mid + 1 // lo ← mid + 1
  }
  return lo // RETURN lo
}`

export const code = CODE_TEXT.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def kth_smallest_subarray_sum(nums, k):
    lo = min(nums)
    hi = sum(nums)
    while lo < hi:
        mid = (lo + hi) // 2
        if count_at_most(nums, mid) >= k:
            hi = mid
        else:
            lo = mid + 1
    return lo

def count_at_most(nums, limit):
    total = 0
    left = 0
    window = 0
    for right, value in enumerate(nums):
        window += value
        while window > limit:
            window -= nums[left]
            left += 1
        total += right - left + 1
    return total
`

const PY = python.split('\n')
const L = text => {
  const index = code.findIndex(c => c.text.includes(text))
  if (index < 0) throw new Error(`missing pseudocode line: ${text}`)
  return index + 1
}
const P = text => {
  const index = PY.findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`missing python line: ${text}`)
  return index + 1
}

export const phases = [
  { id: 'search', label: 'Search', description: 'Pick a candidate sum value between lo and hi.' },
  { id: 'count', label: 'Count', description: 'Slide a window to count subarrays with sum at most the candidate.' },
  { id: 'decide', label: 'Decide', description: 'Enough subarrays fit? Move hi down; otherwise move lo up.' },
  { id: 'answer', label: 'Answer', description: 'lo equals hi: the kth smallest sum.' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with nums and k.')
  const { nums, k } = input
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 10 || !nums.every(v => Number.isInteger(v) && v >= 1 && v <= 9)) throw new Error('nums is 1 to 10 integers from 1 to 9.')
  const pairs = nums.length * (nums.length + 1) / 2
  if (!Number.isInteger(k) || k < 1 || k > pairs) throw new Error(`k is an integer from 1 to ${pairs}.`)
  return { nums, k }
}

export function buildTrace({ nums, k }) {
  const frames = []
  const countAtMost = (limit, lo, hi, mid) => {
    let total = 0
    let left = 0
    let window = 0
    for (let right = 0; right < nums.length; right++) {
      window += nums[right]
      while (window > limit) {
        window -= nums[left]
        left += 1
      }
      total += right - left + 1
      frames.push({ pythonLine: P('total += right - left + 1'), phase: 'count', activeLine: L('total ← total + (right - left + 1)'), lo, hi, mid, left, right, window, total, need: k, limit, message: `Window ${left}..${right} has sum ${window} at most ${limit}; ${total} subarray${total === 1 ? '' : 's'} counted so far.` })
    }
    return total
  }
  let lo = Math.min(...nums)
  let hi = nums.reduce((a, b) => a + b, 0)
  frames.push({ pythonLine: P('lo = min(nums)'), phase: 'search', activeLine: L('lo ← smallest element'), lo, hi, mid: null, left: null, right: null, window: null, total: null, need: k, limit: null, message: `The answer lies between ${lo} and ${hi}.` })
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2)
    frames.push({ pythonLine: P('mid = (lo + hi) // 2'), phase: 'search', activeLine: L('mid ← floor of (lo + hi) / 2'), lo, hi, mid, left: null, right: null, window: null, total: null, need: k, limit: mid, message: `Test the candidate ${mid}.` })
    const count = countAtMost(mid, lo, hi, mid)
    if (count >= k) {
      hi = mid
      frames.push({ pythonLine: P('hi = mid'), phase: 'decide', activeLine: L('IF countAtMost(nums, mid) is at least k'), lo, hi, mid, left: null, right: null, window: null, total: count, need: k, limit: mid, message: `${count} >= ${k}: ${mid} is enough, so the answer is at most ${mid}.` })
    } else {
      lo = mid + 1
      frames.push({ pythonLine: P('lo = mid + 1'), phase: 'decide', activeLine: L('lo ← mid + 1'), lo, hi, mid, left: null, right: null, window: null, total: count, need: k, limit: mid, message: `${count} < ${k}: the answer is above ${mid}.` })
    }
  }
  frames.push({ pythonLine: P('return lo'), phase: 'answer', activeLine: L('RETURN lo'), lo, hi, mid: null, left: null, right: null, window: null, total: null, need: k, limit: null, message: `The ${k}th smallest subarray sum is ${lo}.` })
  return { input: { nums, k }, result: lo, frames }
}
