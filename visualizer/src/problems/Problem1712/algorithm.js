const MOD = 1000000007

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || !Array.isArray(input.nums)) throw new Error('Use an object with a "nums" array.')
  const { nums } = input
  if (nums.length < 3 || nums.length > 30) throw new Error('nums holds 3 to 30 integers.')
  if (nums.some(v => !Number.isInteger(v) || v < 0 || v > 9)) throw new Error('Each number is an integer from 0 to 9.')
  return { nums }
}

// Smallest index in [from, to) where pred is true, assuming pred is false then true; returns to if none.
function firstTrue(from, to, pred) {
  let lo = from
  let hi = to
  while (lo < hi) {
    const mid = (lo + hi) >> 1
    if (pred(mid)) hi = mid
    else lo = mid + 1
  }
  return lo
}

export function buildTrace(input) {
  const { nums } = input
  const n = nums.length
  const prefix = [0]
  for (const value of nums) prefix.push(prefix[prefix.length - 1] + value)
  const total = prefix[n]
  let count = 0
  const frames = [{ phase: 'start', activeLine: L('build prefix sums'), i: -1, lo: null, hi: null, count: 0, message: `Prefix sums are ready; the whole array sums to ${total}.` }]
  for (let i = 1; i <= n - 2; i++) {
    const lo = firstTrue(i + 1, n, j => prefix[j] >= 2 * prefix[i])
    const hi = firstTrue(i + 1, n, j => 2 * prefix[j] > total + prefix[i]) - 1
    if (lo <= hi) count += hi - lo + 1
    frames.push({ phase: 'scan', activeLine: L('find the first end j'), i, lo, hi, count, message: `Left part ends before ${i} (sum ${prefix[i]}). Valid middle ends run from ${lo} to ${hi}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return count modulo'), i: -1, lo: null, hi: null, count: count % MOD, message: `Ways to split: ${count % MOD}.` })
  return { input, nums, result: count % MOD, frames }
}

export const code = `ways to split the array into three non-empty parts with non-decreasing sums
  build prefix sums and set count to zero
  for each left end i from one to the length minus two
    find the first end j where the middle sum is at least the left sum
    find the last end j where the right sum is still at least the middle sum
    add the number of valid ends to count
  return count modulo one billion seven`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def ways_to_split(nums):
    MOD = 10**9 + 7
    n = len(nums)
    prefix = [0]
    for value in nums:
        prefix.append(prefix[-1] + value)
    total = prefix[n]

    def first_true(low, high, pred):
        while low < high:
            mid = (low + high) // 2
            if pred(mid):
                high = mid
            else:
                low = mid + 1
        return low

    count = 0
    for i in range(1, n - 1):
        lo = first_true(i + 1, n, lambda j: prefix[j] >= 2 * prefix[i])
        hi = first_true(i + 1, n, lambda j: 2 * prefix[j] > total + prefix[i]) - 1
        if lo <= hi:
            count += hi - lo + 1
    return count % MOD
`
