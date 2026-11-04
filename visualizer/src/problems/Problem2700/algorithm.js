export const code = [
  'function diffValues(a, b, path, flat) {',
  '  const out = {}',
  '  let any = false',
  '  for (const key of keysInBoth(a, b)) {',
  '    const name = path ? `${path}.${key}` : key',
  '    if (bothContainers(a[key], b[key])) {',
  '      const sub = diffValues(a[key], b[key], name, flat)',
  '      if (sub !== null) { out[key] = sub; any = true }',
  '      continue',
  '    }',
  '    if (JSON.stringify(a[key]) === JSON.stringify(b[key])) continue',
  '    flat[name] = [a[key], b[key]]',
  '    out[key] = [a[key], b[key]]',
  '    any = true',
  '  }',
  '  return any ? out : null',
  '}',
].map((text, index) => ({ line: index + 1, text }))

export const python = `import json

def json_text(value):
    return json.dumps(value)

def keys_in_both(a, b):
    if isinstance(a, list) and isinstance(b, list):
        return range(min(len(a), len(b)))
    return [k for k in a if k in b]

def both_containers(x, y):
    return (isinstance(x, dict) and isinstance(y, dict)) or (isinstance(x, list) and isinstance(y, list))

def diff_values(a, b, path, flat):
    out = {}
    any_change = False
    for key in keys_in_both(a, b):
        name = f"{path}.{key}" if path else str(key)
        if both_containers(a[key], b[key]):
            sub = diff_values(a[key], b[key], name, flat)
            if sub is not None:
                out[key] = sub
                any_change = True
            continue
        if json_text(a[key]) == json_text(b[key]):
            continue
        flat[name] = [a[key], b[key]]
        out[key] = [a[key], b[key]]
        any_change = True
    return out if any_change else None`

const at = phrase => code.findIndex(c => c.text.includes(phrase)) + 1
const pyAt = phrase => python.split('\n').findIndex(line => line.includes(phrase)) + 1

const isPlain = v => v !== null && typeof v === 'object' && !Array.isArray(v)
const isList = v => Array.isArray(v)

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || !input.obj1 || !input.obj2 || typeof input.obj1 !== 'object' || typeof input.obj2 !== 'object') {
    throw new Error('Use an object with obj1 and obj2, both objects or arrays.')
  }
  if (JSON.stringify(input).length > 1000) throw new Error('Keep the input under 1000 characters.')
  return { obj1: input.obj1, obj2: input.obj2 }
}

// The result nests the way the input does. The frame list also records a flat path, so the page can name each change.
export function buildTrace({ obj1, obj2 }) {
  const frames = []
  const flat = {}
  frames.push({ phase: 'start', activeLine: at('function diffValues'), pythonLine: pyAt('def diff_values'), diff: {}, message: 'Compare the two objects key by key.' })
  const walk = (a, b, path) => {
    const out = {}
    let any = false
    const keys = isList(a) && isList(b)
      ? Array.from({ length: Math.min(a.length, b.length) }, (_, i) => String(i))
      : Object.keys(a).filter(k => Object.prototype.hasOwnProperty.call(b, k))
    for (const key of keys) {
      const name = path ? `${path}.${key}` : key
      const x = a[key]
      const y = b[key]
      if ((isPlain(x) && isPlain(y)) || (isList(x) && isList(y))) {
        const sub = walk(x, y, name)
        if (sub !== null) { out[key] = sub; any = true }
        continue
      }
      if (JSON.stringify(x) === JSON.stringify(y)) continue
      flat[name] = [x, y]
      out[key] = [x, y]
      any = true
      frames.push({ phase: 'differ', activeLine: at('flat[name] = [a[key], b[key]]'), pythonLine: pyAt('flat[name] = [a[key], b[key]]'), diff: { ...flat }, message: `${name} changed from ${JSON.stringify(x)} to ${JSON.stringify(y)}.` })
    }
    return any ? out : null
  }
  const result = walk(obj1, obj2, '') ?? {}
  frames.push({ phase: 'done', activeLine: at('return any ? out : null'), pythonLine: pyAt('return out if any_change'), diff: { ...flat }, message: `${Object.keys(flat).length} changed value${Object.keys(flat).length === 1 ? '' : 's'}.` })
  return { input: { obj1, obj2 }, result, frames }
}
