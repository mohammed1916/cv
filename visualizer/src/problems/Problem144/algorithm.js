export const phases = [
  { id: 'setup', label: 'Start stack', description: 'Put the root on an explicit stack instead of using recursion.' },
  { id: 'visit', label: 'Pop and record', description: 'Pop the top node and record its value before anything below it.' },
  { id: 'push', label: 'Push children', description: 'Push the right child first so the left child is popped next.' },
  { id: 'answer', label: 'Answer', description: 'The stack is empty, so every node has been recorded in preorder.' },
]

const PYTHON = `class TreeNode:
    def __init__(self, val):
        self.val = val
        self.left = None
        self.right = None

def build(values):
    if not values or values[0] is None:
        return None
    root = TreeNode(values[0])
    queue, i = [root], 1
    while queue and i < len(values):
        node = queue.pop(0)
        if values[i] is not None:
            node.left = TreeNode(values[i])
            queue.append(node.left)
        i += 1
        if i < len(values) and values[i] is not None:
            node.right = TreeNode(values[i])
            queue.append(node.right)
        i += 1
    return root

def preorder(values):
    root = build(values)
    if root is None:
        return []
    stack, out = [root], []
    while stack:
        node = stack.pop()
        out.append(node.val)
        if node.right:
            stack.append(node.right)
        if node.left:
            stack.append(node.left)
    return out`

export const python = PYTHON
export const code = PYTHON.split('\n').map((text, index) => ({ line: index + 1, text }))
export const pythonLineMap = Object.fromEntries(code.map(({ line }) => [line, line]))
const lineAt = marker => code.find(({ text }) => text.includes(marker)).line

export function parseInput(text) {
  const values = JSON.parse(text)
  if (!Array.isArray(values) || values.length > 31) throw new Error('Enter a JSON array of up to 31 entries in level order, using null for missing children.')
  if (!values.every(v => v === null || (Number.isInteger(v) && v >= -99 && v <= 99))) throw new Error('Entries must be integers from -99 to 99, or null.')
  if (values.length && values[0] === null) throw new Error('The first entry is the root, so it cannot be null.')
  return values
}

/** Level-order array to nodes; missing entries mean there is no child at that position. */
function build(values) {
  if (!values.length || values[0] === null) return null
  const root = { val: values[0], left: null, right: null }
  const queue = [root]
  let i = 1
  while (queue.length && i < values.length) {
    const node = queue.shift()
    if (values[i] !== null) { node.left = { val: values[i], left: null, right: null }; queue.push(node.left) }
    i += 1
    if (i < values.length && values[i] !== null) { node.right = { val: values[i], left: null, right: null }; queue.push(node.right) }
    i += 1
  }
  return root
}

export function buildTrace(values) {
  const frames = []
  const root = build(values)
  const out = []
  const stack = root ? [root] : []
  const snap = (current, pushed = []) => ({ stack: stack.map(n => n.val), output: [...out], current, pushed })

  frames.push({ phase: 'setup', activeLine: lineAt('stack, out ='), message: root ? `The root ${root.val} goes on the stack.` : 'The tree is empty, so the traversal returns an empty list.', snapshot: snap(null) })
  while (stack.length) {
    const node = stack.pop()
    out.push(node.val)
    frames.push({ phase: 'visit', activeLine: lineAt('out.append(node.val)'), message: `Pop ${node.val} and record it. Output is now [${out.join(', ')}].`, snapshot: snap(node.val) })
    const pushed = []
    const parts = []
    if (node.right) { stack.push(node.right); pushed.push(node.right.val); parts.push(`right child ${node.right.val}`) }
    if (node.left) { stack.push(node.left); pushed.push(node.left.val); parts.push(`left child ${node.left.val}`) }
    frames.push({
      phase: 'push', activeLine: lineAt(node.right ? 'stack.append(node.right)' : 'if node.left'),
      message: parts.length
        ? `Push ${parts.join(', then ')}. ${node.left ? 'The left child is on top, so it is visited next.' : 'The right child is visited next.'}`
        : `Node ${node.val} has no children, so nothing is pushed.`,
      snapshot: snap(node.val, pushed),
    })
  }
  frames.push({ phase: 'answer', activeLine: lineAt('return out'), message: `Preorder traversal: [${out.join(', ')}].`, snapshot: snap(null) })
  return { input: values, result: [...out], frames }
}
