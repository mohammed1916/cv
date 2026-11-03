export const phases = [
  { id: 'scan', label: 'Count primes', description: 'Test each number from 2 to n and count the primes.' },
  { id: 'primes', label: 'Prime slots', description: 'Multiply 1 through p to place the primes in the prime-numbered positions.' },
  { id: 'others', label: 'Other slots', description: 'Multiply 1 through n - p to place the remaining values in the other positions.' },
  { id: 'combine', label: 'Combine', description: 'Multiply the two group counts together, modulo 1,000,000,007.' },
  { id: 'done', label: 'Complete', description: 'Return the arrangement count.' },
]

const MOD = 1000000007
const CODE = [
  'function countArrangements(n):',
  '  primeCount = 0',
  '  for x from 2 to n:',
  '    if isPrime(x): primeCount += 1',
  '  primeSlots = factorial(primeCount) mod MOD',
  '  otherSlots = factorial(n - primeCount) mod MOD',
  '  return primeSlots * otherSlots mod MOD',
]
const PY = [
  'def num_prime_arrangements(n):',
  '    prime_count = 0',
  '    for x in range(2, n + 1):',
  '        if is_prime(x):',
  '            prime_count += 1',
  '    prime_slots = factorial(prime_count) % MOD',
  '    other_slots = factorial(n - prime_count) % MOD',
  '    return prime_slots * other_slots % MOD',
]

export const code = CODE.map((text, index) => ({ line: index + 1, text }))
export const python = PY.join('\n')

const L = { init: 2, test: 4, primes: 5, others: 6, ret: 7 }
const P = { init: 2, test: 4, primes: 6, others: 7, ret: 8 }

export function parseInput(text) {
  const n = Number(String(text).trim())
  if (!Number.isInteger(n) || n < 1 || n > 100) throw new Error('Enter one whole number from 1 to 100.')
  return n
}

function smallestDivisor(x) {
  for (let d = 2; d * d <= x; d++) if (x % d === 0) return d
  return 0
}

export function buildTrace(n) {
  const frames = []
  const marks = []
  const state = { n, x: null, prime: null, primeCount: 0, factor: null, primeSlots: null, otherSlots: null, answer: null }
  const push = (phase, key, message) => frames.push({
    phase, activeLine: L[key], pythonLine: P[key], message,
    snapshot: { ...state, marks: [...marks] },
  })

  push('scan', 'init', `Start counting for n = ${n}. Nothing has been tested yet.`)
  for (let x = 2; x <= n; x++) {
    const divisor = smallestDivisor(x)
    const prime = divisor === 0
    if (prime) state.primeCount += 1
    Object.assign(state, { x, prime })
    marks.push({ x, prime })
    push('scan', 'test', prime
      ? `${x} has no divisor up to its square root, so it is prime. Primes so far: ${state.primeCount}.`
      : `${x} is divisible by ${divisor}, so it is not prime. Primes so far: ${state.primeCount}.`)
  }

  const p = state.primeCount
  const others = n - p
  Object.assign(state, { x: null, prime: null, factor: null, primeSlots: 1 })
  let primeSlots = 1
  for (let i = 1; i <= p; i++) {
    primeSlots = (primeSlots * i) % MOD
    Object.assign(state, { factor: i, primeSlots })
    push('primes', 'primes', `Multiply by ${i} for the prime positions: ${primeSlots} so far.`)
  }

  let otherSlots = 1
  Object.assign(state, { factor: null, otherSlots: 1 })
  for (let i = 1; i <= others; i++) {
    otherSlots = (otherSlots * i) % MOD
    Object.assign(state, { factor: i, otherSlots })
    push('others', 'others', `Multiply by ${i} for the other positions: ${otherSlots} so far.`)
  }

  const answer = Number(BigInt(primeSlots) * BigInt(otherSlots) % BigInt(MOD))
  Object.assign(state, { factor: null, answer })
  push('combine', 'ret', `Multiply ${primeSlots} by ${otherSlots} and reduce modulo MOD: ${answer}.`)
  push('done', 'ret', `The arrangement count for n = ${n} is ${answer}.`)
  return { input: n, result: answer, frames }
}
