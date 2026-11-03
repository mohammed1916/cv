export const code = [
  'create an empty result object',
  'for each item read its key value',
  'if the group is new create an empty list for it',
  'append the item id to its group list',
  'return the result object',
].map((text, index) => ({ line: index + 1, text }))
const at = phrase => code.findIndex(c => c.text.includes(phrase)) + 1
function step(frames, phase, line, message, view) { frames.push({ phase, activeLine: at(line), message, view }) }

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || !Array.isArray(input.items) || input.items.length > 8) throw new Error('items has at most 8 objects.')
  if (typeof input.key !== 'string' || !/^[a-z]+$/.test(input.key)) throw new Error('key is the name of a lowercase property.')
  for (const item of input.items) {
    if (!item || typeof item !== 'object' || !Number.isInteger(item.id) || typeof item[input.key] !== 'string') throw new Error('Each item has an integer id and a string under the key.')
  }
  return { items: input.items, key: input.key }
}

export function buildTrace({ items, key }) {
  const frames = []
  const groups = {}
  const rows = () => Object.keys(groups).map(name => `${name}: [${groups[name].join(', ')}]`)
  step(frames, 'start', 'create an empty result', 'Result object is empty.', { title: 'Groups', rows: [], focus: -1, summary: '' })
  items.forEach((item, index) => {
    const name = item[key]
    step(frames, 'read', 'for each item read', `Item ${item.id} has ${key} ${name}.`, { title: 'Groups', rows: rows(), focus: index, summary: '' })
    if (!(name in groups)) {
      groups[name] = []
      step(frames, 'new', 'if the group is new', `New group ${name}.`, { title: 'Groups', rows: rows(), focus: index, summary: '' })
    }
    groups[name].push(item.id)
    step(frames, 'append', 'append the item id', `Id ${item.id} joins ${name}.`, { title: 'Groups', rows: rows(), focus: index, summary: '' })
  })
  step(frames, 'done', 'return the result object', 'Grouping complete.', { title: 'Groups', rows: rows(), focus: -1, summary: JSON.stringify(groups) })
  return { result: groups, frames }
}
