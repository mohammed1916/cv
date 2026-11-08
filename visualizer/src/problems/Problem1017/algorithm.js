// Independently written teaching model. The sample inputs are invented for this visualization.
export const code = [
  'function toBaseNegativeTwo(n):',
  '  if n == 0: return "0"',
  '  digits = []',
  '  while n != 0:',
  '    bit = ((n mod 2) + 2) mod 2',
  '    digits.push(bit)',
  '    n = (n - bit) / -2',
  '  return digits reversed',
].map((text, index) => ({ line: index + 1, text }))

export const python = `def to_base_negative_two(n):
    if n == 0:
        return "0"
    digits = []
    while n != 0:
        bit = n % 2
        digits.append(bit)
        n = (n - bit) // -2
    return "".join(str(d) for d in reversed(digits))`

const PSEUDO = code.map(line => line.text)
const PY_LINES = python.split('\n')
function lineOf(lines, key) {
  const index = lines.findIndex(text => text.includes(key))
  if (index < 0) throw new Error(`Missing line: ${key}`)
  return index + 1
}
const frame = (phase, pseudoKey, pyKey, message, snapshot) => ({
  phase,
  activeLine: lineOf(PSEUDO, pseudoKey),
  pythonLine: lineOf(PY_LINES, pyKey),
  message,
  snapshot,
})

export const phases = [
  { id: 'start', label: 'Start', description: 'Read the value and prepare an empty digit list.' },
  { id: 'inspect', label: 'Pick a digit', description: 'Choose the digit that makes the remaining value divisible by negative two.' },
  { id: 'update', label: 'Divide', description: 'Remove that digit and divide by negative two.' },
  { id: 'done', label: 'Result', description: 'Read the collected digits from last to first.' },
]

export const inputLabel = 'JSON object with n, for example {"n":6}'
export const complexity = 'O(log |n|) digit steps. Each step removes one base-negative-two digit, and the visualizer accepts n up to 1000000.'
export const examples = [
  { label: 'Zero', input: '{"n":0}' },
  { label: 'Single unit', input: '{"n":1}' },
  { label: 'Needs a sign flip', input: '{"n":2}' },
  { label: 'Mixed digits', input: '{"n":173}' },
  { label: 'Largest n allowed', input: '{"n":1000000}' },
  { label: 'All ones in binary', input: '{"n":255}' },
  { label: 'Long run: generated n', input: '{"n":573149}' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || !Number.isInteger(input.n) || input.n < 0 || input.n > 1000000) {
    throw new Error('Use {"n": m} with an integer m from 0 to 1000000.')
  }
  return { n: input.n }
}

export function buildTrace({ n }) {
  const frames = []
  const digits = []
  let value = n
  if (value === 0) {
    frames.push(frame('start', 'if n == 0', 'if n == 0', 'The value is zero, so the one-digit answer is 0.', { n, digits: [] }))
    frames.push(frame('done', 'return digits reversed', 'return "".join', 'Result: 0.', { n, digits: [], result: '0' }))
    return { input: { n }, result: '0', frames }
  }
  frames.push(frame('start', 'digits = []', 'digits = []', `Start with ${value}.`, { n, value, digits: [] }))
  while (value !== 0) {
    const bit = ((value % 2) + 2) % 2
    frames.push(frame('inspect', 'bit = ', 'bit = ',
      `${value} leaves digit ${bit} after subtracting it, so the remainder is even.`, { n, value, bit, digits: [...digits] }))
    digits.push(bit)
    frames.push(frame('update', 'digits.push', 'digits.append', `Record digit ${bit}.`, { n, value, bit, digits: [...digits] }))
    value = (value - bit) / -2
    frames.push(frame('update', 'n = (n - bit)', 'n = (n - bit)', `Divide by negative two: the next value is ${value}.`, { n, value, digits: [...digits] }))
  }
  const result = [...digits].reverse().join('')
  frames.push(frame('done', 'return digits reversed', 'return "".join', `Read the digits last to first: ${result}.`, { n, digits: [...digits], result }))
  return { input: { n }, result, frames }
}
