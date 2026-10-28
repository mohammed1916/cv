export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Use an object with s, for example {"s":"12234"}.')
  const { s } = data
  if (typeof s !== 'string' || s.length < 1 || s.length > 10) throw new Error('s must be a string of 1 to 10 digits.')
  if (!/^[0-9]+$/.test(s)) throw new Error('s may contain only the digits 0 to 9.')
  return { s }
}

function isPrime(x) {
  if (x < 2) return false
  for (let d = 2; d * d <= x; d++) if (x % d === 0) return false
  return true
}

export function buildTrace(input) {
  const { s } = input
  const found = new Set()
  const frames = [{ phase: 'start', activeLine: L('set found to an empty set'), value: null, found: [], result: null, message: 'Read every substring as a number. Leading zeros are ignored, and each prime is counted once.' }]
  for (let i = 0; i < s.length; i++) {
    for (let j = i + 1; j <= s.length; j++) {
      const value = parseInt(s.slice(i, j), 10)
      if (!isPrime(value)) continue
      const fresh = !found.has(value)
      found.add(value)
      if (fresh) frames.push({ phase: 'prime', activeLine: L('if the value is prime'), value, found: [...found], result: null, message: `Substring ${s.slice(i, j)} reads as the prime ${value}.` })
    }
  }
  const top = [...found].sort((a, b) => b - a).slice(0, 3)
  const result = top.reduce((sum, v) => sum + v, 0)
  frames.push({ phase: 'done', activeLine: L('return the sum'), value: null, found: top, result, message: `The three largest distinct primes are ${top.join(', ') || 'none'}, summing to ${result}.` })
  return { input, result, frames }
}

export const code = `sum of largest prime substrings (s)
  set found to an empty set
  for each start position i
    for each end position j after i
      read s from i up to j as an integer, which drops leading zeros
      if the value is prime then add it to found
  sort found from largest to smallest
  keep the first three values
  return the sum of the kept values`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def sum_largest_primes(s):
    def is_prime(x):
        if x < 2:
            return False
        d = 2
        while d * d <= x:
            if x % d == 0:
                return False
            d += 1
        return True

    found = set()
    for i in range(len(s)):
        for j in range(i + 1, len(s) + 1):
            value = int(s[i:j])
            if is_prime(value):
                found.add(value)
    top = sorted(found, reverse=True)[:3]
    return sum(top)
`
