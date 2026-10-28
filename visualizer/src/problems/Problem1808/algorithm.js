const MOD = 1000000007

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use a JSON object with prime_factors.')
  const { prime_factors: n } = input
  if (!Number.isInteger(n) || n < 1 || n > 60) throw new Error('prime_factors must be an integer from 1 to 60.')
  return { prime_factors: n }
}

export function buildTrace({ prime_factors: n }) {
  const frames = [{ phase: 'start', activeLine: L('if n is at most 3'), parts: [], message: `Split ${n} into parts whose product is as large as possible.` }]
  const parts = []
  if (n <= 3) {
    parts.push(n)
  } else {
    let rest = n
    while (rest > 4) {
      parts.push(3)
      rest -= 3
      frames.push({ phase: 'split', activeLine: L('take a part of 3'), parts: parts.slice(), message: `Take a part of 3. ${rest} is left to split.` })
    }
    parts.push(rest)
  }
  const product = parts.reduce((acc, p) => acc * p, 1) % MOD
  frames.push({ phase: 'done', activeLine: L('return the product'), parts: parts.slice(), message: `The parts ${parts.join(' x ')} give ${product} nice divisors.` })
  return { input: { prime_factors: n }, result: product, parts, frames }
}

export const code = `maximize the number of nice divisors when n is the number of prime factors
if n is at most 3 then the answer is n
set rest to n
while rest is more than 4 do
  take a part of 3 and subtract 3 from rest
keep rest as the last part, which is 2, 3 or 4
return the product of the parts modulo 1000000007`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def max_nice_divisors(prime_factors):
    MOD = 10 ** 9 + 7
    n = prime_factors
    if n <= 3:
        return n
    if n % 3 == 0:
        return pow(3, n // 3, MOD)
    if n % 3 == 1:
        return 4 * pow(3, (n - 4) // 3, MOD) % MOD
    return 2 * pow(3, (n - 2) // 3, MOD) % MOD
`
