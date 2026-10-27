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
  const frames = [{ phase: 'start', activeLine: 12, current: null, prev: null, best: null, visited: [], order: [], message: 'In a BST the in-order traversal yields values in increasing order, so the closest pair must be consecutive in that order. Track only the previous value.' }]
  const stack = []
  const snap = (phase, activeLine, current, message, decision) => frames.push({ phase, activeLine, current: current ? current.id : null, prev, best: best === Infinity ? null : best, visited: [...visited], order: [...order], message, treeWalk: { kind: 'recursion', stack: stack.map(v => ({ label: `inorder(${v})` })), order: [...order], orderLabel: 'In-order values so far (sorted)', decision: decision ?? message } })
  function inorder(node) {
    if (!node) return
    stack.push(node.value)
    snap('descend', 7, node, `Visit node ${node.value}: first finish its left subtree${node.left ? ` (root ${node.left.value})` : ' (empty)'}.`)
    inorder(node.left)
    visited.push(node.id)
    order.push(node.value)
    if (prev !== null) {
      const diff = node.value - prev
      const improved = diff < best
      best = Math.min(best, diff)
      snap('visit', 9, node, `In-order visit ${node.value}: difference from previous ${prev} is ${diff}${improved ? ', a new minimum' : `, not below ${best}`}. Best so far: ${best}.`)
    } else snap('visit', 10, node, `In-order visit ${node.value}: the smallest value, nothing to compare with yet.`)
    prev = node.value
    inorder(node.right)
    stack.pop()
  }
  inorder(root)
  frames.push({ phase: 'done', activeLine: 13, current: null, prev, best, visited: [...visited], order: [...order], message: `Minimum difference between any two nodes: ${best}.` })
  return { input: [...values], root, result: best, frames }
}
export const code = `def minDiffInBST(root):
    prev, best = None, inf
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
    return best`.split('\n').map((text, index) => ({ line: index + 1, text }))
