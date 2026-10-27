import { treeFromLevelOrder } from '../../components/shared/treeLayout.js'

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with tree, such as {"tree":[1,null,2]}.')
  const { tree: arr } = input
  if (!Array.isArray(arr) || arr.length < 1 || arr.length > 15 || arr[0] === null) throw new Error('tree must be a level-order array of 1 to 15 entries with a non-null root.')
  if (arr.some(v => v !== null && (!Number.isInteger(v) || v < 0 || v > 9))) throw new Error('Node values are integers from 0 to 9, or null.')
  return { tree: arr }
}

export const code = `longest zigzag path in a binary tree, counted in edges
  set best to zero
  for each node v from the bottom up
    set leftRun of v to one plus the rightRun of its left child, or zero without a left child
    set rightRun of v to one plus the leftRun of its right child, or zero without a right child
    set best to the larger of best, leftRun and rightRun
  return best`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export function buildTrace({ tree }) {
  const root = treeFromLevelOrder(tree)
  let best = 0
  const runs = {}
  const frames = [{ phase: 'start', activeLine: L('set best to zero'), current: null, runs: {}, best: 0, message: 'Start with a best length of 0; a single node has no edges.' }]
  const walk = node => {
    if (!node) return null
    const leftInfo = walk(node.left)
    const rightInfo = walk(node.right)
    const leftRun = leftInfo ? 1 + leftInfo.rightRun : 0
    const rightRun = rightInfo ? 1 + rightInfo.leftRun : 0
    runs[node.id] = { leftRun, rightRun }
    best = Math.max(best, leftRun, rightRun)
    frames.push({ phase: 'measure', activeLine: L('set leftRun of v'), current: node.id, runs: { ...runs }, best, message: `Node ${node.value}: a zigzag starting left has ${leftRun} edges, starting right has ${rightRun}.` })
    return { leftRun, rightRun }
  }
  walk(root)
  frames.push({ phase: 'done', activeLine: L('return best'), current: null, runs: { ...runs }, best, message: `Longest zigzag path: ${best} edges.` })
  return { input: { tree }, root, result: best, frames }
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

def longest_zigzag(tree):
    root = build(tree)
    best = 0

    def walk(current):
        nonlocal best
        if current is None:
            return None
        left_info = walk(current.left)
        right_info = walk(current.right)
        left_run = 1 + left_info[1] if left_info else 0
        right_run = 1 + right_info[0] if right_info else 0
        best = max(best, left_run, right_run)
        return left_run, right_run

    walk(root)
    return best
`
