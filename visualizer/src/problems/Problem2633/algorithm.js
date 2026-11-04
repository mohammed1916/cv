const CODE = [
  'function jsonStringify(value) {',
  '  if (Array.isArray(value)) return `[${value.map(jsonStringify).join(",")}]`',
  '  if (value !== null && typeof value === "object") {',
  '    return `{${Object.keys(value).map(key => `"${key}":${jsonStringify(value[key])}`).join(",")}}`',
  '  }',
  '  if (typeof value === "string") return `"${value}"`',
  '  return String(value)',
  '}',
]

const PY = [
  'def json_stringify(value):',
  '    if isinstance(value, list):',
  '        return "[" + ",".join(json_stringify(item) for item in value) + "]"',
  '    if isinstance(value, dict):',
  '        return "{" + ",".join(f\'"{key}":\' + json_stringify(item) for key, item in value.items()) + "}"',
  '    if isinstance(value, str):',
  '        return f\'"{value}"\'',
  '    if value is None:',
  '        return "null"',
  '    return "true" if value is True else "false" if value is False else str(value)',
]

const at = (lines, text) => {
  const index = lines.findIndex(line => line.trim() === text.trim())
  if (index < 0) throw new Error(`Missing trace line: ${text}`)
  return index + 1
}

export const phases = [
  { id: 'array', label: 'Array', description: 'Write items inside brackets.' },
  { id: 'object', label: 'Object', description: 'Write key and value pairs inside braces.' },
  { id: 'string', label: 'String', description: 'Wrap the text in quotes.' },
  { id: 'leaf', label: 'Leaf', description: 'Write a number, boolean or null.' },
  { id: 'done', label: 'Result', description: 'The joined text.' },
]

const check = (value, depth) => {
  if (depth > 3) throw new Error('Nesting is at most 3 levels deep.')
  if (value === null || typeof value === 'boolean') return
  if (typeof value === 'number') { if (!Number.isInteger(value)) throw new Error('Numbers are whole numbers.'); return }
  if (typeof value === 'string') { if (!/^[a-z ]*$/.test(value)) throw new Error('Strings use lowercase letters and spaces.'); return }
  if (Array.isArray(value)) { if (value.length > 5) throw new Error('Arrays hold at most 5 items.'); value.forEach(item => check(item, depth + 1)); return }
  if (typeof value === 'object') {
    const keys = Object.keys(value)
    if (keys.length > 5 || !keys.every(key => /^[a-z]+$/.test(key))) throw new Error('Objects hold at most 5 keys made of lowercase letters.')
    keys.forEach(key => check(value[key], depth + 1))
    return
  }
  throw new Error('Only JSON values are allowed.')
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || !('value' in input)) throw new Error('Use an object with a value field.')
  check(input.value, 0)
  return { value: input.value }
}

export function buildTrace({ value }) {
  const frames = []
  const out = []
  const view = (kind, depth) => ({ title: 'Output so far', text: out.join(''), kind, depth, summary: '' })
  const write = (node, depth = 0) => {
    if (Array.isArray(node)) {
      out.push('[')
      node.forEach((item, i) => { if (i) out.push(','); write(item, depth + 1) })
      out.push(']')
      frames.push({ pythonLine: at(PY, 'if isinstance(value, list):'), activeLine: at(CODE, 'if (Array.isArray(value)) return `[${value.map(jsonStringify).join(",")}]`'), phase: 'array', message: `Closed an array of ${node.length} items.`, view: view('array', depth) })
    } else if (node !== null && typeof node === 'object') {
      out.push('{')
      Object.keys(node).forEach((key, i) => { if (i) out.push(','); out.push(`"${key}":`); write(node[key], depth + 1) })
      out.push('}')
      frames.push({ pythonLine: at(PY, 'if isinstance(value, dict):'), activeLine: at(CODE, 'if (value !== null && typeof value === "object") {'), phase: 'object', message: `Closed an object with ${Object.keys(node).length} keys.`, view: view('object', depth) })
    } else if (typeof node === 'string') {
      out.push(`"${node}"`)
      frames.push({ pythonLine: at(PY, 'if isinstance(value, str):'), activeLine: at(CODE, 'if (typeof value === "string") return `"${value}"`'), phase: 'string', message: `Wrote the string "${node}".`, view: view('string', depth) })
    } else {
      out.push(String(node))
      frames.push({ pythonLine: at(PY, 'return "true" if value is True else "false" if value is False else str(value)'), activeLine: at(CODE, 'return String(value)'), phase: 'leaf', message: `Wrote ${String(node)}.`, view: view('leaf', depth) })
    }
  }
  write(value)
  const result = out.join('')
  frames.push({ pythonLine: at(PY, 'return "true" if value is True else "false" if value is False else str(value)'), activeLine: at(CODE, '}'), phase: 'done', message: 'Finished.', view: { title: 'Output', text: result, kind: 'done', depth: 0, summary: result } })
  return { result, frames }
}

export const code = CODE.map((text, index) => ({ line: index + 1, text }))
export const python = PY.join('\n') + '\n'
