export const code = [
  'create an empty output list',
  'for each element with its index',
  'compute twice the element plus the index',
  'push the result onto the output list',
  'return the output list',
].map((text, index) => ({ line: index + 1, text }))
const at = phrase => code.findIndex(c => c.text.includes(phrase)) + 1
function step(frames, phase, line, message, view) { frames.push({ phase, activeLine: at(line), message, view }) }

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!Array.isArray(input.arr) || input.arr.length > 8 || !input.arr.every(n => Number.isInteger(n) && Math.abs(n) <= 99)) throw new Error('arr has at most 8 whole numbers from -99 to 99.')
  return { arr: input.arr }
}

export function buildTrace({ arr }) {
  const frames = []
  const out = []
  const view = (focus) => ({ title: 'Elements', rows: arr.map((v, i) => `index ${i}: ${v}`), focus, summary: `output [${out.join(', ')}]` })
  step(frames, 'start', 'create an empty output', 'Output list is empty.', view(-1))
  arr.forEach((value, index) => {
    const next = 2 * value + index
    step(frames, 'compute', 'for each element with its index', `Element ${value} at index ${index}.`, view(index))
    step(frames, 'compute', 'compute twice the element', `2 × ${value} + ${index} = ${next}.`, view(index))
    out.push(next)
    step(frames, 'push', 'push the result', `Pushed ${next}.`, view(index))
  })
  step(frames, 'done', 'return the output list', `Output [${out.join(', ')}].`, view(-1))
  return { result: out, frames }
}
