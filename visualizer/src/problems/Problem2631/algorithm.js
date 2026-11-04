export const code = [
  'create an empty result object',
  'for each item compute its key from the key property',
  'if the group is new create an empty list for it',
  'append the whole item to its group list',
  'return the result object',
].map((text, index) => ({ line: index + 1, text }))
const at = phrase => code.findIndex(c => c.text.includes(phrase)) + 1
function step(frames, phase, line, message, view) { frames.push({ phase, activeLine: at(line), message, view }) }

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
  step(frames, 'start', 'create an empty result', 'Result object is empty.', view(-1))
  items.forEach((item, index) => {
    const name = item[key]
    step(frames, 'read', 'for each item compute its key', `Item ${item.id} has ${key} ${name}.`, view(index, { keyName: name }))
    if (!(name in groups)) {
      groups[name] = []
      step(frames, 'new', 'if the group is new', `New group ${name}.`, view(index, { keyName: name }))
    }
    groups[name].push(item)
    step(frames, 'append', 'append the whole item', `Item ${item.id} joins ${name}.`, view(index, { keyName: name }))
  })
  step(frames, 'done', 'return the result object', 'Grouping complete.', view(-1))
  return { result: groups, frames }
}
