export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || !Number.isInteger(input.n)) throw new Error('Use a JSON object with an integer n.')
  if (input.n < 1 || input.n > 500) throw new Error('n must be an integer from 1 to 500 (visualization cap).')
  return input
}

const isPrime = x => {
  if (x < 2) return false
  for (let d = 2; d * d <= x; d++) if (x % d === 0) return false
  return true
}

export function buildTrace(input) {
  const { n } = input
  let total = 0
  let best = 0
  const sums = []
  const frames = [{ phase: 'start', activeLine: L('best = 0'), prime: null, total, best, sums: [], message: `Add the primes 2, 3, 5, ... in order while the running sum stays at most ${n}.` }]
  for (let p = 2; ; p++) {
    if (!isPrime(p)) continue
    total += p
    if (total > n) {
      frames.push({ phase: 'stop', activeLine: L('if total is more than n'), prime: p, total, best, sums: [...sums], message: `The running sum ${total} is more than ${n}, so stop.` })
      break
    }
    sums.push(total)
    const ok = isPrime(total)
    if (ok) best = total
    frames.push({ phase: 'sum', activeLine: L('if total is prime'), prime: p, total, best, sums: [...sums], message: ok ? `Running sum ${total} is prime. Best so far: ${best}.` : `Running sum ${total} is not prime.` })
  }
  frames.push({ phase: 'done', activeLine: L('return best'), prime: null, total, best, sums: [...sums], message: best === 0 ? 'No prime running sum is at most n.' : `Largest prime running sum at most ${n}: ${best}.` })
  return { input, result: best, frames, sums }
}

export const code = `largest prime from consecutive prime sum (n):
  best = 0
  total = 0
  for each prime p starting from 2 in increasing order
    add p to total
    if total is more than n then stop
    if total is prime then set best to total
  return best`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def largest_prime_from_consecutive_prime_sum(n):
    def is_prime(x):
        if x < 2:
            return False
        d = 2
        while d * d <= x:
            if x % d == 0:
                return False
            d += 1
        return True

    best = 0
    total = 0
    p = 2
    while True:
        if is_prime(p):
            total += p
            if total > n:
                break
            if is_prime(total):
                best = total
        p += 1
    return best
`
