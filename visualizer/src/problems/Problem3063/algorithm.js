const CODE_TEXT = `create an empty count map and an empty order list
for each input value v in list order
  if v is new then remember it in the order list
  add one to the count of v
create an empty result list
for each distinct value v in the order list
  append a new node holding count(v) to the result
return the result list`

const PYTHON_TEXT = `def linked_list_frequency(values):
    counts = {}
    order = []
    for v in values:
        if v not in counts:
            counts[v] = 0
            order.append(v)
        counts[v] += 1
    result = []
    for v in order:
        result.append(counts[v])
    return result`

export const code = CODE_TEXT.split('\n').map((text, index) => ({ line: index + 1, text }))
export const python = PYTHON_TEXT
const L = s => { const i = code.findIndex(c => c.text.includes(s)); if (i < 0) throw new Error(`No pseudocode line: ${s}`); return i + 1 }
const PY = s => { const i = python.split('\n').findIndex(t => t.includes(s)); if (i < 0) throw new Error(`No python line: ${s}`); return i + 1 }

export function parseInput(text) {
  const values = JSON.parse(text)
  if (!Array.isArray(values) || values.length < 1 || values.length > 16) throw new Error('Use a JSON array of 1 to 16 integers.')
  if (!values.every(v => Number.isInteger(v) && v >= 0 && v <= 9)) throw new Error('Each value is an integer from 0 to 9.')
  return values
}

export function buildTrace(values) {
  const frames = []
  const counts = new Map()
  const order = []
  frames.push({ phase: 'start', activeLine: L('create an empty count map'), pythonLine: PY('counts = {}'), value: null, counts: [], result: [], message: 'Start with no counts and no result nodes.' })
  for (const v of values) {
    if (!counts.has(v)) {
      counts.set(v, 0)
      order.push(v)
    }
    counts.set(v, counts.get(v) + 1)
    frames.push({ phase: 'count', activeLine: L('add one to the count'), pythonLine: PY('counts[v] += 1'), value: v, counts: order.map(x => [x, counts.get(x)]), result: [], message: `Value ${v} now has count ${counts.get(v)}.` })
  }
  const result = []
  for (const v of order) {
    result.push(counts.get(v))
    frames.push({ phase: 'build', activeLine: L('append a new node'), pythonLine: PY('result.append'), value: v, counts: order.map(x => [x, counts.get(x)]), result: [...result], message: `A new node holds ${counts.get(v)}, the count of ${v}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return the result list'), pythonLine: PY('return result'), value: null, counts: order.map(x => [x, counts.get(x)]), result: [...result], message: `The new list holds ${result.length} node${result.length === 1 ? '' : 's'}.` })
  return { input: values, result, frames }
}
