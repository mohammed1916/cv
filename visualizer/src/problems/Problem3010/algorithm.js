export function parseInput(text) {
  const nums = JSON.parse(text)
  if (!Array.isArray(nums) || nums.length < 3 || nums.length > 12) throw new Error('Use an array of 3 to 12 integers.')
  if (nums.some(v => !Number.isInteger(v) || v < 1 || v > 50)) throw new Error('Values are integers from 1 to 50.')
  return nums
}

export function buildTrace(nums) {
  const order = nums.map((value, index) => ({ value, index })).slice(1).sort((a, b) => a.value - b.value || a.index - b.index)
  const picks = order.slice(0, 2)
  let total = nums[0]
  const frames = [{ phase: 'first', activeLine: L('set total to the first value'), picked: [0], total, message: `The first subarray always pays ${nums[0]}.` }]
  const picked = [0]
  for (const pick of picks) {
    total += pick.value
    picked.push(pick.index)
    frames.push({ phase: 'pick', activeLine: L('add the two smallest'), picked: [...picked], total, message: `Start a subarray at position ${pick.index} (value ${pick.value}). Total is ${total}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return total'), picked: [...picked], total, message: `Minimum total cost: ${total}.` })
  return { input: nums, result: total, frames }
}

export const code = `minimum total cost of splitting into three subarrays:
  set total to the first value
  sort the values after the first into ascending order, keeping positions
  add the two smallest of them to total
  return total`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def minimum_cost(nums):
    total = nums[0]
    rest = sorted(nums[1:])
    total += rest[0] + rest[1]
    return total
`
