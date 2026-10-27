export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Use an object with left and right.')
  const { left, right } = data
  if (!Number.isInteger(left) || !Number.isInteger(right) || left < 1 || right > 1000 || left > right) {
    throw new Error('Use integers with 1 <= left <= right <= 1000.')
  }
  return { left, right }
}

export const code = `closest pair of primes in the range from left to right
  let best be unset and the answer be minus one, minus one
  let previous be unset
  for each number x from left to right
  if x is not prime then skip it
  if previous is set and x minus previous is less than best then record the pair
  set previous to x
  return the answer`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

const isPrime = x => {
  if (x < 2) return false
  for (let d = 2; d * d <= x; d++) if (x % d === 0) return false
  return true
}

export function buildTrace({ left, right }) {
  let best = Infinity
  let answer = [-1, -1]
  let previous = null
  const frames = [{ phase: 'start', activeLine: L('let best be unset'), index: -1, answer: [...answer], message: `Look for the closest primes between ${left} and ${right}.` }]
  for (let x = left; x <= right; x++) {
    if (!isPrime(x)) continue
    if (previous !== null && x - previous < best) {
      best = x - previous
      answer = [previous, x]
      frames.push({ phase: 'record', activeLine: L('if previous is set'), index: x - left, answer: [...answer], message: `Gap ${best} between ${previous} and ${x} is the new best.` })
    } else {
      frames.push({ phase: 'prime', activeLine: L('if x is not prime'), index: x - left, answer: [...answer], message: `${x} is prime; the best gap is still ${best === Infinity ? 'unset' : best}.` })
    }
    previous = x
  }
  frames.push({ phase: 'done', activeLine: L('return the answer'), index: -1, answer: [...answer], message: `Answer: [${answer.join(', ')}].` })
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

    best = None
    answer = [-1, -1]
    previous = None
    for x in range(left, right + 1):
        if not is_prime(x):
            continue
        if previous is not None and (best is None or x - previous < best):
            best = x - previous
            answer = [previous, x]
        previous = x
    return answer
`
