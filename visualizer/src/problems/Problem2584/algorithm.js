const MAX_LENGTH = 10
const MAX_VALUE = 60

export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || !Array.isArray(data.nums)) throw new Error('Use an object like {"nums":[4,7,8,15,3,5]}.')
  if (data.nums.length < 2 || data.nums.length > MAX_LENGTH) throw new Error(`Use 2 to ${MAX_LENGTH} values.`)
  if (data.nums.some(v => !Number.isInteger(v) || v < 1 || v > MAX_VALUE)) throw new Error(`Values are integers from 1 to ${MAX_VALUE}.`)
  return { nums: data.nums }
}

function primesOf(value) {
  const found = []
  let rest = value
  for (let d = 2; d * d <= rest; d++) {
    if (rest % d === 0) {
      found.push(d)
      while (rest % d === 0) rest /= d
    }
  }
  if (rest > 1) found.push(rest)
  return found
}

export function buildTrace({ nums }) {
  const factors = nums.map(primesOf)
  const last = new Map()
  factors.forEach((fs, i) => fs.forEach(p => last.set(p, i)))
  const frames = [{ phase: 'factor', activeLine: L('for each index i, record'), index: -1, reach: -1, message: 'Recorded the last index at which each prime appears.' }]
  let reach = -1
  let answer = -1
  for (let i = 0; i < nums.length - 1; i++) {
    for (const p of factors[i]) reach = Math.max(reach, last.get(p))
    if (reach <= i) {
      answer = i
      frames.push({ phase: 'scan', activeLine: L('if reach is at most i'), index: i, reach, message: `Primes of the prefix all end by index ${i}, so the split after ${i} works.` })
      break
    }
    frames.push({ phase: 'scan', activeLine: L('set reach to the larger'), index: i, reach, message: `Prefix primes last appear at index ${reach}, so split ${i} fails.` })
  }
  frames.push({ phase: 'done', activeLine: L('return -1'), index: answer, reach, message: answer === -1 ? 'No split gives coprime products.' : `First valid split index: ${answer}.` })
  return { input: { nums }, result: answer, factors, frames }
}

export const code = `index where prefix and suffix products become coprime
  for each index i, record i as the last index of each prime factor of nums[i]
  set reach to -1
  for each index i from 0 to n - 2
    for each prime p in the prime factors of nums[i]
      set reach to the larger of reach and last[p]
    if reach is at most i then return i
  return -1`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def coprime_split_index(nums):
    def prime_factors(x):
        found = set()
        d = 2
        while d * d <= x:
            while x % d == 0:
                found.add(d)
                x //= d
            d += 1
        if x > 1:
            found.add(x)
        return found
    factors = [prime_factors(x) for x in nums]
    last = {}
    for i, fs in enumerate(factors):
        for p in fs:
            last[p] = i
    reach = -1
    for i in range(len(nums) - 1):
        for p in factors[i]:
            reach = max(reach, last[p])
        if reach <= i:
            return i
    return -1
`
