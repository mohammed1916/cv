export const phases = [
  { id: 'start', label: 'Start', description: 'Begin with product 1 and digit sum 0. Read the number one decimal digit at a time, left to right.' },
  { id: 'digit', label: 'Read digit', description: 'Take the next decimal digit from the number.' },
  { id: 'multiply', label: 'Multiply', description: 'Multiply the running product by this digit.' },
  { id: 'add', label: 'Add', description: 'Add this digit to the running sum.' },
  { id: 'done', label: 'Subtract', description: 'Subtract the digit sum from the digit product.' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object such as {"n": 3945}.')
  const { n } = input
  if (!Number.isInteger(n) || n < 1 || n > 100000) throw new Error('n is an integer from 1 to 100000.')
  return { n }
}

export function buildTrace({ n }) {
  const digits = String(n).split('').map(Number)
  let product = 1
  let total = 0
  const snap = (index, digit) => ({ n, digits, index, digit, product, total })
  const frames = [{ phase: 'start', activeLine: L('product = 1'), pythonLine: P('product, total'), snapshot: snap(null, null), message: `Start with product 1 and sum 0 for the digits of ${n}.` }]
  digits.forEach((digit, index) => {
    frames.push({ phase: 'digit', activeLine: L('for each decimal digit'), pythonLine: P('for ch in'), snapshot: snap(index, digit), message: `Read digit ${digit} at position ${index + 1}.` })
    product *= digit
    frames.push({ phase: 'multiply', activeLine: L('product = product'), pythonLine: P('product *='), snapshot: snap(index, digit), message: `Product becomes ${product}.` })
    total += digit
    frames.push({ phase: 'add', activeLine: L('total = total'), pythonLine: P('total +='), snapshot: snap(index, digit), message: `Sum becomes ${total}.` })
  })
  const result = product - total
  frames.push({ phase: 'done', activeLine: L('return product'), pythonLine: P('return product'), snapshot: snap(null, null), message: `${product} - ${total} = ${result}.` })
  return { input: { n }, result, frames }
}

export const code = `subtract product and sum (n):
  product = 1
  total = 0
  for each decimal digit of n from left to right:
    read the digit
    product = product * digit
    total = total + digit
  return product - total`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1

export const python = `def subtract_product_and_sum(n):
    product, total = 1, 0
    for ch in str(n):
        digit = int(ch)
        product *= digit
        total += digit
    return product - total
`
