import { treeFromLevelOrder, levelOrderFromTree } from '../../components/shared/treeLayout.js'

export function parseInput(text) {
  const data = JSON.parse(text)
  const { root, val } = data ?? {}
  if (!Array.isArray(root) || root.length < 1 || root.length > 5000 || root.some(v => v !== null && (!Number.isInteger(v) || Math.abs(v) > 10000000))) throw new Error('root must be a BST level-order array of up to 5,000 items.')
  if (root[0] === null) throw new Error('The root cannot be null.')
  if (!Number.isInteger(val) || Math.abs(val) > 10000000) throw new Error('val must be an integer with |val| ≤ 10,000,000.')
  return { root, val }
}

// Walk down: go left when val is smaller, right when larger, until the node matches or the path ends.
export function buildTrace({ root, val }) {
  let node = treeFromLevelOrder(root)
  const path = []
  const frames = [{ phase: 'start', current: node?.id ?? null, path: [], result: null, activeLine: 2, message: `Search for ${val} from the root.` }]
  while (node) {
    path.push(node.id)
    if (node.value === val) {
      frames.push({ phase: 'found', current: node.id, path: [...path], result: node, activeLine: 4, message: `Found ${val}.` })
      break
    }
    const goLeft = val < node.value
    frames.push({ phase: 'step', current: node.id, path: [...path], result: null, activeLine: goLeft ? 5 : 6, message: `${val} ${goLeft ? '<' : '>'} ${node.value}: go ${goLeft ? 'left' : 'right'}.` })
    node = goLeft ? node.left : node.right
  }
  const found = node && node.value === val ? node : null
  const result = found ? levelOrderFromTree(found) : null
  if (!found) frames.push({ phase: 'missing', current: null, path: [...path], result: null, activeLine: 8, message: `${val} is not in the tree.` })
  frames.push({ phase: 'done', current: found?.id ?? null, path: [...path], result, activeLine: 9, message: found ? `Subtree rooted at ${val}: [${result.map(v => (v === null ? 'null' : v)).join(', ')}].` : 'Return null.' })
  return { input: { root, val }, root: treeFromLevelOrder(root), result, frames }
}

export const code = `def searchBST(root, val):
    while root and root.val != val:
        root = root.left if val < root.val else root.right
    return root`.split('\n').map((text, index) => ({ line: index + 1, text }))
