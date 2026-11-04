const CODE = [
  'function filter(arr, fn) {',
  '  const kept = []',
  '  for (let index = 0; index < arr.length; index++) {',
  '    const value = arr[index]',
  '    if (fn(value, index)) kept.push(value)',
  '  }',
  '  return kept',
  '}',
]

const PY = [
  'def filter_items(arr, fn):',
  '    kept = []',
  '    for index, value in enumerate(arr):',
  '        if fn(value, index):',
  '            kept.append(value)',
  '    return kept',
]

const at = (lines, text) => {
  const index = lines.findIndex(line => line.trim() === text.trim())
  if (index < 0) throw new Error(`Missing trace line: ${text}`)
  return index + 1
}

export const phases = [
  { id: 'start', label: 'Start', description: 'Create an empty result list.' },
  { id: 'check', label: 'Check', description: 'Test the element with its index.' },
  { id: 'keep', label: 'Keep', description: 'The test holds, so the element is kept.' },
  { id: 'skip', label: 'Skip', description: 'The test fails, so the element is dropped.' },
  { id: 'done', label: 'Result', description: 'The kept elements in order.' },
]

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
  frames.push({ pythonLine: at(PY, 'kept = []'), activeLine: at(CODE, 'const kept = []'), phase: 'start', message: 'Result list is empty.', view: view(-1) })
  arr.forEach((value, index) => {
    frames.push({ pythonLine: at(PY, 'for index, value in enumerate(arr):'), activeLine: at(CODE, 'for (let index = 0; index < arr.length; index++) {'), phase: 'check', message: `Check ${value} at index ${index}.`, view: view(index) })
    if (test(value, index)) {
      kept.push(value)
      keptIndices.push(index)
      frames.push({ pythonLine: at(PY, 'kept.append(value)'), activeLine: at(CODE, 'if (fn(value, index)) kept.push(value)'), phase: 'keep', message: `${PREDICATES[fn].label} holds for ${value} at index ${index}, so it is kept.`, view: view(index, true) })
    } else {
      frames.push({ pythonLine: at(PY, 'if fn(value, index):'), activeLine: at(CODE, 'if (fn(value, index)) kept.push(value)'), phase: 'skip', message: `${PREDICATES[fn].label} fails for ${value} at index ${index}.`, view: view(index, false) })
    }
  })
  frames.push({ pythonLine: at(PY, 'return kept'), activeLine: at(CODE, 'return kept'), phase: 'done', message: `Kept [${kept.join(', ')}].`, view: view(-1) })
  return { result: kept, frames, input: { arr, fn } }
}

export const code = CODE.map((text, index) => ({ line: index + 1, text }))
export const python = PY.join('\n') + '\n'
