// Teaching stand-in for fn: the visualization uses fn(...args) = the sum of its arguments (an empty call sums to 0).
// JSON cannot express undefined, so a later call's result is reported as null.
export const code = `function once(fn)
  set called to false
  return a wrapper that takes the call arguments
    if called is true then return undefined
    set called to true
    return fn applied to the arguments`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def once(fn):
    called = False
    def wrapper(*args):
        nonlocal called
        if called:
            return None
        called = True
        return fn(*args)
    return wrapper`

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
  { id: 'start', label: 'Set up', description: 'The flag starts false.' },
  { id: 'check', label: 'Check', description: 'Look at the flag for this call.' },
  { id: 'invoke', label: 'Invoke', description: 'The first call runs fn with its arguments.' },
  { id: 'skip', label: 'Skip', description: 'A later call returns undefined and fn does not run.' },
  { id: 'done', label: 'Result', description: 'Report every call result.' },
]

export function parseInput(text) {
  const input = typeof text === 'string' ? JSON.parse(text) : text
  if (!input || typeof input !== 'object' || !Array.isArray(input.calls)) throw new Error('Use an object with a calls list.')
  if (input.calls.length < 1 || input.calls.length > 6) throw new Error('calls has 1 to 6 entries in this visualization.')
  for (const args of input.calls) {
    if (!Array.isArray(args) || args.length > 4 || !args.every((v) => Number.isInteger(v))) throw new Error('Each call is a list of up to 4 integers.')
  }
  return { calls: input.calls }
}

const sum = (args) => args.reduce((total, v) => total + v, 0)

export function buildTrace({ calls }) {
  const frames = []
  let called = false
  const results = []
  const frame = (phase, activeText, pythonText, message, state = {}) => frames.push({
    phase,
    activeLine: L(activeText),
    pythonLine: PY(pythonText),
    message,
    called,
    call: null,
    args: [],
    results: results.slice(),
    ...state,
  })

  frame('start', 'set called to false', 'called = False', 'The wrapper has not been called yet.')
  calls.forEach((args, index) => {
    frame('check', 'if called is true', 'if called:', `Call ${index + 1} arrives with [${args.join(', ')}]. The flag is ${called}.`, { call: index, args })
    if (called) {
      results.push({ args, returned: false, value: null })
      frame('skip', 'return undefined', 'return None', `Call ${index + 1} returns undefined and fn is not run.`, { call: index, args })
    } else {
      called = true
      frame('invoke', 'set called to true', 'called = True', 'The flag flips to true so no later call can run fn.', { call: index, args })
      const value = sum(args)
      results.push({ args, returned: true, value })
      frame('invoke', 'return fn applied to the arguments', 'return fn(*args)', `fn runs on [${args.join(', ')}] and returns ${value}.`, { call: index, args })
    }
  })
  frame('done', 'return a wrapper that takes the call arguments', 'return wrapper', `fn ran ${results.filter((r) => r.returned).length} time(s) across ${calls.length} call(s).`)
  return { input: { calls }, result: results, frames }
}
