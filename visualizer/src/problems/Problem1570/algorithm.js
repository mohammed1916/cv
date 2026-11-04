export const phases = [
  { id: 'start', label: 'Start', description: 'The dot product sums a[i] times b[i]. An index where either factor is zero adds nothing.' },
  { id: 'store', label: 'Store nonzero of a', description: 'Scan a once and remember only the positions where it is nonzero.' },
  { id: 'scan', label: 'Scan b', description: 'Walk through b and look each index up in the stored table.' },
  { id: 'match', label: 'Add a product', description: 'When both entries are nonzero at the same index, add their product.' },
  { id: 'done', label: 'Complete', description: 'The running total is the dot product.' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object such as {"a": [1, 0, 2], "b": [0, 3, 4]}.')
  const { a, b } = input
  const ok = v => Array.isArray(v) && v.length >= 1 && v.length <= 12 && v.every(x => Number.isInteger(x) && Math.abs(x) <= 5)
  if (!ok(a) || !ok(b)) throw new Error('a and b are lists of 1 to 12 integers from -5 to 5.')
  if (a.length !== b.length) throw new Error('a and b must have the same length.')
  return { a, b }
}

export const code = [
  "function sparseDot(a, b) {",
  "  const store = new Map()",
  "  for (let i = 0; i < a.length; i++) {",
  "    const v = a[i]",
  "    if (v !== 0) store.set(i, v) }",
  "  let total = 0",
  "  for (let i = 0; i < b.length; i++) {",
  "    const w = b[i]; if (w !== 0 && store.has(i)) total += store.get(i) * w }",
  "  return total }",
].map((text, index) => ({ line: index + 1, text }))

export const python = `def sparse_dot(a, b):
    store = {}
    for i, v in enumerate(a):
        if v != 0:
            store[i] = v
    total = 0
    for i, w in enumerate(b):
        if w != 0 and i in store:
            total += store[i] * w
    return total`

const L = s => code.findIndex(c => c.text.includes(s)) + 1
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1

export function buildTrace({ a, b }) {
  const store = new Map()
  let total = 0
  const snap = (extra = {}) => ({ store: [...store].map(([index, value]) => ({ index, value })), total, ...extra })
  const frames = [{ phase: 'start', activeLine: L('const store = new Map()'), pythonLine: P('store = {}'), snapshot: snap(), message: `Both vectors have length ${a.length}. Only indices where both entries are nonzero can add to the total.` }]
  a.forEach((v, i) => {
    frames.push({ phase: 'store', activeLine: L('for (let i = 0; i < a.length; i++)'), pythonLine: P('for i, v'), snapshot: snap({ index: i }), message: `Look at a[${i}] = ${v}.` })
    if (v !== 0) store.set(i, v)
    frames.push({ phase: 'store', activeLine: L('if (v !== 0)'), pythonLine: P('if v != 0'), snapshot: snap({ index: i }), message: v !== 0 ? `a[${i}] = ${v} is nonzero, so it is stored under index ${i}.` : `a[${i}] = 0, so nothing is stored.` })
  })
  b.forEach((w, i) => {
    frames.push({ phase: 'scan', activeLine: L('for (let i = 0; i < b.length; i++)'), pythonLine: P('for i, w'), snapshot: snap({ index: i, bValue: w }), message: `Look at b[${i}] = ${w}.` })
    if (w !== 0 && store.has(i)) {
      const term = store.get(i) * w
      total += term
      frames.push({ phase: 'match', activeLine: L('total += store.get(i)'), pythonLine: P('total += store'), snapshot: snap({ index: i, bValue: w }), message: `Both are nonzero at index ${i}: ${store.get(i)} times ${w} adds ${term}. Total is ${total}.` })
    } else {
      frames.push({ phase: 'scan', activeLine: L('if (w !== 0'), pythonLine: P('if w != 0'), snapshot: snap({ index: i, bValue: w }), message: w === 0 ? `b[${i}] is zero, so this index adds nothing.` : `a[${i}] is zero, so there is nothing to multiply.` })
    }
  })
  frames.push({ phase: 'done', activeLine: L('return total'), pythonLine: P('return total'), snapshot: snap(), message: `The dot product is ${total}.` })
  return { input: { a, b }, result: total, frames }
}
