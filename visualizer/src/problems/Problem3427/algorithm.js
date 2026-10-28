export function parseInput(text) {
  const nums = JSON.parse(text)
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 12 || nums.some(v => !Number.isInteger(v) || v < 1 || v > 1000)) throw new Error('Use 1 to 12 integers from 1 to 1000.')
  return nums
}

export function buildTrace(nums) {
  let total = 0
  const frames = [{ phase: 'start', activeLine: L('set total to zero'), index: -1, start: -1, sub: 0, total: 0, message: 'Add one variable-length subarray for each index.' }]
  for (let i = 0; i < nums.length; i++) {
    const start = Math.max(0, i - nums[i])
    let sub = 0
    for (let j = start; j <= i; j++) sub += nums[j]
    total += sub
    frames.push({ phase: 'add', activeLine: L('add the values from start through i'), index: i, start, sub, total, message: `Index ${i} uses positions ${start} to ${i}, sum ${sub}; running total ${total}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return total'), index: -1, start: -1, sub: 0, total, message: `Total: ${total}.` })
  return { input: nums, result: total, frames }
}

export const code = `sum of variable length subarrays:
  set total to zero
  for each index i from 0 to the last index
    set start to i minus nums[i], but not below zero
    add the values from start through i to total
  return total`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def sum_of_variable_length_subarrays(nums):
    total = 0
    for i in range(len(nums)):
        start = max(0, i - nums[i])
        total += sum(nums[start:i + 1])
    return total
`
