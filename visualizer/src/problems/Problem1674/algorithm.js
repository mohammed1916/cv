export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Use an object with nums and limit.')
  const { nums, limit } = data
  if (!Number.isInteger(limit) || limit < 1 || limit > 10) throw new Error('limit must be an integer from 1 to 10.')
  if (!Array.isArray(nums) || nums.length < 2 || nums.length > 12 || nums.length % 2 !== 0) throw new Error('nums must have an even length from 2 to 12.')
  if (nums.some(v => !Number.isInteger(v) || v < 1 || v > limit)) throw new Error('Each nums value must be an integer from 1 to limit.')
  return { nums, limit }
}

export const code = `minimum moves so every mirrored pair has the same sum
  let limit be the largest allowed value and n the array length
  make a difference array over sums from 0 to twice the limit
  for each mirrored pair with values a and b
  add 2 moves to every sum as the default cost
  take away 1 move for sums from the low value plus 1 up to the high value plus limit
  take away 1 more move for the sum a plus b
  turn the difference array into costs by a running sum
  return the smallest cost for a sum from 2 to twice the limit`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export function buildTrace({ nums, limit }) {
  const n = nums.length
  const top = 2 * limit
  const diff = Array(top + 3).fill(0)
  let base = 0
  const frames = [{ phase: 'start', activeLine: L('make a difference array'), index: -1, costs: null, message: `Try every common sum from 2 to ${top}.` }]
  for (let i = 0; i < n / 2; i++) {
    const a = nums[i]
    const b = nums[n - 1 - i]
    const lo = Math.min(a, b)
    const hi = Math.max(a, b)
    base += 2
    diff[lo + 1] -= 1
    diff[hi + limit + 1] += 1
    diff[a + b] -= 1
    diff[a + b + 1] += 1
    frames.push({ phase: 'pair', activeLine: L('for each mirrored'), index: a + b, costs: null, message: `Pair (${a}, ${b}) costs 2 by default, 1 for sums ${lo + 1} to ${hi + limit}, and 0 for sum ${a + b}.` })
  }
  const costs = []
  let running = 0
  for (let x = 0; x <= top; x++) {
    running += diff[x]
    costs.push(base + running)
  }
  frames.push({ phase: 'scan', activeLine: L('running sum'), index: -1, costs: [...costs], message: 'Each target sum now has its total number of moves.' })
  let best = Infinity
  let bestSum = 2
  for (let x = 2; x <= top; x++) {
    if (costs[x] < best) { best = costs[x]; bestSum = x }
  }
  frames.push({ phase: 'done', activeLine: L('return the smallest'), index: bestSum, costs, message: `Target sum ${bestSum} needs ${best} move(s).` })
  return { input: { nums, limit }, costs, result: best, frames }
}

export const python = `def min_complementary_moves(nums, limit):
    n = len(nums)
    top = 2 * limit
    diff = [0] * (top + 3)
    base = 0
    for i in range(n // 2):
        a = nums[i]
        b = nums[n - 1 - i]
        lo = min(a, b)
        hi = max(a, b)
        base += 2
        diff[lo + 1] -= 1
        diff[hi + limit + 1] += 1
        diff[a + b] -= 1
        diff[a + b + 1] += 1
    costs = []
    running = 0
    for x in range(top + 1):
        running += diff[x]
        costs.append(base + running)
    return min(costs[2:])
`
