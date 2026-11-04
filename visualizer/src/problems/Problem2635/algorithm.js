export const code = [
  'create an empty output list',
  'for each element with its index',
  'compute the mapped value from the element and its index',
  'push the result onto the output list',
  'return the output list',
].map((text, index) => ({ line: index + 1, text }))
const at = phrase => code.findIndex(c => c.text.includes(phrase)) + 1
function step(frames, phase, line, message, view) { frames.push({ phase, activeLine: at(line), message, view }) }

// Transforms the visualization offers in place of an arbitrary callback. The default matches the first version.
export const TRANSFORMS = {
  twicePlusIndex: { label: '2 × value + index', apply: (value, index) => 2 * value + index },
  square: { label: 'value × value', apply: value => value * value },
  plusIndex: { label: 'value + index', apply: (value, index) => value + index },
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!Array.isArray(input.arr) || input.arr.length > 8 || !input.arr.every(n => Number.isInteger(n) && Math.abs(n) <= 99)) throw new Error('arr has at most 8 whole numbers from -99 to 99.')
  const fn = input.fn ?? 'twicePlusIndex'
  if (!Object.hasOwn(TRANSFORMS, fn)) throw new Error('fn is "twicePlusIndex", "square" or "plusIndex".')
  return { arr: input.arr, fn }
}

export function buildTrace({ arr, fn = 'twicePlusIndex' }) {
  const frames = []
  const out = []
  const transform = TRANSFORMS[fn]
  const view = (focus, extra = {}) => ({ title: 'Elements', rows: arr.map((v, i) => `index ${i}: ${v}`), arr: arr.slice(), focus, out: out.slice(), label: transform.label, summary: `output [${out.join(', ')}]`, ...extra })
  step(frames, 'start', 'create an empty output', 'Output list is empty.', view(-1))
  arr.forEach((value, index) => {
    const next = transform.apply(value, index)
    step(frames, 'compute', 'for each element with its index', `Element ${value} at index ${index}.`, view(index))
    step(frames, 'compute', 'compute the mapped value', `${transform.label} gives ${next} for ${value} at index ${index}.`, view(index, { next }))
    out.push(next)
    step(frames, 'push', 'push the result', `Pushed ${next}.`, view(index, { next }))
  })
  step(frames, 'done', 'return the output list', `Output [${out.join(', ')}].`, view(-1))
  return { result: out, frames, input: { arr, fn } }
}
