export const LIMIT = 100

export const code = `names of heavy animals, as one chained expression
  build a true or false mask from weight greater than 100
  keep only the rows where the mask is true
  sort those rows by weight, heaviest first
  keep only the name column
  return the resulting table`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = key => {
  const index = code.findIndex(line => line.text.includes(key))
  if (index < 0) throw new Error(`Pseudocode line missing: ${key}`)
  return index + 1
}

export const python = `import pandas as pd

def find_heavy_animals(animals: pd.DataFrame) -> pd.DataFrame:
    return (
        animals[animals["weight"] > 100]
        .sort_values("weight", ascending=False)
        [["name"]]
    )
`
const PY_LINES = python.split('\n')
const PY = key => {
  const index = PY_LINES.findIndex(line => line.includes(key))
  if (index < 0) throw new Error(`Python line missing: ${key}`)
  return index + 1
}

export const stages = [
  { id: 'source', label: 'animals' },
  { id: 'mask', label: '["weight"] > 100' },
  { id: 'filter', label: 'animals[mask]' },
  { id: 'sort', label: '.sort_values("weight", ascending=False)' },
  { id: 'project', label: '[["name"]]' },
]

export const phases = [
  { id: 'source', label: 'Source', description: 'The chain starts from the whole DataFrame.' },
  { id: 'mask', label: 'Mask', description: 'Each weight is compared with 100.' },
  { id: 'filter', label: 'Filter', description: 'Rows with a false mask leave the chain.' },
  { id: 'sort', label: 'Sort', description: 'The heaviest remaining row takes the next position.' },
  { id: 'project', label: 'Project', description: 'Only the name column continues.' },
  { id: 'done', label: 'Result', description: 'The chain has produced its table.' },
]

export const inputLabel = 'Object with an animals table (name, species, age, weight)'
export const complexity = 'O(n log n) because of the sort; the filter and the projection are linear. The visualization caps the table at 12 rows.'

const animal = (name, species, age, weight) => ({ name, species, age, weight })
export const examples = [
  { label: 'Mixed weights', input: JSON.stringify({ animals: [animal('Juniper', 'Moose', 7, 410), animal('Pip', 'Hamster', 2, 1), animal('Bruno', 'Walrus', 12, 230), animal('Odo', 'Okapi', 9, 100), animal('Sunny', 'Camel', 15, 520), animal('Fern', 'Deer', 4, 70)] }) },
  { label: 'Nothing heavy', input: JSON.stringify({ animals: [animal('Mochi', 'Otter', 3, 11), animal('Tao', 'Heron', 5, 2), animal('Ruth', 'Tapir', 6, 100)] }) },
  { label: 'Just over the line', input: JSON.stringify({ animals: [animal('Ivo', 'Ibex', 8, 101), animal('Lark', 'Elk', 10, 300)] }) },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with an animals table.')
  const rows = input.animals
  if (!Array.isArray(rows) || rows.length > 12) throw new Error('animals is a list of at most 12 rows here.')
  const animals = rows.map(entry => {
    if (!entry || typeof entry !== 'object') throw new Error('Each row needs name, species, age and weight.')
    const { name, species, age, weight } = entry
    if (typeof name !== 'string' || !name || typeof species !== 'string') throw new Error('name and species must be text.')
    if (!Number.isInteger(age) || !Number.isInteger(weight)) throw new Error('age and weight must be integers.')
    return { name, species, age, weight }
  })
  return { animals }
}

export function buildTrace({ animals }) {
  const frames = []
  const source = animals.map((entry, row) => ({ ...entry, row }))
  const mask = new Array(animals.length).fill(null)
  const push = (phase, stage, lineKey, pyKey, message, rows, extra = {}) => frames.push({
    phase, stage, activeLine: L(lineKey), pythonLine: PY(pyKey), message,
    rows: rows.map(entry => ({ ...entry })), mask: [...mask], current: -1, placed: 0, columns: ['name', 'species', 'age', 'weight'], ...extra,
  })

  push('source', 'source', 'names of heavy', 'return (', `The chain starts with all ${animals.length} rows of animals.`, source)

  source.forEach((entry, position) => {
    mask[entry.row] = entry.weight > LIMIT
    push('mask', 'mask', 'build a true', 'animals[animals', `${entry.name}: ${entry.weight} > ${LIMIT} is ${mask[entry.row] ? 'True' : 'False'}${entry.weight === LIMIT ? ' because exactly 100 is not strictly more' : ''}.`, source, { current: position })
  })

  const kept = source.filter(entry => mask[entry.row])
  push('filter', 'filter', 'keep only the rows', 'animals[animals', `${source.length - kept.length} row${source.length - kept.length === 1 ? '' : 's'} drop out and ${kept.length} continue${kept.length === 1 ? 's' : ''}, keeping their original index labels.`, kept)

  const order = [...kept]
  order.forEach((_, position) => {
    let heaviest = position
    for (let k = position + 1; k < order.length; k++) if (order[k].weight > order[heaviest].weight) heaviest = k
    const [picked] = order.splice(heaviest, 1)
    order.splice(position, 0, picked)
    push('sort', 'sort', 'sort those rows', 'sort_values', `${picked.name} (${picked.weight}) is the heaviest not yet placed, so it goes in position ${position}.`, order, { current: position, placed: position + 1 })
  })
  if (!order.length) push('sort', 'sort', 'sort those rows', 'sort_values', 'Nothing is left to sort; the empty table passes straight through.', order)

  const result = order.map(entry => entry.name)
  push('project', 'project', 'keep only the name', '[["name"]]', 'Every column except name is dropped; the sorted order stays.', order, { columns: ['name'], placed: order.length })
  push('done', 'project', 'return the resulting', 'return (', result.length ? `Return ${result.length} name${result.length === 1 ? '' : 's'}: ${result.join(', ')}.` : 'Return an empty table with just the name column.', order, { columns: ['name'], placed: order.length })
  return { input: { animals }, result, frames }
}
