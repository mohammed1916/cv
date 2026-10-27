import { treeFromLevelOrder } from '../../components/shared/treeLayout.js'

export function parseInput(text) {
  const input = JSON.parse(text)
  const values = input?.root
  if (!Array.isArray(values) || values.length < 1 || values.length > 31 || values[0] === null) throw new Error('root must be a level-order array of 1 to 31 entries with a non-null root.')
  if (values.some(v => v !== null && (!Number.isInteger(v) || v < 1 || v > 50))) throw new Error('Values are integers from 1 to 50, or null.')
  if (values.filter(v => v !== null).length > 10) throw new Error('The tree may have at most 10 nodes.')
  const ordered = []
  const walk = node => { if (!node) return; walk(node.left); ordered.push(node.value); walk(node.right) }
  walk(treeFromLevelOrder(values))
  if (ordered.some((v, i) => i > 0 && v <= ordered[i - 1])) throw new Error('root is not a binary search tree with distinct values.')
  return { root: values }
}

function levelOrder(root) {
  if (!root) return []
  const out = []
  const queue = [root]
  for (let q = 0; q < queue.length; q++) {
    const node = queue[q]
    if (!node) { out.push(null); continue }
    out.push(node.value)
    queue.push(node.left, node.right)
  }
  while (out.length && out[out.length - 1] === null) out.pop()
  return out
}

export function buildTrace({ root }) {
  const tree = treeFromLevelOrder(root)
  const values = []
  const frames = [{ phase: 'start', activeLine: L('set values to the inorder'), low: 0, high: -1, mid: -1, values: [], message: 'Read the values in order. A sorted list can be split at its middle to form a balanced tree.' }]
  const visit = node => { if (!node) return; visit(node.left); values.push(node.value); visit(node.right) }
  visit(tree)
  frames.push({ phase: 'collect', activeLine: L('set balanced to build'), low: 0, high: values.length - 1, mid: -1, values: [...values], message: `Sorted values: ${values.join(', ')}.` })
  const build = (low, high) => {
    if (low > high) return null
    const mid = (low + high) >> 1
    frames.push({ phase: 'pick', activeLine: L('set mid to the middle index'), low, high, mid, values: [...values], message: `Range ${low} to ${high} uses ${values[mid]} as its root.` })
    const node = { value: values[mid], left: null, right: null }
    node.left = build(low, mid - 1)
    node.right = build(mid + 1, high)
    return node
  }
  const result = levelOrder(build(0, values.length - 1))
  frames.push({ phase: 'done', activeLine: L('return the level order'), low: 0, high: values.length - 1, mid: -1, values: [...values], message: `Balanced tree in level order: ${result.map(v => v === null ? 'null' : v).join(', ')}.` })
  return { input: { root }, root: tree, values, result, frames }
}

export const code = `balance a binary search tree (root)
  set values to the inorder values of root
  set balanced to build from zero to the last index of values
  return the level order of balanced
build from low to high
  if low is above high then return nothing
  set mid to the middle index of low and high
  make a node holding values at mid
  set its left child to build from low to mid minus one
  set its right child to build from mid plus one to high
  return the node`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def build_tree(values):
    if not values or values[0] is None:
        return None
    root = TreeNode(values[0])
    queue = [root]
    cursor = 1
    for node in queue:
        if cursor < len(values) and values[cursor] is not None:
            node.left = TreeNode(values[cursor])
            queue.append(node.left)
        cursor += 1
        if cursor < len(values) and values[cursor] is not None:
            node.right = TreeNode(values[cursor])
            queue.append(node.right)
        cursor += 1
    return root

def level_order(root):
    if root is None:
        return []
    out = []
    queue = [root]
    for node in queue:
        if node is None:
            out.append(None)
        else:
            out.append(node.val)
            queue.append(node.left)
            queue.append(node.right)
    while out and out[-1] is None:
        out.pop()
    return out

def balance_bst(root):
    values = []
    def inorder(node):
        if node is None:
            return
        inorder(node.left)
        values.append(node.val)
        inorder(node.right)
    inorder(build_tree(root))
    def make(low, high):
        if low > high:
            return None
        mid = (low + high) // 2
        node = TreeNode(values[mid])
        node.left = make(low, mid - 1)
        node.right = make(mid + 1, high)
        return node
    return level_order(make(0, len(values) - 1))
`
