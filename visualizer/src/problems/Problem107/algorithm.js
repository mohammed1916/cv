import { treeFromLevelOrder as buildTreeFromLevels } from '../../components/shared/treeLayout.js'
import { traceLevelOrder } from '../../components/shared/traceLevelOrder.js';
export function generateSteps(text) {
  return traceLevelOrder(text).map(frame=>({...frame,
    reversedLevels:frame.phase==='done'?[...frame.levels].reverse():[],
    message:frame.phase==='done'?'Reverse the order of completed levels. Keep the node order inside each level.':frame.message,
  }));
}

// ---- Binary Tree Level Order Traversal II (statement-sourced; see scratch statements/107.md) ----
export function parseInput(text) {
  const arr = JSON.parse(text)
  if (!Array.isArray(arr) || arr.length > 15) throw new Error('Use a level-order array of at most 15 entries.')
  if (arr.length && arr[0] === null) throw new Error('A level-order array must start with a value or be empty.')
  if (arr.some(v => v !== null && (!Number.isInteger(v) || Math.abs(v) > 1000))) throw new Error('Values are integers from -1000 to 1000, or null.')
  return arr
}

export function buildTrace(arr) {
  const root = buildTreeFromLevels(arr)
  const levels = []
  const frames = [{ phase: 'start', activeLine: L('set queue to [root]'), node: root ? root.id : null, levels: [], message: 'Start a queue with the root.' }]
  let queue = root ? [root] : []
  while (queue.length) {
    const width = queue.length
    const row = []
    const next = []
    for (let i = 0; i < width; i++) {
      const node = queue[i]
      row.push(node.value)
      if (node.left) next.push(node.left)
      if (node.right) next.push(node.right)
      frames.push({ phase: 'visit', activeLine: L('take every node that is in the queue now'), node: node.id, levels: levels.map(l => [...l]), message: `Visit ${node.value} and queue its children.` })
    }
    levels.push(row)
    frames.push({ phase: 'level', activeLine: L('append row to result'), node: null, levels: levels.map(l => [...l]), message: `Level ${levels.length} is [${row.join(', ')}].` })
    queue = next
  }
  const bottomUp = levels.slice().reverse()
  frames.push({ phase: 'done', activeLine: L('return result'), node: null, levels: bottomUp.map(l => [...l]), message: `${levels.length} levels, now listed from the deepest level up to the root.` })
  return { input: arr, result: bottomUp, frames }
}

export const code = `level order (root):
  set result to an empty list
  if the root is empty then return result
  set queue to [root]
  while the queue is not empty:
    set row to an empty list
    take every node that is in the queue now
    for each node taken, add its value to row
    queue the node's children for the next level
    append row to result
  reverse result so the deepest level comes first
  return result`.split('\n').map((text, index) => ({ line: index + 1, text }))
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

def level_order_bottom(root):
    result = []
    queue = [build(root)] if build(root) is not None else []
    while queue:
        row = []
        next_queue = []
        for node in queue:
            row.append(node.val)
            if node.left is not None:
                next_queue.append(node.left)
            if node.right is not None:
                next_queue.append(node.right)
        result.append(row)
        queue = next_queue
    return result[::-1]
`
