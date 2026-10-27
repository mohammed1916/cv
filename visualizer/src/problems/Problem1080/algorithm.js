import { treeFromLevelOrder } from '../../components/shared/treeLayout.js'

export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Use an object with root and limit.')
  const { root, limit } = data
  if (!Array.isArray(root) || root.length < 1 || root.length > 15 || root[0] === null) throw new Error('root must be a level-order array of 1 to 15 entries with a non-null root.')
  if (root.some(v => v !== null && (!Number.isInteger(v) || v < -100 || v > 100))) throw new Error('Values are integers from -100 to 100, or null.')
  if (!Number.isInteger(limit) || limit < -1000 || limit > 1000) throw new Error('limit must be an integer from -1000 to 1000.')
  return { root, limit }
}

export const code = `remove every node that lies only on paths whose sum is below the limit
  let pruned be a copy of the tree
  call keep on the root with a running sum of zero
  keep(node, sum) returns the node if some path through it is sufficient, otherwise nothing
  if node is empty then return nothing
  add the node value to the sum
  if node is a leaf then keep it only when the sum is at least the limit
  keep the left child and the right child using the new sum
  if both children were removed then remove this node too
  write pruned in level order and drop trailing empty entries
  return the level-order list`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

// Level-order form used by LeetCode: missing children are null and trailing nulls are dropped.
export function serialize(root) {
  if (!root) return []
  const out = []
  const queue = [root]
  for (let i = 0; i < queue.length; i++) {
    const node = queue[i]
    if (!node) { out.push(null); continue }
    out.push(node.value)
    queue.push(node.left, node.right)
  }
  while (out.length && out[out.length - 1] === null) out.pop()
  return out
}

export function buildTrace({ root: arr, limit }) {
  const original = treeFromLevelOrder(arr)
  const working = treeFromLevelOrder(arr)
  const removed = []
  const frames = [{ phase: 'start', activeLine: L('let pruned be a copy'), node: null, removed: [], message: `Remove every node that only lies on paths with sum below ${limit}.` }]
  const keep = (node, sum) => {
    if (!node) return null
    const total = sum + node.value
    if (!node.left && !node.right) {
      if (total >= limit) {
        frames.push({ phase: 'keep', activeLine: L('if node is a leaf'), node: node.id, removed: [...removed], message: `Leaf ${node.value} has path sum ${total}, which is enough.` })
        return node
      }
      removed.push(node.id)
      frames.push({ phase: 'remove', activeLine: L('if node is a leaf'), node: node.id, removed: [...removed], message: `Leaf ${node.value} has path sum ${total}, below ${limit}; remove it.` })
      return null
    }
    node.left = keep(node.left, total)
    node.right = keep(node.right, total)
    if (!node.left && !node.right) {
      removed.push(node.id)
      frames.push({ phase: 'remove', activeLine: L('if both children were removed'), node: node.id, removed: [...removed], message: `Both children of ${node.value} were removed, so it goes too.` })
      return null
    }
    return node
  }
  const pruned = keep(working, 0)
  const result = serialize(pruned)
  frames.push({ phase: 'done', activeLine: L('return the level-order list'), node: null, removed: [...removed], message: `Remaining tree: [${result.map(v => (v === null ? 'null' : v)).join(', ')}].` })
  return { input: { root: arr, limit }, original, result, frames }
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

def serialize(tree):
    if tree is None:
        return []
    out = []
    queue = [tree]
    for item in queue:
        if item is None:
            out.append(None)
            continue
        out.append(item.val)
        queue.append(item.left)
        queue.append(item.right)
    while out and out[-1] is None:
        out.pop()
    return out

def prune(root, limit):
    def keep(node, total):
        if node is None:
            return None
        total += node.val
        if node.left is None and node.right is None:
            return node if total >= limit else None
        node.left = keep(node.left, total)
        node.right = keep(node.right, total)
        return node if (node.left or node.right) else None

    return serialize(keep(build(root), 0))
`
