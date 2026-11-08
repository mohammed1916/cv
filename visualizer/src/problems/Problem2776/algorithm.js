const lines = text => text.split('\n').map((t, i) => ({ line: i + 1, text: t }))
const PY_OF = {1: 3, 2: 9, 3: 6, 4: 8, 5: 10}
const frame = (phase, line, message, state = {}, py = PY_OF[line] ?? line) => ({ phase, pythonLine: py, activeLine: line, message, state })
export const PHASES = [
  { id: 'setup', label: 'Setup', description: 'Read the input and prepare the model.' },
  { id: 'step', label: 'Step', description: 'Process one event or item.' },
  { id: 'done', label: 'Result', description: 'The final value.' },
]
export const INPUT_LABEL = 'Object with ok (boolean), value or error (text), and ms (delay from 0 to 1000)'
export const URL = 'https://leetcode.com/problems/convert-callback-based-function-to-promise-based-function/'
export const COMPLEXITY = 'O(1) work: one callback call and one settlement. The delay only changes when it happens.'
export const EXAMPLES = [
  { label: 'Success', input: '{"ok":true,"value":42,"ms":20}' },
  { label: 'Failure', input: '{"ok":false,"error":"boom","ms":5}' },
    { label: 'Zero delay success', input: '{"ok":true,"value":0,"ms":0}' },
    { label: 'Maximum delay failure', input: '{"ok":false,"error":"timeout","ms":1000}' },
    { label: 'Failure with empty error text', input: '{"ok":false,"error":"","ms":3}' },
  ]
export const WHY = [
  'The wrapper creates a promise and calls the old callback-style function with a handler that takes an error first.',
  'If the error is set, the promise rejects; otherwise it resolves with the value.',
  'Callers then use then and catch instead of nesting callbacks.',
]
export function parseInput(text) {
  const input = JSON.parse(text)
  if (typeof input?.ok !== 'boolean' || !Number.isInteger(input.ms) || input.ms < 0 || input.ms > 1000) throw new Error('Use ok, and ms from 0 to 1000.')
  if (input.ok && !('value' in input)) throw new Error('A success needs a value.')
  if (!input.ok && typeof input.error !== 'string') throw new Error('A failure needs an error text.')
  return input
}
export function buildTrace(input) {
  const frames = [frame('setup', 1, 'Wrap the callback function in a promise.', { ms: input.ms }, 3)]
  frames.push(frame('step', 2, `The old function runs and calls back after ${input.ms}ms.`, { time: input.ms }))
  const result = input.ok
    ? { status: 'resolved', value: input.value }
    : { status: 'rejected', reason: input.error }
  frames.push(frame('step', input.ok ? 4 : 3, input.ok ? 'The callback got no error, so resolve with the value.' : 'The callback got an error, so reject with it.', { callback: input.ok ? [null, input.value] : [input.error] }, input.ok ? 8 : 6))
  frames.push(frame('done', 5, `Promise ${result.status}.`, { result }))
  return { input, result, frames }
}
export const code = lines(`const promise = new Promise((resolve, reject) => { // create a new promise
  fn(...args, (err, value) => { // call the callback-style function with a handler
    if (err) reject(err); // if the handler gets an error then reject with it
    else resolve(value); }); // otherwise resolve with the value
}); return promise; // return the promise`)
export const python = `def promisify(fn):
    def wrapped(*args):
        future = Future()
        def handler(err, value):
            if err:
                future.reject(err)
            else:
                future.resolve(value)
        fn(*args, handler)
        return future
    return wrapped`
