export function parseInput(text) {
  const nums = JSON.parse(text)
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 12) throw new Error('Use a binary array of 1 to 12 entries.')
  if (nums.some(v => v !== 0 && v !== 1)) throw new Error('Each entry is 0 or 1.')
  return nums
}

export function buildTrace(nums) {
  const values = [...nums]
  const frames = [{ phase: 'start', activeLine: L('set operations'), index: 0, from: -1, to: -1, operations: 0, values: [...values], message: 'Scan from the left. A zero at the start of a window forces that window to flip.' }]
  let operations = 0
  for (let i = 0; i + 2 < values.length; i++) {
    if (values[i] === 0) {
      for (let j = i; j <= i + 2; j++) values[j] ^= 1
      operations += 1
      frames.push({ phase: 'flip', activeLine: L('flip that value'), index: i, from: i, to: i + 2, operations, values: [...values], message: `Position ${i} is 0, so flip positions ${i} to ${i + 2}.` })
    } else {
      frames.push({ phase: 'skip', activeLine: L('if the value at start'), index: i, from: -1, to: -1, operations, values: [...values], message: `Position ${i} is already 1, so move on.` })
    }
  }
  const stuck = values.some(v => v === 0)
  if (stuck) {
    frames.push({ phase: 'stuck', activeLine: L('if any zero is left'), index: -1, from: -1, to: -1, operations, values: [...values], message: 'A zero is left in the last two positions, and no window fits there. The answer is -1.' })
    return { input: nums, result: -1, frames }
  }
  frames.push({ phase: 'done', activeLine: L('return operations'), index: -1, from: -1, to: -1, operations, values: [...values], message: `Minimum operations: ${operations}.` })
  return { input: nums, result: operations, frames }
}

export const code = `minimum window flips to make every value one
  set operations to 0
  for each start from the left to two places before the end
    if the value at start is 0 then
      flip that value and the next two values
      add 1 to operations
  if any zero is left then return -1
  return operations`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def min_operations(nums):
    arr = list(nums)
    ops = 0
    for i in range(len(arr) - 2):
        if arr[i] == 0:
            for j in range(i, i + 3):
                arr[j] ^= 1
            ops += 1
    if 0 in arr:
        return -1
    return ops
`
