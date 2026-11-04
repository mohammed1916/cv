const CODE = [
  'function* fibonacci(count) {',
  '  let a = 0',
  '  let b = 1',
  '  for (let i = 0; i < count; i++) {',
  '    yield a',
  '    ;[a, b] = [b, a + b]',
  '  }',
  '}',
]

const PY = [
  'def fibonacci(count):',
  '    a, b = 0, 1',
  '    for _ in range(count):',
  '        yield a',
  '        a, b = b, a + b',
]

const at = (lines, text) => {
  const index = lines.findIndex(line => line.trim() === text.trim())
  if (index < 0) throw new Error(`Missing trace line: ${text}`)
  return index + 1
}

export const phases = [
  { id: 'init', label: 'Start', description: 'Set the first two state values.' },
  { id: 'yield', label: 'Yield', description: 'Hand the current value to the caller.' },
  { id: 'advance', label: 'Advance', description: 'Shift the pair forward.' },
  { id: 'done', label: 'Done', description: 'No more values are produced.' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || !Number.isInteger(input.count) || input.count < 0 || input.count > 15) {
    throw new Error('Use an object with count, an integer from 0 to 15.')
  }
  return { count: input.count }
}

export function buildTrace({ count }) {
  const frames = []
  let a = 0
  let b = 1
  const yielded = []
  frames.push({ pythonLine: at(PY, 'a, b = 0, 1'), activeLine: at(CODE, 'let a = 0'), phase: 'init', a, b, yielded: [], message: 'Start with a = 0 and b = 1.' })
  for (let i = 0; i < count; i++) {
    yielded.push(a)
    frames.push({ pythonLine: at(PY, 'yield a'), activeLine: at(CODE, 'yield a'), phase: 'yield', a, b, yielded: [...yielded], message: `Yield ${a}.` })
    ;[a, b] = [b, a + b]
    frames.push({ pythonLine: at(PY, 'a, b = b, a + b'), activeLine: at(CODE, ';[a, b] = [b, a + b]'), phase: 'advance', a, b, yielded: [...yielded], message: `Now a = ${a} and b = ${b}.` })
  }
  frames.push({ pythonLine: at(PY, 'for _ in range(count):'), activeLine: at(CODE, '}'), phase: 'done', a, b, yielded: [...yielded], message: 'The generator is exhausted.' })
  return { input: { count }, result: yielded, frames }
}

export const code = CODE.map((text, index) => ({ line: index + 1, text }))
export const python = PY.join('\n') + '\n'
