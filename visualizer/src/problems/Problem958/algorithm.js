import { treeFromLevelOrder } from '../../components/shared/treeLayout.js'

export function parseInput(text) {
  const arr = JSON.parse(text)
  if (!Array.isArray(arr) || arr.length < 1 || arr.length > 63) throw new Error('Enter a level-order JSON array with 1 to 63 entries (null = missing).')
  if (arr.some(v => v !== null && (!Number.isInteger(v) || v < 1 || v > 1000))) throw new Error('Values must be integers 1 to 1000 or null.')
  if (arr[0] === null) throw new Error('The root cannot be null.')
  if (arr.filter(v => v !== null).length > 30) throw new Error('At most 30 nodes (visualization cap).')
  return arr
}

export function buildTrace(arr) {
  const root = treeFromLevelOrder(arr)
  const queue = [root]
  const label = n => (n ? String(n.value) : 'null')
  let seenNull = false
  const visited = []
  const frames = [{ phase: 'start', activeLine: L('start a queue'), queue: queue.map(label), visited: [], node: null, seenNull, message: 'Run BFS from the root, enqueueing missing children as nulls too. In a complete tree all real nodes come before the first null.' }]
  let result = true
  while (queue.length) {
    const node = queue.shift()
    if (!node) {
      seenNull = true
      frames.push({ phase: 'null', activeLine: L('set seenNull to true'), queue: queue.map(label), visited: [...visited], node: null, seenNull, message: 'Dequeued a null: a gap has started. Every later dequeued node must also be null.' })
      continue
    }
    if (seenNull) {
      result = false
      frames.push({ phase: 'fail', activeLine: L('if seenNull is true'), queue: queue.map(label), visited: [...visited], node: node.id, seenNull, message: `Node ${node.value} appears after a null in level order: a gap precedes it, so the tree is not complete.` })
      break
    }
    visited.push(node.id)
    queue.push(node.left, node.right)
    frames.push({ phase: 'visit', activeLine: L('add its left child'), queue: queue.map(label), visited: [...visited], node: node.id, seenNull, message: `Dequeued node ${node.value}; enqueue its left (${label(node.left)}) and right (${label(node.right)}) children.` })
  }
  frames.push({ phase: 'done', activeLine: result ? L('return true') : L('return false'), queue: [], visited: [...visited], node: null, seenNull, message: result ? 'Only nulls remain after the last node: the tree is complete.' : 'The tree is not complete.' })
  return { input: [...arr], root, result, frames }
}

export const code = `isCompleteTree(root) returns whether the tree is complete
  start a queue holding root, and set seenNull to false
  while the queue is not empty
    remove the front node from the queue
    if the node is empty, then set seenNull to true
    otherwise, if seenNull is true, then return false
    otherwise, add its left child and right child to the queue
  return true`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `from collections import deque

class TreeNode:
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

def is_complete_tree(arr):
    queue = deque([build(arr)])
    seen_null = False
    while queue:
        node = queue.popleft()
        if node is None:
            seen_null = True
        else:
            if seen_null:
                return False
            queue.append(node.left)
            queue.append(node.right)
    return True`
