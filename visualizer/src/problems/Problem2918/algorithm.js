export function parseInput(text) {
  const obj = JSON.parse(text)
  if (!obj || typeof obj !== 'object' || Array.isArray(obj) || !Array.isArray(obj.nums1) || !Array.isArray(obj.nums2)) throw new Error('Use an object with array keys nums1 and nums2.')
  const { nums1, nums2 } = obj
  for (const arr of [nums1, nums2]) {
    if (arr.length < 1 || arr.length > 8) throw new Error('Each array has 1 to 8 entries.')
    if (arr.some(v => !Number.isInteger(v) || v < 0 || v > 6)) throw new Error('Entries are integers from 0 to 6.')
  }
  return { nums1, nums2 }
}

const sum = arr => arr.reduce((s, v) => s + v, 0)

export function buildTrace(input) {
  const { nums1, nums2 } = input
  const z1 = nums1.filter(v => v === 0).length
  const z2 = nums2.filter(v => v === 0).length
  const low1 = sum(nums1) + z1
  const low2 = sum(nums2) + z2
  const frames = [{ phase: 'start', activeLine: L('set low1 to'), index: -1, low1, low2, message: `Smallest possible sums: ${low1} for nums1 and ${low2} for nums2.` }]
  let result
  let line
  if (z1 === 0 && z2 === 0) {
    result = low1 === low2 ? low1 : -1
    line = 'if neither array has a zero'
  } else if (z1 === 0) {
    result = low1 >= low2 ? low1 : -1
    line = 'if nums1 has no zero'
  } else if (z2 === 0) {
    result = low2 >= low1 ? low2 : -1
    line = 'if nums2 has no zero'
  } else {
    result = Math.max(low1, low2)
    line = 'return the larger of low1 and low2'
  }
  frames.push({ phase: 'branch', activeLine: L(line), index: -1, low1, low2, message: result === -1 ? 'The fixed side is too small to match, so the answer is -1.' : `The equal sum is ${result}.` })
  frames.push({ phase: 'done', activeLine: L(line), index: -1, low1, low2, message: `Minimum equal sum: ${result}.` })
  return { input, result, frames }
}

export const code = `minimum equal sum after replacing zeros
  set low1 to the sum of nums1 plus one for each zero in nums1
  set low2 to the sum of nums2 plus one for each zero in nums2
  if neither array has a zero then
    return low1 when low1 equals low2, otherwise -1
  if nums1 has no zero then
    return low1 when low1 is at least low2, otherwise -1
  if nums2 has no zero then
    return low2 when low2 is at least low1, otherwise -1
  return the larger of low1 and low2`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def min_equal_sum(nums1, nums2):
    z1 = nums1.count(0)
    z2 = nums2.count(0)
    low1 = sum(nums1) + z1
    low2 = sum(nums2) + z2
    if z1 == 0 and z2 == 0:
        return low1 if low1 == low2 else -1
    if z1 == 0:
        return low1 if low1 >= low2 else -1
    if z2 == 0:
        return low2 if low2 >= low1 else -1
    return max(low1, low2)
`
