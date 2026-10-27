import { treeFromLevelOrder } from '../../components/shared/treeLayout.js'

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object such as {"arr": [4, 1, 3], "val": 5}.')
  const { arr, val } = input
  if (!Array.isArray(arr) || arr.length < 1 || arr.length > 12 || arr[0] === null) throw new Error('arr must be a level-order maximum tree of 1 to 12 entries with a non-null root.')
  if (arr.some(v => v !== null && (!Number.isInteger(v) || v < 1 || v > 100))) throw new Error('arr values are integers from 1 to 100, or null.')
  const present = arr.filter(v => v !== null)
  if (new Set(present).size !== present.length) throw new Error('arr values must be distinct.')
  // Level order only pairs children with non-null parents, so a value can be dropped by the tree builder.
  let count = 0
  const stack = [treeFromLevelOrder(arr)]
  while (stack.length) {
    const node = stack.pop()
    if (!node) continue
    count++
    for (const child of [node.left, node.right]) {
      if (child && child.value > node.value) throw new Error('arr must be a maximum tree: every parent must be larger than its children.')
      stack.push(child)
    }
  }
  if (count !== present.length) throw new Error('An entry sits under a missing parent, so it would not be part of the tree.')
  if (!Number.isInteger(val) || val < 1 || val > 100 || present.includes(val)) throw new Error('val must be an integer from 1 to 100 that is not already in arr.')
  return { arr, val }
}

const show = list => list.map(v => (v === null ? 'null' : v)).join(', ')

/** Serializes a binary tree to level order, with trailing nulls trimmed. */
export function levelOrder(root) {
  const out = []
  const queue = [root]
  for (let i = 0; i < queue.length; i++) {
    const node = queue[i]
    if (node) {
      out.push(node.value)
      queue.push(node.left, node.right)
    } else {
      out.push(null)
    }
  }
  while (out.length && out[out.length - 1] === null) out.pop()
  return out
}

const snapshot = node => node && { id: node.id, value: node.value, left: snapshot(node.left), right: snapshot(node.right) }

export function buildTrace({ arr, val }) {
  const root = treeFromLevelOrder(arr)
  // The solver mutates its own copy; each frame keeps a snapshot of the tree as it stands at that step.
  let work = treeFromLevelOrder(arr)
  let nextId = 1000
  const newId = nextId
  const frames = []
  const record = (phase, activeLine, node, message) => {
    frames.push({ phase, activeLine, node, newId, tree: snapshot(work), message })
  }
  record('start', L('def insertIntoMaxTree'), null, `Insert ${val} after [${show(arr)}]. Start at the root ${arr[0]}.`)
  // Attach the returned subtree where it came from: under `parent` on `side`, or as the new root.
  const attach = (parent, side, child) => {
    if (parent) parent[side] = child
    else work = child
  }
  const insert = (node, parent, side) => {
    if (!node) {
      const leaf = { id: nextId++, value: val, left: null, right: null }
      attach(parent, side, leaf)
      record('attach', L('return a new node with value val'), leaf.id, `An empty spot is reached, so ${val} becomes a leaf here.`)
      return leaf
    }
    if (val > node.value) {
      const wrapper = { id: nextId++, value: val, left: node, right: null }
      attach(parent, side, wrapper)
      record('wrap', L('whose left child is root'), wrapper.id, `${val} is larger than ${node.value}, so it becomes the root of this subtree and ${node.value} moves to its left.`)
      return wrapper
    }
    record('descend', L('if val is greater than root'), node.id, `${val} is not larger than ${node.value}, so it belongs somewhere in the right subtree.`)
    insert(node.right, node, 'right')
    record('relink', L('root.right = insertIntoMaxTree'), node.id, `${node.value}'s right child is now the subtree that contains ${val}.`)
    return node
  }
  insert(work, null, null)
  const result = levelOrder(work)
  record('done', L('return root'), newId, `New maximum tree: [${show(result)}].`)
  return { input: { arr, val }, root, result, frames }
}

export const code = `insertIntoMaxTree(root, val):
  if root is empty:
    return a new node with value val
  if val is greater than root's value:
    return a new node with value val whose left child is root
  root.right = insertIntoMaxTree(root.right, val)
  return root`.split('\n').map((text, index) => ({ line: index + 1, text }))
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

def level_order(root):
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

def insert_into_max_tree(arr, val):
    def insert(node):
        if node is None:
            return TreeNode(val)
        if val > node.val:
            return TreeNode(val, node)
        node.right = insert(node.right)
        return node
    return level_order(insert(build(arr)))`
