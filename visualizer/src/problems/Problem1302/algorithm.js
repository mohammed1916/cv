import { treeFromLevelOrder } from '../../components/shared/treeLayout.js'

export function parseInput(text) {
  const arr = JSON.parse(text)
  if (!Array.isArray(arr) || arr.length < 1 || arr.length > 15 || arr[0] === null) throw new Error('Use a level-order array of 1 to 15 entries with a non-null root.')
  if (arr.some(v => v !== null && (!Number.isInteger(v) || v < 1 || v > 100))) throw new Error('Values are integers from 1 to 100, or null.')
  return arr
}

export function buildTrace(arr) {
  const root = treeFromLevelOrder(arr)
  const frames = [{ phase: 'start', activeLine: L('set level to just the root'), ids: [], depth: 0, sum: 0, message: 'Start with the root as the only node on level 0.' }]
  let level = [root]
  let depth = 0
  let total
  for (;;) {
    total = level.reduce((a, n) => a + n.value, 0)
    frames.push({ phase: 'level', activeLine: L('set total to the sum'), ids: level.map(n => n.id), depth, sum: total, message: `Level ${depth} has ${level.length} node(s) with sum ${total}.` })
    const next = []
    for (const n of level) { if (n.left) next.push(n.left); if (n.right) next.push(n.right) }
    if (next.length === 0) break
    level = next
    depth++
  }
  frames.push({ phase: 'done', activeLine: L('return total'), ids: [], depth, sum: total, message: `The deepest level is ${depth}, and its sum is ${total}.` })
  return { input: arr, root, result: total, frames }
}

export const code = `deepest leaves sum of a binary tree:
  set level to just the root
  repeat
    set total to the sum of the values in level
    set next to the children of every node in level
    if next is empty then stop
    set level to the next list of nodes
  return total`.split('\n').map((text, index) => ({ line: index + 1, text }))
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

def deepest_leaves_sum(arr):
    level = [build(arr)]
    total = 0
    while True:
        total = sum(n.val for n in level)
        nxt = []
        for n in level:
            if n.left is not None:
                nxt.append(n.left)
            if n.right is not None:
                nxt.append(n.right)
        if not nxt:
            break
        level = nxt
    return total
`
