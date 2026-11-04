const lines = text => text.split('\n').map((t, i) => ({ line: i + 1, text: t }))
const PY_OF = {1: 49, 2: 50, 3: 52, 4: 54, 5: 55}
const frame = (phase, line, message, state = {}) => ({ phase, pythonLine: PY_OF[line] ?? line, activeLine: line, message, state })
export const PHASES = [
  { id: 'setup', label: 'Setup', description: 'Read the input and prepare the model.' },
  { id: 'step', label: 'Step', description: 'Process one event or item.' },
  { id: 'done', label: 'Result', description: 'The final value.' },
]
export const INPUT_LABEL = 'A JSON text of at most 120 characters (objects and arrays)'
export const URL = 'https://leetcode.com/problems/convert-json-string-to-object/'
export const COMPLEXITY = 'O(n) time over the characters, with a depth counter that goes up and down with brackets.'
export const EXAMPLES = [
  { label: 'Nested', input: '{"a":[1,{"b":2}],"c":{}}' },
  { label: 'Array', input: '[1,[2,[3]]]' },
]
export const WHY = [
  'Brackets open and close nesting; the depth counter shows how deep the current position is.',
  'The visual reads the brackets to track depth, then the built-in parser builds the value that is returned.',
  'Invalid text makes the parser throw, so the workspace reports the error instead of a value.',
]
export function parseInput(text) {
  if (typeof text !== 'string' || text.length > 120) throw new Error('Use JSON text of at most 120 characters.')
  JSON.parse(text)
  return text
}
export function buildTrace(text) {
  let depth = 0
  let maxDepth = 0
  const frames = [frame('setup', 1, 'Read the text from left to right and track bracket depth.', { depth })]
  for (const ch of text) {
    if (ch === '{' || ch === '[') {
      depth++
      maxDepth = Math.max(maxDepth, depth)
      frames.push(frame('step', 3, `Open ${ch}: depth ${depth}.`, { char: ch, depth }))
    } else if (ch === '}' || ch === ']') {
      depth--
      frames.push(frame('step', 3, `Close ${ch}: depth ${depth}.`, { char: ch, depth }))
    }
  }
  const result = JSON.parse(text)
  frames.push(frame('done', 5, `Built the value; deepest nesting was ${maxDepth}.`, { maxDepth }))
  return { input: text, result, frames }
}
export const code = lines(`let depth = 0; // set depth to 0
for (const ch of text) { // for each character
  if ('{['.includes(ch)) depth++; // if it opens a bracket then increase depth
  if ('}]'.includes(ch)) depth--; } // if it closes a bracket then decrease depth
return JSON.parse(text); // return the value parsed from the text`)
export const python = `def parse_json(text):
    depth = 0
    for ch in text:
        if ch in "{[":
            depth += 1
        elif ch in "}]":
            depth -= 1
    return json.loads(text)`
