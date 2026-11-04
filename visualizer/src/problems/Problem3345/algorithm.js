export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with n and t.')
  const { n, t } = input
  if (!Number.isInteger(n) || n < 1 || n > 100) throw new Error('n is an integer from 1 to 100.')
  if (!Number.isInteger(t) || t < 1 || t > 10) throw new Error('t is an integer from 1 to 10.')
  return { n, t }
}

function digitProduct(x) {
  let product = 1
  for (const ch of String(x)) product *= Number(ch)
  return product
}

export function buildTrace({ n, t }) {
  const frames = []
  let x = n
  frames.push({ pythonLine: PY('x = n'), phase: 'start', activeLine: L('let x = n'), candidate: x, product: null, message: `Start at ${n} and look for a digit product divisible by ${t}.` })
  for (;;) {
    const product = digitProduct(x)
    const ok = product % t === 0
    frames.push({ pythonLine: PY('if product % t'), phase: 'check', activeLine: L('if (product % t === 0)'), candidate: x, product, ok,
      message: `${x} has digit product ${product}, ${ok ? 'divisible by' : 'not divisible by'} ${t}.` })
    if (ok) {
      frames.push({ pythonLine: PY('return x'), phase: 'done', activeLine: L('return x;'), candidate: x, product, ok, result: x, message: `The answer is ${x}.` })
      return { input: { n, t }, result: x, frames }
    }
    x += 1
  }
}

// Code panel: real JavaScript. Python below mirrors it line for line.
export const code = [
  "function smallestDivisibleDigitProduct(n, t) {",
  "  let x = n;",
  "  for (;;) {",
  "    let product = 1;",
  "    for (const ch of String(x)) product *= Number(ch);",
  "    if (product % t === 0) return x;",
  "    x += 1;",
  "  }",
  "}",
].map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def smallest_divisible_digit_product(n, t):
    x = n
    while True:
        product = 1
        for ch in str(x):
            product *= int(ch)
        if product % t == 0:
            return x
        x += 1
`
const PY = s => python.split('\n').findIndex(line => line.includes(s)) + 1
