const CODE = [
  'function map(arr, fn) {',
  '  const out = []',
  '  for (let index = 0; index < arr.length; index++) {',
  '    const next = fn(arr[index], index)',
  '    out.push(next)',
  '  }',
  '  return out',
  '}',
]

const PY = [
  'def map_items(arr, fn):',
  '    out = []',
  '    for index, value in enumerate(arr):',
  '        next_value = fn(value, index)',
  '        out.append(next_value)',
  '    return out',
]

const at = (lines, text) => {
  const index = lines.findIndex(line => line.trim() === text.trim())
  if (index < 0) throw new Error(`Missing trace line: ${text}`)
  return index + 1
}

export const phases = [
  { id: 'start', label: 'Start', description: 'Create an empty output list.' },
  { id: 'compute', label: 'Compute', description: 'Map the element with its index.' },
  { id: 'push', label: 'Push', description: 'Append the mapped value.' },
  { id: 'done', label: 'Result', description: 'The mapped list.' },
]

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
  frames.push({ pythonLine: at(PY, 'out = []'), activeLine: at(CODE, 'const out = []'), phase: 'start', message: 'Output list is empty.', view: view(-1) })
  arr.forEach((value, index) => {
    const next = transform.apply(value, index)
    frames.push({ pythonLine: at(PY, 'for index, value in enumerate(arr):'), activeLine: at(CODE, 'for (let index = 0; index < arr.length; index++) {'), phase: 'compute', message: `Element ${value} at index ${index}.`, view: view(index) })
    frames.push({ pythonLine: at(PY, 'next_value = fn(value, index)'), activeLine: at(CODE, 'const next = fn(arr[index], index)'), phase: 'compute', message: `${transform.label} gives ${next} for ${value} at index ${index}.`, view: view(index, { next }) })
    out.push(next)
    frames.push({ pythonLine: at(PY, 'out.append(next_value)'), activeLine: at(CODE, 'out.push(next)'), phase: 'push', message: `Pushed ${next}.`, view: view(index, { next }) })
  })
  frames.push({ pythonLine: at(PY, 'return out'), activeLine: at(CODE, 'return out'), phase: 'done', message: `Output [${out.join(', ')}].`, view: view(-1) })
  return { result: out, frames, input: { arr, fn } }
}

export const code = CODE.map((text, index) => ({ line: index + 1, text }))
export const python = PY.join('\n') + '\n'
