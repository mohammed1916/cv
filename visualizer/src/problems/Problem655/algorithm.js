import { treeFromLevelOrder } from '../../components/shared/treeLayout.js'

export function parseInput(text) {
  const values = JSON.parse(text)
  if (!Array.isArray(values) || values.length < 1 || values.length > 127 || values.some(v => v !== null && (!Number.isInteger(v) || Math.abs(v) > 99))) throw new Error('Enter a LeetCode level-order array of up to 127 items: integers from −99 to 99 or null.')
  if (values[0] === null) throw new Error('The root cannot be null.')
  return values
}

// The height h gives h + 1 rows and 2^(h+1) − 1 columns. A node's column is the middle of its range,
// and its children split that range in half, so every value lands at a fixed grid position.
export function buildTrace(values) {
  const root = treeFromLevelOrder(values)
  const height = node => (node ? 1 + Math.max(height(node.left), height(node.right)) : -1)
  const h = height(root)
  const rows = h + 1
  const cols = 2 ** (h + 1) - 1
  const matrix = Array.from({ length: rows }, () => Array(cols).fill(''))
  const frames = [{ phase: 'start', matrix: matrix.map(r => [...r]), cell: null, rows, cols, activeLine: L('const matrix = Array'), pythonLine: P('res = [[""]'), message: `Height ${h}: ${rows} rows and ${cols} columns.` }]
  const place = (node, row, lo, hi) => {
    if (!node) return
    const mid = Math.floor((lo + hi) / 2)
    matrix[row][mid] = String(node.value)
    frames.push({ phase: 'place', matrix: matrix.map(r => [...r]), cell: { row, col: mid }, rows, cols, activeLine: L('matrix[row][mid]'), pythonLine: P('res[row][mid]'), message: `${node.value} goes to row ${row}, column ${mid}; its children split columns ${lo}–${mid - 1} and ${mid + 1}–${hi}.` })
    place(node.left, row + 1, lo, mid - 1)
    place(node.right, row + 1, mid + 1, hi)
  }
  place(root, 0, 0, cols - 1)
  const result = matrix
  frames.push({ phase: 'done', matrix: matrix.map(r => [...r]), cell: null, rows, cols, result, activeLine: L('return matrix'), pythonLine: P('return res'), message: 'Every node has its fixed position.' })
  return { input: values, result, frames }
}

const SOURCE = `function printTree(root) {
  const height = node => (node ? 1 + Math.max(height(node.left), height(node.right)) : -1)
  const h = height(root)
  const rows = h + 1
  const cols = 2 ** (h + 1) - 1
  const matrix = Array.from({ length: rows }, () => Array(cols).fill(''))
  const place = (node, row, lo, hi) => {
    if (!node) return
    const mid = Math.floor((lo + hi) / 2)
    matrix[row][mid] = String(node.value)
    place(node.left, row + 1, lo, mid - 1)
    place(node.right, row + 1, mid + 1, hi)
  }
  place(root, 0, 0, cols - 1)
  return matrix
}`
export const code = SOURCE.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def print_tree(root):
    def height(node):
        return -1 if node is None else 1 + max(height(node["left"]), height(node["right"]))

    h = height(root)
    rows, cols = h + 1, 2 ** (h + 1) - 1
    res = [[""] * cols for _ in range(rows)]

    def place(node, row, lo, hi):
        if node is None:
            return
        mid = (lo + hi) // 2
        res[row][mid] = str(node["val"])
        place(node["left"], row + 1, lo, mid - 1)
        place(node["right"], row + 1, mid + 1, hi)

    place(root, 0, 0, cols - 1)
    return res`
const P = s => python.split('\n').findIndex(t => t.includes(s)) + 1
