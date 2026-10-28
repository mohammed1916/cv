export function parseInput(text) {
  const nums = JSON.parse(text)
  if (!Array.isArray(nums) || nums.length < 2 || nums.length > 12) throw new Error('Use an array of 2 to 12 integers.')
  if (nums.some(v => !Number.isInteger(v) || v < 1 || v > 1000000)) throw new Error('Values are integers from 1 to 1000000.')
  return nums
}

export function buildTrace(nums) {
  const frames = []
  let best = 0
  let bestPair = null
  frames.push({ phase: 'start', activeLine: L('set best to 0'), i: -1, j: -1, best, bestPair, message: 'Start with no qualifying pair. The answer is 0 unless some pair has a zero AND.' })
  for (let i = 0; i < nums.length - 1; i++) {
    for (let j = i + 1; j < nums.length; j++) {
      const and = nums[i] & nums[j]
      if (and !== 0) {
        frames.push({ phase: 'check', activeLine: L('if the AND of'), i, j, best, bestPair, message: `${nums[i]} AND ${nums[j]} = ${and}, so this pair is skipped.` })
        continue
      }
      const product = nums[i] * nums[j]
      if (product > best) {
        best = product
        bestPair = [i, j]
        frames.push({ phase: 'best', activeLine: L('set best to the product'), i, j, best, bestPair, message: `${nums[i]} AND ${nums[j]} = 0. Product ${product} is the new best.` })
      } else {
        frames.push({ phase: 'check', activeLine: L('if the AND of'), i, j, best, bestPair, message: `${nums[i]} AND ${nums[j]} = 0, product ${product} does not beat ${best}.` })
      }
    }
  }
  frames.push({ phase: 'done', activeLine: L('return best'), i: -1, j: -1, best, bestPair, message: `Answer: ${best}.` })
  return { input: nums, result: best, frames }
}

export const code = `maximum product with no common bits (nums):
  set best to 0
  for each index i before the last index do
    for each index j after i do
      if the AND of nums at i and nums at j is not 0 then skip this pair
      set product to nums at i times nums at j
      if product is greater than best then set best to the product
  return best`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def max_product_no_common_bits(nums):
    best = 0
    for i in range(len(nums) - 1):
        for j in range(i + 1, len(nums)):
            if nums[i] & nums[j] != 0:
                continue
            best = max(best, nums[i] * nums[j])
    return best
`
