// Visualization cap: at most 12 keys or elements at the top level. A key whose value is null still counts as a key.
export const code = `function isEmpty(value)
  if value is a list then
    return whether its length is zero
  count the own keys of the object
  return whether the count is zero`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def is_empty(value):
    if isinstance(value, list):
        return len(value) == 0
    keys = list(value.keys())
    return len(keys) == 0`

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
  { id: 'check', label: 'Kind', description: 'Decide whether the value is a list or an object.' },
  { id: 'count', label: 'Count', description: 'Count the own keys of the object.' },
  { id: 'done', label: 'Result', description: 'Empty means a count of zero.' },
]

export function parseInput(text) {
  const input = typeof text === 'string' ? JSON.parse(text) : text
  if (!input || typeof input !== 'object') throw new Error('Use a JSON object or array.')
  const size = Array.isArray(input) ? input.length : Object.keys(input).length
  if (size > 12) throw new Error('At most 12 keys or elements in this visualization.')
  return input
}

export function buildTrace(value) {
  const frames = []
  if (Array.isArray(value)) {
    frames.push({ phase: 'check', activeLine: L('if value is a list'), pythonLine: PY('if isinstance(value, list)'), message: 'The value is a list, so its elements are counted.', kind: 'list', items: value, count: value.length })
    const result = value.length === 0
    frames.push({ phase: 'done', activeLine: L('return whether its length is zero'), pythonLine: PY('return len(value) == 0'), message: `${value.length} element${value.length === 1 ? '' : 's'}, so the answer is ${result}.`, kind: 'list', items: value, count: value.length, result })
    return { input: value, result, frames }
  }
  const keys = Object.keys(value)
  frames.push({ phase: 'check', activeLine: L('if value is a list'), pythonLine: PY('if isinstance(value, list)'), message: 'The value is an object, so its keys are counted.', kind: 'object', items: keys, count: null })
  frames.push({ phase: 'count', activeLine: L('count the own keys of the object'), pythonLine: PY('keys = list(value.keys())'), message: `${keys.length} own key${keys.length === 1 ? '' : 's'} found${keys.length ? `: ${keys.join(', ')}` : ''}.`, kind: 'object', items: keys, count: keys.length })
  const result = keys.length === 0
  frames.push({ phase: 'done', activeLine: L('return whether the count is zero'), pythonLine: PY('return len(keys) == 0'), message: result ? 'No keys, so the object is empty.' : 'A key is present, even when its value is null, so the object is not empty.', kind: 'object', items: keys, count: keys.length, result })
  return { input: value, result, frames }
}
