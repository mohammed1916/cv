import { treeFromLevelOrder } from '../../components/shared/treeLayout.js'

export function parseInput(text) {
  const arr = JSON.parse(text)
  if (!Array.isArray(arr) || arr.length < 1 || arr.length > 15 || arr[0] === null) throw new Error('Use a level-order array of 1 to 15 entries with a non-null root.')
  if (arr.some(v => v !== null && (!Number.isInteger(v) || Math.abs(v) > 100))) throw new Error('Values are integers from -100 to 100, or null.')
  return arr
}

// Columns are numbered from the root (left -1, right +1); rows are depths. Within a column,
// nodes sort by row, then by value.
export function buildTrace(arr) {
  const root = treeFromLevelOrder(arr)
  const entries = []
  const frames = [{ phase: 'start', activeLine: L('queue = deque'), node: null, columns: {}, message: 'Breadth-first search gives each node a column and a row. Collect every node, then sort.' }]
  const queue = root ? [{ node: root, col: 0, row: 0 }] : []
  while (queue.length) {
    const { node, col, row } = queue.shift()
    entries.push({ col, row, value: node.value })
    frames.push({ phase: 'visit', activeLine: L('entries.append'), node: node.id, columns: group(entries), message: `${node.value} is at column ${col}, row ${row}.` })
    if (node.left) queue.push({ node: node.left, col: col - 1, row: row + 1 })
    if (node.right) queue.push({ node: node.right, col: col + 1, row: row + 1 })
  }
  entries.sort((x, y) => x.col - y.col || x.row - y.row || x.value - y.value)
  const result = []
  let current = null
  for (const e of entries) {
    if (current === null || current.col !== e.col) {
      current = { col: e.col, values: [] }
      result.push(current.values)
    }
    current.values.push(e.value)
  }
  frames.push({ phase: 'done', activeLine: L('return result'), node: null, columns: group(entries), message: `${result.length} column(s), left to right.` })
  return { input: arr, root: treeFromLevelOrder(arr), result, frames }
}

// Current columns as { column: values }, for display only.
function group(entries) {
  const out = {}
  for (const e of [...entries].sort((x, y) => x.col - y.col || x.row - y.row || x.value - y.value)) {
    if (!out[e.col]) out[e.col] = []
    out[e.col].push(e.value)
  }
  return out
}

export const code = `def verticalTraversal(root):
    queue = deque([(root, 0, 0)])
    entries = []
    while queue:
        node, col, row = queue.popleft()
        entries.append((col, row, node.val))
        if node.left:
            queue.append((node.left, col - 1, row + 1))
        if node.right:
            queue.append((node.right, col + 1, row + 1))
    entries.sort()
    result = []
    for col, group in groupby(entries, key=lambda e: e[0]):
        result.append([value for _, _, value in group])
    return result`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1
