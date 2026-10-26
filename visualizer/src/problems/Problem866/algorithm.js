export function parseInput(text) {
  const n = JSON.parse(text)
  if (!Number.isInteger(n) || n < 1 || n > 100000000) throw new Error('Enter a single integer n with 1 <= n <= 100,000,000.')
  return n
}

function smallestDivisor(x) {
  if (x < 2) return 1
  for (let d = 2; d * d <= x; d++) if (x % d === 0) return d
  return 0
}

export function buildTrace(n) {
  const frames = []
  const f = (phase, activeLine, message, extra = {}) => frames.push({ phase, activeLine, message, half: null, p: null, prime: null, divisor: null, skipped: 0, ...extra })
  f('start', 1, `Find the smallest prime palindrome >= ${n}. Palindromes are built from a left half, so they come out in increasing order.`)
  if (n >= 8 && n <= 11) {
    f('special', 11, 'Every even-length palindrome is divisible by 11, so 11 is the only even-length prime palindrome. For 8 <= n <= 11 the answer is 11.')
    f('done', 12, 'Answer: 11.', { p: 11, prime: true })
    return { input: n, result: 11, frames }
  }
  let skipped = 0, noted = false
  for (let half = 1; half < 100000; half++) {
    const s = String(half)
    const p = Number(s + [...s].slice(0, -1).reverse().join(''))
    if (p < n) { skipped++; continue }
    if (!noted) {
      noted = true
      f('skip', 15, `${skipped} palindromes (from halves 1..${half - 1}) are below ${n}, so they are skipped without testing.`, { skipped })
    }
    f('candidate', 15, `Half ${half} mirrors to the odd-length palindrome ${p} (the last digit of the half is not repeated).`, { half, p })
    const divisor = smallestDivisor(p)
    const prime = divisor === 0
    f('test', 16, prime ? `${p} has no divisor up to its square root, so it is prime.` : p < 2 ? `${p} is below 2, not prime.` : `${p} is divisible by ${divisor}, so it is not prime.`, { half, p, prime, divisor: prime ? null : divisor })
    if (prime) {
      f('done', 17, `Answer: ${p}, the first prime palindrome >= ${n}.`, { half, p, prime: true })
      return { input: n, result: p, frames }
    }
  }
  throw new Error('No prime palindrome found.')
}

export const code = `def primePalindrome(n):
    def is_prime(x):
        if x < 2:
            return False
        d = 2
        while d * d <= x:
            if x % d == 0:
                return False
            d += 1
        return True
    if 8 <= n <= 11:
        return 11
    for half in range(1, 100000):
        s = str(half)
        p = int(s + s[-2::-1])
        if p >= n and is_prime(p):
            return p`.split('\n').map((text, index) => ({ line: index + 1, text }))
