// The mutator is modelled as a list of assignments, because JSON input cannot carry a function.
export const code = `class ImmutableHelper {
  constructor(obj) { this.obj = obj } // keep the original object
  produce(writes) { // writes stands in for the mutator's assignments
    let next = this.obj // start from the original
    for (const [path, value] of writes) { // each assignment in order
      next = setAlong(next, path, value) // copy the objects on the path, then set the leaf
    }
    return next // return the new object
  }
}

function setAlong(node, path, value, depth = 0) {
  if (depth === path.length) return value
  const key = path[depth]
  const copy = Array.isArray(node) ? [...node] : { ...node } // copy this level only
  copy[key] = setAlong(node[key] ?? {}, path, value, depth + 1)
  return copy
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `class ImmutableHelper:
    def __init__(self, obj):
        self.obj = obj
    def produce(self, writes):
        nxt = self.obj
        for path, value in writes:
            nxt = set_along(nxt, path, value)
        return nxt

def set_along(node, path, value, depth=0):
    if depth == len(path):
        return value
    key = path[depth]
    copy = list(node) if isinstance(node, list) else dict(node)
    copy[key] = set_along(node.get(key, {}) if isinstance(node, dict) else node[key], path, value, depth + 1)
    return copy`
const pythonLines = python.split('\n')
const PY = s => {
  const found = pythonLines.findIndex(t => t.includes(s))
  if (found < 0) throw new Error(`Missing Python line for "${s}"`)
  return found + 1
}

export const phases = [
  { id: 'start', label: 'Start', description: 'The original object is kept as it is.' },
  { id: 'walk', label: 'Copy path', description: 'Copy each object on the path of this assignment.' },
  { id: 'set', label: 'Set', description: 'Write the value at the end of the path in the copy.' },
  { id: 'done', label: 'Result', description: 'The new object is returned; the original is unchanged.' },
]

export function parseInput(text) {
  const input = typeof text === 'string' ? JSON.parse(text) : text
  if (!input || typeof input !== 'object' || Array.isArray(input) || !input.obj || typeof input.obj !== 'object') {
    throw new Error('Use an object with obj (a JSON object or array) and writes (a list of [path, value]).')
  }
  const writes = input.writes
  if (!Array.isArray(writes) || writes.length < 1 || writes.length > 4) throw new Error('writes holds 1 to 4 assignments.')
  for (const [path] of writes) {
    if (!Array.isArray(path) || path.length < 1 || path.length > 3 || !path.every(k => typeof k === 'string' || Number.isInteger(k))) {
      throw new Error('Each write is [path, value], where path is 1 to 3 keys or indices.')
    }
  }
  return { obj: input.obj, writes }
}

export function buildTrace({ obj, writes }) {
  const frames = []
  const copies = []
  let current = obj
  const frame = (phase, line, py, message, extra = {}) => frames.push({ phase, activeLine: L(line), pythonLine: PY(py), copies: [...copies], message, ...extra })
  frame('start', 'keep the original object', 'self.obj = obj', 'The original object is kept as it is.')
  for (const [path, value] of writes) {
    const walk = (node, depth) => {
      if (depth === path.length) return value
      const key = path[depth]
      const label = path.slice(0, depth + 1).join('.')
      copies.push(label)
      frame('walk', 'copy the objects on the path', 'copy = list(node)', `Copy the object at ${label}.`)
      const child = node?.[key] ?? {}
      const copy = Array.isArray(node) ? [...node] : { ...node }
      copy[key] = walk(child, depth + 1)
      return copy
    }
    current = walk(current, 0)
    frame('set', 'set the leaf', 'return value', `Set ${path.join('.')} to ${JSON.stringify(value)} in the copies.`)
  }
  frame('done', 'return the new object', 'return nxt', 'The new object is returned. Untouched branches are shared with the original.')
  return { input: { obj, writes }, result: current, frames }
}
