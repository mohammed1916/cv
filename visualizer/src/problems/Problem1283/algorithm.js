export function parseInput(text) {
  const input = JSON.parse(text)
  const nums = input?.nums
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 8) throw new Error('Give nums as an array of 1 to 8 entries.')
  if (nums.some(v => !Number.isInteger(v) || v < 1 || v > 50)) throw new Error('Each value in nums is an integer from 1 to 50.')
  if (!Number.isInteger(input.threshold) || input.threshold < nums.length || input.threshold > 50) throw new Error('threshold is an integer from the length of nums up to 50.')
  return { nums, threshold: input.threshold }
}

export function buildTrace({ nums, threshold }) {
  const frames = []
  let low = 1, high = Math.max(...nums)
  frames.push({ phase: 'start', activeLine: L('set low to one'), low, high, mid: null, sum: null, message: `Try divisors from ${low} to ${high}. A larger divisor never raises the sum.` })
  while (low < high) {
    const mid = Math.floor((low + high) / 2)
    const sum = nums.reduce((acc, v) => acc + Math.floor((v + mid - 1) / mid), 0)
    if (sum <= threshold) high = mid
    else low = mid + 1
    frames.push({ phase: 'probe', activeLine: L('if the rounded up'), low, high, mid, sum, message: `Divisor ${mid} gives sum ${sum} ${sum <= threshold ? 'within' : 'above'} ${threshold}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return low'), low, high, mid: null, sum: null, message: `The smallest divisor is ${low}.` })
  return { input: { nums, threshold }, result: low, frames }
}

export const code = `smallest divisor (nums, threshold)
  set low to one and high to the largest value in nums
  while low is less than high
    set mid to the middle of low and high
    if the rounded up quotient sum at mid is at most threshold then
      set high to mid
    otherwise
      set low to mid plus one
  return low`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def smallest_divisor(nums, threshold):
    low = 1
    high = max(nums)
    while low < high:
        mid = (low + high) // 2
        total = sum(-(-value // mid) for value in nums)
        if total <= threshold:
            high = mid
        else:
            low = mid + 1
    return low
`
