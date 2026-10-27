import { treeFromLevelOrder } from '../../components/shared/treeLayout.js'

export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || !Array.isArray(data.tree) || !Number.isInteger(data.distance)) throw new Error('Use an object such as {"tree":[1,2,3,null,4],"distance":3}.')
  const { tree, distance } = data
  if (tree.length < 1 || tree.length > 15 || tree[0] === null) throw new Error('tree has 1 to 15 entries and a non-null root.')
  if (tree.some(v => v !== null && (!Number.isInteger(v) || v < 1 || v > 99))) throw new Error('Node values are integers from 1 to 99, or null.')
  if (distance < 1 || distance > 10) throw new Error('distance is an integer from 1 to 10.')
  return { tree, distance }
}

export function buildTrace({ tree, distance }) {
  const root = treeFromLevelOrder(tree)
  let pairs = 0
  const marks = {}
  const frames = [{ phase: 'start', activeLine: L('set pairs to 0'), node: null, marks: {}, pairs, message: `Count pairs of leaves whose path has at most ${distance} edges.` }]
  // counts[d] is the number of leaves exactly d edges below this node.
  const walk = node => {
    if (!node) return []
    if (!node.left && !node.right) {
      marks[node.id] = 'leaf'
      frames.push({ phase: 'leaf', activeLine: L('if node is a leaf'), node: node.id, marks: { ...marks }, pairs, message: `Leaf ${node.value} has one leaf at depth 0.` })
      return [1]
    }
    const left = [0, ...walk(node.left)]
    const right = [0, ...walk(node.right)]
    let added = 0
    for (let a = 0; a < left.length; a++) {
      for (let b = 0; b < right.length; b++) {
        if (a + b <= distance) added += left[a] * right[b]
      }
    }
    pairs += added
    const merged = new Array(Math.max(left.length, right.length)).fill(0)
    left.forEach((count, d) => { merged[d] += count })
    right.forEach((count, d) => { merged[d] += count })
    marks[node.id] = `depths ${merged.map((c, d) => (c ? `${d}:${c}` : '')).filter(Boolean).join(' ') || 'none'}`
    frames.push({ phase: 'merge', activeLine: L('if a plus b is at most distance'), node: node.id, marks: { ...marks }, pairs, message: `Node ${node.value} adds ${added} good pairs that meet here. Total: ${pairs}.` })
    return merged
  }
  walk(root)
  frames.push({ phase: 'done', activeLine: L('return pairs'), node: null, marks: { ...marks }, pairs, message: `Good leaf pairs: ${pairs}.` })
  return { input: { tree, distance }, root, result: pairs, frames }
}

export const code = `count good leaf pairs:
  set pairs to 0
  call walk on the root
  return pairs

walk(node):
  if node is empty then return no leaves
  if node is a leaf then return one leaf at depth 0
  left is the depth counts of the left child, each depth plus one
  right is the depth counts of the right child, each depth plus one
  for each depth a in left and depth b in right:
    if a plus b is at most distance then add their leaf counts to pairs
  return the combined depth counts of left and right`.split('\n').map((text, index) => ({ line: index + 1, text }))
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

def good_leaf_pairs(tree, distance):
    root = build(tree)
    pairs = 0
    def walk(node):
        nonlocal pairs
        if node is None:
            return []
        if node.left is None and node.right is None:
            return [1]
        left = [0] + walk(node.left)
        right = [0] + walk(node.right)
        for a in range(len(left)):
            for b in range(len(right)):
                if a + b <= distance:
                    pairs += left[a] * right[b]
        merged = [0] * max(len(left), len(right))
        for d in range(len(left)):
            merged[d] += left[d]
        for d in range(len(right)):
            merged[d] += right[d]
        return merged
    walk(root)
    return pairs
`
