import { treeFromLevelOrder } from '../../components/shared/treeLayout.js'

export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Use an object with root (level-order array) and target.')
  const { root, target } = data
  if (!Array.isArray(root) || root.length < 1 || root.length > 15 || root[0] === null) throw new Error('root is a level-order array of 1 to 15 entries with a non-null root.')
  if (root.some(v => v !== null && (!Number.isInteger(v) || v < 1 || v > 4))) throw new Error('Tree values are integers from 1 to 4, or null.')
  if (!Number.isInteger(target) || target < 1 || target > 4) throw new Error('target is an integer from 1 to 4.')
  return { root, target }
}

// Level-order serialization with nulls for missing children and no trailing nulls.
export function serialize(top) {
  const out = []
  const queue = [top]
  for (let i = 0; i < queue.length; i++) {
    const n = queue[i]
    if (!n) {
      out.push(null)
      continue
    }
    out.push(n.value)
    queue.push(n.left, n.right)
  }
  while (out.length && out[out.length - 1] === null) out.pop()
  return out
}

export function buildTrace({ root, target }) {
  const display = treeFromLevelOrder(root)
  const work = treeFromLevelOrder(root)
  const pruned = []
  const frames = [{ phase: 'start', activeLine: L('tree after deleting every leaf'), active: null, pruned: [], message: `Remove leaves that hold ${target}, working from the bottom up.` }]
  const prune = node => {
    if (!node) return null
    node.left = prune(node.left)
    node.right = prune(node.right)
    const gone = !node.left && !node.right && node.value === target
    if (gone) pruned.push(node.id)
    frames.push({ phase: gone ? 'remove' : 'visit', activeLine: L('if this node is a leaf whose value is target'), active: node.id, pruned: [...pruned], message: gone ? `Leaf ${node.value} matches ${target} and is removed.` : `Node ${node.value} stays.` })
    return gone ? null : node
  }
  const result = serialize(prune(work))
  frames.push({ phase: 'done', activeLine: L('return the tree'), active: null, pruned: [...pruned], message: `Remaining tree in level order: ${JSON.stringify(result)}.` })
  return { input: { root, target }, display, result, frames }
}

export const code = `tree after deleting every leaf with the target value
  return prune of the root

prune of a node
  if the node is empty then
    return nothing
  set left to prune of the left child
  set right to prune of the right child
  if this node is a leaf whose value is target then
    return nothing
  otherwise return this node

the answer
  return the tree in level order`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

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
    for current in queue:
        if cursor < len(arr) and arr[cursor] is not None:
            current.left = TreeNode(arr[cursor])
            queue.append(current.left)
        cursor += 1
        if cursor < len(arr) and arr[cursor] is not None:
            current.right = TreeNode(arr[cursor])
            queue.append(current.right)
        cursor += 1
    return root

def serialize(top):
    out = []
    queue = [top]
    i = 0
    while i < len(queue):
        current = queue[i]
        i += 1
        if current is None:
            out.append(None)
            continue
        out.append(current.val)
        queue.append(current.left)
        queue.append(current.right)
    while out and out[-1] is None:
        out.pop()
    return out

def delete_leaves(root, target):
    def prune(current):
        if current is None:
            return None
        current.left = prune(current.left)
        current.right = prune(current.right)
        if current.left is None and current.right is None and current.val == target:
            return None
        return current
    return serialize(prune(build(root)))
`
