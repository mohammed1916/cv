export const phases = [
  { id: 'start', label: 'Start', description: 'Take the first value as the smallest so far.' },
  { id: 'scan', label: 'Find minimum', description: 'Compare each later value with the smallest so far.' },
  { id: 'digits', label: 'Sum digits', description: 'Add the digits of the minimum only.' },
  { id: 'done', label: 'Complete', description: 'Return one for an even digit sum, otherwise zero.' },
]

export const code = `parity of minimum digit sum (values):
  smallest = values[0]
  for value in values after the first:
    if value < smallest: smallest = value
  total = 0
  for digit in digits of smallest:
    total += digit
  return 1 if total is even else 0`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def parity_of_minimum_digit_sum(values):
    smallest = values[0]
    for value in values[1:]:
        if value < smallest: smallest = value
    total = 0
    for digit in str(smallest):
        total += int(digit)
    return 1 if total % 2 == 0 else 0
`

const codeLine = key => code.findIndex(line => line.text.includes(key)) + 1
const pythonLine = key => python.split('\n').findIndex(line => line.includes(key)) + 1

export function parseInput(text) {
  const values = JSON.parse(text)
  if (!Array.isArray(values) || values.length < 1 || values.length > 20) throw new Error('Use a JSON array of 1 to 20 integers.')
  if (!values.every(v => Number.isInteger(v) && v >= 1 && v <= 999)) throw new Error('Values must be integers from 1 to 999.')
  return values
}

export function buildTrace(values) {
  const frames = []
  let smallest = values[0]
  const push = (phase, key, message, extra = {}, pyKey = key) => frames.push({
    phase,
    activeLine: codeLine(key),
    pythonLine: pythonLine(pyKey),
    message,
    state: { values, smallest, digits: [], total: 0, index: null, ...extra },
  })

  push('start', 'smallest = values[0]', `Start with ${smallest} as the smallest value.`)
  for (let i = 1; i < values.length; i++) {
    const beats = values[i] < smallest
    push('scan', 'if value < smallest', beats ? `${values[i]} is smaller than ${smallest}, so it becomes the minimum.` : `${values[i]} does not beat ${smallest}.`, { index: i, value: values[i] })
    if (beats) smallest = values[i]
  }
  push('scan', 'if value < smallest', `The minimum is ${smallest}. Other values no longer matter for the answer.`, { index: null })

  const digits = String(smallest).split('').map(Number)
  let total = 0
  push('digits', 'total = 0', `Digits of ${smallest} are ${digits.join(', ')}.`, { digits, total: 0 })
  for (const digit of digits) {
    total += digit
    push('digits', 'total += digit', `Add ${digit}, total is now ${total}.`, { digits, total }, 'total +=')
  }

  const result = total % 2 === 0 ? 1 : 0
  push('done', 'return 1 if total is even else 0', `Digit sum ${total} is ${total % 2 === 0 ? 'even' : 'odd'}, so the answer is ${result}.`, { digits, total }, 'return 1 if')
  return { input: values, result, frames }
}
