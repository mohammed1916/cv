export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input) || !Array.isArray(input.nums)) throw new Error('Use an object with a nums array.')
  const { nums } = input
  if (nums.length < 1 || nums.length > 8) throw new Error('nums must have 1 to 8 values.')
  if (nums.some(v => !Number.isInteger(v) || v < 1 || v > 50)) throw new Error('Each value is an integer from 1 to 50.')
  return { nums }
}

const isPrime = n => {
  if (n < 2) return false
  for (let d = 2; d * d <= n; d++) if (n % d === 0) return false
  return true
}

export function buildTrace({ nums }) {
  const frames = []
  const values = []
  let previous = 0
  let possible = true
  frames.push({ phase: 'start', activeLine: L('set previous to 0'), index: -1, previous, value: null, message: 'Start with no previous value.' })
  for (let i = 0; i < nums.length; i++) {
    const limit = nums[i] - previous - 1
    frames.push({ phase: 'check', activeLine: L('for each index'), index: i, previous, value: null, message: `Index ${i} holds ${nums[i]}; the largest subtraction keeps it above ${previous} only if the prime is at most ${limit}.` })
    let value
    if (limit >= 2) {
      let p = limit
      while (!isPrime(p)) p--
      value = nums[i] - p
      frames.push({ phase: 'subtract', activeLine: L('set value to nums at i minus p'), index: i, previous, value, prime: p, message: `Subtract the prime ${p}: ${nums[i]} becomes ${value}.` })
    } else if (nums[i] > previous) {
      value = nums[i]
      frames.push({ phase: 'keep', activeLine: L('else if nums at i is greater'), index: i, previous, value, message: `No useful prime; keep ${nums[i]}.` })
    } else {
      possible = false
      frames.push({ phase: 'fail', activeLine: L('else return false'), index: i, previous, value: null, message: `Index ${i} cannot stay above ${previous}; the answer is false.` })
      break
    }
    values.push(value)
    previous = value
  }
  if (possible) frames.push({ phase: 'done', activeLine: L('return true'), index: -1, previous, value: null, message: `Strictly increasing: [${values.join(', ')}].` })
  else frames.push({ phase: 'done', activeLine: L('return false'), index: -1, previous, value: null, message: 'No choice of primes works.' })
  return { input: { nums }, result: possible, frames }
}

export const code = `can nums become strictly increasing by subtracting primes
  set previous to 0
  for each index i from 0 to the last index
    let limit be nums at i minus previous minus 1
    if limit is at least 2 then
      find the largest prime p that is at most limit
      set value to nums at i minus p
    else if nums at i is greater than previous then set value to nums at i
    else return false
    set previous to value
  return true`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def prime_subtraction_possible(nums):
    def is_prime(x):
        if x < 2:
            return False
        d = 2
        while d * d <= x:
            if x % d == 0:
                return False
            d += 1
        return True

    previous = 0
    for original in nums:
        limit = original - previous - 1
        if limit >= 2:
            p = limit
            while not is_prime(p):
                p -= 1
            value = original - p
        elif original > previous:
            value = original
        else:
            return False
        previous = value
    return True
`
