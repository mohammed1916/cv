import { traceLevelOrder as generateSteps } from '../../components/shared/traceLevelOrder.js';
export { generateSteps };

// ---- Binary Tree Level Order Traversal (statement-sourced; see scratch statements/102.md) ----
export function parseInput(text) {
  let arr = text
  if (typeof arr === 'string') {
    try { arr = JSON.parse(arr) } catch { throw new Error('Use a JSON level-order array, such as [3,9,20,null,null,15,7].') }
  }
  if (arr && typeof arr === 'object' && !Array.isArray(arr) && 'arr' in arr) arr = arr.arr
  if (!Array.isArray(arr) || arr.length > 15) throw new Error('Use a level-order array of at most 15 entries.')
  if (arr.length && arr[0] === null) throw new Error('A level-order array must start with a value or be empty.')
  if (arr.some(v => v !== null && (!Number.isInteger(v) || Math.abs(v) > 1000))) throw new Error('Values are integers from -1000 to 1000, or null.')
  return arr
}

// traceLevelOrder owns the queue snapshots. Each frame is mapped to the pseudocode line in `code`.
const PSEUDO_LINE_FOR_LEGACY = { 3: 3, 4: 4, 7: 6, 8: 7, 9: 8, 10: 9, 11: 9, 12: 10, 13: 11 }

export function buildTrace(input) {
  const arr = parseInput(input)
  const legacy = generateSteps(JSON.stringify(arr))
  const frames = legacy.map(frame => ({
    ...frame,
    legacyLine: frame.activeLine,
    activeLine: PSEUDO_LINE_FOR_LEGACY[frame.activeLine],
    explanation: frame.message,
  }))
  return { input: arr, result: legacy.at(-1).levels, frames }
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
  return result`.split('\n').map((text, index) => ({ line: index + 1, text }))

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

def level_order(root):
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
    return result
`

// Maps each pseudocode activeLine to the Python line that performs the same action.
export const pythonLineMap = {
  2: 25,
  3: 26,
  4: 26,
  5: 27,
  6: 28,
  7: 30,
  8: 31,
  9: 32,
  10: 36,
  11: 38,
}
