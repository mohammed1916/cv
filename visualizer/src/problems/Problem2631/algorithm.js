const CODE = [
  'function groupBy(items, key) {',
  '  const groups = {}',
  '  for (const item of items) {',
  '    const name = item[key]',
  '    if (!(name in groups)) groups[name] = []',
  '    groups[name].push(item)',
  '  }',
  '  return groups',
  '}',
]

const PY = [
  'def group_by(items, key):',
  '    groups = {}',
  '    for item in items:',
  '        name = item[key]',
  '        if name not in groups:',
  '            groups[name] = []',
  '        groups[name].append(item)',
  '    return groups',
]

const at = (lines, text) => {
  const index = lines.findIndex(line => line.trim() === text.trim())
  if (index < 0) throw new Error(`Missing trace line: ${text}`)
  return index + 1
}

export const phases = [
  { id: 'start', label: 'Start', description: 'Empty result.' },
  { id: 'read', label: 'Read key', description: 'Read one item key value.' },
  { id: 'new', label: 'New group', description: 'Create a bucket when needed.' },
  { id: 'append', label: 'Append', description: 'Add the id to its bucket.' },
  { id: 'done', label: 'Result', description: 'The grouped object.' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || !Array.isArray(input.items) || input.items.length > 8) throw new Error('items has at most 8 objects.')
  if (typeof input.key !== 'string' || !/^[a-z]+$/.test(input.key)) throw new Error('key is the name of a lowercase property.')
  for (const item of input.items) {
    if (!item || typeof item !== 'object' || Array.isArray(item) || !Number.isInteger(item.id) || typeof item[input.key] !== 'string') throw new Error('Each item has an integer id and a string under the key.')
  }
  return { items: input.items, key: input.key }
}

// The groups hold the original items, in their original order. Only the key is read from each item.
export function buildTrace({ items, key }) {
  const frames = []
  const groups = {}
  const snapshot = () => Object.keys(groups).map(name => ({ name, items: groups[name].map(item => item.id) }))
  const view = (focus, extra = {}) => ({ title: 'Groups', items: items.map(item => ({ id: item.id, key: item[key] })), focus, groups: snapshot(), ...extra })
  frames.push({ pythonLine: at(PY, 'groups = {}'), activeLine: at(CODE, 'const groups = {}'), phase: 'start', message: 'Result object is empty.', view: view(-1) })
  items.forEach((item, index) => {
    const name = item[key]
    frames.push({ pythonLine: at(PY, 'name = item[key]'), activeLine: at(CODE, 'const name = item[key]'), phase: 'read', message: `Item ${item.id} has ${key} ${name}.`, view: view(index, { keyName: name }) })
    if (!(name in groups)) {
      groups[name] = []
      frames.push({ pythonLine: at(PY, 'groups[name] = []'), activeLine: at(CODE, 'if (!(name in groups)) groups[name] = []'), phase: 'new', message: `New group ${name}.`, view: view(index, { keyName: name }) })
    }
    groups[name].push(item)
    frames.push({ pythonLine: at(PY, 'groups[name].append(item)'), activeLine: at(CODE, 'groups[name].push(item)'), phase: 'append', message: `Item ${item.id} joins ${name}.`, view: view(index, { keyName: name }) })
  })
  frames.push({ pythonLine: at(PY, 'return groups'), activeLine: at(CODE, 'return groups'), phase: 'done', message: 'Grouping complete.', view: view(-1) })
  return { result: groups, frames }
}

export const code = CODE.map((text, index) => ({ line: index + 1, text }))
export const python = PY.join('\n') + '\n'
