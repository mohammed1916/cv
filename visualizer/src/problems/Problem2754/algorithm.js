const lines = text => text.split('\n').map((t, i) => ({ line: i + 1, text: t }))
const frame = (phase, line, message, state = {}) => ({ phase, pythonLine: line, activeLine: line, message, state })
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
export const code = lines(`store the context as this
store the leading arguments
when called, append the call arguments after the stored ones
return the function result with this set to the context`)
export const python = `def bind(func, context, *bound):
    def bound_call(*args):
        return func(context, [*bound, *args])
    return bound_call`
