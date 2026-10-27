import { treeFromLevelOrder } from '../../components/shared/treeLayout.js'

export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || !Array.isArray(data.tree)) throw new Error('Use an object with a level-order tree, for example {"tree":[4,8,5,0,1]}.')
  const { tree } = data
  if (tree.length < 1 || tree.length > 15 || tree[0] === null) throw new Error('tree has 1 to 15 entries and a non-null root.')
  if (tree.some(v => v !== null && (!Number.isInteger(v) || v < 0 || v > 50))) throw new Error('Node values are integers from 0 to 50, or null.')
  return { tree }
}

export function buildTrace({ tree }) {
  const root = treeFromLevelOrder(tree)
  let count = 0
  const marks = {}
  const frames = [{ phase: 'start', activeLine: L('set count to 0'), node: null, marks: {}, count, message: 'Walk up from the leaves. Each subtree reports its sum and its size.' }]
  const walk = node => {
    if (!node) return { sum: 0, size: 0 }
    const left = walk(node.left)
    const right = walk(node.right)
    const total = left.sum + right.sum + node.value
    const size = left.size + right.size + 1
    const match = Math.floor(total / size) === node.value
    if (match) count++
    marks[node.id] = `${match ? 'match' : 'no'} ${total}/${size}`
    frames.push({ phase: 'subtree', activeLine: L('if total divided'), node: node.id, marks: { ...marks }, count, message: `Subtree at ${node.value}: sum ${total}, size ${size}, floored average ${Math.floor(total / size)}. ${match ? 'It matches the node value.' : 'It does not match.'}` })
    return { sum: total, size }
  }
  walk(root)
  frames.push({ phase: 'done', activeLine: L('return count'), node: null, marks: { ...marks }, count, message: `Nodes equal to their subtree average: ${count}.` })
  return { input: { tree }, root, result: count, frames }
}

export const code = `count nodes equal to their subtree average:
  set count to 0
  call walk on the root
  return count

walk(node):
  if node is empty then return a sum of 0 and a size of 0
  get the sum and size of the left subtree
  get the sum and size of the right subtree
  total is the left sum plus right sum plus node.value
  size is the left size plus right size plus 1
  if total divided by size, rounded down, equals node.value then add 1 to count
  return total and size`.split('\n').map((text, index) => ({ line: index + 1, text }))
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

def count_average_nodes(tree):
    root = build(tree)
    count = 0
    def walk(node):
        nonlocal count
        if node is None:
            return (0, 0)
        left_sum, left_size = walk(node.left)
        right_sum, right_size = walk(node.right)
        total = left_sum + right_sum + node.val
        size = left_size + right_size + 1
        if total // size == node.val:
            count += 1
        return (total, size)
    walk(root)
    return count
`
