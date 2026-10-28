export function parseInput(text) {
  const value = JSON.parse(text)
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Use an object with nums1 and nums2.')
  const { nums1, nums2 } = value
  if (!Array.isArray(nums1) || !Array.isArray(nums2)) throw new Error('nums1 and nums2 must both be arrays.')
  if (nums1.length !== nums2.length || nums1.length < 2 || nums1.length > 10 || nums1.length % 2 !== 0) throw new Error('Both arrays need the same even length from 2 to 10.')
  if ([...nums1, ...nums2].some(v => !Number.isInteger(v) || v < 1 || v > 9)) throw new Error('Values are integers from 1 to 9.')
  return { nums1, nums2 }
}

export function buildTrace({ nums1, nums2 }) {
  const half = nums1.length / 2
  const set1 = new Set(nums1)
  const set2 = new Set(nums2)
  const only1 = [...set1].filter(v => !set2.has(v))
  const only2 = [...set2].filter(v => !set1.has(v))
  const shared = [...set1].filter(v => set2.has(v))
  const frames = [{ phase: 'start', activeLine: L('let half be'), keep1: 0, keep2: 0, sharedKept: 0, result: 0, message: `Each array keeps ${half} values after removals.` }]
  frames.push({ phase: 'classify', activeLine: L('count values only'), keep1: 0, keep2: 0, sharedKept: 0, result: 0, message: `Only in nums1: ${only1.length}. Only in nums2: ${only2.length}. In both: ${shared.length}.` })
  const keep1 = Math.min(only1.length, half)
  const keep2 = Math.min(only2.length, half)
  frames.push({ phase: 'exclusive', activeLine: L('keep up to half'), keep1, keep2, sharedKept: 0, result: keep1 + keep2, message: `Keep ${keep1} values only in nums1 and ${keep2} only in nums2.` })
  const spare = (half - keep1) + (half - keep2)
  const sharedKept = Math.min(shared.length, spare)
  const result = keep1 + keep2 + sharedKept
  frames.push({ phase: 'shared', activeLine: L('fill the remaining'), keep1, keep2, sharedKept, result, message: `${spare} slots remain, so ${sharedKept} shared values join the set.` })
  frames.push({ phase: 'done', activeLine: L('return the number'), keep1, keep2, sharedKept, result, message: `Maximum set size: ${result}.` })
  return { input: { nums1, nums2 }, result, frames }
}

export const code = `maximum size of the set after removals:
  let half be the length of nums1 divided by two
  count values only in nums1, values only in nums2, and values in both
  keep up to half of the only-in-nums1 values and up to half of the only-in-nums2 values
  fill the remaining slots with values that appear in both
  return the number of distinct values kept`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def max_set_size(nums1, nums2):
    half = len(nums1) // 2
    set1 = set(nums1)
    set2 = set(nums2)
    only1 = len(set1 - set2)
    only2 = len(set2 - set1)
    shared = len(set1 & set2)
    keep1 = min(only1, half)
    keep2 = min(only2, half)
    spare = (half - keep1) + (half - keep2)
    return keep1 + keep2 + min(shared, spare)
`
