export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with nums1 and nums2.')
  const { nums1, nums2 } = input
  if (!Array.isArray(nums1) || !Array.isArray(nums2) || nums1.length < 1 || nums1.length > 16 || nums1.length !== nums2.length) throw new Error('nums1 and nums2 have the same length, 1 to 16.')
  if (![...nums1, ...nums2].every(x => Number.isInteger(x) && x >= 1 && x <= 100)) throw new Error('Each value is an integer from 1 to 100.')
  return { nums1, nums2 }
}

export function buildTrace({ nums1, nums2 }) {
  const frames = []
  const total1 = nums1.reduce((s, x) => s + x, 0)
  const total2 = nums2.reduce((s, x) => s + x, 0)
  frames.push({ pythonLine: 2, phase: 'start', activeLine: L('total1 = sum'), at: -1, gain: null, total: total1, cur: 0, result: null, message: `Sums: nums1 ${total1}, nums2 ${total2}.` })
  let best1 = 0
  let cur = 0
  for (let i = 0; i < nums1.length; i++) {
    cur = Math.max(0, cur + nums2[i] - nums1[i])
    best1 = Math.max(best1, cur)
    frames.push({ pythonLine: 6, phase: 'gain1', activeLine: L('cur = max'), at: i, gain: best1, total: total1, cur, result: null, message: `Splice into nums1 at ${i}: running gain ${cur}, best ${best1}.` })
  }
  let best2 = 0
  cur = 0
  for (let i = 0; i < nums1.length; i++) {
    cur = Math.max(0, cur + nums1[i] - nums2[i])
    best2 = Math.max(best2, cur)
    frames.push({ pythonLine: 10, phase: 'gain2', activeLine: L('cur + nums1[i]'), at: i, gain: best2, total: total2, cur, result: null, message: `Splice into nums2 at ${i}: running gain ${cur}, best ${best2}.` })
  }
  const result = Math.max(total1 + best1, total2 + best2)
  frames.push({ pythonLine: 12, phase: 'done', activeLine: L('return max'), at: -1, gain: null, total: null, cur: null, result, message: `Best score is ${result}.` })
  return { input: { nums1, nums2 }, result, frames }
}

export const code = `maximum sum after swapping one interval between the arrays
  total1 = sum of nums1, total2 = sum of nums2
  best1 = 0, cur = 0
  for each index
    cur = max(0, cur + nums2[i] minus nums1[i]), best1 = max(best1, cur)
  best2 = 0, cur = 0
  for each index
    cur = max(0, cur + nums1[i] minus nums2[i]), best2 = max(best2, cur)
  return max(total1 + best1, total2 + best2)`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def maximums_spliced_array(nums1, nums2):
    total1 = sum(nums1)
    total2 = sum(nums2)
    best1 = cur = 0
    for a, b in zip(nums1, nums2):
        cur = max(0, cur + b - a)
        best1 = max(best1, cur)
    best2 = cur = 0
    for a, b in zip(nums1, nums2):
        cur = max(0, cur + a - b)
        best2 = max(best2, cur)
    return max(total1 + best1, total2 + best2)
`
