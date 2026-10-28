export function parseInput(text) {
  const obj = JSON.parse(text)
  if (!obj || typeof obj !== 'object' || !Array.isArray(obj.nums)) throw new Error('Use a JSON object with a "nums" array.')
  const { nums } = obj
  if (nums.length < 1 || nums.length > 30) throw new Error('nums must have 1 to 30 entries for this visualization.')
  if (nums.some(v => !Number.isInteger(v) || v < 1 || v > 1000)) throw new Error('Each value must be an integer from 1 to 1000.')
  return { nums }
}

export function buildTrace({ nums }) {
  const total = nums.reduce((a, b) => a + b, 0)
  const cap = total + 1
  const n = nums.length
  // right[i] is the product of nums after i, capped: any product above the total can never match a left sum.
  const right = new Array(n).fill(0)
  let prod = 1
  for (let i = n - 1; i >= 0; i--) {
    right[i] = prod
    prod = Math.min(prod * nums[i], cap)
  }
  const frames = [{ phase: 'start', activeLine: L('set total to'), index: -1, left: 0, right: null, result: null, message: `Total ${total}. Right products above ${total} are capped.` }]
  let left = 0
  let result = -1
  for (let i = 0; i < n; i++) {
    const match = left === right[i]
    frames.push({ phase: match ? 'found' : 'check', activeLine: L('if the left sum equals'), index: i, left, right: right[i], result: null,
      message: `Index ${i}: left sum ${left}, right product ${right[i] === cap ? `above ${total}` : right[i]}${match ? ', they match' : ', no match'}.` })
    if (match) { result = i; break }
    left += nums[i]
  }
  frames.push({ phase: 'done', activeLine: L('return -1'), index: result, left: null, right: null, result, message: `Answer: ${result}.` })
  return { input: { nums }, result, frames }
}

export const code = `smallest balanced index (nums):
  set total to the sum of nums
  set cap to total plus 1
  compute right[i] as the product of nums after i, capped at cap
  set left to 0
  for each index i from 0 to n minus 1
    if the left sum equals right[i] then
      return i
    add nums[i] to left
  return -1`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def smallest_balanced_index(nums):
    total = sum(nums)
    cap = total + 1
    right = [0] * len(nums)
    prod = 1
    for i in range(len(nums) - 1, -1, -1):
        right[i] = prod
        prod = min(prod * nums[i], cap)
    left = 0
    for i, v in enumerate(nums):
        if left == right[i]:
            return i
        left += v
    return -1
`
