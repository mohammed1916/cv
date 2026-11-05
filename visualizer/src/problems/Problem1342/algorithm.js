export const phases = [
  { id: 'start', label: 'Start', description: 'Begin with the number and a step count of zero.' },
  { id: 'even', label: 'Halve', description: 'An even number is divided by two.' },
  { id: 'odd', label: 'Subtract one', description: 'An odd number has one subtracted.' },
  { id: 'done', label: 'Complete', description: 'The number has reached zero; return the step count.' },
]

export const examples = [
  { label: 'Fourteen', input: '14' },
  { label: 'Eight', input: '8' },
  { label: 'Zero', input: '0' },
]

export function parseInput(text) {
  const trimmed = String(text).trim()
  if (!/^-?\d+(\.\d+)?$/.test(trimmed)) throw new Error('Enter a whole number, such as 14.')
  const value = Number(trimmed)
  if (!Number.isInteger(value)) throw new Error('num must be a nonnegative integer.')
  if (value < 0) throw new Error('num must be nonnegative.')
  if (value > 1000000) throw new Error('num must be at most 1000000 in this visualization.')
  return value
}

export function buildTrace(num) {
  let x = num
  let steps = 0
  const snap = (extra = {}) => ({ value: x, steps, ...extra })
  const frames = [{ phase: 'start', activeLine: L('let steps = 0'), pythonLine: P('steps = 0'), snapshot: snap(),
    message: `Start at ${num} with 0 steps.` }]
  while (x > 0) {
    if (x % 2 === 0) {
      x = x / 2
      steps++
      frames.push({ phase: 'even', activeLine: L('if (x % 2 === 0)'), pythonLine: P('if x % 2 == 0'), snapshot: snap({ rule: 'halve' }),
        message: `Even, so halve: ${x * 2} becomes ${x} (step ${steps}).` })
    } else {
      x = x - 1
      steps++
      frames.push({ phase: 'odd', activeLine: L('x = x - 1'), pythonLine: P('x -= 1'), snapshot: snap({ rule: 'subtract' }),
        message: `Odd, so subtract one: the value is now ${x} (step ${steps}).` })
    }
  }
  frames.push({ phase: 'done', activeLine: L('return steps'), pythonLine: P('return steps'), snapshot: snap({ value: 0, result: steps }),
    message: `Reached 0 in ${steps} step(s).`, result: steps })
  return { input: num, result: steps, frames }
}

export const code = `function numberOfSteps(num) {
  let x = num
  let steps = 0
  while (x > 0) {
    if (x % 2 === 0) {
      x = x / 2
    } else {
      x = x - 1
    }
    steps++
  }
  return steps
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def number_of_steps(num):
    x = num
    steps = 0
    while x > 0:
        if x % 2 == 0:
            x //= 2
        else:
            x -= 1
        steps += 1
    return steps
`
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1
