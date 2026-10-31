import { treeFromLevelOrder } from '../../components/shared/treeLayout.js'

export function parseInput(text) {
  const values = JSON.parse(text)
  if (!Array.isArray(values) || values.length < 1 || values.length > 64 || values.some(v => v !== null && (!Number.isInteger(v) || Math.abs(v) > 99))) throw new Error('Enter a LeetCode level-order array of up to 64 items: integers from −99 to 99 or null.')
  if (values[0] === null) throw new Error('The root cannot be null.')
  return values
}

// Rows = height + 1. Columns = 2^(height+1) − 1. Each child is placed halfway between its parent's
// position and the midpoint of its own subtree's columns.
export function buildTrace(values) {
  const root = treeFromLevelOrder(values)
  const height = root ? treeHeight(root) : -1
  const rows = height + 1
  const cols = 2 ** (height + 1) - 1
  const matrix = Array.from({ length: rows }, () => Array(cols).fill(''))
  const frames = [{ phase: 'start', matrix: matrix.map(r => [...r]), current: null, pythonLine: P('rows, cols = h + 1'), activeLine: L('set rows to'), message: `Height ${height}: a ${rows}×${cols} grid, root in the middle column.` }]
  function place(node, row, lo, hi) {
    if (!node) return
    const col = Math.floor((lo + hi) / 2)
    matrix[row][col] = String(node.value)
    frames.push({ phase: 'place', matrix: matrix.map(r => [...r]), current: node.id, pythonLine: P('res[r][mid] = str'), activeLine: L('set res[r][mid]'), message: `Place ${node.value} at row ${row}, column ${col}.` })
    const mid = Math.floor((lo + hi) / 2)
    place(node.left, row + 1, lo, mid - 1)
    place(node.right, row + 1, mid + 1, hi)
  }
  place(root, 0, 0, cols - 1)
  frames.push({ phase: 'done', matrix: matrix.map(r => [...r]), current: null, pythonLine: P('return res'), activeLine: L('return res'), message: 'Grid complete.' })
  return { input: values, root, result: matrix, frames }
}

function treeHeight(node) {
  if (!node) return -1
  return 1 + Math.max(treeHeight(node.left), treeHeight(node.right))
}

export const code = `function printTree(root):
  set h to the height of root
  set rows to h + 1 and cols to 2^(h+1) - 1
  set res to a rows-by-cols grid of empty strings
  define place(node, r, lo, hi):
    if node is empty, return
    set mid to the middle of lo and hi
    set res[r][mid] to the value of node
    place(node.left, r + 1, lo, mid - 1)
    place(node.right, r + 1, mid + 1, hi)
  place(root, 0, 0, cols - 1)
  return res`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1

export const python = `class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def build_tree(values):
    if not values or values[0] is None:
        return None
    root = TreeNode(values[0])
    queue = [root]
    cursor = 1
    for node in queue:
        if cursor < len(values) and values[cursor] is not None:
            node.left = TreeNode(values[cursor])
            queue.append(node.left)
        cursor += 1
        if cursor < len(values) and values[cursor] is not None:
            node.right = TreeNode(values[cursor])
            queue.append(node.right)
        cursor += 1
    return root

def height(node):
    if node is None:
        return -1
    return 1 + max(height(node.left), height(node.right))

def print_tree(values):
    root = build_tree(values)
    h = height(root)
    rows, cols = h + 1, 2 ** (h + 1) - 1
    res = [[""] * cols for _ in range(rows)]

    def place(node, r, lo, hi):
        if node is None:
            return
        mid = (lo + hi) // 2
        res[r][mid] = str(node.val)
        place(node.left, r + 1, lo, mid - 1)
        place(node.right, r + 1, mid + 1, hi)

    place(root, 0, 0, cols - 1)
    return res
`
