export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with nums and k.')
  const { nums, k } = input
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 10) throw new Error('nums has 1 to 10 entries.')
  if (!nums.every(v => Number.isInteger(v) && v >= 1 && v <= 60)) throw new Error('Each number is a positive integer up to 60.')
  if (!Number.isInteger(k) || k < 1 || k > nums.length) throw new Error('k is an integer from 1 to the length of nums.')
  return { nums, k }
}

const gcd = (a, b) => {
  while (b) [a, b] = [b, a % b]
  return a
}

// For each right end r, keep one group per distinct gcd of subarrays ending at r.
// Each group stores the smallest start with that gcd: with positive numbers it gives the largest sum.
export function buildTrace({ nums, k }) {
  const n = nums.length
  const prefix = [0]
  for (const x of nums) prefix.push(prefix[prefix.length - 1] + x)
  const frames = []
  let best = 0
  let bestRange = null
  let groups = []
  const snap = () => groups.map(({ g, s }) => ({ g, s }))
  const push = (phase, pythonLine, text, state, message) =>
    frames.push({ phase, pythonLine, activeLine: L(text), r: -1, groups: snap(), candidate: null, best, bestRange, ...state, message })

  push('start', 7, 'best is zero', {}, `Use subarrays of length at least ${k}. Best starts at 0.`)
  for (let r = 0; r < n; r++) {
    const merged = []
    for (const { g, s } of groups) {
      const ng = gcd(g, nums[r])
      if (merged.length && merged[merged.length - 1].g === ng) continue
      merged.push({ g: ng, s })
    }
    if (!merged.length || merged[merged.length - 1].g !== nums[r]) merged.push({ g: nums[r], s: r })
    groups = merged
    push('extend', 18, 'gcd each old group', { r }, `Right end ${r}: ${groups.length} distinct gcd value${groups.length === 1 ? '' : 's'} among subarrays ending here.`)

    for (const { g, s } of groups) {
      if (s > r - k + 1) {
        push('short', 20, 'whose start leaves', { r, candidate: { g, s, sum: null, value: null } },
          `The group with gcd ${g} starts at ${s}, which leaves fewer than ${k} numbers.`)
        continue
      }
      const sum = prefix[r + 1] - prefix[s]
      const value = g * sum
      push('candidate', 21, 'candidate is gcd', { r, candidate: { g, s, sum, value } },
        `Subarray ${s} to ${r}: gcd ${g} times sum ${sum} is ${value}.`)
      if (value > best) {
        best = value
        bestRange = [s, r]
        push('best', 21, 'best is the larger', { r, candidate: { g, s, sum, value } }, `New best ${best} from indices ${s} to ${r}.`)
      }
    }
  }
  push('done', 22, 'return best', {}, `The maximum product is ${best}.`)
  return { input: { nums, k }, result: best, frames, bestRange }
}

export const code = `maximum gcd times sum over subarrays of length at least k
  best is zero and no groups exist yet
  for each right end r, groups hold the distinct gcd values of subarrays ending at r
    gcd each old group with nums at r and keep the smallest start for each gcd
    add the group that starts at r
    for each group whose start leaves length at least k
      candidate is gcd times the sum from start to r
      best is the larger of best and candidate
  return best`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => {
  const index = code.findIndex(c => c.text.includes(s))
  if (index < 0) throw new Error(`Missing pseudocode line: ${s}`)
  return index + 1
}

export const python = `from math import gcd
def max_gcd_sum(nums, k):
    n = len(nums)
    prefix = [0] * (n + 1)
    for i, x in enumerate(nums):
        prefix[i + 1] = prefix[i] + x
    best = 0
    groups = []
    for r in range(n):
        merged = []
        for g, s in groups:
            ng = gcd(g, nums[r])
            if merged and merged[-1][0] == ng:
                continue
            merged.append((ng, s))
        if not merged or merged[-1][0] != nums[r]:
            merged.append((nums[r], r))
        groups = merged
        for g, s in groups:
            if s <= r - k + 1:
                best = max(best, g * (prefix[r + 1] - prefix[s]))
    return best
`
