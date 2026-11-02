// LeetCode 2628: JSON Deep Equal.
// Compare two JSON-compatible values. Primitives and null compare with ===.
// Arrays compare length and each index in order. Objects compare key sets (order ignored) and each value.
// An array never equals an object, and null is never traversed.
// Visualization caps: each value has at most 20 nodes (values, keys and elements) and nesting depth at most 4.
// The draft gives no official bound.

const MAX_NODES = 20
const MAX_DEPTH = 4

const CODE_LINES = [
  'FUNCTION deepEqual(a, b)',
  '    IF a or b is a primitive or null THEN RETURN a === b',
  '    IF exactly one of a and b is an array THEN RETURN false',
  '    IF both are arrays THEN',
  '        IF lengths differ THEN RETURN false',
  '        FOR each index i, IF NOT deepEqual(a[i], b[i]) THEN RETURN false',
  '        RETURN true',
  '    IF key counts differ THEN RETURN false',
  '    FOR each key of a, IF key is missing in b OR NOT deepEqual(a[key], b[key]) THEN RETURN false',
  '    RETURN true',
]

const PYTHON_LINES = [
  'class Solution:',
  '    def areDeeplyEqual(self, o1, o2):',
  '        if isinstance(o1, bool) or isinstance(o2, bool):',
  '            return type(o1) is type(o2) and o1 == o2',
  '        if not isinstance(o1, (dict, list)) or not isinstance(o2, (dict, list)):',
  '            return o1 == o2',
  '        if isinstance(o1, list) != isinstance(o2, list):',
  '            return False',
  '        if isinstance(o1, list):',
  '            if len(o1) != len(o2):',
  '                return False',
  '            return all(self.areDeeplyEqual(x, y) for x, y in zip(o1, o2))',
  '        if len(o1) != len(o2) or set(o1) != set(o2):',
  '            return False',
  '        return all(self.areDeeplyEqual(o1[key], o2[key]) for key in o1)',
  '',
  'if __name__ == "__main__":',
  '    import sys, json',
  '    data = json.loads(sys.stdin.read())',
  '    print(json.dumps(Solution().areDeeplyEqual(data["o1"], data["o2"])))',
]

const code = CODE_LINES.map((text, index) => ({ line: index + 1, text }))
const python = PYTHON_LINES.join('\n') + '\n'

function L(text) {
  const index = CODE_LINES.findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`Missing pseudocode line: ${text}`)
  return index + 1
}

function P(text) {
  const index = PYTHON_LINES.findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`Missing Python line: ${text}`)
  return index + 1
}

const phases = [
  { id: 'value', label: 'Compare values', description: 'Primitives and null compare directly.' },
  { id: 'array', label: 'Compare arrays', description: 'Lengths first, then each index in order.' },
  { id: 'object', label: 'Compare objects', description: 'Key counts and key sets, then each value by key.' },
  { id: 'done', label: 'Answer', description: 'Whether the two JSON values are deeply equal.' },
]

const pythonLineMap = { 1: 5, 2: 5, 3: 7, 4: 9, 5: 10, 6: 12, 7: 12, 8: 13, 9: 15, 10: 15 }

export { code, python, phases, pythonLineMap }

function isContainer(value) {
  return value !== null && typeof value === 'object'
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input) || !('o1' in input) || !('o2' in input)) {
    throw new Error('Use an object with o1 and o2 JSON values.')
  }
  for (const value of [input.o1, input.o2]) {
    const nodes = countNodes(value, 0)
    if (nodes.depth > MAX_DEPTH) throw new Error(`Each value nests at most ${MAX_DEPTH} levels deep.`)
    if (nodes.count > MAX_NODES) throw new Error(`Each value holds at most ${MAX_NODES} nodes.`)
  }
  return { o1: input.o1, o2: input.o2 }
}

// Nodes are every value plus every object key; depth counts nesting levels below the root.
function countNodes(value, depth) {
  if (!isContainer(value)) return { count: 1, depth }
  const children = Array.isArray(value) ? value : Object.values(value)
  let count = 1 + (Array.isArray(value) ? 0 : Object.keys(value).length)
  let deepest = depth
  for (const child of children) {
    const sub = countNodes(child, depth + 1)
    count += sub.count
    deepest = Math.max(deepest, sub.depth)
  }
  return { count, depth: deepest }
}

