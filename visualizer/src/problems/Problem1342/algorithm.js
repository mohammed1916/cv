export const phases = [
  { id: 'start', label: 'Start', description: 'Begin with the given value and a step count of zero.' },
  { id: 'halve', label: 'Halve', description: 'An even value is divided by two. One step is counted.' },
  { id: 'subtract', label: 'Subtract one', description: 'An odd value loses one first, so the next value is even. One step is counted.' },
  { id: 'done', label: 'Complete', description: 'The value has reached zero, so the step count is the answer.' },
]

export function parseInput(text) {
  const trimmed = text.trim()
  if (!/^\d+$/.test(trimmed)) throw new Error('Enter one nonnegative integer, such as 14.')
  const num = Number(trimmed)
  if (num > 1000000) throw new Error('The value must be at most 1000000.')
  return num
}

const L = s => code.findIndex(c => c.text.includes(s)) + 1
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1
const at = (codeSub, pySub = codeSub) => ({ activeLine: L(codeSub), pythonLine: P(pySub) })

export function buildTrace(num) {
  const frames = []
  let value = num
  let steps = 0
  frames.push({ phase: 'start', ...at('steps = 0'), message: `Start with ${value} and zero steps. Each step either halves an even value or removes one from an odd value.`, snapshot: { value, steps, path: [value] } })
  const path = [value]

  while (value > 0) {
    const before = value
    const even = value % 2 === 0
    if (even) {
      value = value / 2
    } else {
      value = value - 1
    }
    steps += 1
    path.push(value)
    frames.push({
      phase: even ? 'halve' : 'subtract', ...(even ? at('is even', '% 2 == 0') : at('subtract one', 'else')),
      message: even
        ? `${before} is even, so halve it to ${value}. Step ${steps}.`
        : `${before} is odd, so subtract one to get ${value}. Step ${steps}.`,
      snapshot: { value, steps, path: [...path], from: before },
    })
  }

  frames.push({ phase: 'done', ...at('return steps'), message: `The value reached zero after ${steps} step${steps === 1 ? '' : 's'}.`, snapshot: { value, steps, path: [...path], result: steps } })
  return { input: num, result: steps, frames }
}

export const code = `steps to zero (num):
  steps = 0
  while num > 0:
    if num is even: num = num / 2
    else: subtract one from num
    steps = steps + 1
  return steps`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def number_of_steps(num):
    steps = 0
    while num > 0:
        if num % 2 == 0:
            num //= 2
        else:
            num -= 1
        steps += 1
    return steps
`
