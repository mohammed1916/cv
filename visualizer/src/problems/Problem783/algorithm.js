import { treeFromLevelOrder } from '../../components/shared/treeLayout.js'

export function parseInput(text) {
  const values = JSON.parse(text)
  if (!Array.isArray(values) || values.length < 2 || values.length > 63 || values.some(v => v !== null && (!Number.isInteger(v) || v < 0 || v > 100000))) throw new Error('Enter a level-order JSON array like [4,2,6,1,3] with 2-63 slots; values are integers 0..100000 or null (visualization cap: 63 slots).')
  const root = treeFromLevelOrder(values)
  if (!root) throw new Error('The root must not be null.')
  const nodes = []
  const walk = (node, lo, hi) => {
    if (!node) return
    if (node.value <= lo || node.value >= hi) throw new Error('The tree must be a binary search tree with distinct values.')
    walk(node.left, lo, node.value)
    nodes.push(node.value)
    walk(node.right, node.value, hi)
  }
  walk(root, -Infinity, Infinity)
  if (nodes.length < 2) throw new Error('The tree needs at least 2 nodes.')
  return values
}
export function buildTrace(values) {
  const root = treeFromLevelOrder(values)
  let prev = null
  let best = Infinity
  const visited = []
  const order = []
  const frames = [{ phase: 'start', pythonLine: 26, activeLine: 1, current: null, prev: null, best: null, visited: [], order: [], message: 'In a BST the in-order traversal yields values in increasing order, so the closest pair must be consecutive in that order. Track only the previous value.' }]
  const stack = []
  const snap = (phase, activeLine, pythonLine, current, message, decision) => frames.push({ phase, activeLine, pythonLine, current: current ? current.id : null, prev, best: best === Infinity ? null : best, visited: [...visited], order: [...order], message, treeWalk: { kind: 'recursion', stack: stack.map(v => ({ label: `inorder(${v})` })), order: [...order], orderLabel: 'In-order values so far (sorted)', decision: decision ?? message } })
  function inorder(node) {
    if (!node) return
    stack.push(node.value)
    snap('descend', 4, 31, node, `Visit node ${node.value}: first finish its left subtree${node.left ? ` (root ${node.left.value})` : ' (empty)'}.`)
    inorder(node.left)
    visited.push(node.id)
    order.push(node.value)
    if (prev !== null) {
      const diff = node.value - prev
      const improved = diff < best
      best = Math.min(best, diff)
      snap('visit', 6, 33, node, `In-order visit ${node.value}: difference from previous ${prev} is ${diff}${improved ? ', a new minimum' : `, not below ${best}`}. Best so far: ${best}.`)
    } else snap('visit', 7, 32, node, `In-order visit ${node.value}: the smallest value, nothing to compare with yet.`)
    prev = node.value
    inorder(node.right)
    stack.pop()
  }
  inorder(root)
  frames.push({ phase: 'done', pythonLine: 37, activeLine: 10, current: null, prev, best, visited: [...visited], order: [...order], message: `Minimum difference between any two nodes: ${best}.` })
  return { input: [...values], root, result: best, frames }
}
export const code = `set prev to none and best to infinity
define inorder(node)
  if node is empty then return
  inorder(node.left)
  if prev is not none then
    set best to min(best, node.value - prev)
  set prev to node.value
  inorder(node.right)
call inorder(root)
return best`.split('\n').map((text, index) => ({ line: index + 1, text }))
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

def min_diff_in_bst(values):
    root = build(values)
    prev, best = None, float('inf')
    def inorder(node):
        nonlocal prev, best
        if not node:
            return
        inorder(node.left)
        if prev is not None:
            best = min(best, node.val - prev)
        prev = node.val
        inorder(node.right)
    inorder(root)
    return best
`