export function buildTrace({ o1, o2 }) {
  const frames = []
  const log = []

  const emit = (phase, line, pyText, message, a, b, path, result) => {
    frames.push({
      phase,
      activeLine: L(line),
      pythonLine: P(pyText),
      message,
      view: { o1, o2, a, b, path, result, log: log.slice() },
    })
  }

  function deepEqual(a, b, path) {
    if (!isContainer(a) || !isContainer(b)) {
      const result = a === b
      log.push({ path, kind: 'value', result, depth: depthOf(path) })
      emit('value', 'IF a or b is a primitive', 'if not isinstance(o1, (dict, list))', `${path}: ${show(a)} ${result ? '=' : '≠'} ${show(b)}.`, a, b, path, result)
      return result
    }
    if (Array.isArray(a) !== Array.isArray(b)) {
      log.push({ path, kind: 'shape', result: false, depth: depthOf(path) })
      emit('array', 'IF exactly one of a and b is an array', 'if isinstance(o1, list) != isinstance(o2, list)', `${path}: one side is an array and the other is an object, so they differ.`, a, b, path, false)
      return false
    }
    if (Array.isArray(a)) {
      if (a.length !== b.length) {
        log.push({ path, kind: 'array', result: false, depth: depthOf(path) })
        emit('array', 'IF lengths differ THEN RETURN false', 'if len(o1) != len(o2):', `${path}: arrays have lengths ${a.length} and ${b.length}.`, a, b, path, false)
        return false
      }
      for (let i = 0; i < a.length; i++) {
        const sub = `${path}[${i}]`
        emit('array', 'FOR each index i', 'return all(self.areDeeplyEqual(x, y)', `${path}: compare index ${i}.`, a, b, path, null)
        if (!deepEqual(a[i], b[i], sub)) {
          log.push({ path, kind: 'array', result: false, depth: depthOf(path) })
          emit('array', 'FOR each index i', 'return all(self.areDeeplyEqual(x, y)', `${sub} differs, so the arrays differ.`, a, b, path, false)
          return false
        }
      }
      log.push({ path, kind: 'array', result: true, depth: depthOf(path) })
      emit('array', 'RETURN true', 'return all(self.areDeeplyEqual(x, y)', `${path}: every index matches.`, a, b, path, true)
      return true
    }
    const keysA = Object.keys(a)
    const keysB = Object.keys(b)
    if (keysA.length !== keysB.length) {
      log.push({ path, kind: 'object', result: false, depth: depthOf(path) })
      emit('object', 'IF key counts differ', 'if len(o1) != len(o2) or set', `${path}: objects have ${keysA.length} and ${keysB.length} keys.`, a, b, path, false)
      return false
    }
    for (const key of keysA) {
      const sub = `${path}.${key}`
      if (!Object.prototype.hasOwnProperty.call(b, key)) {
        log.push({ path, kind: 'object', result: false, depth: depthOf(path) })
        emit('object', 'FOR each key of a', 'return all(self.areDeeplyEqual(o1[key]', `${path}: key "${key}" is missing in the second object.`, a, b, path, false)
        return false
      }
      emit('object', 'FOR each key of a', 'return all(self.areDeeplyEqual(o1[key]', `${path}: compare key "${key}".`, a, b, path, null)
      if (!deepEqual(a[key], b[key], sub)) {
        log.push({ path, kind: 'object', result: false, depth: depthOf(path) })
        emit('object', 'FOR each key of a', 'return all(self.areDeeplyEqual(o1[key]', `${sub} differs, so the objects differ.`, a, b, path, false)
        return false
      }
    }
    log.push({ path, kind: 'object', result: true, depth: depthOf(path) })
    emit('object', 'RETURN true', 'return all(self.areDeeplyEqual(o1[key]', `${path}: every key matches.`, a, b, path, true)
    return true
  }

  const result = deepEqual(o1, o2, '$')
  frames.push({
    phase: 'done',
    activeLine: result ? L('RETURN true') : L('IF exactly one'),
    pythonLine: P('return all(self.areDeeplyEqual(o1[key]'),
    message: result ? 'The two values are deeply equal.' : 'The two values differ.',
    view: { o1, o2, a: o1, b: o2, path: '$', result, log: log.slice(), done: true },
  })
  return { input: { o1, o2 }, result, frames }
}

function depthOf(path) {
  return (path.match(/[.[]/g) || []).length
}

function show(value) {
  return JSON.stringify(value) ?? 'undefined'
}
