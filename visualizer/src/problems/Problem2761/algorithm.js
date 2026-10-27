export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Use an object with n.')
  const { n } = data
  if (!Number.isInteger(n) || n < 1 || n > 1000) throw new Error('n must be an integer from 1 to 1000.')
  return { n }
}

export const code = `all pairs of primes that add up to n
  let pairs be an empty list
  make a list of primes up to n
  for x from 2 to n divided by 2
  if x is prime and n minus x is prime then append the pair [x, n minus x]
  return pairs`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export function buildTrace({ n }) {
  const isPrime = x => {
    if (x < 2) return false
    for (let d = 2; d * d <= x; d++) if (x % d === 0) return false
    return true
  }
  const pairs = []
  const frames = [{ phase: 'start', activeLine: L('let pairs be'), index: -1, pairs: [], message: `Find primes x <= y with x + y = ${n}.` }]
  for (let x = 2; x <= Math.floor(n / 2); x++) {
    const y = n - x
    if (isPrime(x) && isPrime(y)) {
      pairs.push([x, y])
      frames.push({ phase: 'pair', activeLine: L('if x is prime'), index: x, pairs: pairs.map(p => [...p]), message: `${x} and ${y} are both prime.` })
    } else {
      frames.push({ phase: 'skip', activeLine: L('for x from 2'), index: x, pairs: pairs.map(p => [...p]), message: `${x} with ${y} is not a prime pair.` })
    }
  }
  frames.push({ phase: 'done', activeLine: L('return pairs'), index: -1, pairs: pairs.map(p => [...p]), message: `${pairs.length} pair(s) found.` })
  return { input: { n }, result: pairs, frames }
}

export const python = `def prime_pairs(n):
    def is_prime(x):
        if x < 2:
            return False
        d = 2
        while d * d <= x:
            if x % d == 0:
                return False
            d += 1
        return True

    pairs = []
    for x in range(2, n // 2 + 1):
        if is_prime(x) and is_prime(n - x):
            pairs.append([x, n - x])
    return pairs
`
