export const code = `function createHelloWorld() {
  return (...args) => 'Hello World'; // return a new function that takes any arguments and, when called, will return the string Hello World
}`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def create_hello_world():
    def hello(*args):
        return "Hello World"
    return hello`

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
  { id: 'start', label: 'Build', description: 'Create the function that will be returned.' },
  { id: 'call', label: 'Call', description: 'Call the returned function with any arguments.' },
  { id: 'done', label: 'Result', description: 'Every call gives the same string.' },
]

export function parseInput(text) {
  const input = typeof text === 'string' ? JSON.parse(text) : text
  if (!input || typeof input !== 'object' || !Array.isArray(input.calls)) throw new Error('Use an object with a calls list.')
  if (input.calls.length < 1 || input.calls.length > 6) throw new Error('calls has 1 to 6 entries in this visualization.')
  for (const args of input.calls) if (!Array.isArray(args) || args.length > 4) throw new Error('Each call is a list of up to 4 arguments.')
  return { calls: input.calls }
}

export function buildTrace({ calls }) {
  const frames = []
  const results = []
  frames.push({ phase: 'start', activeLine: L('return a new function'), pythonLine: PY('def hello'), message: 'createHelloWorld returns a function that ignores its arguments.', results: [] })
  calls.forEach((args, index) => {
    results.push('Hello World')
    frames.push({
      phase: 'call', activeLine: L('return the string Hello World'), pythonLine: PY('return "Hello World"'),
      message: `Call ${index + 1} with ${args.length} argument${args.length === 1 ? '' : 's'} returns "Hello World".`,
      call: index, args, results: results.slice(),
    })
  })
  frames.push({ phase: 'done', activeLine: L('return a new function'), pythonLine: PY('return hello'), message: `All ${calls.length} call(s) returned "Hello World".`, results: results.slice() })
  return { input: { calls }, result: results, frames }
}
