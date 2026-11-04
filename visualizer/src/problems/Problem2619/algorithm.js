export const code = [
  'given an array arr',
  'if arr has no elements answer -1',
  'otherwise answer the element at index length minus one',
].map((text, index) => ({ line: index + 1, text }))
const at = phrase => code.findIndex(c => c.text.includes(phrase)) + 1
function step(frames, phase, line, message, view) { frames.push({ phase, activeLine: at(line), message, view }) }

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || !Array.isArray(input.items) || input.items.length > 10) throw new Error('Use an object whose items list has at most 10 values.')
  return { items: input.items }
}

export function buildTrace({ items }) {
  const frames = []
  const last = items.length - 1
  const view = (focus, summary) => ({ title: 'Array', rows: items.map(value => JSON.stringify(value)), focus, summary })
  if (items.length === 0) {
    step(frames, 'check', 'if arr has no elements', 'The array is empty.', view(-1, ''))
    step(frames, 'done', 'if arr has no elements', 'Result: -1.', view(-1, '-1'))
    return { result: -1, frames, input: { items } }
  }
  step(frames, 'check', 'if arr has no elements', `Length is ${items.length}, so an element exists.`, view(last, ''))
  step(frames, 'read', 'otherwise answer', `Index ${last} holds ${JSON.stringify(items[last])}.`, view(last, ''))
  step(frames, 'done', 'otherwise answer', 'Result: the last element.', view(last, JSON.stringify(items[last])))
  return { result: items[last], frames, input: { items } }
}
