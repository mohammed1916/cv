export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with integers l and r.')
  const { l, r } = input
  if (!Number.isInteger(l) || !Number.isInteger(r) || l < 1 || r > 200 || l > r) throw new Error('Use integers with 1 <= l <= r <= 200.')
  return { l, r }
}

const isPrime = x => {
  if (x < 2) return false
  for (let d = 2; d * d <= x; d++) if (x % d === 0) return false
  return true
}

export function buildTrace({ l, r }) {
  const frames = []
  const found = []
  let special = 0
  frames.push({ phase: 'start', activeLine: L('set special to 0'), p: 0, found: [], special, message: `Count the numbers from ${l} to ${r} that have exactly three divisors.` })
  for (let p = 2; p * p <= r; p++) {
    frames.push({ phase: 'candidate', activeLine: L('for each candidate p'), p, found: [...found], special, message: `Candidate ${p}: its square is ${p * p}.` })
    if (isPrime(p) && p * p >= l) {
      special++
      found.push(p * p)
      frames.push({ phase: 'special', activeLine: L('if p is prime'), p, found: [...found], special, message: `${p * p} = ${p} squared has exactly three divisors.` })
    } else {
      frames.push({ phase: 'skip', activeLine: L('if p is prime'), p, found: [...found], special, message: isPrime(p) ? `${p * p} is below ${l}; not in range.` : `${p} is not prime, so ${p * p} is not special.` })
    }
  }
  const result = r - l + 1 - special
  frames.push({ phase: 'done', activeLine: L('return (r minus l'), p: -1, found: [...found], special, message: `${r - l + 1} numbers, ${special} special: ${result} not special.` })
  return { input: { l, r }, result, frames }
}

export const code = `count of numbers from l to r that are not special
  set special to 0
  for each candidate p while p times p is at most r
    if p is prime and p times p is at least l then add one to special
  return (r minus l plus 1) minus special`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def count_not_special(l, r):
    def is_prime(x):
        if x < 2:
            return False
        d = 2
        while d * d <= x:
            if x % d == 0:
                return False
            d += 1
        return True

    special = 0
    p = 2
    while p * p <= r:
        if is_prime(p) and p * p >= l:
            special += 1
        p += 1
    return (r - l + 1) - special
`
