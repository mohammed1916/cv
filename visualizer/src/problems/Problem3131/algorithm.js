export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with nums1 and nums2.')
  const { nums1, nums2 } = input
  const ok = a => Array.isArray(a) && a.length >= 1 && a.length <= 100 && a.every(v => Number.isInteger(v) && v >= -1000 && v <= 1000)
  if (!ok(nums1) || !ok(nums2) || nums1.length !== nums2.length) throw new Error('nums1 and nums2 are equal-length arrays of 1 to 100 integers.')
  return { nums1, nums2 }
}

export function buildTrace({ nums1, nums2 }) {
  const frames = []
  const min1 = Math.min(...nums1)
  const min2 = Math.min(...nums2)
  frames.push({ pythonLine: 2, phase: 'start', activeLine: L('const min1'), min1, min2, x: null, message: `Smallest value of nums1 is ${min1}; of nums2 is ${min2}.` })
  const x = min2 - min1
  frames.push({ pythonLine: 4, phase: 'done', activeLine: L('return min2 - min1'), min1, min2, x, message: `Adding ${x} to every value of nums1 gives nums2 as a multiset.` })
  return { input: { nums1, nums2 }, result: x, frames }
}

export const code = `function addedInteger(nums1, nums2) {
  const min1 = Math.min(...nums1)
  const min2 = Math.min(...nums2)
  return min2 - min1
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def added_integer(nums1, nums2):
    min1 = min(nums1)
    min2 = min(nums2)
    return min2 - min1
`
