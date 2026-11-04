export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || !input.obj1 || !input.obj2 || typeof input.obj1 !== 'object' || typeof input.obj2 !== 'object') {
    throw new Error('Use an object with obj1 and obj2, both objects or arrays.')
  }
  if (JSON.stringify(input).length > 1000) throw new Error('Keep the input under 1000 characters.')
  return { obj1: input.obj1, obj2: input.obj2 }
}

export const code = `compare two values key by key, with array indices as keys
for each key present in both values
  if both are objects, or both are arrays, compare them inside
  otherwise if the values differ, report the pair [old, new]
keys present in only one value are ignored
return the nested result, keeping only branches with a difference`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

const isPlain = v => v !== null && typeof v === 'object' && !Array.isArray(v)
const isList = v => Array.isArray(v)

// The result nests the way the input does. The frame list also records a flat path, so the page can name each change.
export function buildTrace({ obj1, obj2 }) {
  const frames = []
  const flat = {}
  frames.push({ phase: 'start', activeLine: L('compare two values'), diff: {}, message: 'Compare the two objects key by key.' })
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
      frames.push({ phase: 'differ', activeLine: L('otherwise if the values differ'), diff: { ...flat }, message: `${name} changed from ${JSON.stringify(x)} to ${JSON.stringify(y)}.` })
    }
    return any ? out : null
  }
  const result = walk(obj1, obj2, '') ?? {}
  frames.push({ phase: 'done', activeLine: L('return the nested result'), diff: { ...flat }, message: `${Object.keys(flat).length} changed value${Object.keys(flat).length === 1 ? '' : 's'}.` })
  return { input: { obj1, obj2 }, result, frames }
}
