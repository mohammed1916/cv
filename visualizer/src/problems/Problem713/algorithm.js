export function parseInput(text) {
  const data = JSON.parse(text)
  const { nums, k } = data ?? {}
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 30000 || nums.some(v => !Number.isInteger(v) || v < 1 || v > 1000)) throw new Error('nums must be 1–30,000 integers from 1 to 1,000.')
  if (!Number.isInteger(k) || k < 0 || k > 1000000) throw new Error('k must be an integer from 0 to 1,000,000.')
  return { nums, k }
}

// Sliding window: extend right; while the product reaches k, shrink from the left. Each window ending at r adds r − l + 1.
export function buildTrace({ nums, k }) {
  let l = 0, product = 1, count = 0
  const frames = [{ phase: 'start', l, r: -1, product, count, activeLine: 2, message: `Window product starts at 1; count subarrays with product < ${k}.` }]
  for (let r = 0; r < nums.length; r++) {
    product *= nums[r]
    while (l <= r && product >= k) {
      product /= nums[l]
      l++
    }
    count += r - l + 1
    frames.push({ phase: 'grow', l, r, product, count, activeLine: 8, message: `Window [${l}, ${r}] has product ${product}: ${r - l + 1} valid subarray${r - l + 1 === 1 ? '' : 's'} end here.` })
  }
  frames.push({ phase: 'done', l, r: nums.length - 1, product, count, result: count, activeLine: 10, message: `Subarrays with product < ${k}: ${count}.` })
  return { input: { nums, k }, result: count, frames }
}

export const code = `def numSubarrayProductLessThanK(nums, k):
    if k <= 1: return 0
    l, product, count = 0, 1, 0
    for r, x in enumerate(nums):
        product *= x
        while product >= k:
            product //= nums[l]
            l += 1
        count += r - l + 1
    return count`.split('\n').map((text, index) => ({ line: index + 1, text }))
