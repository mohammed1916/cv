// The statement's three error messages are thrown as string literals. The attempt is described by a path and an action.
const MUTATORS = ['pop', 'push', 'shift', 'unshift', 'splice', 'sort', 'reverse']

export const code = `const MUTATORS = ['pop', 'push', 'shift', 'unshift', 'splice', 'sort', 'reverse']

function makeImmutable(value) {
  if (value === null || typeof value !== 'object') return value
  const copy = Array.isArray(value) ? [] : {}
  for (const key of Object.keys(value)) copy[key] = makeImmutable(value[key]) // children first
  return new Proxy(copy, {
    set(target, key) {
      throw Array.isArray(target) && /^\\d+$/.test(key) ? \`Error Modifying Index: \${key}\` : \`Error Modifying: \${key}\`
    },
    get(target, key) {
      if (Array.isArray(target) && MUTATORS.includes(key)) return () => { throw \`Error Calling Method: \${key}\` }
      return target[key]
    },
  })
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `MUTATORS = {"pop", "push", "shift", "unshift", "splice", "sort", "reverse"}

class ImmutableDict(dict):
    def __setitem__(self, key, value):
        raise ValueError(f"Error Modifying: {key}")

class ImmutableList(list):
    def __setitem__(self, index, value):
        raise ValueError(f"Error Modifying Index: {index}")

def _blocked(name):
    def method(self, *args):
        raise ValueError(f"Error Calling Method: {name}")
    return method

for _name in MUTATORS:
    setattr(ImmutableList, _name, _blocked(_name))

def make_immutable(value):
    if isinstance(value, dict):
        return ImmutableDict({k: make_immutable(v) for k, v in value.items()})
    if isinstance(value, list):
        return ImmutableList([make_immutable(v) for v in value])
    return value`
const pythonLines = python.split('\n')
const PY = s => {
  const found = pythonLines.findIndex(t => t.includes(s))
  if (found < 0) throw new Error(`Missing Python line for "${s}"`)
  return found + 1
}

export const phases = [
  { id: 'start', label: 'Start', description: 'Begin at the bottom of the object.' },
  { id: 'freeze', label: 'Wrap', description: 'Wrap each child before its parent.' },
  { id: 'attempt', label: 'Attempt', description: 'Try a change through the wrapped object.' },
  { id: 'done', label: 'Result', description: 'The attempt is refused with an error.' },
]

const keyOf = k => (typeof k === 'number' ? k : String(k))
function getAt(node, keys) {
  let cur = node
  for (const k of keys) {
    if (cur === null || typeof cur !== 'object' || !(String(k) in cur)) return undefined
    cur = cur[k]
  }
  return cur
}

export function parseInput(text) {
  const input = typeof text === 'string' ? JSON.parse(text) : text
  if (!input || typeof input !== 'object' || Array.isArray(input) || !input.obj || typeof input.obj !== 'object') {
    throw new Error('Use an object with obj (a JSON object or array), path (keys to the target) and action.')
  }
  const { obj, path, action } = input
  if (!Array.isArray(path) || path.length < 1 || path.length > 4 || !path.every(k => typeof k === 'string' || Number.isInteger(k))) {
    throw new Error('path is a list of 1 to 4 keys or indices.')
  }
  if (action === 'set') {
    const parent = getAt(obj, path.slice(0, -1))
    if (parent === undefined || parent === null || typeof parent !== 'object') throw new Error('The parent of the path must exist in obj.')
    if (!(String(path[path.length - 1]) in parent)) throw new Error('The key to set must already exist in obj.')
    return { obj, path, action, method: null }
  }
  if (action === 'call') {
    const target = getAt(obj, path)
    if (!Array.isArray(target)) throw new Error('A method call needs the path to end at an array.')
    const method = input.method
    if (typeof method !== 'string' || method.length > 10) throw new Error('method is a short method name such as push or map.')
    return { obj, path, action, method }
  }
  throw new Error('action is set or call.')
}

export function buildTrace({ obj, path, action, method }) {
  const frames = []
  const frozen = []
  const frame = (phase, line, py, message, extra = {}) => frames.push({ phase, activeLine: L(line), pythonLine: PY(py), frozen: [...frozen], message, ...extra })
  const visit = (node, name) => {
    if (node === null || typeof node !== 'object') return
    for (const key of Object.keys(node)) visit(node[key], name ? `${name}.${key}` : String(key))
    frozen.push(name || 'root')
    frame('freeze', 'copy[key] = makeImmutable', 'return ImmutableDict', `Wrap ${name || 'root'}.`)
  }
  frame('start', 'function makeImmutable', 'def make_immutable(value):', 'Walk the object from the bottom up.')
  visit(obj, '')
  const target = path.join('.')
  let error
  if (action === 'set') {
    const key = path[path.length - 1]
    const parentPath = path.slice(0, -1)
    const isIndex = Array.isArray(getAt(obj, parentPath)) && /^\d+$/.test(String(key))
    error = isIndex ? `Error Modifying Index: ${key}` : `Error Modifying: ${key}`
    frame('attempt', 'set(target, key)', 'def __setitem__', `Set ${target} is refused.`, { target, blocked: true, error })
  } else {
    error = `Error Calling Method: ${method}`
    const mutates = MUTATORS.includes(method)
    if (mutates) {
      frame('attempt', "get(target, key)", 'def _blocked', `Calling ${method} on ${target} is refused.`, { target, blocked: true, error })
    } else {
      error = null
      frame('attempt', "get(target, key)", 'def _blocked', `${method} only reads, so it is allowed.`, { target, blocked: false, error: null })
    }
  }
  frame('done', 'return new Proxy', 'return ImmutableDict', error ? `The thrown message is "${error}".` : 'The call completes; nothing is changed.', { target, blocked: error !== null, error })
  return { input: { obj, path, action, method }, result: error, frames }
}
