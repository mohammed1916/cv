export const code = [
  'given an object and a class C',
  'if the value is a primitive otherwise answer false',
  'walk up the prototype chain one class at a time',
  'if a prototype is C.prototype then answer true',
  'if the chain ends without a match otherwise answer false',
].map((text, index) => ({ line: index + 1, text }))
const at = phrase => code.findIndex(c => c.text.includes(phrase)) + 1
function step(frames, phase, line, message, view) { frames.push({ phase, activeLine: at(line), message, view }) }

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with chain, target and primitive.')
  const { chain, target, primitive = false } = input
  if (!Array.isArray(chain) || chain.length > 8 || !chain.every(name => typeof name === 'string')) throw new Error('chain is a list of at most 8 class names, nearest first.')
  if (typeof target !== 'string') throw new Error('target is the class name to test.')
  if (typeof primitive !== 'boolean') throw new Error('primitive is true or false.')
  return { chain, target, primitive }
}

export function buildTrace({ chain, target, primitive }) {
  const frames = []
  const view = (title, focus, summary) => ({ title, rows: primitive ? ['primitive value'] : chain.slice(), chain: chain.slice(), target, primitive, focus, summary })
  if (primitive) {
    step(frames, 'check', 'if the value is a primitive', 'A primitive is never an instance.', view('Value', -1, 'false'))
    step(frames, 'done', 'otherwise answer false', 'Result: false.', view('Result', -1, 'false'))
    return { result: false, frames }
  }
  let result = false
  for (let i = 0; i < chain.length && !result; i++) {
    step(frames, 'walk', 'walk up the prototype', `Compare ${chain[i]} with ${target}.`, view('Prototype chain', i, ''))
    if (chain[i] === target) {
      result = true
      step(frames, 'found', 'if a prototype is', `${chain[i]} matches ${target}.`, view('Prototype chain', i, 'true'))
    }
  }
  if (!result) step(frames, 'done', 'if the chain ends', 'The chain ends without a match.', view('Prototype chain', -1, 'false'))
  else step(frames, 'done', 'if a prototype is', 'Result: true.', view('Prototype chain', -1, 'true'))
  return { result, frames }
}
