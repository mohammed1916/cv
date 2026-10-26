import { treeFromLevelOrder, levelOrderFromTree } from '../../components/shared/treeLayout.js'

export function parseInput(text) {
  const data = JSON.parse(text)
  const { a, b } = data ?? {}
  const ok = t => Array.isArray(t) && t.length <= 2000 && t.every(v => v === null || (Number.isInteger(v) && Math.abs(v) <= 10000))
  if (!ok(a) || !ok(b)) throw new Error('Enter {"a":[...],"b":[...]}: level-order trees of up to 2,000 items with integers |v| ≤ 10,000 or null.')
  if ((a.length && a[0] === null) || (b.length && b[0] === null)) throw new Error('A root cannot be null; use [] for an empty tree.')
  return { a, b }
}

// Gives every node in a tree a new id, so ids from the two inputs never collide in the display.
function offsetIds(node, offset) {
  if (!node) return null
  return { ...node, id: node.id + offset, left: offsetIds(node.left, offset), right: offsetIds(node.right, offset) }
}

// Merge of two trees: values add where both exist; otherwise the existing subtree is kept.
export function buildTrace({ a, b }) {
  const ta = treeFromLevelOrder(a), tb = offsetIds(treeFromLevelOrder(b), 10000)
  const frames = [{ phase: 'start', current: null, activeLine: 2, message: 'Walk both trees together from the roots.' }]
  function merge(x, y) {
    if (!x) return y
    if (!y) return x
    const node = { id: x.id, value: x.value + y.value, left: null, right: null }
    frames.push({ phase: 'merge', current: node.id, activeLine: 5, message: `Both nodes exist: ${x.value} + ${y.value} = ${node.value}.` })
    node.left = merge(x.left, y.left)
    node.right = merge(x.right, y.right)
    return node
  }
  const root = merge(ta, tb)
  if (!root) frames.push({ phase: 'merge', current: null, activeLine: 3, message: 'Both trees are empty.' })
  const serial = levelOrderFromTree(root)
  frames.push({ phase: 'done', current: null, result: serial, activeLine: 7, message: `Merged level order: [${serial.map(v => (v === null ? 'null' : v)).join(', ')}].` })
  return { input: { a, b }, root, result: serial, frames }
}

export const code = `def mergeTrees(t1, t2):
    if not t1: return t2
    if not t2: return t1
    node = TreeNode(t1.val + t2.val)
    node.left = mergeTrees(t1.left, t2.left)
    node.right = mergeTrees(t1.right, t2.right)
    return node`.split('\n').map((text, index) => ({ line: index + 1, text }))
