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

export function buildTrace({ arr, val }) {
  const root = treeFromLevelOrder(arr)
  // The solver mutates its own copy so the displayed tree keeps the original shape.
  const work = treeFromLevelOrder(arr)
  let nextId = 1000
  const frames = [{ phase: 'start', activeLine: L('def insertIntoMaxTree'), node: null, message: `Insert ${val} after [${show(arr)}]. Start at the root ${arr[0]}.` }]
  const insert = node => {
    if (!node) {
      frames.push({ phase: 'attach', activeLine: L('return TreeNode(val)'), node: null, message: `An empty spot is reached, so ${val} becomes a leaf here.` })
      return { id: nextId++, value: val, left: null, right: null }
    }
    if (val > node.value) {
      frames.push({ phase: 'wrap', activeLine: L('return TreeNode(val, root)'), node: node.id, message: `${val} is larger than ${node.value}, so it becomes the root of this subtree and ${node.value} moves to its left.` })
      return { id: nextId++, value: val, left: node, right: null }
    }
    frames.push({ phase: 'descend', activeLine: L('if val > root.val'), node: node.id, message: `${val} is not larger than ${node.value}, so it belongs somewhere in the right subtree.` })
    node.right = insert(node.right)
    frames.push({ phase: 'relink', activeLine: L('root.right = insertIntoMaxTree'), node: node.id, message: `${node.value}'s right child is now ${node.right.value}.` })
    return node
  }
  const result = levelOrder(insert(work))
  frames.push({ phase: 'done', activeLine: L('return root'), node: null, message: `New maximum tree: [${show(result)}].` })
  return { input: { arr, val }, root, resultRoot: treeFromLevelOrder(result), result, frames }
}

export const code = `def insertIntoMaxTree(root, val):
    if not root:
        return TreeNode(val)
    if val > root.val:
        return TreeNode(val, root)
    root.right = insertIntoMaxTree(root.right, val)
    return root`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1
