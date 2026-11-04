const CODE = [
  'function compose(functions) {',
  '  return function (x) {',
  '    let value = x',
  '    for (let i = functions.length - 1; i >= 0; i--) {',
  '      value = functions[i](value)',
  '    }',
  '    return value',
  '  }',
  '}',
]

const PY = [
  'def compose(functions):',
  '    def composed(x):',
  '        value = x',
  '        for fn in reversed(functions):',
  '            value = fn(value)',
  '        return value',
  '    return composed',
]

const at = (lines, text) => {
  const index = lines.findIndex(line => line.trim() === text.trim())
  if (index < 0) throw new Error(`Missing trace line: ${text}`)
  return index + 1
}

export const phases = [
  { id: 'start', label: 'Start', description: 'Begin with the input.' },
  { id: 'apply', label: 'Apply', description: 'Apply one function, from the last to the first.' },
  { id: 'done', label: 'Result', description: 'The composed value.' },
]

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
    frames.push({ pythonLine: at(PY, 'value = x'), activeLine: at(CODE, 'let value = x'), phase: 'start', message: 'No functions, so x passes through.', view: view(-1) })
    frames.push({ pythonLine: at(PY, 'return value'), activeLine: at(CODE, 'return value'), phase: 'done', message: `Result ${x}.`, view: view(-1) })
    return { result: x, frames }
  }
  frames.push({ pythonLine: at(PY, 'value = x'), activeLine: at(CODE, 'let value = x'), phase: 'start', message: `Start with x = ${x}.`, view: view(-1) })
  for (let i = fns.length - 1; i >= 0; i--) {
    frames.push({ pythonLine: at(PY, 'for fn in reversed(functions):'), activeLine: at(CODE, 'for (let i = functions.length - 1; i >= 0; i--) {'), phase: 'apply', message: `Apply ${fns[i]} to ${value}.`, view: view(i) })
    value = OPS[fns[i]](value)
    frames.push({ pythonLine: at(PY, 'value = fn(value)'), activeLine: at(CODE, 'value = functions[i](value)'), phase: 'apply', message: `${fns[i]} gives ${value}.`, view: view(i) })
  }
  frames.push({ pythonLine: at(PY, 'return value'), activeLine: at(CODE, 'return value'), phase: 'done', message: `Result ${value}.`, view: view(-1) })
  return { result: value, frames }
}

export const code = CODE.map((text, index) => ({ line: index + 1, text }))
export const python = PY.join('\n') + '\n'
