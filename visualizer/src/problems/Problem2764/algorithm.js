export const code = `Is the sequence a preorder of some binary tree?
The first pair must be the root, so its parent must be -1
Start the stack with the root
Keep a child count for every node
For each later pair (node, parent) in order
  Pop nodes until the top of the stack is parent
  If the stack is empty, parent is not open: return false
  Add one to the child count of parent
  If that count is above 2: return false
  Push node onto the stack
Return true`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def is_preorder(pairs):
    if pairs[0][1] != -1:
        return False
    stack = [pairs[0][0]]
    child_count = {}
    for node, parent in pairs[1:]:
        while stack and stack[-1] != parent:
            stack.pop()
        if not stack:
            return False
        child_count[parent] = child_count.get(parent, 0) + 1
        if child_count[parent] > 2:
            return False
        stack.append(node)
    return True
`

const L = s => {
  const index = code.findIndex(c => c.text.includes(s))
  if (index < 0) throw new Error(`Missing pseudocode line: ${s}`)
  return index + 1
}

const P = s => {
  const index = python.split('\n').findIndex(t => t.includes(s))
  if (index < 0) throw new Error(`Missing python line: ${s}`)
  return index + 1
}

export const phases = [
  { id: 'start', label: 'Pairs', description: 'Read the pairs as a preorder claim.' },
  { id: 'root', label: 'Root', description: 'The root opens the stack.' },
  { id: 'read', label: 'Read', description: 'Take the next pair in order.' },
  { id: 'pop', label: 'Close', description: 'Close a node that cannot take this pair.' },
  { id: 'attach', label: 'Attach', description: 'Count a child for the parent.' },
  { id: 'push', label: 'Open', description: 'The new node joins the open path.' },
  { id: 'reject', label: 'Reject', description: 'The order breaks a preorder rule.' },
  { id: 'done', label: 'Accept', description: 'Every pair fits a preorder.' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!Array.isArray(input) || input.length < 1 || input.length > 12) throw new Error('Use a list of 1 to 12 [node, parent] pairs.')
  const seen = new Set()
  for (const pair of input) {
    if (!Array.isArray(pair) || pair.length !== 2 || !pair.every(Number.isInteger)) throw new Error('Each pair is [node, parent] with integers.')
    const [node, parent] = pair
    if (node < 1 || node > 99) throw new Error('Node values are 1 to 99.')
    if (seen.has(node)) throw new Error('Node values must be distinct.')
    if (parent !== -1 && (parent < 1 || parent > 99)) throw new Error('A parent is -1 for the root, or a node value from 1 to 99.')
    seen.add(node)
  }
  return input.map(([node, parent]) => [node, parent])
}

export function buildTrace(pairs) {
  const frames = []
  const stack = []
  const counts = {}
  let result = null

  const add = (phase, line, py, extra) => frames.push({
    phase, activeLine: L(line), pythonLine: P(py),
    i: -1, node: null, parent: null, popped: [], ok: null,
    stack: [...stack], counts: { ...counts }, message: '', ...extra,
  })

  add('start', 'Is the sequence', 'def is_preorder', { message: `Check ${pairs.length} pair${pairs.length === 1 ? '' : 's'} in input order.` })

  const [rootNode, rootParent] = pairs[0]
  if (rootParent !== -1) {
    add('reject', 'The first pair must be', 'if pairs[0][1] != -1', { i: 0, node: rootNode, parent: rootParent, ok: false, message: `Pair 0 has parent ${rootParent}, but the first pair must be the root with parent -1. Return false.` })
    return { input: pairs, result: false, frames }
  }

  stack.push(rootNode)
  add('root', 'Start the stack', 'stack = [pairs[0][0]]', { i: 0, node: rootNode, parent: -1, message: `Root ${rootNode} opens the stack.` })

  for (let i = 1; i < pairs.length; i += 1) {
    const [node, parent] = pairs[i]
    add('read', 'For each later pair', 'for node, parent in', { i, node, parent, message: `Read ${node} with parent ${parent}.` })
    while (stack.length && stack[stack.length - 1] !== parent) {
      const top = stack.pop()
      add('pop', 'Pop nodes until', 'while stack and', { i, node, parent, popped: [top], message: `${top} is not ${parent}, so ${top} is closed; no later pair can attach to it.` })
    }
    if (!stack.length) {
      add('reject', 'If the stack is empty', 'if not stack:', { i, node, parent, ok: false, message: `Parent ${parent} is no longer open, so the order is not a preorder. Return false.` })
      return { input: pairs, result: false, frames }
    }
    counts[parent] = (counts[parent] || 0) + 1
    add('attach', 'Add one to the child', 'child_count[parent] = ', { i, node, parent, message: `${parent} now has ${counts[parent]} child${counts[parent] === 1 ? '' : 'ren'}.` })
    if (counts[parent] > 2) {
      add('reject', 'If that count is above 2', 'if child_count[parent] > 2', { i, node, parent, ok: false, message: `${parent} would need a third child in a binary tree. Return false.` })
      return { input: pairs, result: false, frames }
    }
    stack.push(node)
    add('push', 'Push node onto', 'stack.append(node)', { i, node, parent, message: `${node} joins the open path under ${parent}.` })
  }

  result = true
  add('done', 'Return true', 'return True', { ok: true, message: 'Every pair fits a preorder of one binary tree. Return true.' })
  return { input: pairs, result, frames }
}
