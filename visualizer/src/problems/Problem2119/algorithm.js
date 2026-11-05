// LeetCode 2119: A Number After a Double Reversal.
// Reversing drops leading zeros, so reversing twice restores the number exactly unless the original
// ends in zero (those zeros disappear and cannot come back).

export function parseInput(text) {
  const trimmed = text.trim()
  if (!/^\d{1,7}$/.test(trimmed)) throw new Error('Use a whole number from 0 to 1000000.')
  const num = Number(trimmed)
  if (num > 1000000) throw new Error('Use a whole number from 0 to 1000000.')
  return { num }
}

export const code = `function reverseDigits(x) {
  let reversed = 0
  while (x > 0) {
    reversed = reversed * 10 + (x % 10)
    x = Math.floor(x / 10)
  }
  return reversed
}

function isDoubleReversal(num) {
  const reversed1 = reverseDigits(num)
  const reversed2 = reverseDigits(reversed1)
  return reversed2 === num
}`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `# entry: is_double_reversal
def reverse_digits(x):
    reversed_value = 0
    while x > 0:
        reversed_value = reversed_value * 10 + x % 10
        x //= 10
    return reversed_value

def is_double_reversal(num):
    reversed1 = reverse_digits(num)
    reversed2 = reverse_digits(reversed1)
    return reversed2 == num
`

const L = text => {
  const index = code.findIndex(line => line.text.includes(text))
  if (index < 0) throw new Error(`Missing pseudocode line: ${text}`)
  return index + 1
}
const P = text => {
  const index = python.split('\n').findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`Missing python line: ${text}`)
  return index + 1
}

export const phases = [
  { id: 'first', label: 'First reversal', description: 'Read the digits from the last one to the first.' },
  { id: 'second', label: 'Second reversal', description: 'Reverse the first result the same way.' },
  { id: 'compare', label: 'Compare', description: 'Equal to the original only when no trailing zero was lost.' },
  { id: 'done', label: 'Result', description: 'Whether the double reversal matches.' },
]

function reverseTrace(x, frames, stage, label) {
  let value = x
  let reversed = 0
  const steps = []
  while (value > 0) {
    const digit = value % 10
    reversed = reversed * 10 + digit
    steps.push({ digit, reversed })
    value = Math.floor(value / 10)
  }
  frames.push({ phase: stage, activeLine: L('while (x > 0)'), pythonLine: P('while x > 0'), message: `Reversing ${label} gives ${reversed}${steps.length && steps[0].digit === 0 ? ' (the leading zeros are dropped)' : ''}.`, stage: label, input: x, output: reversed, steps })
  return reversed
}

export function buildTrace({ num }) {
  const frames = []
  const reversed1 = reverseTrace(num, frames, 'first', String(num))
  const reversed2 = reverseTrace(reversed1, frames, 'second', String(reversed1))
  const result = reversed2 === num
  frames.push({ phase: 'compare', activeLine: L('return reversed2 === num'), pythonLine: P('return reversed2 == num'), message: `${reversed2} ${result ? 'equals' : 'does not equal'} the original ${num}.`, stage: 'compare', input: num, output: reversed2, steps: [] })
  frames.push({ phase: 'done', activeLine: L('return reversed2 === num'), pythonLine: P('return reversed2 == num'), message: `Answer: ${result}.`, stage: 'done', input: num, output: reversed2, steps: [] })
  return { input: { num }, result, frames }
}
