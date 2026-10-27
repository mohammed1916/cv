import { treeFromLevelOrder } from '../../components/shared/treeLayout.js'

export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Use an object with root (level-order array) and target.')
  const { root, target } = data
  if (!Array.isArray(root) || root.length < 1 || root.length > 15 || root[0] === null) throw new Error('root is a level-order array of 1 to 15 entries with a non-null root.')
  const values = root.filter(v => v !== null)
  if (values.some(v => !Number.isInteger(v) || v < 1 || v > 20) || new Set(values).size !== values.length) throw new Error('Tree values are distinct integers from 1 to 20.')
  const attached = []
  const collect = node => { if (!node) return; attached.push(node.value); collect(node.left); collect(node.right) }
  collect(treeFromLevelOrder(root))
  if (!attached.includes(target)) throw new Error('target must be a value that appears in the tree.')
  return { root, target }
}

// The clone has the same shape, so the same left and right path finds the corresponding node in it.
export function buildTrace({ root, target }) {
  const original = treeFromLevelOrder(root)
  const clone = treeFromLevelOrder(root)
  const frames = [{ phase: 'start', activeLine: L('set the answer to the path'), active: null, path: '', message: `Search the original tree for ${target}, recording the path of left and right turns.` }]
  const search = (node, path) => {
    if (!node) return null
    frames.push({ phase: 'visit', activeLine: L('if this node has the target value'), active: node.id, path, message: `Visit ${node.value} at path ${path || 'root'}.` })
    if (node.value === target) {
      frames.push({ phase: 'found', activeLine: L('return path'), active: node.id, path, message: `Found ${target} at path ${path || 'root'}. The clone has the same path.` })
      return path
    }
    const left = search(node.left, path + 'L')
    if (left !== null) return left
    return search(node.right, path + 'R')
  }
  const result = search(original, '')
  const cloneNode = (() => {
    let cur = clone
    for (const turn of result) cur = turn === 'L' ? cur.left : cur.right
    return cur
  })()
  frames.push({ phase: 'done', activeLine: L('return the answer'), active: cloneNode.id, path: result, message: `Corresponding node in the clone: value ${cloneNode.value}, path ${result || 'root'}.` })
  return { input: { root, target }, display: original, result, frames }
}

export const code = `position in the clone of the node that holds the target
  set the answer to the path found by searching from the root with an empty path
  return the answer

search(node, path)
  if the node is empty then
    return nothing
  if this node has the target value then
    return path
  set found to search of the left child with path plus L
  if found is not nothing then
    return found
  return search of the right child with path plus R`.split('\n').map((text, index) => ({ line: index + 1, text }))
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

def find_corresponding_path(root, target):
    def search(current, path):
        if current is None:
            return None
        if current.val == target:
            return path
        found = search(current.left, path + "L")
        if found is not None:
            return found
        return search(current.right, path + "R")

    return search(build(root), "")
`
