export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with nums1 and nums2 arrays.')
  const { nums1, nums2 } = input
  if (!Array.isArray(nums1) || !Array.isArray(nums2) || nums1.length < 1 || nums1.length > 10 || nums1.length !== nums2.length) throw new Error('nums1 and nums2 must have the same length from 1 to 10.')
  const bad = v => !Number.isInteger(v) || v < 1 || v > 20
  if (nums1.some(bad) || nums2.some(bad)) throw new Error('Values must be integers from 1 to 20.')
  return { nums1, nums2 }
}

export function buildTrace(input) {
  const { nums1, nums2 } = input
  const n = nums1.length
  const from1 = Array(n).fill(0)
  const from2 = Array(n).fill(0)
  from1[0] = 1
  from2[0] = 1
  let best = 1
  const show = () => [[...from1], [...from2]]
  const frames = [{ phase: 'start', activeLine: L('set from1 and from2'), index: 0, table: show(), best, message: 'At index 0 either array gives a run of length 1.' }]
  for (let i = 1; i < n; i++) {
    let new1 = 1
    let new2 = 1
    if (nums1[i] >= nums1[i - 1]) new1 = Math.max(new1, from1[i - 1] + 1)
    if (nums1[i] >= nums2[i - 1]) new1 = Math.max(new1, from2[i - 1] + 1)
    if (nums2[i] >= nums1[i - 1]) new2 = Math.max(new2, from1[i - 1] + 1)
    if (nums2[i] >= nums2[i - 1]) new2 = Math.max(new2, from2[i - 1] + 1)
    from1[i] = new1
    from2[i] = new2
    best = Math.max(best, new1, new2)
    frames.push({ phase: 'step', activeLine: L('set best to the largest'), index: i, table: show(), best, message: `Index ${i}: ending with nums1 gives ${new1}, ending with nums2 gives ${new2}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return best'), index: n - 1, table: show(), best, message: `Longest non-decreasing subarray: ${best}.` })
  return { input, result: best, frames }
}

export const code = `longest non-decreasing subarray from two arrays (nums1, nums2):
  set from1 and from2 to 1 for index 0, where from1 uses nums1 and from2 uses nums2
  set best to 1
  for each index i from 1 to n - 1:
    set new1 and new2 to 1
    if nums1[i] is at least nums1[i - 1] then new1 = max(new1, from1 + 1)
    if nums1[i] is at least nums2[i - 1] then new1 = max(new1, from2 + 1)
    if nums2[i] is at least nums1[i - 1] then new2 = max(new2, from1 + 1)
    if nums2[i] is at least nums2[i - 1] then new2 = max(new2, from2 + 1)
    store new1 in from1[i] and new2 in from2[i]
    set best to the largest of best, new1 and new2
  return best`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def max_non_decreasing_length(nums1, nums2):
    n = len(nums1)
    take1 = 1
    take2 = 1
    best = 1
    for i in range(1, n):
        new1 = 1
        new2 = 1
        if nums1[i] >= nums1[i - 1]:
            new1 = max(new1, take1 + 1)
        if nums1[i] >= nums2[i - 1]:
            new1 = max(new1, take2 + 1)
        if nums2[i] >= nums1[i - 1]:
            new2 = max(new2, take1 + 1)
        if nums2[i] >= nums2[i - 1]:
            new2 = max(new2, take2 + 1)
        take1, take2 = new1, new2
        best = max(best, take1, take2)
    return best
`
