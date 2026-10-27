export function parseInput(text) {
  const input = JSON.parse(text)
  const { nums1, nums2 } = input ?? {}
  for (const [name, nums] of [['nums1', nums1], ['nums2', nums2]]) {
    if (!Array.isArray(nums) || nums.length < 1 || nums.length > 10) throw new Error(`${name} needs 1 to 10 values.`)
    if (nums.some(v => !Number.isInteger(v) || v < 1 || v > 100)) throw new Error(`${name} holds integers from 1 to 100.`)
    if (nums.some((v, i) => i > 0 && v < nums[i - 1])) throw new Error(`${name} must be sorted in non-decreasing order.`)
  }
  return { nums1, nums2 }
}

export function buildTrace({ nums1, nums2 }) {
  let i = 0
  let j = 0
  const frames = [{ phase: 'start', activeLine: L('minimum common value of two sorted lists'), i, j, message: 'Both pointers start at the smallest values.' }]
  while (i < nums1.length && j < nums2.length) {
    if (nums1[i] === nums2[j]) {
      frames.push({ phase: 'found', activeLine: L('return that value'), i, j, message: `${nums1[i]} is in both lists, and it is the smallest such value.` })
      return { input: { nums1, nums2 }, result: nums1[i], frames }
    }
    if (nums1[i] < nums2[j]) {
      i++
      frames.push({ phase: 'advance', activeLine: L('move the first pointer forward'), i, j, message: `${nums1[i - 1]} is smaller than ${nums2[j]}, so it cannot be common.` })
    } else {
      j++
      frames.push({ phase: 'advance', activeLine: L('move the second pointer forward'), i, j, message: `${nums2[j - 1]} is smaller than ${nums1[i]}, so it cannot be common.` })
    }
  }
  frames.push({ phase: 'done', activeLine: L('return -1'), i, j, message: 'One list ran out before any value matched.' })
  return { input: { nums1, nums2 }, result: -1, frames }
}

export const code = `minimum common value of two sorted lists
  set both pointers to the first positions
  while both pointers are inside their lists
    if the two values under the pointers are equal then
      return that value
    if the first value is smaller then
      move the first pointer forward
    otherwise
      move the second pointer forward
  return -1`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def minimum_common_value(nums1, nums2):
    i = 0
    j = 0
    while i < len(nums1) and j < len(nums2):
        if nums1[i] == nums2[j]:
            return nums1[i]
        if nums1[i] < nums2[j]:
            i += 1
        else:
            j += 1
    return -1
`
