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
  const frames = [{ phase: 'start', activeLine: L('start a queue'), node: null, columns: {}, message: 'Breadth-first search gives each node a column and a row. Collect every node, then sort.' }]
  const queue = root ? [{ node: root, col: 0, row: 0 }] : []
  while (queue.length) {
    const { node, col, row } = queue.shift()
    entries.push({ col, row, value: node.value })
    frames.push({ phase: 'visit', activeLine: L('append (col, row, node.value)'), node: node.id, columns: group(entries), message: `${node.value} is at column ${col}, row ${row}.` })
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

export const code = `verticalTraversal(root) returns the node values column by column, from left to right
  start a queue with (root, column 0, row 0), and set entries to an empty list
  while the queue is not empty
    remove the front (node, col, row) from the queue
    append (col, row, node.value) to entries
    if node has a left child, then add (left, col minus 1, row plus 1) to the queue
    if node has a right child, then add (right, col plus 1, row plus 1) to the queue
  sort entries by column, then row, then value
  set result to an empty list
  for each group of entries with the same column
    append the values of the group to result
  return result`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `from collections import deque
from itertools import groupby

class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def build(arr):
    if not arr or arr[0] is None:
        return None
    root = TreeNode(arr[0])
    queue = [root]
    cursor = 1
    for node in queue:
        if cursor < len(arr) and arr[cursor] is not None:
            node.left = TreeNode(arr[cursor])
            queue.append(node.left)
        cursor += 1
        if cursor < len(arr) and arr[cursor] is not None:
            node.right = TreeNode(arr[cursor])
            queue.append(node.right)
        cursor += 1
    return root

def vertical_traversal(arr):
    root = build(arr)
    queue = deque([(root, 0, 0)] if root else [])
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
    return result`
