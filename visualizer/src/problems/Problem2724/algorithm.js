const lines = text => text.split('\n').map((t, i) => ({ line: i + 1, text: t }))
const PY_OF = {1: 2, 2: 3, 3: 6, 4: 8, 5: 9}
const frame = (phase, line, message, state = {}) => ({ phase, pythonLine: PY_OF[line] ?? line, activeLine: line, message, state })
export const PHASES = [
  { id: 'setup', label: 'Setup', description: 'Read the input and prepare the model.' },
  { id: 'step', label: 'Step', description: 'Process one event or item.' },
  { id: 'done', label: 'Result', description: 'The final value.' },
]
export const INPUT_LABEL = 'Object with key (a field name) and items (objects whose key value is a number, up to 8)'
export const URL = 'https://leetcode.com/problems/sort-by/'
export const COMPLEXITY = 'O(n^2) comparisons with the insertion method shown here. Equal keys keep their order.'
export const EXAMPLES = [
  { label: 'Example', input: '{"key":"v","items":[{"id":"a","v":3},{"id":"b","v":1},{"id":"c","v":2}]}' },
  { label: 'Ties', input: '{"key":"v","items":[{"id":"a","v":2},{"id":"b","v":1},{"id":"c","v":2}]}' },
  { label: 'Single item', input: '{"key":"v","items":[{"id":"a","v":4}]}' },
  { label: 'All equal values', input: '{"key":"v","items":[{"id":"a","v":5},{"id":"b","v":5},{"id":"c","v":5}]}' },
  { label: 'Negative and zero', input: '{"key":"v","items":[{"id":"a","v":-1},{"id":"b","v":0},{"id":"c","v":-9}]}' },
  { label: 'Long run: 8 items', input: '{"key":"v","items":[{"id":"a","v":73},{"id":"b","v":70},{"id":"c","v":15},{"id":"d","v":12},{"id":"e","v":57},{"id":"f","v":54},{"id":"g","v":99},{"id":"h","v":96}]}' },
]
export const WHY = [
  'The sort reads one number per object, given by the chosen key, and orders objects by that number.',
  'Insertion keeps the sorted prefix in place and moves each new item left past larger keys.',
  'Only strictly larger keys move past an item, so equal keys keep their original order.',
]
export function parseInput(text) {
  const input = JSON.parse(text)
  if (typeof input?.key !== 'string' || !Array.isArray(input.items) || input.items.length < 1 || input.items.length > 8) throw new Error('Use a key name and 1 to 8 items.')
  if (!input.items.every(item => item && typeof item[input.key] === 'number')) throw new Error('Every item needs a numeric value under the key.')
  return input
}
export function buildTrace({ key, items }) {
  const list = items.map(item => ({ ...item }))
  const frames = [frame('setup', 1, 'Treat the first item as a sorted prefix of one.', { list: list.map(i => i.id) })]
  for (let i = 1; i < list.length; i++) {
    const current = list[i]
    let j = i
    frames.push(frame('step', 2, `Insert ${current.id} (${key}=${current[key]}).`, { index: i, current: current.id }))
    while (j > 0 && list[j - 1][key] > current[key]) {
      list[j] = list[j - 1]
      j--
      frames.push(frame('step', 3, `${list[j].id} is larger, so it moves right.`, { list: list.map(x => x.id) }))
    }
    list[j] = current
  }
  const ids = list.map(item => item.id)
  frames.push(frame('done', 5, 'Sorted by the key.', { order: ids }))
  return { input: { key, items }, result: list, frames }
}
export const code = lines(`const list = [items[0]]; // start with the first item as the sorted part
for (const current of items.slice(1)) { // for each later item called current
  let j = list.length; while (j > 0 && list[j - 1][key] > current[key]) j--; // move left while the item before has a larger key
  list.splice(j, 0, current); // place current in the gap
} return list; // return the items in sorted order`)
export const python = `def sort_by(items, key):
    for i in range(1, len(items)):
        current = items[i]
        j = i
        while j > 0 and items[j - 1][key] > current[key]:
            items[j] = items[j - 1]
            j -= 1
        items[j] = current
    return items`
