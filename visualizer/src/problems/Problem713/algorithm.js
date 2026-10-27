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

export const code = `if k is at most 1, return 0
set left to 0, product to 1, and count to 0
for each index right with value v in nums
  multiply product by v
  while product is at least k, divide product by nums[left] and increase left
  add right minus left plus 1 to count
return count`.split('\n').map((text, index) => ({ line: index + 1, text }))

// Family line 3 handles the k at most 1 threshold (line 1 here); line 1 sets up the window (line 2 here).
export const LINE_MAP = { 1: 2, 3: 1, 4: 6, 5: 7 }

export const python = `def num_subarray_product_less_than_k(nums, k):
    if k <= 1:
        return 0
    left = 0
    product = 1
    count = 0
    for right, value in enumerate(nums):
        product *= value
        while product >= k:
            product //= nums[left]
            left += 1
        count += right - left + 1
    return count`
