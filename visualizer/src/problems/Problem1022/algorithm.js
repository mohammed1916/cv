import { treeFromLevelOrder } from '../../components/shared/treeLayout.js'

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input) || !Array.isArray(input.root)) throw new Error('Use an object with a "root" level-order array.')
  const { root } = input
  if (root.length < 1 || root.length > 15) throw new Error('root must have 1 to 15 entries.')
  if (root[0] === null) throw new Error('The root must not be null.')
  if (root.some(v => v !== null && v !== 0 && v !== 1)) throw new Error('Node values are 0 or 1, or null for a missing child.')
  return { root }
}

export function buildTrace({ root }) {
  const tree = treeFromLevelOrder(root)
  const frames = []
  let total = 0
  frames.push({ phase: 'start', activeLine: L('set total to 0'), node: null, path: 0, total, message: 'Start at the root with an empty binary number.' })
  const visit = (current, path) => {
    if (!current) return
    const bits = path * 2 + current.value
    if (!current.left && !current.right) {
      total += bits
      frames.push({ phase: 'leaf', activeLine: L('add the value to total'), node: current.id, path: bits, total, message: `Leaf reads ${bits.toString(2)} = ${bits}. Total is now ${total}.` })
      return
    }
    frames.push({ phase: 'visit', activeLine: L('visit the left child'), node: current.id, path: bits, total, message: `Extend the path with ${current.value}, giving ${bits.toString(2)}.` })
    visit(current.left, bits)
    visit(current.right, bits)
  }
  visit(tree, 0)
  frames.push({ phase: 'done', activeLine: L('return total'), node: null, path: 0, total, message: `Sum of all root-to-leaf numbers: ${total}.` })
  return { input: { root }, root: tree, result: total, frames }
}

export const code = `sum of root-to-leaf binary numbers
  set total to 0
  call visit on the root with a path value of 0
  return total

visit a node with a path value
  if the node is empty then stop
  set bits to path times 2 plus the node value
  if the node is a leaf then
    add the value to total
  otherwise
    visit the left child with bits
    visit the right child with bits`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def build(values):
    if not values or values[0] is None:
        return None
    root = TreeNode(values[0])
    queue = [root]
    cursor = 1
    for owner in queue:
        if cursor < len(values) and values[cursor] is not None:
            owner.left = TreeNode(values[cursor])
            queue.append(owner.left)
        cursor += 1
        if cursor < len(values) and values[cursor] is not None:
            owner.right = TreeNode(values[cursor])
            queue.append(owner.right)
        cursor += 1
    return root

def sum_root_to_leaf(root):
    def visit(current, path):
        if current is None:
            return 0
        bits = path * 2 + current.val
        if current.left is None and current.right is None:
            return bits
        return visit(current.left, bits) + visit(current.right, bits)
    return visit(build(root), 0)
`
