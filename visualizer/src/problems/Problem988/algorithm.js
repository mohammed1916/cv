import { treeFromLevelOrder } from '../../components/shared/treeLayout.js'

export function parseInput(text) {
  const arr = JSON.parse(text)
  if (!Array.isArray(arr) || arr.length < 1 || arr.length > 15 || arr[0] === null) throw new Error('Use a level-order array of 1 to 15 entries with a non-null root.')
  if (arr.some(v => v !== null && (!Number.isInteger(v) || v < 0 || v > 25))) throw new Error('Values are integers from 0 to 25 (letters a to z), or null.')
  return arr
}

const letter = v => String.fromCharCode(97 + v)

export function buildTrace(arr) {
  const root = treeFromLevelOrder(arr)
  let best = null
  const frames = [{ phase: 'start', activeLine: L('set best to nothing'), node: null, path: '', best: null, message: 'Walk down from the root. At each leaf, the string reads from the leaf up to the root.' }]
  const visit = (node, path) => {
    if (!node) return
    // path holds the letters from the root down to this node; each leaf reads them in reverse.
    const next = path + letter(node.value)
    if (!node.left && !node.right) {
      const word = [...next].reverse().join('')
      if (best === null || word < best) best = word
      frames.push({ phase: 'leaf', activeLine: L('if best is unset'), node: node.id, path: next, best, message: `Leaf ${node.value} reads ${word}. Best so far: ${best}.` })
      return
    }
    frames.push({ phase: 'visit', activeLine: L('for each child'), node: node.id, path: next, best, message: `Extend the path with ${letter(node.value)}.` })
    visit(node.left, next)
    visit(node.right, next)
  }
  visit(root, '')
  frames.push({ phase: 'done', activeLine: L('return best'), node: null, path: '', best, message: `Smallest string: ${best}.` })
  return { input: arr, root: treeFromLevelOrder(arr), result: best, frames }
}

export const code = `smallest string starting from a leaf (root):
  set best to nothing
  call visit on the root with an empty path
  return best

visit(node, path):
  if node is empty then stop
  add the letter of this node to the end of path
  if this node is a leaf then
    read path backwards, from the leaf up to the root, to get a word
    if best is unset or the word is smaller than best then
      set best to the word
  otherwise
    for each child of this node, call visit on that child with path`.split('\n').map((text, index) => ({ line: index + 1, text }))
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

def smallest_from_leaf(arr):
    best = None
    def visit(node, path):
        nonlocal best
        if node is None:
            return
        path = path + chr(97 + node.val)
        if node.left is None and node.right is None:
            word = path[::-1]
            if best is None or word < best:
                best = word
            return
        for child in (node.left, node.right):
            visit(child, path)
    visit(build(arr), '')
    return best
`
