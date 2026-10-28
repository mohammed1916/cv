export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Use an object with nums and target, for example {"nums":[3,1,6,8,4],"target":24}.')
  const { nums, target } = data
  if (!Array.isArray(nums) || nums.length < 3 || nums.length > 8) throw new Error('nums must have 3 to 8 entries.')
  if (nums.some(x => !Number.isInteger(x) || x < 1 || x > 100)) throw new Error('Each element is an integer from 1 to 100.')
  if (new Set(nums).size !== nums.length) throw new Error('The elements must be distinct.')
  if (!Number.isInteger(target) || target < 1 || target > 10000000000) throw new Error('target must be an integer from 1 to 10^10 in this visualization.')
  return { nums: [...nums], target }
}

export function buildTrace(input) {
  const { nums, target } = input
  const n = nums.length
  const full = (1 << n) - 1
  const productOf = mask => nums.reduce((p, x, i) => ((mask >> i) & 1 ? p * x : p), 1)
  const total = productOf(full)
  const frames = [{ phase: 'start', activeLine: L('set total to the product of all elements'), mask: null, message: `The product of all elements is ${total}. Each group must multiply to ${target}, so the whole product must be ${target * target}.` }]
  if (total !== target * target) {
    frames.push({ phase: 'done', activeLine: L('return false'), mask: null, message: `The whole product is ${total}, not ${target * target}, so no split works.` })
    return { input, result: false, frames }
  }
  for (let mask = 1; mask < full; mask++) {
    const p = productOf(mask)
    if (p === target) {
      frames.push({ phase: 'found', activeLine: L('return true'), mask, message: `The group with mask ${mask.toString(2).padStart(n, '0')} multiplies to ${target}, and its complement does too.` })
      return { input, result: true, frames }
    }
    frames.push({ phase: 'try', activeLine: L('for each non-empty proper subset mask'), mask, message: `Subset ${mask.toString(2).padStart(n, '0')} multiplies to ${p}, not ${target}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return false'), mask: null, message: 'No subset has product equal to the target, so the answer is false.' })
  return { input, result: false, frames }
}

export const code = `equal product partition (nums, target)
  set total to the product of all elements
  if total is not target times target then return false
  for each non-empty proper subset mask of the elements
    set p to the product of the elements in the subset
    if p equals target then return true
  return false`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def can_partition_products(nums, target):
    n = len(nums)
    full = (1 << n) - 1

    def product_of(mask):
        p = 1
        for i in range(n):
            if (mask >> i) & 1:
                p *= nums[i]
        return p

    total = product_of(full)
    if total != target * target:
        return False
    for mask in range(1, full):
        if product_of(mask) == target:
            return True
    return False
`
