export function parseInput(text) {
  const nums = JSON.parse(text)
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 10) throw new Error('Use an array of 1 to 10 integers.')
  if (nums.some(v => !Number.isInteger(v) || v < 0 || v > 15)) throw new Error('Each element is an integer from 0 to 15 for this visualization.')
  return nums
}

export function buildTrace(nums) {
  let xor = 0
  const frames = [{ phase: 'start', activeLine: L('set xor to 0'), index: -1, xor, result: null, message: 'Start with a running XOR of 0.' }]
  nums.forEach((value, i) => {
    xor ^= value
    frames.push({ phase: 'scan', activeLine: L('xor the value into xor'), index: i, xor, result: null, message: `XOR with ${value}: running XOR is ${xor}.` })
  })
  let result
  let branchLine
  if (xor !== 0) {
    result = nums.length
    branchLine = L('return the length of nums')
    frames.push({ phase: 'keep', activeLine: L('if xor is not 0'), index: -1, xor, result: null, message: `Total XOR ${xor} is non-zero, so the whole array works.` })
  } else if (nums.some(v => v !== 0)) {
    result = nums.length - 1
    branchLine = L('minus 1')
    frames.push({ phase: 'drop', activeLine: L('some value in nums is not 0'), index: -1, xor, result: null, message: `Total XOR is 0. Dropping one non-zero value leaves XOR equal to that value.` })
  } else {
    result = 0
    branchLine = L('return 0')
    frames.push({ phase: 'zero', activeLine: L('return 0'), index: -1, xor, result: null, message: 'Every value is 0, so no non-zero XOR exists.' })
  }
  frames.push({ phase: 'done', activeLine: branchLine, index: -1, xor, result, message: `Longest length: ${result}.` })
  return { input: nums, result, frames }
}

export const code = `longest subsequence with non-zero XOR of nums
  set xor to 0
  for each value in nums
    xor the value into xor
  if xor is not 0 then
    return the length of nums
  if some value in nums is not 0 then
    return the length of nums minus 1
  return 0`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def longest_non_zero_xor_subsequence(nums):
    xor = 0
    for value in nums:
        xor ^= value
    if xor != 0:
        return len(nums)
    if any(value != 0 for value in nums):
        return len(nums) - 1
    return 0
`
