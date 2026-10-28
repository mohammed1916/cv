export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use a JSON object with n and m.')
  const { n, m } = input
  if (!Number.isInteger(n) || n < 1 || n > 1000) throw new Error('n must be an integer from 1 to 1000.')
  if (!Number.isInteger(m) || m < 1 || m > 1000) throw new Error('m must be an integer from 1 to 1000.')
  return { n, m }
}

export function buildTrace({ n, m }) {
  const total = n * (n + 1) / 2
  const k = Math.floor(n / m)
  const multiples = m * k * (k + 1) / 2
  const result = total - 2 * multiples
  const frames = [
    { phase: 'start', activeLine: L('set total to'), k: 0, multiples: 0, message: `The sum of 1 to ${n} is ${total}.` },
    { phase: 'count', activeLine: L('set k to'), k, multiples, message: `There are ${k} multiples of ${m} up to ${n}, and they add up to ${multiples}.` },
    { phase: 'done', activeLine: L('return total'), k, multiples, message: `${total} minus twice ${multiples} gives ${result}.` },
  ]
  return { input: { n, m }, result, total, frames }
}

export const code = `difference between the sum of non-multiples and the sum of multiples of m up to n
read n and m from the input
set total to the sum of 1 to n
set k to the number of multiples of m up to n
set multiples to m times the sum of 1 to k
return total minus twice multiples`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def divisible_difference(n, m):
    total = n * (n + 1) // 2
    k = n // m
    multiples = m * k * (k + 1) // 2
    return total - 2 * multiples
`
