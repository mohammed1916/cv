export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || !Number.isInteger(input.init) || Math.abs(input.init) > 100) {
    throw new Error('Use an object with init, an integer between -100 and 100.')
  }
  const ops = input.ops
  if (!Array.isArray(ops) || ops.length > 20 || !ops.every(op => ['increment', 'decrement', 'reset'].includes(op))) {
    throw new Error('ops is a list of at most 20 items, each increment, decrement or reset.')
  }
  return { init: input.init, ops }
}

export const code = `create a counter that remembers init
define increment, decrement and reset over one shared value
for each call, update the value and return it
reset puts the value back to init`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export function buildTrace({ init, ops }) {
  const frames = []
  let value = init
  const results = []
  frames.push({ phase: 'create', activeLine: L('create a counter'), value, results: [], op: null, message: `The counter starts at ${init}.` })
  for (const op of ops) {
    if (op === 'increment') value += 1
    else if (op === 'decrement') value -= 1
    else value = init
    results.push(value)
    frames.push({ phase: op === 'reset' ? 'reset' : 'update', activeLine: L(op === 'reset' ? 'reset puts' : 'for each call'), value, results: [...results], op,
      message: `${op} returns ${value}.` })
  }
  frames.push({ phase: 'done', activeLine: L('for each call'), value, results: [...results], op: null, message: 'All calls are processed.' })
  return { input: { init, ops }, result: results, frames }
}
