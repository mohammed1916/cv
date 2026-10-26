import { treeFromLevelOrder, levelOrderFromTree } from '../../components/shared/treeLayout.js'

export function parseInput(text) {
  const data = JSON.parse(text)
  const { root, low, high } = data ?? {}
  if (!Array.isArray(root) || root.length < 1 || root.length > 10000 || root[0] === null || root.some(v => v !== null && (!Number.isInteger(v) || Math.abs(v) > 10000))) throw new Error('root must be a level-order BST array of 1–10,000 items; the first is not null.')
  if (!Number.isInteger(low) || !Number.isInteger(high) || low > high || Math.abs(low) > 10000 || Math.abs(high) > 10000) throw new Error('low and high must be integers with low ≤ high and |v| ≤ 10,000.')
  return { root, low, high }
}

// A node below low is replaced by its right subtree (trimmed); above high by its left; otherwise keep it and trim both sides.
export function buildTrace({ root, low, high }) {
  const top = treeFromLevelOrder(root)
  const frames = [{ phase: 'start', current: null, pruned: [], activeLine: 2, message: `Keep values in [${low}, ${high}].` }]
  const pruned = []
  function trim(node) {
    if (!node) return null
    if (node.value < low) {
      pruned.push(node.id)
      frames.push({ phase: 'prune', current: node.id, pruned: [...pruned], activeLine: 4, message: `${node.value} < ${low}: discard it and keep only its right subtree.` })
      return trim(node.right)
    }
    if (node.value > high) {
      pruned.push(node.id)
      frames.push({ phase: 'prune', current: node.id, pruned: [...pruned], activeLine: 5, message: `${node.value} > ${high}: discard it and keep only its left subtree.` })
      return trim(node.left)
    }
    frames.push({ phase: 'keep', current: node.id, pruned: [...pruned], activeLine: 7, message: `${node.value} is in range: keep it and trim both subtrees.` })
    node.left = trim(node.left)
    node.right = trim(node.right)
    return node
  }
  const trimmed = trim(top)
  const result = levelOrderFromTree(trimmed)
  frames.push({ phase: 'done', current: null, pruned: [...pruned], result, activeLine: 9, message: `Trimmed level order: [${result.map(v => (v === null ? 'null' : v)).join(', ')}].` })
  return { input: { root, low, high }, root: trimmed, result, frames, prunedIds: new Set(pruned) }
}

export const code = `def trimBST(root, low, high):
    if not root: return None
    if root.val < low: return trimBST(root.right, low, high)
    if root.val > high: return trimBST(root.left, low, high)
    root.left = trimBST(root.left, low, high)
    root.right = trimBST(root.right, low, high)
    return root`.split('\n').map((text, index) => ({ line: index + 1, text }))
