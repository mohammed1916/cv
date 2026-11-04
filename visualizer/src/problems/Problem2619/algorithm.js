const CODE = [
  'Array.prototype.last = function () {',
  '  if (this.length === 0) return -1',
  '  return this[this.length - 1]',
  '}',
]

const PY = [
  'def last(arr):',
  '    if len(arr) == 0:',
  '        return -1',
  '    return arr[len(arr) - 1]',
]

const at = (lines, text) => {
  const index = lines.findIndex(line => line.trim() === text.trim())
  if (index < 0) throw new Error(`Missing trace line: ${text}`)
  return index + 1
}

export const phases = [
  { id: 'check', label: 'Check length', description: 'Is there any element?' },
  { id: 'read', label: 'Read last', description: 'Read the element at length minus one.' },
  { id: 'done', label: 'Result', description: 'Report the answer.' },
]

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
    frames.push({ pythonLine: at(PY, 'if len(arr) == 0:'), activeLine: at(CODE, 'if (this.length === 0) return -1'), phase: 'check', message: 'The array is empty.', view: view(-1, '') })
    frames.push({ pythonLine: at(PY, 'return -1'), activeLine: at(CODE, 'if (this.length === 0) return -1'), phase: 'done', message: 'Result: -1.', view: view(-1, '-1') })
    return { result: -1, frames, input: { items } }
  }
  frames.push({ pythonLine: at(PY, 'if len(arr) == 0:'), activeLine: at(CODE, 'if (this.length === 0) return -1'), phase: 'check', message: `Length is ${items.length}, so an element exists.`, view: view(last, '') })
  frames.push({ pythonLine: at(PY, 'return arr[len(arr) - 1]'), activeLine: at(CODE, 'return this[this.length - 1]'), phase: 'read', message: `Index ${last} holds ${JSON.stringify(items[last])}.`, view: view(last, '') })
  frames.push({ pythonLine: at(PY, 'return arr[len(arr) - 1]'), activeLine: at(CODE, 'return this[this.length - 1]'), phase: 'done', message: 'Result: the last element.', view: view(last, JSON.stringify(items[last])) })
  return { result: items[last], frames, input: { items } }
}

export const code = CODE.map((text, index) => ({ line: index + 1, text }))
export const python = PY.join('\n') + '\n'
