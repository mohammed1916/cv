// JSON cannot express undefined, so a null in the args list stands for an explicitly passed undefined argument.
export const code = `function argumentsLength(...args)
  set count to 0
  for each argument
    add one to count
  return count`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def arguments_length(*args):
    count = 0
    for _ in args:
        count += 1
    return count`

const L = (text) => {
  const index = code.findIndex((line) => line.text.includes(text))
  if (index < 0) throw new Error(`Missing pseudocode line: ${text}`)
  return index + 1
}

const PY_LINES = python.split('\n')
const PY = (text) => {
  const index = PY_LINES.findIndex((line) => line.includes(text))
  if (index < 0) throw new Error(`Missing python line: ${text}`)
  return index + 1
}

export const phases = [
  { id: 'start', label: 'Count', description: 'Start the count at zero.' },
  { id: 'argument', label: 'Argument', description: 'Each argument adds one, even when it is undefined.' },
  { id: 'done', label: 'Result', description: 'Return the count.' },
]

export function parseInput(text) {
  const input = typeof text === 'string' ? JSON.parse(text) : text
  if (!input || typeof input !== 'object' || !Array.isArray(input.args)) throw new Error('Use an object with an args list.')
  if (input.args.length > 10) throw new Error('args has at most 10 entries in this visualization.')
  return { args: input.args }
}

const show = (v) => (v === null ? 'undefined' : JSON.stringify(v))

export function buildTrace({ args }) {
  const frames = []
  let count = 0
  frames.push({ phase: 'start', activeLine: L('set count to 0'), pythonLine: PY('count = 0'), message: 'The count starts at 0.', count, index: null })
  args.forEach((value, index) => {
    count += 1
    frames.push({
      phase: 'argument', activeLine: L('add one to count'), pythonLine: PY('count += 1'),
      message: `Argument ${index + 1} (${show(value)}) counts, so the count is ${count}.`,
      count, index, args: args.slice(0, index + 1),
    })
  })
  frames.push({ phase: 'done', activeLine: L('return count'), pythonLine: PY('return count'), message: `${args.length} argument${args.length === 1 ? '' : 's'} were passed, so the result is ${count}.`, count, index: null })
  return { input: { args }, result: count, frames }
}
