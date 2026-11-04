const lines = text => text.split('\n').map((t, i) => ({ line: i + 1, text: t }))
const PY_OF = {1: 68, 2: 70, 3: 78, 4: 80, 5: 81, 6: 83, 7: 83}
const frame = (phase, line, message, state = {}) => ({ phase, pythonLine: PY_OF[line] ?? line, activeLine: line, message, state })
export const PHASES = [
  { id: 'setup', label: 'Setup', description: 'Read the two values and prepare the merge.' },
  { id: 'step', label: 'Step', description: 'Decide, for one position, which value wins or whether to recurse.' },
  { id: 'done', label: 'Result', description: 'The merged value.' },
]
export const INPUT_LABEL = 'Object with a and b, each any JSON value (objects and arrays may nest)'
export const URL = 'https://leetcode.com/problems/deep-merge-of-two-objects/'
export const COMPLEXITY = 'O(total size of both values). Each position of each value is visited once.'
export const EXAMPLES = [
  { label: 'Nested objects', input: '{"a":{"x":1,"n":{"p":1,"q":2}},"b":{"n":{"q":5},"y":[1]}}' },
  { label: 'Arrays by index', input: '{"a":[{"k":1},4,7],"b":[[8],6]}' },
]
export const WHY = [
  'Two objects merge key by key: keys from either side are kept, and a key on both sides is merged again.',
  'Two arrays merge index by index. The result is as long as the longer array, and a position that only one side has is kept as it is.',
  'Any other pair, such as a number against an object, or an array against an object, takes the value from b.',
]
const isObj = v => v !== null && typeof v === 'object' && !Array.isArray(v)
const isArr = v => Array.isArray(v)
export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || !('a' in input) || !('b' in input)) throw new Error('Use an object with keys a and b.')
  if (JSON.stringify(input).length > 1000) throw new Error('Keep the input under 1000 characters.')
  return input
}
export function buildTrace({ a, b }) {
  const frames = [frame('setup', 1, 'Compare a and b at the top level.', { path: '(top)', origin: 'start' })]
  const merge = (x, y, path) => {
    const where = path || '(top)'
    if (isArr(x) && isArr(y)) {
      frames.push(frame('step', 3, `${where}: both are arrays, so merge by index.`, { path: where, origin: 'arrays' }))
      const out = []
      for (let i = 0; i < Math.max(x.length, y.length); i++) {
        const p = `${where}[${i}]`
        if (i >= y.length) { frames.push(frame('step', 6, `${p}: only a has this index, so keep it.`, { path: p, origin: 'a' })); out.push(x[i]) }
        else if (i >= x.length) { frames.push(frame('step', 6, `${p}: only b has this index, so add it.`, { path: p, origin: 'b' })); out.push(y[i]) }
        else out.push(merge(x[i], y[i], p))
      }
      return out
    }
    if (isObj(x) && isObj(y)) {
      frames.push(frame('step', 4, `${where}: both are objects, so merge key by key.`, { path: where, origin: 'objects' }))
      const out = { ...x }
      for (const key of Object.keys(y)) {
        const p = where === '(top)' ? key : `${where}.${key}`
        if (key in x) out[key] = merge(x[key], y[key], p)
        else { frames.push(frame('step', 5, `${p}: only b has this key, so add it.`, { path: p, origin: 'b' })); out[key] = y[key] }
      }
      return out
    }
    frames.push(frame('step', 7, `${where}: not the same kind, so take the value from b.`, { path: where, origin: 'b' }))
    return y
  }
  const result = merge(a, b, '')
  frames.push(frame('done', 7, 'Merged value ready.', { path: '(top)', origin: 'done', result }))
  return { input: { a, b }, result, frames }
}
export const code = lines(`if (Array.isArray(a) && Array.isArray(b)) { // if both values are arrays then merge them index by index
  return Array.from({ length: Math.max(a.length, b.length) }, (_, i) => merge(a[i], b[i])); } // the result is as long as the longer array
if (isObject(a) && isObject(b)) { // if both values are objects then merge them key by key
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]); // keys from either object are kept
  return Object.fromEntries([...keys].map(k => [k, k in a && k in b ? merge(a[k], b[k]) : (k in a ? a[k] : b[k])])); } // a key on both sides is merged again
return b; // otherwise the result is the value from b
// return the merged value`)
export const python = `def deep_merge(a, b):
    if isinstance(a, list) and isinstance(b, list):
        out = []
        for i in range(max(len(a), len(b))):
            if i >= len(b):
                out.append(a[i])
            elif i >= len(a):
                out.append(b[i])
            else:
                out.append(deep_merge(a[i], b[i]))
        return out
    if isinstance(a, dict) and isinstance(b, dict):
        out = dict(a)
        for key, value in b.items():
            out[key] = deep_merge(a[key], value) if key in a else value
        return out
    return b`
