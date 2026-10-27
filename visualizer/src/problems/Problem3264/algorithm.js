export function parseInput(text) {
  const data = JSON.parse(text)
  const { nums, k, multiplier } = data ?? {}
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 8) throw new Error('Use "nums" as an array of 1 to 8 numbers.')
  if (nums.some(x => !Number.isInteger(x) || x < 1 || x > 20)) throw new Error('Each number is an integer from 1 to 20.')
  if (!Number.isInteger(k) || k < 1 || k > 10) throw new Error('"k" is an integer from 1 to 10.')
  if (!Number.isInteger(multiplier) || multiplier < 1 || multiplier > 5) throw new Error('"multiplier" is an integer from 1 to 5.')
  return { nums, k, multiplier }
}

export function buildTrace({ nums, k, multiplier }) {
  const values = [...nums]
  const frames = [{ phase: 'start', activeLine: L('repeat k times'), values: [...values], picked: -1, message: 'Each operation multiplies the first smallest number.' }]
  for (let round = 1; round <= k; round++) {
    let at = 0
    for (let i = 1; i < values.length; i++) if (values[i] < values[at]) at = i
    values[at] *= multiplier
    frames.push({ phase: 'multiply', activeLine: L('multiply nums'), values: [...values], picked: at, message: `Operation ${round}: index ${at} becomes ${values[at]}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return nums'), values: [...values], picked: -1, message: `Final array: [${values.join(', ')}].` })
  return { input: { nums, k, multiplier }, result: values, frames }
}

export const code = `final array state after k multiplication operations on nums
  repeat k times
    find the first index i that holds the smallest number
    multiply nums[i] by the multiplier
  return nums`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def final_array_state(nums, k, multiplier):
    nums = list(nums)
    for _ in range(k):
        i = nums.index(min(nums))
        nums[i] *= multiplier
    return nums
`
