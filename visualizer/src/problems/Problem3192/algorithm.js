export function parseInput(text) {
  const nums = JSON.parse(text)
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 12) throw new Error('Use a binary array of 1 to 12 entries.')
  if (nums.some(v => v !== 0 && v !== 1)) throw new Error('Each entry is 0 or 1.')
  return nums
}

export function buildTrace(nums) {
  const frames = [{ phase: 'start', activeLine: L('set flipped'), index: 0, from: -1, to: -1, operations: 0, flipped: 0, message: 'Scan from the left. Track whether the suffix is currently flipped.' }]
  let flipped = 0
  let operations = 0
  nums.forEach((x, i) => {
    const current = x ^ flipped
    if (current === 0) {
      operations += 1
      flipped ^= 1
      frames.push({ phase: 'flip', activeLine: L('flip the suffix'), index: i, from: i, to: nums.length - 1, operations, flipped, message: `Position ${i} reads 0 after earlier flips, so flip the suffix from ${i} onward.` })
    } else {
      frames.push({ phase: 'keep', activeLine: L('if the value there'), index: i, from: -1, to: -1, operations, flipped, message: `Position ${i} reads 1, so no flip is needed.` })
    }
  })
  frames.push({ phase: 'done', activeLine: L('return operations'), index: -1, from: -1, to: -1, operations, flipped, message: `Minimum suffix flips: ${operations}.` })
  return { input: nums, result: operations, frames }
}

export const code = `minimum suffix flips to make every value one
  set flipped to 0
  set operations to 0
  for each index from the left
    if the value there xor flipped is 0 then
      flip the suffix from this index and count one operation
      toggle flipped
  return operations`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def min_suffix_flips(nums):
    flipped = 0
    ops = 0
    for x in nums:
        if (x ^ flipped) == 0:
            ops += 1
            flipped ^= 1
    return ops
`
