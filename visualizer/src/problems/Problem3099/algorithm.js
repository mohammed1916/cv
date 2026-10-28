export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use a JSON object with x.')
  const { x } = input
  if (!Number.isInteger(x) || x < 1 || x > 100) throw new Error('x must be an integer from 1 to 100.')
  return { x }
}

export function buildTrace({ x }) {
  const digits = String(x).split('').map(Number)
  let total = 0
  let rest = x
  const frames = [{ phase: 'start', activeLine: L('set total to 0'), digit: -1, total: 0, message: `Add the digits of ${x}.` }]
  let position = digits.length - 1
  while (rest > 0) {
    const digit = rest % 10
    total += digit
    rest = Math.floor(rest / 10)
    frames.push({ phase: 'digit', activeLine: L('add the last digit'), digit: position, total, message: `Add digit ${digit}. The digit sum is now ${total}.` })
    position -= 1
  }
  const harshad = x % total === 0
  const result = harshad ? total : -1
  frames.push({ phase: 'done', activeLine: L(harshad ? 'then return total' : 'otherwise return -1'), digit: -1, total, message: harshad ? `${x} is divisible by ${total}, so the answer is ${total}.` : `${x} is not divisible by ${total}, so the answer is -1.` })
  return { input: { x }, result, digits, frames }
}

export const code = `return the digit sum of x if x is a Harshad number, otherwise -1
read x from the input
set total to 0 and rest to x
while rest is above 0 do
  add the last digit of rest to total
  remove the last digit from rest
if x is divisible by total then return total
otherwise return -1`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def harshad_digit_sum(x):
    total = 0
    rest = x
    while rest > 0:
        total += rest % 10
        rest //= 10
    if x % total == 0:
        return total
    return -1
`
