import { treeFromLevelOrder } from '../../components/shared/treeLayout.js'

function checkTree(name, arr) {
  if (!Array.isArray(arr) || arr.length > 63) throw new Error(`${name} must be a level-order JSON array with at most 63 entries.`)
  if (arr.some(v => v !== null && (!Number.isInteger(v) || v < 0 || v > 99))) throw new Error(`${name} values must be integers 0 to 99 or null.`)
  if (arr.filter(v => v !== null).length > 30) throw new Error(`${name} may have at most 30 nodes (visualization cap).`)
  if (arr.length && arr[0] === null) throw new Error(`${name}: the root cannot be null; use [] for an empty tree.`)
}

export function parseInput(text) {
  const obj = JSON.parse(text)
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) throw new Error('Enter a JSON object like {"root1":[1,2,3],"root2":[1,3,2]} with level-order arrays (null = missing).')
  checkTree('root1', obj.root1)
  checkTree('root2', obj.root2)
  return { root1: obj.root1, root2: obj.root2 }
}

export function buildTrace({ root1, root2 }) {
  const tree1 = treeFromLevelOrder(root1), tree2 = treeFromLevelOrder(root2)
  const name = (n, tag) => (n ? `${tag}${n.value}` : 'null')
  const frames = [{ phase: 'start', activeLine: L('compare the pair'), a: tree1?.id ?? null, b: tree2?.id ?? null, stack: [], message: 'Compare the two roots. Two trees are flip equivalent if the roots match and the children match either straight or crossed.' }]
  const rec = (a, b, stack) => {
    const ids = { a: a ? a.id : null, b: b ? b.id : null }
    frames.push({ phase: 'visit', activeLine: L('compare the pair'), ...ids, stack: [...stack], message: `flipEquiv(${name(a, 'A')}, ${name(b, 'B')}).` })
    if (!a && !b) {
      frames.push({ phase: 'base', activeLine: L('if both are empty'), ...ids, stack: [...stack], verdict: true, message: 'Both are empty: equivalent.' })
      return true
    }
    if (!a || !b || a.value !== b.value) {
      frames.push({ phase: 'base', activeLine: L('if only one is empty'), ...ids, stack: [...stack], verdict: false,
        message: !a || !b ? 'Exactly one side is empty: not equivalent.' : `Values differ (${a.value} vs ${b.value}): not equivalent.` })
      return false
    }
    const next = [...stack, [a.id, b.id]]
    let ok = rec(a.left, b.left, next) && rec(a.right, b.right, next)
    if (!ok) {
      frames.push({ phase: 'flip', activeLine: L('if straight is false'), ...ids, stack: [...stack], message: `Straight pairing failed under ${a.value}: try crossing the children (A.left with B.right, A.right with B.left).` })
      ok = rec(a.left, b.right, next) && rec(a.right, b.left, next)
    }
    frames.push({ phase: 'return', activeLine: L('return straight, or'), ...ids, stack: [...stack], verdict: ok, message: `Subtrees at ${a.value} are ${ok ? '' : 'not '}flip equivalent.` })
    return ok
  }
  const result = rec(tree1, tree2, [])
  frames.push({ phase: 'done', activeLine: L('return straight, or'), a: null, b: null, stack: [], verdict: result, message: result ? 'The trees are flip equivalent.' : 'The trees are not flip equivalent.' })
  return { input: { root1: [...root1], root2: [...root2] }, tree1, tree2, result, frames }
}

export const code = `flipEquiv(root1, root2) decides if two trees are flip equivalent
  compare the pair (root1, root2)
  if both are empty then return true
  if only one is empty, or their values differ, then return false
  set straight to flipEquiv(left1, left2) and flipEquiv(right1, right2)
  if straight is false, then try crossing the children
  return straight, or flipEquiv(left1, right2) and flipEquiv(right1, left2)`.split('\n').map((text, index) => ({ line: index + 1, text }))
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

def flip_equiv(root1, root2):
    def same(x, y):
        if x is None and y is None:
            return True
        if x is None or y is None or x.val != y.val:
            return False
        straight = same(x.left, y.left) and same(x.right, y.right)
        if straight:
            return True
        return same(x.left, y.right) and same(x.right, y.left)
    return same(build(root1), build(root2))`
