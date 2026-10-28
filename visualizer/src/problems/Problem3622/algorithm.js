export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use a JSON object with n.')
  const { n } = input
  if (!Number.isInteger(n) || n < 1 || n > 100000) throw new Error('n must be an integer from 1 to 100000.')
  return { n }
}

export function buildTrace({ n }) {
  const digits = String(n).split('').map(Number)
  let total = 0
  let product = 1
  let rest = n
  let position = digits.length - 1
  const frames = [{ phase: 'start', activeLine: L('set total to 0'), position: -1, total, product, message: `Read the digits of ${n} from the last one.` }]
  while (rest > 0) {
    const digit = rest % 10
    total += digit
    product *= digit
    rest = Math.floor(rest / 10)
    frames.push({ phase: 'digit', activeLine: L('add the last digit'), position, total, product, message: `Digit ${digit}: sum ${total}, product ${product}.` })
    position -= 1
  }
  const divisor = total + product
  const result = n % divisor === 0
  frames.push({ phase: 'done', activeLine: L(result ? 'return true' : 'otherwise return false'), position: -1, total, product, divisor, message: `${n} ${result ? 'is' : 'is not'} divisible by ${divisor}.` })
  return { input: { n }, result, digits, divisor, frames }
}

export const code = `check whether n is divisible by the sum of its digits plus the product of its digits
read n from the input
set total to 0, product to 1, and rest to n
while rest is above 0 do
  add the last digit of rest to total and multiply product by it
  remove the last digit from rest
set divisor to total plus product
return true if n is divisible by divisor
otherwise return false`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def divisible_by_digit_sum_and_product(n):
    total = 0
    product = 1
    rest = n
    while rest > 0:
        digit = rest % 10
        total += digit
        product *= digit
        rest //= 10
    return n % (total + product) == 0
`
