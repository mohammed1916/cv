export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Use an object with nums and k, for example {"nums":[2,3,5,7],"k":3}.')
  const { nums, k } = data
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 12) throw new Error('nums must have 1 to 12 entries.')
  if (nums.some(x => !Number.isInteger(x) || x < 1 || x > 60)) throw new Error('Each value is an integer from 1 to 60.')
  if (!Number.isInteger(k) || k < 0 || k > 60) throw new Error('k must be an integer from 0 to 60.')
  return { nums: [...nums], k }
}

function isPrime(x) {
  if (x < 2) return false
  for (let d = 2; d * d <= x; d++) if (x % d === 0) return false
  return true
}

export function buildTrace(input) {
  const { nums, k } = input
  const n = nums.length
  let count = 0
  const frames = [{ phase: 'start', activeLine: L('set count to 0'), start: null, count: 0, message: 'Count subarrays that contain at least two primes whose largest and smallest differ by at most k.' }]
  for (let l = 0; l < n; l++) {
    let lo = null
    let hi = null
    let primes = 0
    for (let r = l; r < n; r++) {
      if (isPrime(nums[r])) {
        primes++
        lo = lo === null ? nums[r] : Math.min(lo, nums[r])
        hi = hi === null ? nums[r] : Math.max(hi, nums[r])
      }
      if (primes >= 2 && hi - lo <= k) count++
    }
    frames.push({ phase: 'start-index', activeLine: L('for each start l'), start: l, count, message: `Subarrays starting at ${l} are counted. Running total: ${count}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return count'), start: null, count, message: `There are ${count} prime-gap balanced subarrays.` })
  return { input, result: count, frames }
}

export const code = `count prime gap balanced subarrays (nums, k)
  set count to 0
  for each start l
    set lo and hi to nothing and primes to 0
    for each end r from l to the last index
      if nums[r] is prime then
        add one to primes, and update lo and hi with nums[r]
      if primes is at least 2 and hi minus lo is at most k then add one to count
  return count`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def count_prime_gap_balanced(nums, k):
    def is_prime(x):
        if x < 2:
            return False
        d = 2
        while d * d <= x:
            if x % d == 0:
                return False
            d += 1
        return True

    n = len(nums)
    count = 0
    for l in range(n):
        lo = hi = None
        primes = 0
        for r in range(l, n):
            if is_prime(nums[r]):
                primes += 1
                lo = nums[r] if lo is None else min(lo, nums[r])
                hi = nums[r] if hi is None else max(hi, nums[r])
            if primes >= 2 and hi - lo <= k:
                count += 1
    return count
`
