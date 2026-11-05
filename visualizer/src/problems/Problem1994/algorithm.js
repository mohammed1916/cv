export const phases = [
  { id: 'start', label: 'Start', description: 'Start with the empty set of primes used: one way to have product 1 with no primes.' },
  { id: 'value', label: 'Add a value', description: 'A squarefree value adds its primes as a bit mask; it can only join states whose primes do not overlap.' },
  { id: 'ones', label: 'Ones', description: 'Each 1 can be included or left out freely without changing the product.' },
  { id: 'done', label: 'Result', description: 'Sum the non-empty prime states, then multiply by 2 for each 1.' },
]

export const code = `const PRIMES = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29]

function primeMask(x) {
  let mask = 0
  for (let i = 0; i < PRIMES.length; i++) {
    if (x % PRIMES[i] === 0) {
      x /= PRIMES[i]
      if (x % PRIMES[i] === 0) return -1
      mask |= 1 << i
    }
  }
  return mask
}

function countGoodSubsets(nums) {
  const MOD = 1000000007
  const count = new Array(31).fill(0)
  for (const x of nums) count[x]++
  const dp = new Array(1 << PRIMES.length).fill(0)
  dp[0] = 1
  for (let x = 2; x <= 30; x++) {
    const mask = primeMask(x)
    if (count[x] === 0 || mask === -1) continue
    for (let state = dp.length - 1; state >= 0; state--) {
      if ((state & mask) === 0) dp[state | mask] = (dp[state | mask] + dp[state] * count[x]) % MOD
    }
  }
  let ans = (dp.reduce((sum, v) => (sum + v) % MOD, 0) - 1 + MOD) % MOD
  for (let i = 0; i < count[1]; i++) ans = (ans * 2) % MOD
  return ans
}`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `PRIMES = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29]

def prime_mask(x):
    mask = 0
    for i, p in enumerate(PRIMES):
        if x % p == 0:
            x //= p
            if x % p == 0:
                return -1
            mask |= 1 << i
    return mask

def count_good_subsets(nums):
    MOD = 1000000007
    count = [0] * 31
    for x in nums:
        count[x] += 1
    dp = [0] * (1 << len(PRIMES))
    dp[0] = 1
    for x in range(2, 31):
        mask = prime_mask(x)
        if count[x] == 0 or mask == -1:
            continue
        for state in range(len(dp) - 1, -1, -1):
            if state & mask == 0:
                dp[state | mask] = (dp[state | mask] + dp[state] * count[x]) % MOD
    ans = (sum(dp) % MOD - 1 + MOD) % MOD
    for _ in range(count[1]):
        ans = (ans * 2) % MOD
    return ans
`

const C = fragment => code.findIndex(c => c.text.includes(fragment)) + 1
const P = fragment => python.split('\n').findIndex(line => line.includes(fragment)) + 1
const PRIMES = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29]

function primeMask(x) {
  let mask = 0
  for (let i = 0; i < PRIMES.length; i++) {
    if (x % PRIMES[i] === 0) {
      x /= PRIMES[i]
      if (x % PRIMES[i] === 0) return -1
      mask |= 1 << i
    }
  }
  return mask
}

export function parseInput(text) {
  let nums
  try { nums = JSON.parse(text) } catch { throw new Error('Use a JSON array such as [1,2,3,4].') }
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 50) throw new Error('nums must have 1 to 50 values here.')
  if (!nums.every(v => Number.isInteger(v) && v >= 1 && v <= 30)) throw new Error('Each value must be a whole number from 1 to 30.')
  return nums
}

export function buildTrace(nums) {
  const MOD = 1000000007
  const frames = []
  const count = new Array(31).fill(0)
  for (const x of nums) count[x]++
  const dp = new Array(1 << PRIMES.length).fill(0)
  dp[0] = 1
  const live = () => dp.map((v, state) => [state, v]).filter(([, v]) => v > 0)
  const add = (phase, c, p, message, value) => frames.push({
    phase, activeLine: C(c), pythonLine: P(p), message,
    snapshot: { nums, value, states: live(), ones: count[1], primes: PRIMES },
  })
  add('start', 'const PRIMES', 'PRIMES = ', 'Only the empty product is possible before any value is added.', null)
  for (let x = 2; x <= 30; x++) {
    const mask = primeMask(x)
    if (count[x] === 0 || mask === -1) continue
    for (let state = dp.length - 1; state >= 0; state--) {
      if ((state & mask) === 0) dp[state | mask] = (dp[state | mask] + dp[state] * count[x]) % MOD
    }
    add('value', 'const mask = primeMask', 'mask = prime_mask', `Value ${x} (${count[x]} copies) uses prime mask ${mask.toString(2).padStart(PRIMES.length, '0')}.`, x)
  }
  let ans = (dp.reduce((sum, v) => (sum + v) % MOD, 0) - 1 + MOD) % MOD
  add('ones', 'for (let i = 0; i < count[1]', 'for _ in range(count[1])', `There are ${count[1]} ones, which double the count.`, 1)
  for (let i = 0; i < count[1]; i++) ans = (ans * 2) % MOD
  add('done', 'return ans', 'return ans', `${ans} good subsets.`, null)
  return { input: nums, result: ans, frames }
}
