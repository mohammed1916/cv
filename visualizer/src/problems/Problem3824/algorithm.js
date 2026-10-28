export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || !Array.isArray(input.nums)) throw new Error('Use a JSON object with a nums array.')
  if (input.nums.length < 1 || input.nums.length > 12) throw new Error('nums needs 1 to 12 values (visualization cap).')
  if (input.nums.some(v => !Number.isInteger(v) || v < 1 || v > 60)) throw new Error('nums values are integers from 1 to 60.')
  return input
}

const ops = (nums, k) => nums.reduce((s, x) => s + Math.ceil(x / k), 0)

export function buildTrace(input) {
  const { nums } = input
  let low = 1
  let high = Math.max(...nums) + nums.length
  const frames = [{ phase: 'search', activeLine: L('low = 1, high ='), k: null, operations: null, low, high, message: `Binary search for the smallest k between ${low} and ${high}.` }]
  while (low < high) {
    const mid = Math.floor((low + high) / 2)
    const count = ops(nums, mid)
    const ok = count <= mid * mid
    if (ok) high = mid
    else low = mid + 1
    frames.push({ phase: 'probe', activeLine: L('if operations(mid) is at most'), k: mid, operations: count, low, high, ok, message: `k = ${mid} needs ${count} operations, ${ok ? 'within' : 'over'} the limit ${mid * mid}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return low'), k: low, operations: ops(nums, low), low, high, message: `Smallest valid k: ${low}.` })
  return { input, result: low, frames }
}

export const code = `minimum k to reduce array within limit (nums):
  operations(k) = sum of ceil(x / k) over all x in nums
  low = 1, high = max(nums) + length of nums
  while low is less than high
    mid = (low + high) divided by 2
    if operations(mid) is at most mid squared then high = mid
    otherwise low = mid + 1
  return low`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def minimum_k_to_reduce_array_within_limit(nums):
    def ops(k):
        return sum((x + k - 1) // k for x in nums)

    low, high = 1, max(nums) + len(nums)
    while low < high:
        mid = (low + high) // 2
        if ops(mid) <= mid * mid:
            high = mid
        else:
            low = mid + 1
    return low
`
