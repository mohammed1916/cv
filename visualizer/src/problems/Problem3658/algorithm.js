const MAX_N = 40

export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || !Number.isInteger(data.n)) throw new Error('Use an object like {"n":4}.')
  if (data.n < 1 || data.n > MAX_N) throw new Error(`n must be between 1 and ${MAX_N}.`)
  return { n: data.n }
}

const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b))

export function buildTrace({ n }) {
  let oddSum = 0
  let evenSum = 0
  const frames = [{ phase: 'start', activeLine: L('set odd_sum to 0'), i: 0, oddSum, evenSum, message: 'Both running sums start at 0.' }]
  for (let i = 1; i <= n; i++) {
    oddSum += 2 * i - 1
    evenSum += 2 * i
    frames.push({ phase: 'sum', activeLine: L('add the i-th odd number'), i, oddSum, evenSum, message: `Add ${2 * i - 1} and ${2 * i}: sums are ${oddSum} and ${evenSum}.` })
  }
  const result = gcd(oddSum, evenSum)
  frames.push({ phase: 'done', activeLine: L('return the gcd'), i: n, oddSum, evenSum, message: `gcd(${oddSum}, ${evenSum}) = ${result}.` })
  return { input: { n }, result, frames }
}

export const code = `gcd of the odd and even sums
  set odd_sum to 0
  set even_sum to 0
  for i from 1 to n
    add the i-th odd number, 2 * i - 1, to odd_sum
    add the i-th even number, 2 * i, to even_sum
  return the gcd of odd_sum and even_sum`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def gcd_of_odd_and_even_sums(n):
    from math import gcd
    odd_sum = 0
    even_sum = 0
    for i in range(1, n + 1):
        odd_sum += 2 * i - 1
        even_sum += 2 * i
    return gcd(odd_sum, even_sum)
`
