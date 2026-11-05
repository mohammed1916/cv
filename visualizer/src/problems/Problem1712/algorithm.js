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
  const frames = [{ phase: 'start', pythonLine: 7, activeLine: L('const prefix = [0]'), i: -1, lo: null, hi: null, count: 0, message: `Prefix sums are ready; the whole array sums to ${total}.` }]
  for (let i = 1; i <= n - 2; i++) {
    const lo = firstTrue(i + 1, n, j => prefix[j] >= 2 * prefix[i])
    const hi = firstTrue(i + 1, n, j => 2 * prefix[j] > total + prefix[i]) - 1
    if (lo <= hi) count += hi - lo + 1
    frames.push({ phase: 'scan', pythonLine: lo <= hi ? 12 : 11, activeLine: L('const lo = firstTrue'), i, lo, hi, count, message: `Left part ends before ${i} (sum ${prefix[i]}). Valid middle ends run from ${lo} to ${hi}.` })
  }
  frames.push({ phase: 'done', pythonLine: 13, activeLine: L('return count % MOD'), i: -1, lo: null, hi: null, count: count % MOD, message: `Ways to split: ${count % MOD}.` })
  return { input, nums, result: count % MOD, frames }
}

export const code = `function waysToSplit(nums) {
  const MOD = 1000000007
  const n = nums.length
  const prefix = [0]
  for (const v of nums) prefix.push(prefix[prefix.length - 1] + v)
  const total = prefix[n]
  let count = 0
  for (let i = 1; i <= n - 2; i++) {
    const lo = firstTrue(i + 1, n, j => prefix[j] >= 2 * prefix[i])
    const hi = firstTrue(i + 1, n, j => 2 * prefix[j] > total + prefix[i]) - 1
    if (lo <= hi) count += hi - lo + 1
  }
  return count % MOD
}

function firstTrue(from, to, pred) {
  let lo = from
  let hi = to
  while (lo < hi) {
    const mid = (lo + hi) >> 1
    if (pred(mid)) hi = mid
    else lo = mid + 1
  }
  return lo
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def first_true(lo, hi, pred):
    while lo < hi:
        mid = (lo + hi) // 2
        if pred(mid):
            hi = mid
        else:
            lo = mid + 1
    return lo

def ways_to_split(nums):
    MOD = 1000000007
    n = len(nums)
    prefix = [0]
    for v in nums:
        prefix.append(prefix[-1] + v)
    total = prefix[n]
    count = 0
    for i in range(1, n - 1):
        lo = first_true(i + 1, n, lambda j: prefix[j] >= 2 * prefix[i])
        hi = first_true(i + 1, n, lambda j: 2 * prefix[j] > total + prefix[i]) - 1
        if lo <= hi:
            count += hi - lo + 1
    return count % MOD
`
