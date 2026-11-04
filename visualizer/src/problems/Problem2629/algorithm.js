export const code = [
  'if there are no functions return x unchanged',
  'start with the input value x',
  'apply the last function first',
  'then apply each earlier function in turn',
  'return the value',
].map((text, index) => ({ line: index + 1, text }))
const at = phrase => code.findIndex(c => c.text.includes(phrase)) + 1
function step(frames, phase, line, message, view) { frames.push({ phase, activeLine: at(line), message, view }) }

const OPS = { inc: v => v + 1, dbl: v => v * 2, sq: v => v * v }

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!Array.isArray(input.fns) || input.fns.length > 5 || !input.fns.every(name => name in OPS)) throw new Error('fns lists up to 5 of inc, dbl or sq.')
  if (!Number.isInteger(input.x) || Math.abs(input.x) > 99) throw new Error('x is a whole number from -99 to 99.')
  return { fns: input.fns, x: input.x }
}

export function buildTrace({ fns, x }) {
  const frames = []
  let value = x
  const view = (focus) => ({ title: 'Chain (applied right to left)', rows: fns.map(name => name), fns: fns.slice(), focus, value, summary: `value ${value}` })
  if (fns.length === 0) {
    step(frames, 'start', 'if there are no functions', 'No functions, so x passes through.', view(-1))
    step(frames, 'done', 'return the value', `Result ${x}.`, view(-1))
    return { result: x, frames }
  }
  step(frames, 'start', 'start with the input value', `Start with x = ${x}.`, view(-1))
  for (let i = fns.length - 1; i >= 0; i--) {
    step(frames, 'apply', i === fns.length - 1 ? 'apply the last function first' : 'then apply each earlier', `Apply ${fns[i]} to ${value}.`, view(i))
    value = OPS[fns[i]](value)
    step(frames, 'apply', 'then apply each earlier', `${fns[i]} gives ${value}.`, view(i))
  }
  step(frames, 'done', 'return the value', `Result ${value}.`, view(-1))
  return { result: value, frames }
}
