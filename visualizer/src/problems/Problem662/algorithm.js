import { treeFromLevelOrder } from '../../components/shared/treeLayout.js'

export function parseInput(text) {
  const values = JSON.parse(text)
  if (!Array.isArray(values) || values.length < 1 || values.length > 3000 || values.some(v => v !== null && (!Number.isInteger(v) || Math.abs(v) > 100))) throw new Error('Enter a LeetCode level-order array of up to 3,000 items: integers from −100 to 100 or null.')
  if (values[0] === null) throw new Error('The root cannot be null.')
  return values
}

// Number every position as in a complete binary tree (children of p are 2p and 2p+1). A level's width
// is last index − first index + 1, counting missing nodes between the outermost present nodes.
export function buildTrace(values) {
  const root = treeFromLevelOrder(values)
  const frames = [{ phase: 'start', depth: 0, width: null, best: 0, activeLine: L('set level to the list'), message: 'Assign heap positions to nodes; the width of a level spans its outermost nodes.' }]
  let best = 0
  let level = root ? [{ node: root, p: 1 }] : []
  let depth = 0
  while (level.length) {
    const width = level[level.length - 1].p - level[0].p + 1
    best = Math.max(best, width)
    frames.push({ phase: 'level', depth, width, best, first: level[0].p, last: level[level.length - 1].p, activeLine: L('set best to the larger'), message: `Level ${depth}: positions ${level[0].p}…${level[level.length - 1].p}, width ${width}.` })
    const next = []
    for (const { node, p } of level) {
      if (node.left) next.push({ node: node.left, p: 2 * p })
      if (node.right) next.push({ node: node.right, p: 2 * p + 1 })
    }
    level = next
    depth++
  }
  frames.push({ phase: 'done', depth, width: null, best, result: best, activeLine: L('return best'), message: `Maximum width: ${best}.` })
  return { input: values, result: best, frames }
}

export const code = `function widthOfBinaryTree(root):
  set best to 0
  set level to the list containing (root, position 1), or empty if root is empty
  while level is not empty:
    set best to the larger of best and (last position - first position + 1) of level
    set nxt to an empty list
    for each (node, p) in level:
      if node has a left child, append (left child, 2p) to nxt
      if node has a right child, append (right child, 2p+1) to nxt
    set level to nxt
  return best`.split('\n').map((text, index) => ({ line: index + 1, text }))
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

def width_of_binary_tree(values):
    root = build_tree(values)
    best = 0
    level = [(root, 1)] if root else []
    while level:
        best = max(best, level[-1][1] - level[0][1] + 1)
        nxt = []
        for node, p in level:
            if node.left is not None:
                nxt.append((node.left, 2 * p))
            if node.right is not None:
                nxt.append((node.right, 2 * p + 1))
        level = nxt
    return best
`
