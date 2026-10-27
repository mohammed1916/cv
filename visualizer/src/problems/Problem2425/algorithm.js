export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || !Array.isArray(data.nums1) || !Array.isArray(data.nums2)) throw new Error('Use an object such as {"nums1":[2,1,3],"nums2":[10,2,5,0]}.')
  const { nums1, nums2 } = data
  for (const [name, arr] of [['nums1', nums1], ['nums2', nums2]]) {
    if (arr.length < 1 || arr.length > 6) throw new Error(`${name} has 1 to 6 entries.`)
    if (!arr.every(v => Number.isInteger(v) && v >= 0 && v <= 15)) throw new Error(`${name} values are integers from 0 to 15 in this visualization.`)
  }
  return { nums1, nums2 }
}

export function buildTrace({ nums1, nums2 }) {
  let result = 0
  const frames = [{ phase: 'start', activeLine: L('set result to 0'), result, message: `Each of the ${nums1.length * nums2.length} pairs contributes one value. Count how many times each value appears.` }]
  if (nums2.length % 2 === 1) {
    const part = nums1.reduce((a, b) => a ^ b, 0)
    result ^= part
    frames.push({ phase: 'nums1', activeLine: L('if the length of nums2 is odd'), result, message: `nums2 has odd length, so each nums1 value is paired an odd number of times. Its xor ${part} is included.` })
  } else {
    frames.push({ phase: 'nums1', activeLine: L('if the length of nums2 is odd'), result, message: 'nums2 has even length, so each nums1 value is paired an even number of times and cancels out.' })
  }
  if (nums1.length % 2 === 1) {
    const part = nums2.reduce((a, b) => a ^ b, 0)
    result ^= part
    frames.push({ phase: 'nums2', activeLine: L('if the length of nums1 is odd'), result, message: `nums1 has odd length, so each nums2 value is paired an odd number of times. Its xor ${part} is included.` })
  } else {
    frames.push({ phase: 'nums2', activeLine: L('if the length of nums1 is odd'), result, message: 'nums1 has even length, so each nums2 value cancels out.' })
  }
  frames.push({ phase: 'done', activeLine: L('return result'), result, message: `Bitwise XOR of all pairings: ${result}.` })
  return { input: { nums1, nums2 }, result, frames }
}

export const code = `xor of all pairings:
  set result to 0
  if the length of nums2 is odd then
    xor every value of nums1 into result
  if the length of nums1 is odd then
    xor every value of nums2 into result
  return result`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def pairing_xor(nums1, nums2):
    result = 0
    if len(nums2) % 2 == 1:
        for a in nums1:
            result ^= a
    if len(nums1) % 2 == 1:
        for b in nums2:
            result ^= b
    return result
`
