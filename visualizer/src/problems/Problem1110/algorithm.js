import { treeFromLevelOrder } from '../../components/shared/treeLayout.js'

export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Use an object with root (level-order array) and to_delete (an array).')
  const { root, to_delete } = data
  if (!Array.isArray(root) || root.length < 1 || root.length > 15 || root[0] === null) throw new Error('root is a level-order array of 1 to 15 entries with a non-null root.')
  const values = root.filter(v => v !== null)
  if (values.some(v => !Number.isInteger(v) || v < 1 || v > 15) || new Set(values).size !== values.length) throw new Error('Tree values are distinct integers from 1 to 15.')
  if (!Array.isArray(to_delete) || to_delete.length > 6 || to_delete.some(v => !Number.isInteger(v) || v < 1 || v > 15) || new Set(to_delete).size !== to_delete.length) throw new Error('to_delete holds up to 6 distinct integers from 1 to 15.')
  return { root, to_delete }
}

export function serialize(top) {
  const out = []
  const queue = [top]
  for (let i = 0; i < queue.length; i++) {
    const n = queue[i]
    if (!n) {
      out.push(null)
      continue
    }
    out.push(n.value)
    queue.push(n.left, n.right)
  }
  while (out.length && out[out.length - 1] === null) out.pop()
  return out
}

export function buildTrace({ root, to_delete }) {
  const display = treeFromLevelOrder(root)
  const work = treeFromLevelOrder(root)
  const doomed = new Set(to_delete)
  const deleted = []
  const mark = node => {
    if (!node) return
    if (doomed.has(node.value)) deleted.push(node.id)
    mark(node.left)
    mark(node.right)
  }
  mark(display)
  const forest = []
  const frames = [{ phase: 'start', activeLine: L('set the forest to empty'), active: null, roots: [], deleted, message: `Delete the values ${to_delete.join(', ') || 'none'}. Each node that survives below a deleted parent starts a new tree.` }]
  const walk = (node, parentDeleted) => {
    if (!node) return null
    const gone = doomed.has(node.value)
    if (!gone && parentDeleted) {
      forest.push(node)
      frames.push({ phase: 'root', activeLine: L('add the node to the forest as a new tree'), active: node.id, roots: forest.map(n => n.id), deleted, message: `Node ${node.value} starts a new tree.` })
    } else {
      frames.push({ phase: 'visit', activeLine: L('set gone to whether'), active: node.id, roots: forest.map(n => n.id), deleted, message: gone ? `Node ${node.value} is deleted.` : `Node ${node.value} stays in its tree.` })
    }
    node.left = walk(node.left, gone)
    node.right = walk(node.right, gone)
    return gone ? null : node
  }
  walk(work, true)
  const result = forest.map(serialize)
  frames.push({ phase: 'done', activeLine: L('return the forest'), active: null, roots: forest.map(n => n.id), deleted, message: `${result.length} trees remain.` })
  return { input: { root, to_delete }, display, result, frames }
}

export const code = `trees left after deleting the listed values
  set the forest to empty
  walk the root with parent deleted set to true
  return the forest

walk of a node with parent deleted
  if the node is empty then
    return nothing
  set gone to whether the node value is in to_delete
  if not gone and parent deleted then
    add the node to the forest as a new tree
  walk the left child with parent deleted set to gone
  walk the right child with parent deleted set to gone
  if gone then return nothing, otherwise return the node`.split('\n').map((text, index) => ({ line: index + 1, text }))
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

def serialize(top):
    out = []
    queue = [top]
    i = 0
    while i < len(queue):
        current = queue[i]
        i += 1
        if current is None:
            out.append(None)
            continue
        out.append(current.val)
        queue.append(current.left)
        queue.append(current.right)
    while out and out[-1] is None:
        out.pop()
    return out

def forest_after_deleting(root, to_delete):
    doomed = set(to_delete)
    forest = []

    def walk(current, parent_deleted):
        if current is None:
            return None
        gone = current.val in doomed
        if not gone and parent_deleted:
            forest.append(current)
        current.left = walk(current.left, gone)
        current.right = walk(current.right, gone)
        return None if gone else current

    walk(build(root), True)
    return [serialize(tree) for tree in forest]
`
