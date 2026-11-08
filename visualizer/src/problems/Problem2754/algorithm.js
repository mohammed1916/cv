const lines = text => text.split('\n').map((t, i) => ({ line: i + 1, text: t }))
const PY_OF = {1: 1, 2: 1, 3: 2, 4: 3}
const frame = (phase, line, message, state = {}) => ({ phase, pythonLine: PY_OF[line] ?? line, activeLine: line, message, state })
export const PHASES = [
  { id: 'setup', label: 'Setup', description: 'Read the input and prepare the model.' },
  { id: 'step', label: 'Step', description: 'Process one event or item.' },
  { id: 'done', label: 'Result', description: 'The final value.' },
]
export const INPUT_LABEL = 'Object with name (string), args (bound words) and call (words passed later)'
export const URL = 'https://leetcode.com/problems/bind-function-to-context/'
export const COMPLEXITY = 'O(k) time to join k words. Binding stores references and does not copy the function.'
export const EXAMPLES = [
  { label: 'Example', input: '{"name":"Ada","args":["hi"],"call":["there"]}' },
  { label: 'No bound words', input: '{"name":"Bo","args":[],"call":["ok"]}' },
    { label: 'Zero words: empty bind and call', input: '{"name": "A", "args": [], "call": []}' },
    { label: 'Equal lengths: two bound and two called', input: '{"name": "Mo", "args": ["a", "b"], "call": ["c", "d"]}' },
    { label: 'Boundary: 10 words in total', input: '{"name": "Max", "args": ["p", "q", "r", "s", "t"], "call": ["u", "v", "w", "x", "y"]}' },
    { label: 'Long run: 10 words, one bound each', input: '{"name": "Run", "args": ["one", "two", "three", "four", "five"], "call": ["six", "seven", "eight", "nine", "ten"]}' },
  ]
export const WHY = [
  'Binding fixes two things ahead of time: the value of this inside the function and any leading arguments.',
  'Arguments given when the bound function is later called are appended after the bound ones.',
  'The demo function joins the name and the words, so you can see which values were fixed and which arrived later.',
]
export function parseInput(text) {
  const input = JSON.parse(text)
  if (typeof input?.name !== 'string' || !Array.isArray(input.args) || !Array.isArray(input.call)) throw new Error('Use name, args and call.')
  if (input.args.length + input.call.length > 10) throw new Error('Use at most 10 words in total.')
  return input
}
function greet(context, words) {
  return [context.name, 'says', ...words].join(' ')
}
export function buildTrace({ name, args, call }) {
  const context = { name }
  const bound = args.slice()
  const frames = [frame('setup', 1, 'Bind the context and the leading words.', { context, bound })]
  const result = greet(context, [...bound, ...call])
  frames.push(frame('step', 3, 'Call the bound function; the later words are appended.', { this: context.name, words: [...bound, ...call] }))
  frames.push(frame('done', 4, 'Return the joined sentence.', { result }))
  return { input: { name, args, call }, result, frames }
}
export const code = lines(`const self = context; // store the context as this
const leading = bound; // store the leading arguments
const call = (...args) => fn.apply(self, [...leading, ...args]); // when called, append the call arguments after the stored ones
return call; // return the function result with this set to the context`)
export const python = `def bind(func, context, *bound):
    def bound_call(*args):
        return func(context, [*bound, *args])
    return bound_call`
