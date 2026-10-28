export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || !Array.isArray(data.nums) || data.nums.length < 1 || data.nums.length > 30) throw new Error('Use an array nums of 1 to 30 integers.')
  if (data.nums.some(v => !Number.isInteger(v) || v < 1 || v > 100)) throw new Error('Values are integers from 1 to 100.')
  return { nums: data.nums }
}

const isPrime = n => {
  if (n < 2) return false
  for (let d = 2; d * d <= n; d++) if (n % d === 0) return false
  return true
}

export function buildTrace({ nums }) {
  const counts = new Map()
  const frames = [{ phase: 'start', activeLine: L('count how many times'), index: -1, counts: [], key: null, message: 'Count how often each value appears, then test each count for primality.' }]
  for (let i = 0; i < nums.length; i++) {
    counts.set(nums[i], (counts.get(nums[i]) || 0) + 1)
    frames.push({ phase: 'count', activeLine: L('count how many times'), index: i, counts: [...counts], key: null, message: `Value ${nums[i]} now has frequency ${counts.get(nums[i])}.` })
  }
  for (const [value, count] of counts) {
    const prime = isPrime(count)
    frames.push({ phase: 'check', activeLine: L('if the count is prime'), index: -1, counts: [...counts], key: value, prime, message: `Frequency ${count} of ${value} is ${prime ? 'prime' : 'not prime'}.` })
    if (prime) {
      frames.push({ phase: 'found', activeLine: L('return true'), index: -1, counts: [...counts], key: value, result: true, message: `Frequency ${count} is prime, so the answer is true.` })
      return { input: { nums }, result: true, frames }
    }
  }
  frames.push({ phase: 'done', activeLine: L('return false'), index: -1, counts: [...counts], key: null, result: false, message: 'No frequency is prime, so the answer is false.' })
  return { input: { nums }, result: false, frames }
}

export const code = `any element has a prime frequency
  count how many times each value appears in nums
  for each count in the counts
    if the count is prime then
      return true
  return false`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def any_element_has_prime_frequency(nums):
    counts = {}
    for x in nums:
        counts[x] = counts.get(x, 0) + 1

    def is_prime(n):
        if n < 2:
            return False
        d = 2
        while d * d <= n:
            if n % d == 0:
                return False
            d += 1
        return True

    for c in counts.values():
        if is_prime(c):
            return True
    return False
`
