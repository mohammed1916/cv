// An Armstrong number equals the sum of its digits, each raised to the power of the digit count.
// The trace splits n into digits, raises each digit to the digit count, and compares the total with n.

const LIMIT = 100000000

export const phases = [
  { id: 'start', label: 'Start', description: 'Read n and prepare to inspect its digits.' },
  { id: 'split', label: 'Digits', description: 'Split n into decimal digits and count them.' },
  { id: 'power', label: 'Add power', description: 'Raise the current digit to the digit count and add it to the total.' },
  { id: 'done', label: 'Compare', description: 'Compare the total with n.' },
]

export function parseInput(text) {
  let obj = text
  if (typeof obj === 'string') {
    try { obj = JSON.parse(obj) } catch { throw new Error('Use a JSON object with an integer n.') }
  }
  if (!obj || typeof obj !== 'object' || !Number.isInteger(obj.n)) throw new Error('Use an object with an integer n.')
  if (obj.n < 1 || obj.n > LIMIT) throw new Error(`n must be from 1 to ${LIMIT}.`)
  return { n: obj.n }
}

export const code = `is armstrong (n):
  digits = the decimal digits of n
  k = number of digits
  total = 0
  for each digit d in digits:
    total = total + d raised to the power k
  return total equals n`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def is_armstrong(n):
    digits = str(n)
    k = len(digits)
    total = 0
    for d in digits:
        total += int(d) ** k
    return total == n
`

const P = text => python.split('\n').findIndex(line => line.includes(text)) + 1

export function buildTrace(input) {
  const { n } = parseInput(input)
  const digits = String(n).split('').map(Number)
  const k = digits.length
  const frames = [{
    phase: 'start', activeLine: 1, pythonLine: P('def is_armstrong'),
    message: `Check whether ${n} equals the sum of its digits raised to the digit count.`,
    snapshot: { n, digits, k, total: 0, current: null },
  }, {
    phase: 'split', activeLine: 3, pythonLine: P('k = len(digits)'),
    message: `${n} has ${k} digit${k === 1 ? '' : 's'}, so each digit is raised to the power ${k}.`,
    snapshot: { n, digits, k, total: 0, current: null },
  }]
  let total = 0
  digits.forEach((d, index) => {
    const term = d ** k
    total += term
    frames.push({
      phase: 'power', activeLine: 5, pythonLine: P('total += int(d)'),
      message: `Digit ${d} contributes ${d}^${k} = ${term}. The total is now ${total}.`,
      snapshot: { n, digits, k, total, current: index },
    })
  })
  const isArmstrong = total === n
  frames.push({
    phase: 'done', activeLine: 6, pythonLine: P('return total == n'),
    message: isArmstrong ? `The total ${total} equals ${n}, so it is an Armstrong number.` : `The total ${total} differs from ${n}, so it is not an Armstrong number.`,
    snapshot: { n, digits, k, total, current: null },
  })
  return { input: { n }, result: isArmstrong, frames }
}
