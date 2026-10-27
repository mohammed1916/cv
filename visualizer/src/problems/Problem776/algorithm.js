import { treeFromLevelOrder } from '../../components/shared/treeLayout.js'

function inorder(node, out = []) {
  if (node) {
    inorder(node.left, out)
    out.push(node.value)
    inorder(node.right, out)
  }
  return out
}

export function parseInput(text) {
  const spec = JSON.parse(text)
  const { arr, target } = spec
  if (!Array.isArray(arr) || arr.length < 1 || arr.length > 30 || arr[0] === null) throw new Error('Use a level-order array of 1 to 30 entries with a non-null root.')
  const values = arr.filter(v => v !== null)
  if (values.some(v => !Number.isInteger(v) || v < 1 || v > 100) || new Set(values).size !== values.length) {
    throw new Error('Values are distinct integers from 1 to 100.')
  }
  const sorted = inorder(treeFromLevelOrder(arr))
  if (sorted.some((v, i) => i > 0 && v <= sorted[i - 1])) throw new Error('The tree is not a binary search tree.')
  if (!Number.isInteger(target) || target < 0 || target > 100) throw new Error('target is an integer from 0 to 100.')
  return spec
}

export function buildTrace(spec) {
  const roles = {}
  const frames = [{ phase: 'start', activeLine: L('To split the tree at target'), node: null, roles: {}, message: `Split the tree at ${spec.target}: values at most ${spec.target} go left, larger values go right.` }]
  // Splits a subtree; returns the roots of the two resulting trees. Pointers are rewired in place.
  const split = node => {
    if (!node) return [null, null]
    const small = node.value <= spec.target
    roles[node.id] = small ? 'small' : 'large'
    frames.push({ phase: 'visit', activeLine: L(small ? 'if root.value is at most target' : '(left, right) = split root.left'), node: node.id, roles: { ...roles }, message: `${node.value} is ${small ? 'at most' : 'greater than'} ${spec.target}, so it stays in the ${small ? 'left' : 'right'} tree.` })
    if (small) {
      const [smallPart, largePart] = split(node.right)
      node.right = smallPart
      return [node, largePart]
    }
    const [smallPart, largePart] = split(node.left)
    node.left = largePart
    return [smallPart, node]
  }
  const [smallRoot, largeRoot] = split(treeFromLevelOrder(spec.arr))
  const result = [inorder(smallRoot), inorder(largeRoot)]
  frames.push({ phase: 'done', activeLine: L('To split the tree at target'), node: null, roles: { ...roles }, message: `Left tree: [${result[0].join(', ')}]. Right tree: [${result[1].join(', ')}].` })
  return { input: spec, root: treeFromLevelOrder(spec.arr), result, frames }
}

export const code = `To split the tree at target, call split(root)
  if root is empty then
    return (empty, empty)
  if root.value is at most target then
    (left, right) = split root.right
    set root.right to left
    return (root, right)
  (left, right) = split root.left
  set root.left to right
  return (left, root)`.split('\n').map((text, index) => ({ line: index + 1, text }))
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

def inorder(node, out):
    if node:
        inorder(node.left, out)
        out.append(node.val)
        inorder(node.right, out)
    return out

def split_bst(arr, target):
    def split(root):
        if root is None:
            return None, None
        if root.val <= target:
            left, right = split(root.right)
            root.right = left
            return root, right
        left, right = split(root.left)
        root.left = right
        return left, root
    small, large = split(build(arr))
    return [inorder(small, []), inorder(large, [])]
`
const L = s => code.findIndex(c => c.text.includes(s)) + 1
