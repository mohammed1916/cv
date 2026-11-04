export const code = [
  'class Wrapper {',
  '  constructor(items) { this.items = items }',
  '  valueOf() {',
  '    return this.items.reduce((x, y) => x + y, 0)',
  '  }',
  '  toString() {',
  '    return `[${this.items.join(\',\')}]`',
  '  }',
  '}',
  'const total = new Wrapper(a).valueOf() + new Wrapper(b).valueOf()',
].map((text, index) => ({ line: index + 1, text }))

export const python = `class Wrapper:
    def __init__(self, items):
        self.items = items
    def __int__(self):
        return sum(self.items)
    def __str__(self):
        return "[" + ",".join(str(x) for x in self.items) + "]"

total = int(Wrapper(a)) + int(Wrapper(b))`

const at = phrase => code.findIndex(c => c.text.includes(phrase)) + 1
const pyAt = phrase => python.split('\n').findIndex(line => line.includes(phrase)) + 1

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

export function buildTrace({ a, b }) {
  const frames = []
  const sum = list => list.reduce((x, y) => x + y, 0)
  const push = (phase, line, pyLine, shown, message) => frames.push({ phase, activeLine: at(line), pythonLine: pyAt(pyLine), shown, message })
  push('create', 'constructor(items)', 'def __init__', null, `Wrap [${a.join(', ')}] and [${b.join(', ')}].`)
  const sa = sum(a)
  push('number', 'valueOf() {', 'def __int__', `wrapA → ${sa}`, `Converting the first wrapper gives ${sa}.`)
  const sb = sum(b)
  push('number', 'valueOf() {', 'def __int__', `wrapB → ${sb}`, `Converting the second wrapper gives ${sb}.`)
  const total = sa + sb
  push('add', 'const total = new Wrapper(a)', 'total = int(', `wrapA + wrapB = ${total}`, `The addition uses both numbers: ${total}.`)
  push('string', 'toString() {', 'def __str__', `String(wrapA) = "[${a.join(',')}]"`, 'Printing uses the bracketed form.')
  return { input: { a, b }, result: total, frames }
}
