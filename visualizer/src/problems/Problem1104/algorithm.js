export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use a JSON object with label.')
  const { label } = input
  if (!Number.isInteger(label) || label < 1 || label > 1000000) throw new Error('label must be an integer from 1 to 1000000.')
  return { label }
}

// Each line of JavaScript is paired with the Python line on the same row.
const LINES = [
  ['function pathInZigzag(label) {', 'def path_in_zigzag(label):'],
  ['  let row = 0', '    row = 0'],
  ['  while (2 ** (row + 1) <= label) row++', '    while 2 ** (row + 1) <= label: row += 1'],
  ['  const path = [label]', '    path = [label]'],
  ['  let current = label', '    current = label'],
  ['  while (row > 0) {', '    while row > 0:'],
  ['    const heap = row % 2 === 1 ? 2 ** row + 2 ** (row + 1) - 1 - current : current', '        heap = 2 ** row + 2 ** (row + 1) - 1 - current if row % 2 == 1 else current'],
  ['    const parentHeap = Math.floor(heap / 2)', '        parent_heap = heap // 2'],
  ['    row--', '        row -= 1'],
  ['    current = row % 2 === 1 ? 2 ** row + 2 ** (row + 1) - 1 - parentHeap : parentHeap', '        current = 2 ** row + 2 ** (row + 1) - 1 - parent_heap if row % 2 == 1 else parent_heap'],
  ['    path.unshift(current)', '        path.insert(0, current)'],
  ['  }', ''],
  ['  return path', '    return path'],
  ['}', ''],
]
const codeLines = LINES.map(([js]) => js)
export const code = codeLines.map((text, index) => ({ line: index + 1, text }))
const L = s => codeLines.findIndex(c => c.includes(s)) + 1
export const python = LINES.map(([, py]) => py).join('\n')
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1

export function buildTrace({ label }) {
  let row = 0
  while (2 ** (row + 1) <= label) row += 1
  const frames = [{ phase: 'start', pythonLine: P('row = 0'), activeLine: L('let row = 0'), row, path: [label], message: `Label ${label} sits in row ${row} of the tree.` }]
  let current = label
  const up = [label]
  while (row > 0) {
    // In odd rows the labels run right to left, so flip them into ordinary heap numbering first.
    const heap = row % 2 === 1 ? 2 ** row + 2 ** (row + 1) - 1 - current : current
    const parentHeap = Math.floor(heap / 2)
    row -= 1
    current = row % 2 === 1 ? 2 ** row + 2 ** (row + 1) - 1 - parentHeap : parentHeap
    up.push(current)
    frames.push({ phase: 'climb', pythonLine: P('path.insert(0'), activeLine: L('path.unshift(current)'), row, path: up.slice().reverse(), message: `The parent of the previous label is ${current}, in row ${row}.` })
  }
  const result = up.reverse()
  frames.push({ phase: 'done', pythonLine: P('return path'), activeLine: L('return path'), row: 0, path: result, message: `The path from the root is ${result.join(' to ')}.` })
  return { input: { label }, result, frames }
}
