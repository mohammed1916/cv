import { treeFromLevelOrder } from '../../components/shared/treeLayout.js'

export function parseInput(text) {
  const input = JSON.parse(text)
  const values = input?.root
  if (!Array.isArray(values) || values.length < 1 || values.length > 15 || values[0] === null) throw new Error('root must be a level-order array of 1 to 15 entries with a non-null root.')
  if (values.some(v => v !== null && (!Number.isInteger(v) || v < 0 || v > 50))) throw new Error('Values are integers from 0 to 50, or null.')
  if (values.filter(v => v !== null).length > 10) throw new Error('The tree may have at most 10 nodes.')
  const ordered = []
  const walk = node => { if (!node) return; walk(node.left); ordered.push(node.value); walk(node.right) }
  walk(treeFromLevelOrder(values))
  if (ordered.some((v, i) => i > 0 && v <= ordered[i - 1])) throw new Error('root is not a binary search tree with distinct values.')
  return { root: values }
}

function levelOrder(root) {
  if (!root) return []
  const out = []
  const queue = [root]
  for (let q = 0; q < queue.length; q++) {
    const node = queue[q]
    if (!node) { out.push(null); continue }
    out.push(node.value)
    queue.push(node.left, node.right)
  }
  while (out.length && out[out.length - 1] === null) out.pop()
  return out
}

export function buildTrace({ root }) {
  const tree = treeFromLevelOrder(root)
  const work = treeFromLevelOrder(root)
  const frames = [{ phase: 'start', activeLine: L('set running to zero'), node: null, original: null, running: 0, message: 'Visit the largest values first. Each node receives the running sum of everything visited so far.' }]
  let running = 0
  const visit = node => {
    if (!node) return
    visit(node.right)
    const original = node.value
    running += original
    node.value = running
    frames.push({ phase: 'visit', activeLine: L('add the node value'), node: node.id, original, running, message: `Node ${original} stores ${running}, the sum of values at least ${original}.` })
    visit(node.left)
  }
  visit(work)
  const result = levelOrder(work)
  frames.push({ phase: 'done', activeLine: L('return the level order'), node: null, original: null, running, message: `Converted tree in level order: ${result.map(v => v === null ? 'null' : v).join(', ')}.` })
  return { input: { root }, root: tree, result, frames }
}

export const code = `greater sum tree (root)
  set running to zero
  visit(root) to replace each value with the sum of values at least as large
  return the level order of the converted tree
visit(node)
  if node is empty then stop
  visit the right child first
  add the node value to running and store running in the node
  visit the left child last`.split('\n').map((text, index) => ({ line: index + 1, text }))
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

def level_order(root):
    if root is None:
        return []
    out = []
    queue = [root]
    for node in queue:
        if node is None:
            out.append(None)
        else:
            out.append(node.val)
            queue.append(node.left)
            queue.append(node.right)
    while out and out[-1] is None:
        out.pop()
    return out

def bst_to_greater_sum(root):
    tree = build_tree(root)
    running = 0
    def visit(node):
        nonlocal running
        if node is None:
            return
        visit(node.right)
        running += node.val
        node.val = running
        visit(node.left)
    visit(tree)
    return level_order(tree)
`
