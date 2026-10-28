export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || !Number.isInteger(data.n)) throw new Error('Use {"n": n} with an integer n.')
  if (data.n < 1 || data.n > 1000) throw new Error('n is an integer from 1 to 1000.')
  return { n: data.n }
}

const isPrime = x => {
  if (x < 2) return false
  for (let d = 2; d * d <= x; d++) if (x % d === 0) return false
  return true
}

export function buildTrace(input) {
  const { n } = input
  const r = Number(String(n).split('').reverse().join(''))
  const low = Math.min(n, r)
  const high = Math.max(n, r)
  let total = 0
  const frames = [{ phase: 'start', activeLine: L('let r be'), x: null, total, r: null, message: `Reverse the digits of ${n}.` }]
  frames.push({ phase: 'range', activeLine: L('let low be'), x: null, total, r, low, high, message: `The reverse is ${r}, so the range is [${low}, ${high}].` })
  frames.push({ phase: 'range', activeLine: L('let total be 0'), x: null, total, r, low, high, message: 'Start the running total at zero.' })
  for (let x = low; x <= high; x++) {
    if (isPrime(x)) {
      total += x
      frames.push({ phase: 'prime', activeLine: L('add x to total'), x, total, r, low, high, message: `${x} is prime, so add it. Total ${total}.` })
    } else {
      frames.push({ phase: 'scan', activeLine: L('if x is prime'), x, total, r, low, high, message: `${x} is not prime.` })
    }
  }
  frames.push({ phase: 'done', activeLine: L('return total'), x: null, total, r, low, high, message: `Sum of primes in [${low}, ${high}] is ${total}.` })
  return { input, result: total, frames }
}

export const code = `sum of primes between a number and its reverse
  let r be n with its digits reversed
  let low be the smaller of n and r
  let high be the larger of n and r
  let total be 0
  for each number x from low to high
    if x is prime then
      add x to total
  return total`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def sum_primes_between_number_and_its_reverse(n):
    r = int(str(n)[::-1])
    low = min(n, r)
    high = max(n, r)
    total = 0
    for x in range(low, high + 1):
        if x < 2:
            continue
        if all(x % d != 0 for d in range(2, int(x ** 0.5) + 1)):
            total += x
    return total
`
