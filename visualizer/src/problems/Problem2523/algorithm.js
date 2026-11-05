export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Use an object with left and right.')
  const { left, right } = data
  if (!Number.isInteger(left) || !Number.isInteger(right) || left < 1 || right > 1000 || left > right) {
    throw new Error('Use integers with 1 <= left <= right <= 1000.')
  }
  return { left, right }
}

const isPrime = x => {
  if (x < 2) return false
  for (let d = 2; d * d <= x; d++) if (x % d === 0) return false
  return true
}

export const code = `function closestPrimes(left, right) {
  let best = Infinity
  let answer = [-1, -1]
  let previous = -1
  for (let x = left; x <= right; x++) {
    if (!isPrime(x)) continue
    if (previous !== -1 && x - previous < best) {
      best = x - previous
      answer = [previous, x]
    }
    previous = x
  }
  return answer
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export function buildTrace({ left, right }) {
  let best = Infinity
  let answer = [-1, -1]
  let previous = -1
  const primes = []
  const frames = [{ phase: 'start', activeLine: L('let best = Infinity'), pythonLine: 12, index: -1, previous, answer: [...answer], best: null, primes: [], message: `Look for the closest primes between ${left} and ${right}.` }]
  for (let x = left; x <= right; x++) {
    if (!isPrime(x)) {
      frames.push({ phase: 'composite', activeLine: L('if (!isPrime(x))'), pythonLine: 15, index: x - left, previous, answer: [...answer], best: best === Infinity ? null : best, primes: [...primes], message: `${x} has a divisor, so it is skipped.` })
      continue
    }
    primes.push(x)
    if (previous !== -1 && x - previous < best) {
      best = x - previous
      answer = [previous, x]
      frames.push({ phase: 'record', activeLine: L('best = x - previous'), pythonLine: 18, index: x - left, previous, answer: [...answer], best, primes: [...primes], message: `${x} is prime. The gap from ${previous} is ${best}, which beats every earlier gap, so [${answer.join(', ')}] is the new pair.` })
    } else {
      frames.push({ phase: 'prime', activeLine: L('if (previous !== -1'), pythonLine: 16, index: x - left, previous, answer: [...answer], best: best === Infinity ? null : best, primes: [...primes], message: `${x} is prime. ${previous === -1 ? 'It is the first prime, so there is no gap yet.' : `Its gap to ${previous} is ${x - previous}, which does not beat ${best}.`}` })
    }
    previous = x
  }
  frames.push({ phase: 'done', activeLine: L('return answer'), pythonLine: 21, index: -1, previous, answer: [...answer], best: best === Infinity ? null : best, primes: [...primes], message: `Answer: [${answer.join(', ')}].` })
  return { input: { left, right }, result: answer, frames }
}

export const python = `def closest_primes(left, right):
    def is_prime(x):
        if x < 2:
            return False
        d = 2
        while d * d <= x:
            if x % d == 0:
                return False
            d += 1
        return True

    best = float('inf')
    answer = [-1, -1]
    previous = -1
    for x in range(left, right + 1):
        if not is_prime(x):
            continue
        if previous != -1 and x - previous < best:
            best = x - previous
            answer = [previous, x]
        previous = x
    return answer
`
