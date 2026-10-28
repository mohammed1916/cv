export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use a JSON object with label.')
  const { label } = input
  if (!Number.isInteger(label) || label < 1 || label > 1000000) throw new Error('label must be an integer from 1 to 1000000.')
  return { label }
}

export function buildTrace({ label }) {
  let row = 0
  while (2 ** (row + 1) <= label) row += 1
  const frames = [{ phase: 'start', activeLine: L('set the row'), row, path: [label], message: `Label ${label} sits in row ${row} of the tree.` }]
  let current = label
  const up = [label]
  while (row > 0) {
    // In odd rows the labels run right to left, so flip them into ordinary heap numbering first.
    const heap = row % 2 === 1 ? 2 ** row + 2 ** (row + 1) - 1 - current : current
    const parentHeap = Math.floor(heap / 2)
    row -= 1
    current = row % 2 === 1 ? 2 ** row + 2 ** (row + 1) - 1 - parentHeap : parentHeap
    up.push(current)
    frames.push({ phase: 'climb', activeLine: L('add the parent label'), row, path: up.slice().reverse(), message: `The parent of the previous label is ${current}, in row ${row}.` })
  }
  const result = up.reverse()
  frames.push({ phase: 'done', activeLine: L('return the path'), row: 0, path: result, message: `The path from the root is ${result.join(' to ')}.` })
  return { input: { label }, result, frames }
}

export const code = `path from the root to a label in a zigzag labelled binary tree
set the row to the number of halvings that take the label down to 1
set current to the label
while the row is above the root do
  convert current to heap numbering, which reverses odd rows
  halve that heap number to find the parent heap number
  move up one row and convert the parent back to a zigzag label
  add the parent label to the front of the path
return the path`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def path_in_zigzag(label):
    row = 0
    while 2 ** (row + 1) <= label:
        row += 1
    path = [label]
    current = label
    while row > 0:
        if row % 2 == 1:
            heap = 2 ** row + 2 ** (row + 1) - 1 - current
        else:
            heap = current
        parent_heap = heap // 2
        row -= 1
        if row % 2 == 1:
            current = 2 ** row + 2 ** (row + 1) - 1 - parent_heap
        else:
            current = parent_heap
        path.insert(0, current)
    return path
`
