export function parseInput(text) {
  const data = JSON.parse(text)
  const { nums, k } = data ?? {}
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 30000 || nums.some(v => !Number.isInteger(v) || v < 1 || v > 1000)) throw new Error('nums must be 1–30,000 integers from 1 to 1,000.')
  if (!Number.isInteger(k) || k < 0 || k > 1000000) throw new Error('k must be an integer from 0 to 1,000,000.')
  return { nums, k }
}

const JS_LINES = [
  'function numSubarrayProductLessThanK(nums, k) {',
  '  if (k <= 1) return 0 // no positive product of values of at least 1 can be below 1',
  '  let left = 0, product = 1, count = 0',
  '  for (let right = 0; right < nums.length; right++) {',
  '    product *= nums[right] // grow the window on the right',
  '    while (product >= k) { // shrink from the left until the window is valid',
  '      product /= nums[left]',
  '      left++',
  '    }',
  '    count += right - left + 1 // every window ending at right is valid',
  '  }',
  '  return count',
  '}',
]
const PY_LINES = [
  'def num_subarray_product_less_than_k(nums, k):',
  '    if k <= 1:',
  '        return 0',
  '    left = 0',
  '    product = 1',
  '    count = 0',
  '    for right, value in enumerate(nums):',
  '        product *= value',
  '        while product >= k:',
  '            product //= nums[left]',
  '            left += 1',
  '        count += right - left + 1',
  '    return count',
]
const L = s => JS_LINES.findIndex(t => t.includes(s)) + 1
const P = s => PY_LINES.findIndex(t => t.includes(s)) + 1

export const code = JS_LINES.map((text, index) => ({ line: index + 1, text }))
export const python = PY_LINES.join('\n')

// Sliding window: extend right; while the product reaches k, shrink from the left. Each window ending at r adds r - l + 1.
export function buildTrace({ nums, k }) {
  if (k <= 1) {
    return { input: { nums, k }, result: 0, frames: [{ phase: 'done', l: 0, r: -1, product: 1, count: 0, activeLine: L('return 0'), pythonLine: P('return 0'), result: 0, message: `k is ${k}, so no subarray product can be strictly below it. The answer is 0.` }] }
  }
  let l = 0, product = 1, count = 0
  const frames = [{ phase: 'start', l, r: -1, product, count, activeLine: L('let left = 0'), pythonLine: P('left = 0'), message: `Window starts empty, product 1. Count subarrays whose product is below ${k}.` }]
  for (let r = 0; r < nums.length; r++) {
    product *= nums[r]
    frames.push({ phase: 'grow', l, r, product, count, activeLine: L('grow the window'), pythonLine: P('product *= value'), message: `Add nums[${r}] = ${nums[r]} on the right: product is now ${product}.` })
    while (product >= k) {
      product /= nums[l]
      frames.push({ phase: 'shrink', l, r, product, count, activeLine: L('product /= nums[left]'), pythonLine: P('product //= nums[left]'), message: `Product ${product * nums[l]} is not below ${k}; drop nums[${l}] = ${nums[l]} from the left.` })
      l++
    }
    count += r - l + 1
    frames.push({ phase: 'count', l, r, product, count, activeLine: L('count += right'), pythonLine: P('count += right'), message: `Window [${l}, ${r}] is valid: ${r - l + 1} subarray${r - l + 1 === 1 ? '' : 's'} end at index ${r}. Total ${count}.` })
  }
  frames.push({ phase: 'done', l, r: nums.length - 1, product, count, result: count, activeLine: L('return count'), pythonLine: P('return count'), message: `Subarrays with product below ${k}: ${count}.` })
  return { input: { nums, k }, result: count, frames }
}
