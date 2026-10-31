export const code = `function countPrimeSetBits(left, right):
  primes = {2, 3, 5, 7, 11, 13, 17, 19}
  count = 0
  for each x from left to right:
    bits = number of 1 bits in the binary form of x
    if bits is in primes then
      count = count + 1
  return count`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1
const PRIMES = [2, 3, 5, 7, 11, 13, 17, 19]

export const python = `def count_prime_set_bits(left, right):
    primes = {2, 3, 5, 7, 11, 13, 17, 19}
    count = 0
    for x in range(left, right + 1):
        bits = bin(x).count('1')
        if bits in primes:
            count += 1
    return count`

export function parseInput(text) {
  const v = JSON.parse(text)
  if (!Array.isArray(v) || v.length !== 2 || v.some(n => !Number.isInteger(n))) throw new Error('Enter [left, right] as two integers.')
  const [left, right] = v
  if (left < 1 || right > 1000000 || left > right) throw new Error('Need 1 <= left <= right <= 1,000,000.')
  if (right - left > 200) throw new Error('Visualization cap: right - left must be at most 200.')
  return { left, right }
}

export function buildTrace({ left, right }) {
  const numbers = []
  const bitsOf = []
  const frames = [{ phase: 'start', activeLine: L('primes ='), pythonLine: 2, count: 0, index: -1, bits: null, isPrime: null, message: 'Numbers below 2^20 have at most 20 set bits, so the primes to recognise are 2, 3, 5, 7, 11, 13, 17, 19.' }]
  let count = 0
  for (let x = left; x <= right; x++) {
    const bits = x.toString(2).split('1').length - 1
    numbers.push(x); bitsOf.push(bits)
    const index = numbers.length - 1
    frames.push({ phase: 'count', activeLine: L('bits ='), pythonLine: 5, count, index, bits, isPrime: null, binary: x.toString(2), message: `${x} is ${x.toString(2)} in binary, which has ${bits} set bit${bits === 1 ? '' : 's'}.` })
    const isPrime = PRIMES.includes(bits)
    if (isPrime) count++
    frames.push({ phase: 'test', activeLine: isPrime ? L('count = count + 1') : L('if bits'), pythonLine: isPrime ? 7 : 6, count, index, bits, isPrime, binary: x.toString(2),
      message: isPrime ? `${bits} is prime, so ${x} counts. Total: ${count}.` : `${bits} is not prime (1 and 0 are not prime), so ${x} is skipped.` })
  }
  frames.push({ phase: 'done', activeLine: L('return count'), pythonLine: 8, count, index: numbers.length - 1, bits: null, isPrime: null, message: `${count} number${count === 1 ? '' : 's'} in [${left}, ${right}] have a prime number of set bits.` })
  return { input: { left, right }, numbers, bitsOf, result: count, frames }
}
