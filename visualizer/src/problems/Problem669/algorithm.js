import { treeFromLevelOrder } from '../../components/shared/treeLayout.js'

export function parseInput(text) {
  const data = JSON.parse(text)
  const { root, low, high } = data ?? {}
  if (!Array.isArray(root) || root.length < 1 || root.length > 10000 || root.some(v => v !== null && (!Number.isInteger(v) || v < 0 || v > 10000))) throw new Error('root must be a level-order array of up to 10,000 items: integers from 0 to 10,000 or null.')
  if (root[0] === null) throw new Error('The root cannot be null.')
  if (!Number.isInteger(low) || !Number.isInteger(high) || low < 0 || high > 10000 || low > high) throw new Error('low and high must be integers from 0 to 10,000 with low ≤ high.')
  return { root, low, high }
}

// Keep the BST shape inside [low, high]. A node below the range is replaced by its right subtree (its left
// subtree is all smaller, so it is out too); a node above the range is replaced by its left subtree.
export function buildTrace({ root, low, high }) {
  const original = treeFromLevelOrder(root)
  const tree = treeFromLevelOrder(root)
  const removed = []
  const frames = [{ phase: 'start', current: null, removed: [], kept: [], activeLine: L('if (!root) return null'), pythonLine: P('if node is None'), message: `Keep only values from ${low} to ${high}.` }]
  const trim = node => {
    if (!node) return null
    if (node.value < low) {
      removed.push(node.id)
      frames.push({ phase: 'cut', current: node.id, removed: [...removed], kept: [], activeLine: L('if (root.val < low)'), pythonLine: P('if node["val"] < low'), message: `${node.value} is below ${low}: drop it and keep its right subtree.` })
      return trim(node.right)
    }
    if (node.value > high) {
      removed.push(node.id)
      frames.push({ phase: 'cut', current: node.id, removed: [...removed], kept: [], activeLine: L('if (root.val > high)'), pythonLine: P('if node["val"] > high'), message: `${node.value} is above ${high}: drop it and keep its left subtree.` })
      return trim(node.left)
    }
    frames.push({ phase: 'keep', current: node.id, removed: [...removed], kept: [], activeLine: L('root.left = trimBST'), pythonLine: P('node["left"] = trim'), message: `${node.value} is in range: keep it and trim both children.` })
    node.left = trim(node.left)
    node.right = trim(node.right)
    return node
  }
  const trimmed = trim(tree)
  const result = toLevelOrder(trimmed)
  frames.push({ phase: 'done', current: null, removed: [...removed], kept: [], result, activeLine: L('return root'), pythonLine: P('return node'), message: `Trimmed tree: [${result.map(v => (v === null ? 'null' : v)).join(', ')}].` })
  return { input: { root, low, high }, original, root: trimmed, result, frames }
}

// Level-order list with nulls for missing children, without trailing nulls.
function toLevelOrder(root) {
  if (!root) return []
  const out = []
  const queue = [root]
  for (let q = 0; q < queue.length; q++) {
    const node = queue[q]
    if (node) { out.push(node.value); queue.push(node.left, node.right) } else out.push(null)
  }
  while (out.at(-1) === null) out.pop()
  return out
}

const SOURCE = `function trimBST(root, low, high) {
  if (!root) return null
  if (root.val < low) return trimBST(root.right, low, high)
  if (root.val > high) return trimBST(root.left, low, high)
  root.left = trimBST(root.left, low, high)
  root.right = trimBST(root.right, low, high)
  return root
}`
export const code = SOURCE.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def trim_bst(node, low, high):
    if node is None:
        return None
    if node["val"] < low:
        return trim_bst(node["right"], low, high)
    if node["val"] > high:
        return trim_bst(node["left"], low, high)
    node["left"] = trim_bst(node["left"], low, high)
    node["right"] = trim_bst(node["right"], low, high)
    return node`
const P = s => python.split('\n').findIndex(t => t.includes(s)) + 1
