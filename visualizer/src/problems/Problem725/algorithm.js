export function parseInput(text) {
  const data = JSON.parse(text)
  const { values, k } = data ?? {}
  if (!Array.isArray(values) || values.length > 1000 || values.some(v => !Number.isInteger(v) || Math.abs(v) > 1000)) throw new Error('values must be up to 1,000 integers with |v| ≤ 1,000.')
  if (!Number.isInteger(k) || k < 1 || k > 50) throw new Error('k must be an integer from 1 to 50.')
  return { values, k }
}

const JS_LINES = [
  'function splitListInParts(values, k) {',
  '  const n = values.length',
  '  const base = Math.floor(n / k) // every part gets at least this many nodes',
  '  const extra = n % k // the first extra parts get one more node',
  '  const parts = []',
  '  let position = 0',
  '  for (let part = 0; part < k; part++) {',
  '    const size = base + (part < extra ? 1 : 0)',
  '    parts.push(values.slice(position, position + size)) // cut the next run of nodes as one part',
  '    position += size',
  '  }',
  '  return parts // return parts, empty ones included',
  '}',
]
const PY_LINES = [
  'def split_list_in_parts(values, k):',
  '    n = len(values)',
  '    base, extra = divmod(n, k)',
  '    parts = []',
  '    position = 0',
  '    for part in range(k):',
  '        size = base + (1 if part < extra else 0)',
  '        parts.append(values[position:position + size])',
  '        position += size',
  '    return parts',
]
const L = s => JS_LINES.findIndex(t => t.includes(s)) + 1
const P = s => PY_LINES.findIndex(t => t.includes(s)) + 1

export const code = JS_LINES.map((text, index) => ({ line: index + 1, text }))
export const python = PY_LINES.join('\n')

// n nodes split into k parts: base = n div k, and the first n mod k parts take one extra node.
export function buildTrace({ values, k }) {
  const n = values.length
  const base = Math.floor(n / k), extra = n % k
  const parts = []
  const frames = [{ phase: 'start', part: -1, cuts: [], parts: [], activeLine: L('const base'), pythonLine: P('base, extra'), message: `${n} nodes into ${k} parts: each gets ${base}, and the first ${extra} get one more.` }]
  let position = 0
  for (let part = 0; part < k; part++) {
    const size = base + (part < extra ? 1 : 0)
    const cut = values.slice(position, position + size)
    parts.push(cut)
    frames.push({ phase: 'cut', part, cuts: [position, position + size], parts: parts.map(p => [...p]), activeLine: L('cut the next run'), pythonLine: P('parts.append'),
      message: size === 0 ? `Part ${part}: no nodes are left, so it is empty.` : `Part ${part} takes ${size} node${size === 1 ? '' : 's'}: positions ${position} to ${position + size - 1}.` })
    position += size
  }
  frames.push({ phase: 'done', part: k - 1, cuts: [], parts: parts.map(p => [...p]), result: parts, activeLine: L('return parts'), pythonLine: P('return parts'), message: `${k} parts returned.` })
  return { input: { values, k }, result: parts, frames }
}
