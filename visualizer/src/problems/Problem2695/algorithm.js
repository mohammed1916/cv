export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || !Array.isArray(input.a) || !Array.isArray(input.b)) {
    throw new Error('Use an object with two number lists, a and b.')
  }
  for (const list of [input.a, input.b]) {
    if (list.length > 8 || !list.every(n => Number.isInteger(n) && Math.abs(n) <= 1000)) throw new Error('Each list has at most 8 integers between -1000 and 1000.')
  }
  return { a: input.a, b: input.b }
}

export const code = `create a wrapper that stores its array
when converted to a number, return the sum of its values
when converted to a string, return the values in brackets
when two wrappers are added, convert both and add the results`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export function buildTrace({ a, b }) {
  const frames = []
  const sum = list => list.reduce((x, y) => x + y, 0)
  frames.push({ phase: 'create', activeLine: L('create a wrapper'), shown: null, message: `Wrap [${a.join(', ')}] and [${b.join(', ')}].` })
  const sa = sum(a)
  frames.push({ phase: 'number', activeLine: L('when converted to a number'), shown: `wrapA → ${sa}`, message: `Converting the first wrapper gives ${sa}.` })
  const sb = sum(b)
  frames.push({ phase: 'number', activeLine: L('when two wrappers are added'), shown: `wrapB → ${sb}`, message: `Converting the second wrapper gives ${sb}.` })
  const total = sa + sb
  frames.push({ phase: 'add', activeLine: L('when two wrappers are added'), shown: `wrapA + wrapB = ${total}`, message: `The addition uses both numbers: ${total}.` })
  frames.push({ phase: 'string', activeLine: L('when converted to a string'), shown: `String(wrapA) = "[${a.join(',')}]"`, message: 'Printing uses the bracketed form.' })
  return { input: { a, b }, result: total, frames }
}
