import { treeFromLevelOrder } from '../../components/shared/treeLayout.js'

export function parseInput(text) {
  const arr = JSON.parse(text)
  if (!Array.isArray(arr) || arr.length < 1 || arr.length > 15 || arr[0] === null) throw new Error('Use a level-order array of 1 to 15 entries with a non-null root.')
  if (arr.some(v => v !== null && (!Number.isInteger(v) || v < 0 || v > 99))) throw new Error('Values are integers from 0 to 99, or null.')
  return arr
}

export const code = `largest difference between a node and one of its ancestors
  set best to zero
  call visit on the root with no ancestor range
  visit(node, low, high) where low and high bound the ancestor values
  if node is empty then stop
  if there are ancestors then compare the node with low and high by absolute gaps
  update best with the larger of those absolute gaps
  narrow the range to include this value
  visit the left child and the right child with the new range
  return best`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export function buildTrace(arr) {
  const root = treeFromLevelOrder(arr)
  let best = 0
  const frames = [{ phase: 'start', activeLine: L('set best to zero'), node: null, best, message: 'Walk down from the root, keeping the smallest and largest ancestor value.' }]
  const visit = (node, low, high) => {
    if (!node) return
    if (low !== null) {
      const gap = Math.max(Math.abs(node.value - low), Math.abs(node.value - high))
      best = Math.max(best, gap)
      frames.push({ phase: 'compare', activeLine: L('if there are ancestors'), node: node.id, best, message: `Node ${node.value} differs from its ancestors by up to ${gap}.` })
    } else {
      frames.push({ phase: 'visit', activeLine: L('if node is empty'), node: node.id, best, message: `Root ${node.value} has no ancestors yet.` })
    }
    const newLow = low === null ? node.value : Math.min(low, node.value)
    const newHigh = high === null ? node.value : Math.max(high, node.value)
    visit(node.left, newLow, newHigh)
    visit(node.right, newLow, newHigh)
  }
  visit(root, null, null)
  frames.push({ phase: 'done', activeLine: L('return best'), node: null, best, message: `Largest difference: ${best}.` })
  return { input: arr, root: treeFromLevelOrder(arr), result: best, frames }
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

def max_ancestor_diff(arr):
    best = 0

    def visit(node, low, high):
        nonlocal best
        if node is None:
            return
        if low is not None:
            best = max(best, abs(node.val - low), abs(node.val - high))
        new_low = node.val if low is None else min(low, node.val)
        new_high = node.val if high is None else max(high, node.val)
        visit(node.left, new_low, new_high)
        visit(node.right, new_low, new_high)

    visit(build(arr), None, None)
    return best
`
