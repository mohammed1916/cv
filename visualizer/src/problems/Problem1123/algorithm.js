import { treeFromLevelOrder } from '../../components/shared/treeLayout.js'

export function parseInput(text) {
  const arr = JSON.parse(text)
  if (!Array.isArray(arr) || arr.length < 1 || arr.length > 15 || arr[0] === null) throw new Error('Use a level-order array of 1 to 15 entries with a non-null root.')
  const values = arr.filter(v => v !== null)
  if (values.some(v => !Number.isInteger(v) || v < 0 || v > 99)) throw new Error('Values are integers from 0 to 99, or null.')
  if (new Set(values).size !== values.length) throw new Error('Values must be unique.')
  return arr
}

export const code = `value of the lowest common ancestor of the deepest leaves
  call deepest on the root at depth zero
  deepest(node, depth) returns the greatest leaf depth below and the common ancestor
  if node is empty then return depth minus one and no ancestor
  if node is a leaf then return its depth and the node itself
  ask the left child and the right child for their results
  if the two depths are equal then this node is the common ancestor
  otherwise return the result of the deeper side
  return the value of the common ancestor of the root`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export function buildTrace(arr) {
  const root = treeFromLevelOrder(arr)
  const frames = [{ phase: 'start', activeLine: L('call deepest on the root'), node: null, deepest: [], message: 'Ask every subtree for its deepest depth and common ancestor.' }]
  const deepest = (node, depth) => {
    if (!node) return { depth: depth - 1, lca: null }
    if (!node.left && !node.right) {
      frames.push({ phase: 'leaf', activeLine: L('if node is a leaf'), node: node.id, deepest: [], message: `Leaf ${node.value} at depth ${depth}.` })
      return { depth, lca: node }
    }
    const left = deepest(node.left, depth + 1)
    const right = deepest(node.right, depth + 1)
    let out
    if (left.depth === right.depth) {
      out = { depth: left.depth, lca: node }
      frames.push({ phase: 'join', activeLine: L('if the two depths are equal'), node: node.id, deepest: [], message: `Both sides reach depth ${left.depth}, so ${node.value} is the common ancestor.` })
    } else {
      out = left.depth > right.depth ? left : right
      frames.push({ phase: 'pass', activeLine: L('otherwise return'), node: node.id, deepest: [], message: `${node.value} passes up the deeper side at depth ${out.depth}.` })
    }
    return out
  }
  const found = deepest(root, 0)
  const deepestIds = []
  const collect = (node, depth, max) => {
    if (!node) return
    if (!node.left && !node.right && depth === max) deepestIds.push(node.id)
    collect(node.left, depth + 1, max)
    collect(node.right, depth + 1, max)
  }
  collect(root, 0, found.depth)
  frames.push({ phase: 'done', activeLine: L('return the value'), node: found.lca.id, deepest: deepestIds, message: `Answer: ${found.lca.value}.` })
  return { input: arr, root, result: found.lca.value, frames }
}

export const python = `class TreeNode:
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

def lca_deepest(arr):
    def deepest(node, depth):
        if node is None:
            return depth - 1, None
        if node.left is None and node.right is None:
            return depth, node
        left_depth, left_lca = deepest(node.left, depth + 1)
        right_depth, right_lca = deepest(node.right, depth + 1)
        if left_depth == right_depth:
            return left_depth, node
        return (left_depth, left_lca) if left_depth > right_depth else (right_depth, right_lca)

    return deepest(build(arr), 0)[1].val
`
