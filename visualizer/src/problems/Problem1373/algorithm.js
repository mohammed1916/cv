import { treeFromLevelOrder } from '../../components/shared/treeLayout.js'

export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || !Array.isArray(data.tree)) throw new Error('Use an object with a level-order tree, for example {"tree":[1,4,3,2,4]}.')
  const { tree } = data
  if (tree.length < 1 || tree.length > 15 || tree[0] === null) throw new Error('tree has 1 to 15 entries and a non-null root.')
  if (tree.some(v => v !== null && (!Number.isInteger(v) || Math.abs(v) > 40))) throw new Error('Values are integers from -40 to 40, or null.')
  return { tree }
}

// An empty subtree is a BST with no values: its range is empty and its sum is 0.
const EMPTY = { ok: true, lo: Infinity, hi: -Infinity, sum: 0 }

export function buildTrace({ tree }) {
  const root = treeFromLevelOrder(tree)
  let best = 0
  const marks = {}
  const frames = [{ phase: 'start', activeLine: L('set best to 0'), node: null, marks: {}, best, message: 'An empty subtree is a BST with sum 0, so the answer is at least 0.' }]
  const walk = node => {
    if (!node) return EMPTY
    const left = walk(node.left)
    const right = walk(node.right)
    if (left.ok && right.ok && left.hi < node.value && node.value < right.lo) {
      const sum = left.sum + right.sum + node.value
      best = Math.max(best, sum)
      marks[node.id] = `BST sum ${sum}`
      frames.push({ phase: 'bst', activeLine: L('if both sides are BSTs'), node: node.id, marks: { ...marks }, best, message: `The subtree at ${node.value} is a BST with sum ${sum}. Best so far: ${best}.` })
      return { ok: true, lo: Math.min(node.value, left.lo), hi: Math.max(node.value, right.hi), sum }
    }
    marks[node.id] = 'not a BST'
    frames.push({ phase: 'reject', activeLine: L('otherwise'), node: node.id, marks: { ...marks }, best, message: `The subtree at ${node.value} is not a BST, so no sum is taken from it.` })
    return { ok: false, lo: 0, hi: 0, sum: 0 }
  }
  walk(root)
  frames.push({ phase: 'done', activeLine: L('return best'), node: null, marks: { ...marks }, best, message: `Largest BST subtree sum: ${best}.` })
  return { input: { tree }, root, result: best, frames }
}

export const code = `largest bst subtree sum:
  set best to 0
  call walk on the root
  return best

walk(node):
  if node is empty then report an empty BST with sum 0
  walk the left child and the right child
  if both sides are BSTs and the largest value on the left is below node.value and node.value is below the smallest value on the right then
    total is left sum plus right sum plus node.value
    if total is greater than best then set best to total
    report this subtree as a BST with its low, high and total
  otherwise
    report this subtree as not a BST`.split('\n').map((text, index) => ({ line: index + 1, text }))
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

def max_sum_bst(tree):
    root = build(tree)
    best = 0
    def walk(node):
        nonlocal best
        if node is None:
            return (True, float('inf'), float('-inf'), 0)
        left_ok, left_lo, left_hi, left_sum = walk(node.left)
        right_ok, right_lo, right_hi, right_sum = walk(node.right)
        if left_ok and right_ok and left_hi < node.val < right_lo:
            total = left_sum + right_sum + node.val
            best = max(best, total)
            return (True, min(node.val, left_lo), max(node.val, right_hi), total)
        return (False, 0, 0, 0)
    walk(root)
    return best
`
