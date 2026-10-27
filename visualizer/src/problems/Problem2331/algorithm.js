import { treeFromLevelOrder } from '../../components/shared/treeLayout.js'

export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Use an object with root (level-order array).')
  const { root } = data
  if (!Array.isArray(root) || root.length < 1 || root.length > 15 || root[0] === null) throw new Error('root is a level-order array of 1 to 15 entries with a non-null root.')
  const check = node => {
    if (!node.left && !node.right) {
      if (node.value !== 0 && node.value !== 1) throw new Error('Leaves hold 0 (false) or 1 (true).')
      return
    }
    if (!node.left || !node.right) throw new Error('Every internal node needs exactly two children.')
    if (node.value !== 2 && node.value !== 3) throw new Error('Internal nodes hold 2 (OR) or 3 (AND).')
    check(node.left)
    check(node.right)
  }
  check(treeFromLevelOrder(root))
  return { root }
}

export function buildTrace({ root }) {
  const tree = treeFromLevelOrder(root)
  const values = {}
  const frames = [{ phase: 'start', activeLine: L('return evaluate of the root'), node: null, values: {}, message: 'Evaluate from the root. A leaf is its own value; an internal node combines its two children.' }]
  const evaluate = node => {
    if (!node.left && !node.right) {
      const result = node.value === 1
      values[node.id] = result
      frames.push({ phase: 'leaf', activeLine: L('if this node is a leaf'), node: node.id, values: { ...values }, message: `Leaf ${node.value} is ${result}.` })
      return result
    }
    const left = evaluate(node.left)
    const right = evaluate(node.right)
    const result = node.value === 2 ? left || right : left && right
    values[node.id] = result
    frames.push({ phase: 'combine', activeLine: L(node.value === 2 ? 'if this node is the OR operation' : 'return left and right'), node: node.id, values: { ...values }, message: `${node.value === 2 ? 'OR' : 'AND'} of ${left} and ${right} is ${result}.` })
    return result
  }
  const result = evaluate(tree)
  frames.push({ phase: 'done', activeLine: L('return evaluate of the root'), node: null, values: { ...values }, message: `The root evaluates to ${result}.` })
  return { input: { root }, display: tree, result, frames }
}

export const code = `value of a boolean tree
  return evaluate of the root

evaluate of a node
  if this node is a leaf then
    return true when its value is 1, otherwise false
  set left to evaluate of the left child
  set right to evaluate of the right child
  if this node is the OR operation then
    return left or right
  otherwise
    return left and right`.split('\n').map((text, index) => ({ line: index + 1, text }))
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

def evaluate_boolean_tree(root):
    def evaluate(current):
        if current.left is None and current.right is None:
            return current.val == 1
        left = evaluate(current.left)
        right = evaluate(current.right)
        if current.val == 2:
            return left or right
        return left and right
    return evaluate(build(root))
`
