const lines = text => text.split('\n').map((t, i) => ({ line: i + 1, text: t }))
const frame = (phase, line, message, state = {}) => ({ phase, pythonLine: line, activeLine: line, message, state })
export const PHASES = [
  { id: 'setup', label: 'Setup', description: 'Read the input and prepare the model.' },
  { id: 'step', label: 'Step', description: 'Process one event or item.' },
  { id: 'done', label: 'Result', description: 'The final value.' },
]
export const INPUT_LABEL = 'Object with a and b, each a JSON object (nested objects allowed)'
export const URL = 'https://leetcode.com/problems/deep-merge-of-two-objects/'
export const COMPLEXITY = 'O(total keys) time. Each key of each object is visited once.'
export const EXAMPLES = [
  { label: 'Example', input: '{"a":{"x":1,"n":{"p":1,"q":2}},"b":{"n":{"q":5},"y":[1]}}' },
  { label: 'Array replaces', input: '{"a":{"list":[1,2]},"b":{"list":[9]}}' },
]
export const WHY = [
  'When both values under a key are plain objects, the merge recurses so nested keys combine instead of being replaced.',
  'In every other case the value from b wins, including arrays, which are replaced rather than merged.',
]
const isObject = v => v !== null && typeof v === 'object' && !Array.isArray(v)
export function parseInput(text) {
  const input = JSON.parse(text)
  if (!isObject(input?.a) || !isObject(input?.b)) throw new Error('Both a and b must be objects.')
  return input
}
export function buildTrace({ a, b }) {
  const frames = [frame('setup', 1, 'Start with a copy of a.', { keys: Object.keys(a) })]
  const merged = (x, y, path) => {
    const out = { ...x }
    for (const key of Object.keys(y)) {
      const where = path ? `${path}.${key}` : key
      if (isObject(out[key]) && isObject(y[key])) {
        frames.push(frame('step', 3, `${where} holds objects in both, so merge inside.`, { key: where }))
        out[key] = merged(out[key], y[key], where)
      } else {
        out[key] = y[key]
        frames.push(frame('step', 4, `${where} takes the value from b.`, { key: where, value: y[key] }))
      }
    }
    return out
  }
  const result = merged(a, b, '')
  frames.push(frame('done', 6, 'Merged object ready.', { result }))
  return { input: { a, b }, result, frames }
}
export const code = lines(`start with a copy of a
for each key in b
  if both values are objects then merge them recursively
  otherwise take the value from b
return the copy`)
export const python = `def deep_merge(a, b):
    out = dict(a)
    for key, value in b.items():
        if isinstance(out.get(key), dict) and isinstance(value, dict):
            out[key] = deep_merge(out[key], value)
        else:
            out[key] = value
    return out`
