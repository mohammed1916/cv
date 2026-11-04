export const code = [
  'create an empty result list',
  'for each element with its index',
  'if fn of the element and its index is truthy keep it',
  'otherwise skip the element',
  'return the result list',
].map((text, index) => ({ line: index + 1, text }))
const at = phrase => code.findIndex(c => c.text.includes(phrase)) + 1
function step(frames, phase, line, message, view) { frames.push({ phase, activeLine: at(line), message, view }) }

// Predicates the visualization offers in place of an arbitrary callback. The default matches the first version.
export const PREDICATES = {
  aboveIndex: { label: 'value > index', test: (value, index) => value > index },
  positive: { label: 'value > 0', test: value => value > 0 },
  even: { label: 'value is even', test: value => value % 2 === 0 },
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!Array.isArray(input.arr) || input.arr.length > 10 || !input.arr.every(n => Number.isInteger(n) && n >= -5 && n <= 30)) throw new Error('arr has at most 10 whole numbers from -5 to 30.')
  const fn = input.fn ?? 'aboveIndex'
  if (!Object.hasOwn(PREDICATES, fn)) throw new Error('fn is "aboveIndex" (value > index), "positive" (value > 0) or "even".')
  return { arr: input.arr, fn }
}

export function buildTrace({ arr, fn = 'aboveIndex' }) {
  const frames = []
  const kept = []
  const keptIndices = []
  const test = PREDICATES[fn].test
  const view = (focus, verdict = null) => ({ title: 'Elements', rows: arr.map((v, i) => `index ${i}: ${v}`), arr: arr.slice(), focus, verdict, keptIndices: keptIndices.slice(), predicate: PREDICATES[fn].label, summary: `kept [${kept.join(', ')}]` })
  step(frames, 'start', 'create an empty result', 'Result list is empty.', view(-1))
  arr.forEach((value, index) => {
    step(frames, 'check', 'for each element with its index', `Check ${value} at index ${index}.`, view(index))
    if (test(value, index)) {
      kept.push(value)
      keptIndices.push(index)
      step(frames, 'keep', 'if fn of the element', `${PREDICATES[fn].label} holds for ${value} at index ${index}, so it is kept.`, view(index, true))
    } else {
      step(frames, 'skip', 'otherwise skip', `${PREDICATES[fn].label} fails for ${value} at index ${index}.`, view(index, false))
    }
  })
  step(frames, 'done', 'return the result list', `Kept [${kept.join(', ')}].`, view(-1))
  return { result: kept, frames, input: { arr, fn } }
}
