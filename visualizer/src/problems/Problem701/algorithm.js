import { treeFromLevelOrder, levelOrderFromTree } from '../../components/shared/treeLayout.js'

export function parseInput(text) {
  const data = JSON.parse(text)
  const { root, val } = data ?? {}
  if (!Array.isArray(root) || root.length < 1 || root.length > 1000 || root.some(v => v !== null && (!Number.isInteger(v) || Math.abs(v) > 100000000))) throw new Error('root must be a BST level-order array of up to 1,000 items.')
  if (root[0] === null) throw new Error('The root cannot be null.')
  if (!Number.isInteger(val) || Math.abs(val) > 100000000) throw new Error('val must be an integer with |val| ≤ 100,000,000.')
  return { root, val }
}

// Walk down to the empty slot where val belongs (left of smaller nodes, right of larger), and attach a new leaf.
export function buildTrace({ root, val }) {
  const top = treeFromLevelOrder(root)
  const newId = 100000
  const frames = [{ phase: 'start', current: top.id, activeLine: 2, message: `Find the empty slot where ${val} belongs.` }]
  let node = top
  let inserted = false
  while (!inserted) {
    const goLeft = val < node.value
    const child = goLeft ? node.left : node.right
    if (!child) {
      const leaf = { id: newId, value: val, left: null, right: null }
      if (goLeft) node.left = leaf; else node.right = leaf
      frames.push({ phase: 'attach', current: leaf.id, activeLine: 6, message: `Empty ${goLeft ? 'left' : 'right'} slot under ${node.value}: attach ${val}.` })
      inserted = true
    } else {
      frames.push({ phase: 'step', current: child.id, activeLine: goLeft ? 4 : 5, message: `${val} ${goLeft ? '<' : '>'} ${node.value}: go ${goLeft ? 'left' : 'right'}.` })
      node = child
    }
  }
  const result = levelOrderFromTree(top)
  frames.push({ phase: 'done', current: null, result, activeLine: 8, message: `Level order: [${result.map(v => (v === null ? 'null' : v)).join(', ')}].` })
  return { input: { root, val }, root: top, result, frames }
}

export const code = `def insertIntoBST(root, val):
    if not root: return TreeNode(val)
    node = root
    while True:
        if val < node.val:
            if not node.left:
                node.left = TreeNode(val); break
            node = node.left
        else:
            if not node.right:
                node.right = TreeNode(val); break
            node = node.right
    return root`.split('\n').map((text, index) => ({ line: index + 1, text }))
