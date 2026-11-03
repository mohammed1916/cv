export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || !input.obj1 || !input.obj2 || typeof input.obj1 !== 'object' || typeof input.obj2 !== 'object') {
    throw new Error('Use an object with obj1 and obj2, both plain objects.')
  }
  return { obj1: input.obj1, obj2: input.obj2 }
}

export const code = `compare two values key by key
if both are objects, recurse into every key they share or add
if the values are equal, report nothing for that key
otherwise report the pair [old, new]`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export function buildTrace({ obj1, obj2 }) {
  const frames = []
  const diff = {}
  const isObj = v => v !== null && typeof v === 'object' && !Array.isArray(v)
  const walk = (a, b, path) => {
    const keys = [...new Set([...Object.keys(a), ...Object.keys(b)])]
    for (const key of keys) {
      const name = path ? `${path}.${key}` : key
      const x = a[key]
      const y = b[key]
      if (isObj(x) && isObj(y)) { walk(x, y, name); continue }
      if (JSON.stringify(x) === JSON.stringify(y)) continue
      diff[name] = [x, y]
      frames.push({ phase: 'differ', activeLine: L('otherwise report'), diff: { ...diff }, message: `${name} changed from ${JSON.stringify(x)} to ${JSON.stringify(y)}.` })
    }
  }
  frames.push({ phase: 'start', activeLine: L('compare two values'), diff: {}, message: 'Compare the two objects key by key.' })
  walk(obj1, obj2, '')
  frames.push({ phase: 'done', activeLine: L('if both are objects'), diff: { ...diff }, message: `${Object.keys(diff).length} difference${Object.keys(diff).length === 1 ? '' : 's'} found.` })
  return { input: { obj1, obj2 }, result: diff, frames }
}
