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
  const frames = [{ phase: 'start', matrix: matrix.map(r => [...r]), current: null, activeLine: 2, message: `Height ${height}: a ${rows}×${cols} grid, root in the middle column.` }]
  function place(node, row, lo, hi) {
    if (!node) return
    const col = Math.floor((lo + hi) / 2)
    matrix[row][col] = String(node.value)
    frames.push({ phase: 'place', matrix: matrix.map(r => [...r]), current: node.id, activeLine: 5, message: `Place ${node.value} at row ${row}, column ${col}.` })
    const mid = Math.floor((lo + hi) / 2)
    place(node.left, row + 1, lo, mid - 1)
    place(node.right, row + 1, mid + 1, hi)
  }
  place(root, 0, 0, cols - 1)
  frames.push({ phase: 'done', matrix: matrix.map(r => [...r]), current: null, activeLine: 8, message: 'Grid complete.' })
  return { input: values, root, result: matrix, frames }
}

function treeHeight(node) {
  if (!node) return -1
  return 1 + Math.max(treeHeight(node.left), treeHeight(node.right))
}

export const code = `def printTree(root):
    h = height(root)
    rows, cols = h + 1, 2 ** (h + 1) - 1
    res = [[''] * cols for _ in range(rows)]
    def place(node, r, lo, hi):
        if not node: return
        mid = (lo + hi) // 2
        res[r][mid] = str(node.val)
        place(node.left, r + 1, lo, mid - 1)
        place(node.right, r + 1, mid + 1, hi)
    place(root, 0, 0, cols - 1)
    return res`.split('\n').map((text, index) => ({ line: index + 1, text }))
