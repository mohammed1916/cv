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
  f('start', L('read n'), `Find the smallest prime palindrome >= ${n}. Palindromes are built from a left half, so they come out in increasing order.`, { pythonLine: 1 })
  if (n >= 8 && n <= 11) {
    f('special', L('if 8 <= n <= 11'), 'Every even-length palindrome is divisible by 11, so 11 is the only even-length prime palindrome. For 8 <= n <= 11 the answer is 11.', { pythonLine: 12 })
    f('done', L('return 11 (every'), 'Answer: 11.', { p: 11, prime: true, pythonLine: 13 })
    return { input: n, result: 11, frames }
  }
  let skipped = 0, noted = false
  for (let half = 1; half < 100000; half++) {
    const s = String(half)
    const p = Number(s + [...s].slice(0, -1).reverse().join(''))
    if (p < n) { skipped++; continue }
    if (!noted) {
      noted = true
      f('skip', L('if p is less than n'), `${skipped} palindromes (from halves 1..${half - 1}) are below ${n}, so they are skipped without testing.`, { skipped, pythonLine: 17 })
    }
    f('candidate', L('let p be s followed'), `Half ${half} mirrors to the odd-length palindrome ${p} (the last digit of the half is not repeated).`, { half, p, pythonLine: 16 })
    const divisor = smallestDivisor(p)
    const prime = divisor === 0
    f('test', L('if p is not prime'), prime ? `${p} has no divisor up to its square root, so it is prime.` : p < 2 ? `${p} is below 2, not prime.` : `${p} is divisible by ${divisor}, so it is not prime.`, { half, p, prime, divisor: prime ? null : divisor, pythonLine: 19 })
    if (prime) {
      f('done', L('return p, the first'), `Answer: ${p}, the first prime palindrome >= ${n}.`, { half, p, prime: true, pythonLine: 20 })
      return { input: n, result: p, frames }
    }
  }
  throw new Error('No prime palindrome found.')
}

export const code = `read n
if 8 <= n <= 11, return 11 (every even-length palindrome is divisible by 11)
for each half from 1 up to 99999 do
  let s be the digits of the half
  let p be s followed by the digits of s reversed, without its last digit
  if p is less than n, skip to the next half
  if p is not prime, skip to the next half
  return p, the first prime palindrome at least n
return no answer`.split('\n').map((text, index) => ({ line: index + 1, text }))

const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def prime_palindrome(n):
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
        if p < n:
            continue
        if is_prime(p):
            return p
    raise ValueError('No prime palindrome found.')
`
