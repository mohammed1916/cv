const lines = text => text.split('\n').map((t, i) => ({ line: i + 1, text: t }))
const PY_OF = {1: 2, 2: 3, 3: 4, 4: 6, 5: 7}
const frame = (phase, line, message, state = {}) => ({ phase, pythonLine: PY_OF[line] ?? line, activeLine: line, message, state })
export const PHASES = [
  { id: 'setup', label: 'Setup', description: 'Read the input and prepare the model.' },
  { id: 'step', label: 'Step', description: 'Process one event or item.' },
  { id: 'done', label: 'Result', description: 'The final value.' },
]
export const INPUT_LABEL = 'Object with init (integer) and ops: a list of [name, integer] pairs using add, subtract, multiply, divide, power (power exponent 0 to 5)'
export const URL = 'https://leetcode.com/problems/calculator-with-method-chaining/'
export const COMPLEXITY = 'O(k) time for k operations. Each operation changes one running value.'
export const EXAMPLES = [
  { label: 'Example', input: '{"init":10,"ops":[["add",5],["multiply",2],["divide",3]]}' },
  { label: 'Divide by zero', input: '{"init":4,"ops":[["divide",0]]}' },
]
export const WHY = [
  'Each method returns the calculator itself, so calls chain into one left-to-right fold over the running value.',
  'Dividing by zero is rejected rather than producing an infinite value; the chain stops at that operation.',
]
const NAMES = ['add', 'subtract', 'multiply', 'divide', 'power']
export function parseInput(text) {
  const input = JSON.parse(text)
  if (!Number.isInteger(input?.init) || !Array.isArray(input.ops) || input.ops.length > 10) throw new Error('Use an integer init and up to 10 operations.')
  for (const op of input.ops) {
    if (!Array.isArray(op) || !NAMES.includes(op[0]) || !Number.isInteger(op[1])) throw new Error('Each operation is [name, integer].')
    if (op[0] === 'power' && (op[1] < 0 || op[1] > 5)) throw new Error('Power exponent is from 0 to 5.')
  }
  return input
}
export function buildTrace({ init, ops }) {
  let value = init
  const frames = [frame('setup', 1, `Start with ${value}.`, { value })]
  for (const [name, arg] of ops) {
    if (name === 'divide' && arg === 0) {
      frames.push(frame('step', 3, 'Division by zero: the chain stops.', { value, error: 'Division by zero is not allowed' }))
      frames.push(frame('done', 5, 'Error result.', { value }))
      return { input: { init, ops }, result: { error: 'Division by zero is not allowed' }, frames }
    }
    const next = { add: value + arg, subtract: value - arg, multiply: value * arg, divide: value / arg, power: value ** arg }[name]
    value = next
    frames.push(frame('step', 4, `${name} ${arg} gives ${value}.`, { op: name, arg, value }))
  }
  frames.push(frame('done', 5, `Final value ${value}.`, { value }))
  return { input: { init, ops }, result: { value }, frames }
}
export const code = lines(`let value = init; // set value to init
for (const [name, arg] of ops) { // for each [name, arg] in the chain
  if (name === 'divide' && arg === 0) return 'Division by zero is not allowed'; // if the name is divide and arg is zero then return an error
  value = apply(name, value, arg); // value becomes value combined with arg
} return value; // return value`)
export const python = `def chain(init, ops):
    value = init
    for name, arg in ops:
        if name == "divide" and arg == 0:
            return "Division by zero is not allowed"
        value = apply(name, value, arg)
    return value`
