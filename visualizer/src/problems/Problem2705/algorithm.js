// Visualization caps: the JSON value has at most 4 levels of nesting and 30 entries in total.
// Falsy means null, false, 0 or "". Empty objects and arrays are truthy and are kept.
export const code = `function compact(value)
  if value is a list then
    set out to an empty list
    for each element
      if element is truthy then append compact(element) to out
    return out
  if value is an object then
    set out to an empty object
    for each key and item
      if item is truthy then set out[key] to compact(item)
    return out
  return value`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def truthy(v):
    return not (v is None or v is False or v == 0 or v == "")

def compact(value):
    if isinstance(value, list):
        out = []
        for item in value:
            if truthy(item):
                out.append(compact(item))
        return out
    if isinstance(value, dict):
        out = {}
        for key, item in value.items():
            if truthy(item):
                out[key] = compact(item)
        return out
    return value`

const L = (text) => {
  const index = code.findIndex((line) => line.text.includes(text))
  if (index < 0) throw new Error(`Missing pseudocode line: ${text}`)
  return index + 1
}

const PY_LINES = python.split('\n')
// The Nth line (1-based) that contains the text, so the list and object branches can be told apart.
const PY = (text, occurrence = 1) => {
  let seen = 0
  const index = PY_LINES.findIndex((line) => {
    if (!line.includes(text)) return false
    seen += 1
    return seen === occurrence
  })
  if (index < 0) throw new Error(`Missing python line: ${text}`)
  return index + 1
}

export const phases = [
  { id: 'visit', label: 'Visit', description: 'Enter a list or object and prepare its output.' },
  { id: 'keep', label: 'Keep', description: 'The item is truthy, so it stays and is compacted.' },
  { id: 'drop', label: 'Drop', description: 'The item is falsy, so it is removed.' },
  { id: 'done', label: 'Result', description: 'Return the compacted value.' },
]

export function parseInput(text) {
  const input = typeof text === 'string' ? JSON.parse(text) : text
  let count = 0
  const check = (value, depth) => {
    if (depth > 4) throw new Error('Nesting is at most 4 levels in this visualization.')
    if (value && typeof value === 'object') {
      for (const item of Array.isArray(value) ? value : Object.values(value)) {
        count += 1
        check(item, depth + 1)
      }
    }
  }
  check(input, 0)
  if (count > 30) throw new Error('At most 30 entries in this visualization.')
  return input
}

const truthy = (v) => !(v === null || v === false || v === 0 || v === '')
const show = (v) => JSON.stringify(v) ?? 'undefined'

export function buildTrace(input) {
  const frames = []
  const decisions = []
  const walk = (value, path) => {
    if (Array.isArray(value)) {
      frames.push({ phase: 'visit', activeLine: L('if value is a list'), pythonLine: PY('if isinstance(value, list)'), message: `Visit the list at ${path}.`, path, decisions: decisions.slice() })
      const out = []
      value.forEach((item, i) => {
        const itemPath = `${path}[${i}]`
        if (truthy(item)) {
          decisions.push({ path: itemPath, value: item, kept: true })
          frames.push({ phase: 'keep', activeLine: L('if element is truthy'), pythonLine: PY('if truthy(item):', 1), message: `${itemPath} is ${show(item)}, which is truthy, so it stays.`, path: itemPath, decisions: decisions.slice() })
          out.push(walk(item, itemPath))
        } else {
          decisions.push({ path: itemPath, value: item, kept: false })
          frames.push({ phase: 'drop', activeLine: L('if element is truthy'), pythonLine: PY('if truthy(item):', 1), message: `${itemPath} is ${show(item)}, which is falsy, so it is removed.`, path: itemPath, decisions: decisions.slice() })
        }
      })
      return out
    }
    if (value && typeof value === 'object') {
      frames.push({ phase: 'visit', activeLine: L('if value is an object'), pythonLine: PY('if isinstance(value, dict)'), message: `Visit the object at ${path}.`, path, decisions: decisions.slice() })
      const out = {}
      for (const [key, item] of Object.entries(value)) {
        const itemPath = `${path}.${key}`
        if (truthy(item)) {
          decisions.push({ path: itemPath, value: item, kept: true })
          frames.push({ phase: 'keep', activeLine: L('if item is truthy'), pythonLine: PY('if truthy(item):', 2), message: `${itemPath} is ${show(item)}, which is truthy, so it stays.`, path: itemPath, decisions: decisions.slice() })
          out[key] = walk(item, itemPath)
        } else {
          decisions.push({ path: itemPath, value: item, kept: false })
          frames.push({ phase: 'drop', activeLine: L('if item is truthy'), pythonLine: PY('if truthy(item):', 2), message: `${itemPath} is ${show(item)}, which is falsy, so it is removed.`, path: itemPath, decisions: decisions.slice() })
        }
      }
      return out
    }
    return value
  }
  const result = walk(input, 'root')
  frames.push({ phase: 'done', activeLine: L('return value'), pythonLine: PY('return value'), message: `Compacted value: ${show(result)}.`, path: 'root', decisions: decisions.slice(), output: result })
  return { input, result, frames }
}
