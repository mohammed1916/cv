export const code = [
  'create an empty result list',
  'for each element with its index',
  'if the element is greater than its index keep it',
  'otherwise skip the element',
  'return the result list',
].map((text, index) => ({ line: index + 1, text }))
const at = phrase => code.findIndex(c => c.text.includes(phrase)) + 1
function step(frames, phase, line, message, view) { frames.push({ phase, activeLine: at(line), message, view }) }

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!Array.isArray(input.arr) || input.arr.length > 10 || !input.arr.every(n => Number.isInteger(n) && n >= -5 && n <= 30)) throw new Error('arr has at most 10 whole numbers from -5 to 30.')
  return { arr: input.arr }
}

export function buildTrace({ arr }) {
  const frames = []
  const kept = []
  const view = (focus) => ({ title: 'Elements', rows: arr.map((v, i) => `index ${i}: ${v}`), focus, summary: `kept [${kept.join(', ')}]` })
  step(frames, 'start', 'create an empty result', 'Result list is empty.', view(-1))
  arr.forEach((value, index) => {
    step(frames, 'check', 'for each element', `Check ${value} at index ${index}.`, view(index))
    if (value > index) {
      kept.push(value)
      step(frames, 'keep', 'if the element is greater', `${value} > ${index}, so it is kept.`, view(index))
    } else {
      step(frames, 'skip', 'otherwise skip', `${value} is not greater than ${index}.`, view(index))
    }
  })
  step(frames, 'done', 'return the result list', `Kept [${kept.join(', ')}].`, view(-1))
  return { result: kept, frames }
}
