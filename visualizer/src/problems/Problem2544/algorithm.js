const PYTHON_SOURCE = `def alternating_digit_sum(n):
    total = 0
    sign = 1
    for digit in str(n):
        total += sign * int(digit)
        sign = -sign
    return total`

const PY = PYTHON_SOURCE.split('\n')
const py = (text) => {
  const index = PY.findIndex((line) => line.trim() === text)
  if (index < 0) throw new Error(`Python line not found: ${text}`)
  return index + 1
}

export const python = PYTHON_SOURCE

export const code = [
  { line: 1, text: 'function alternatingDigitSum(n)' },
  { line: 2, text: 'total = 0 and sign = 1' },
  { line: 3, text: 'for each digit of n from the most significant digit' },
  { line: 4, text: 'total = total + sign times digit' },
  { line: 5, text: 'sign = negative of sign' },
  { line: 6, text: 'return total' },
]

export function parseInput(text) {
  let data
  try {
    data = JSON.parse(text)
  } catch {
    throw new Error('Input must be valid JSON, for example {"n": 521}')
  }
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Input must be a JSON object with an n field')
  if (!Number.isInteger(data.n) || data.n < 1 || data.n > 1000000000) throw new Error('n must be an integer from 1 to 10^9')
  return { n: data.n }
}

export function buildTrace(input) {
  const { n } = input
  const digits = String(n).split('').map(Number)
  const frames = []
  let total = 0
  let sign = 1
  let index = -1
  const add = (fields) => frames.push({ n, digits, total, sign, index, result: null, ...fields })

  add({ phase: 'init', activeLine: 2, pythonLine: py('total = 0'), message: `Read ${n} from the most significant digit.` })
  add({ phase: 'init', activeLine: 2, pythonLine: py('sign = 1'), message: 'The first digit is positive.' })

  for (let i = 0; i < digits.length; i++) {
    index = i
    add({ phase: 'scan', activeLine: 3, pythonLine: py('for digit in str(n):'), message: `Digit ${digits[i]} is next.` })
    total += sign * digits[i]
    add({ phase: 'update', activeLine: 4, pythonLine: py('total += sign * int(digit)'), message: `Add ${sign > 0 ? '+' : '-'}${digits[i]}: total is now ${total}.` })
    sign = -sign
    add({ phase: 'update', activeLine: 5, pythonLine: py('sign = -sign'), message: `The next digit gets the ${sign > 0 ? 'plus' : 'minus'} sign.` })
  }

  index = -1
  add({ phase: 'done', activeLine: 6, pythonLine: py('return total'), message: `Return ${total}.`, result: total })
  return { input, result: total, frames }
}
