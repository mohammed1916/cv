const CODE = [
  'function isInstanceOf(obj, classFunction) {',
  '  if (obj === null || (typeof obj !== "object" && typeof obj !== "function")) return false',
  '  let proto = Object.getPrototypeOf(obj)',
  '  while (proto !== null) {',
  '    if (proto === classFunction.prototype) return true',
  '    proto = Object.getPrototypeOf(proto)',
  '  }',
  '  return false',
  '}',
]

const PY = [
  'def is_instance_of(obj, cls):',
  '    if obj is None or isinstance(obj, (int, float, str, bool)):',
  '        return False',
  '    for klass in type(obj).__mro__:',
  '        if klass is cls:',
  '            return True',
  '    return False',
]

const at = (lines, text) => {
  const index = lines.findIndex(line => line.trim() === text.trim())
  if (index < 0) throw new Error(`Missing trace line: ${text}`)
  return index + 1
}

export const phases = [
  { id: 'check', label: 'Primitive check', description: 'Primitives have no prototype chain, so they are rejected first.' },
  { id: 'walk', label: 'Walk chain', description: 'Compare each prototype, nearest first, with the class prototype.' },
  { id: 'found', label: 'Match', description: 'A prototype is the class prototype.' },
  { id: 'done', label: 'Result', description: 'Report the answer.' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with chain, target and primitive.')
  const { chain, target, primitive = false } = input
  if (!Array.isArray(chain) || chain.length > 8 || !chain.every(name => typeof name === 'string')) throw new Error('chain is a list of at most 8 class names, nearest first.')
  if (typeof target !== 'string') throw new Error('target is the class name to test.')
  if (typeof primitive !== 'boolean') throw new Error('primitive is true or false.')
  return { chain, target, primitive }
}

export function buildTrace({ chain, target, primitive }) {
  const frames = []
  const view = (focus, summary) => ({ title: 'Prototype chain', rows: primitive ? ['primitive value'] : chain.slice(), chain: chain.slice(), target, primitive, focus, summary })
  if (primitive) {
    frames.push({ pythonLine: at(PY, 'return False'), activeLine: at(CODE, 'if (obj === null || (typeof obj !== "object" && typeof obj !== "function")) return false'), phase: 'check', message: 'A primitive is never an instance.', view: view(-1, 'false') })
    frames.push({ pythonLine: at(PY, 'return False'), activeLine: at(CODE, 'return false'), phase: 'done', message: 'Result: false.', view: view(-1, 'false') })
    return { result: false, frames }
  }
  let result = false
  frames.push({ pythonLine: at(PY, 'for klass in type(obj).__mro__:'), activeLine: at(CODE, 'let proto = Object.getPrototypeOf(obj)'), phase: 'walk', message: `Start at the nearest prototype, ${chain[0] ?? 'none'}.`, view: view(0, '') })
  for (let i = 0; i < chain.length && !result; i++) {
    if (i > 0) frames.push({ pythonLine: at(PY, 'for klass in type(obj).__mro__:'), activeLine: at(CODE, 'proto = Object.getPrototypeOf(proto)'), phase: 'walk', message: `Move up to ${chain[i]}.`, view: view(i, '') })
    frames.push({ pythonLine: at(PY, 'if klass is cls:'), activeLine: at(CODE, 'if (proto === classFunction.prototype) return true'), phase: 'walk', message: `Compare ${chain[i]} with ${target}.`, view: view(i, '') })
    if (chain[i] === target) {
      result = true
      frames.push({ pythonLine: at(PY, 'return True'), activeLine: at(CODE, 'if (proto === classFunction.prototype) return true'), phase: 'found', message: `${chain[i]} matches ${target}.`, view: view(i, 'true') })
    }
  }
  if (!result) frames.push({ pythonLine: at(PY, 'return False'), activeLine: at(CODE, 'return false'), phase: 'done', message: 'The chain ends without a match.', view: view(-1, 'false') })
  else frames.push({ pythonLine: at(PY, 'return True'), activeLine: at(CODE, 'if (proto === classFunction.prototype) return true'), phase: 'done', message: 'Result: true.', view: view(-1, 'true') })
  return { result, frames }
}

export const code = CODE.map((text, index) => ({ line: index + 1, text }))
export const python = PY.join('\n') + '\n'
