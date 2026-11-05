// LeetCode 1945: turn letters into digits, sum the digits once, then repeat digit sums k - 1 more times.
const SOURCE = [
  "function getLucky(s, k) {",
  "  let value = [...s].map(ch => ch.charCodeAt(0) - 96).join('').split('').reduce((a, d) => a + Number(d), 0)",
  "  for (let step = 2; step <= k; step++) {",
  "    value = String(value).split('').reduce((a, d) => a + Number(d), 0)",
  "  }",
  "  return value",
  "}",
]

export const code = SOURCE.map((text, index) => ({ line: index + 1, text }))

export const python = `def get_lucky(s, k):
    digits = ""
    for ch in s:
        digits += str(ord(ch) - 96)
    value = sum(int(d) for d in digits)
    for _ in range(k - 1):
        value = sum(int(d) for d in str(value))
    return value
`

const L = text => { const i = SOURCE.findIndex(line => line.includes(text)); if (i < 0) throw new Error(`no code line: ${text}`); return i + 1 }
const P = text => { const i = python.split('\n').findIndex(line => line.includes(text)); if (i < 0) throw new Error(`no python line: ${text}`); return i + 1 }

export const phases = [
  { id: 'convert', label: 'Convert', description: 'Replace each letter by its position and read the digits.' },
  { id: 'transform', label: 'Transform', description: 'Replace the number by the sum of its digits.' },
  { id: 'done', label: 'Result', description: 'The value after k transforms.' },
]

export function parseInput(text) {
  let input
  try { input = JSON.parse(text) } catch { throw new Error('Enter JSON like {"s":"hello","k":2}.') }
  const { s, k } = input || {}
  if (typeof s !== 'string' || !/^[a-z]{1,12}$/.test(s)) throw new Error('s is 1 to 12 lowercase letters.')
  if (!Number.isInteger(k) || k < 1 || k > 6) throw new Error('k is an integer from 1 to 6.')
  return { s, k }
}

const digitSum = n => String(n).split('').reduce((a, d) => a + Number(d), 0)

export function buildTrace({ s, k }) {
  const frames = []
  const pieces = [...s].map(ch => ch.charCodeAt(0) - 96)
  const digits = pieces.join('')
  frames.push({ phase: 'convert', activeLine: L('map(ch => ch.charCodeAt'), pythonLine: P('for ch in s'), message: `Letters become ${pieces.join(' ')}, giving the digit string ${digits}.`, value: digits, step: 0, k, pieces })
  let value = digitSum(digits)
  frames.push({ phase: 'transform', activeLine: L('let value = [...s]'), pythonLine: P('value = sum'), message: `Transform 1: sum of the digits is ${value}.`, value, step: 1, k, pieces })
  for (let t = 2; t <= k; t++) {
    value = digitSum(value)
    frames.push({ phase: 'transform', activeLine: L('for (let step = 2'), pythonLine: P('for _ in range'), message: `Transform ${t}: sum of the digits is ${value}.`, value, step: t, k, pieces })
  }
  frames.push({ phase: 'done', activeLine: L('return value'), pythonLine: P('return value'), message: `Result after ${k} transform(s): ${value}.`, value, step: k, k, pieces })
  return { input: { s, k }, result: value, frames }
}
