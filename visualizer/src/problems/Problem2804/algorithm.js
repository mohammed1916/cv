const JS = [
  'function forEachValue(array, callback) {',
  '  for (let i = 0; i < array.length; i++) {',
  '    callback(array[i], i, array)',
  '  }',
  '}',
]
export const code = JS.map((text, index) => ({ line: index + 1, text }))
const L = s => JS.findIndex(t => t.includes(s)) + 1

const PY = `def for_each(array, callback):
    for i in range(len(array)):
        callback(array[i], i, array)`
export const python = PY
const P = s => PY.split('\n').findIndex(t => t.includes(s)) + 1

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || !Array.isArray(input.arr)) throw new Error('Use { "arr": [...] }.')
  return { arr: [...input.arr] }
}

export function buildTrace({ arr }) {
  const out = []
  const frames = [{ phase: 'start', activeLine: L('for (let i'), pythonLine: P('for i in range'), message: `Visit ${arr.length} element(s) in order, starting at index 0.`, at: -1, out: [] }]
  arr.forEach((value, i) => {
    out.push(`${i}:${JSON.stringify(value)}`)
    frames.push({ phase: 'step', activeLine: L('callback(array[i]'), pythonLine: P('callback(array[i]'), message: `callback(${JSON.stringify(value)}, ${i}, array) runs for index ${i}.`, at: i, out: [...out] })
  })
  frames.push({ phase: 'done', activeLine: L('for (let i'), pythonLine: P('callback(array[i]'), message: 'Every index has been visited. forEach returns nothing.', at: -1, out: [...out] })
  return { input: { arr }, result: undefined, frames }
}
