const lines = text => text.split('\n').map((t, i) => ({ line: i + 1, text: t }))
const frame = (phase, line, message, state = {}) => ({ phase, pythonLine: line, activeLine: line, message, state })
export const PHASES = [
  { id: 'setup', label: 'Setup', description: 'Read the input and prepare the model.' },
  { id: 'step', label: 'Step', description: 'Process one event or item.' },
  { id: 'done', label: 'Result', description: 'The final value.' },
]
export const INPUT_LABEL = 'JSON value where undefined is written as {"$undefined": true} (nested objects and arrays allowed)'
export const URL = 'https://leetcode.com/problems/undefined-to-null/'
export const COMPLEXITY = 'O(total nodes) time: each object and array node is visited once.'
export const EXAMPLES = [
  { label: 'Example', input: '{"a":{"$undefined":true},"b":[1,{"$undefined":true}]}' },
  { label: 'Nested', input: '{"x":{"y":{"z":{"$undefined":true}}}}' },
]
export const WHY = [
  'JSON cannot store undefined, so this visual marks each undefined with a small object and replaces it with null.',
  'The walk visits every nested object and array, so undefined values buried deep inside are also replaced.',
]
const MARK = value => value !== null && typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length === 1 && value.$undefined === true
export function parseInput(text) {
  return JSON.parse(text)
}
export function buildTrace(input) {
  const frames = [frame('setup', 1, 'Walk the value and replace each undefined marker with null.', { value: input })]
  const walk = (value, path) => {
    if (MARK(value)) {
      frames.push(frame('step', 3, `${path || 'root'} was undefined; it becomes null.`, { path, now: null }))
      return null
    }
    if (Array.isArray(value)) return value.map((item, i) => walk(item, `${path}[${i}]`))
    if (value !== null && typeof value === 'object') {
      const out = {}
      for (const key of Object.keys(value)) out[key] = walk(value[key], path ? `${path}.${key}` : key)
      return out
    }
    return value
  }
  const result = walk(input, '')
  frames.push(frame('done', 5, 'Every undefined is now null.', { result }))
  return { input, result, frames }
}
export const code = lines(`if the value is an undefined marker then return null
if the value is an array then map each item through this rule
if the value is an object then rebuild it with each field through this rule
otherwise return the value unchanged`)
export const python = `def undefined_to_null(value):
    if is_marker(value):
        return None
    if isinstance(value, list):
        return [undefined_to_null(v) for v in value]
    if isinstance(value, dict):
        return {k: undefined_to_null(v) for k, v in value.items()}
    return value`
