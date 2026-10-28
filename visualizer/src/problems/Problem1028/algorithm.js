const PATTERN = /^(0|[1-9]\d*)(-+(0|[1-9]\d*))*$/

export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data.traversal !== 'string' || data.traversal.length > 200|| !PATTERN.test(data.traversal)) {
    throw new Error('Use a traversal such as "1-2--3--4": digits are values and each run of dashes gives the depth.')
  }
  if ([...data.traversal.matchAll(/\d+/g)].length > 15) throw new Error('Use at most 15 values.')
  buildTrace({ traversal: data.traversal })
  return { traversal: data.traversal }
}

// Level-order list of the tree so far, with null for a missing child (LeetCode format, trailing nulls trimmed).
function serialize(root) {
  if (!root) return []
  const out = [root.value]
  const queue = [root]
  for (let q = 0; q < queue.length; q++) {
    for (const child of [queue[q].left, queue[q].right]) {
      out.push(child ? child.value : null)
      if (child) queue.push(child)
    }
  }
  while (out.length && out[out.length - 1] === null) out.pop()
  return out
}

// Position of a node in level order, which matches the node id that treeFromLevelOrder assigns.
function positionOf(root, target) {
  const queue = root ? [root] : []
  for (let q = 0; q < queue.length; q++) {
    if (queue[q] === target) return q
    if (queue[q].left) queue.push(queue[q].left)
    if (queue[q].right) queue.push(queue[q].right)
  }
  return null
}

export function buildTrace({ traversal }) {
  const tokens = [...traversal.matchAll(/(-*)(\d+)/g)].map(m => ({ depth: m[1].length, value: Number(m[2]) }))
  const stack = []
  let root = null
  const frames = [{ phase: 'start', activeLine: L('set stack to empty'), index: -1, shape: [], current: null, message: 'Read the values left to right; the dashes give each value its depth.' }]
  tokens.forEach(({ depth, value }, index) => {
    frames.push({ phase: 'read', activeLine: L('for each value with its depth'), index, shape: serialize(root), current: null, message: `Next value ${value} has depth ${depth}.` })
    const before = stack.length
    while (stack.length > depth) stack.pop()
    if (stack.length < depth) throw new Error(`Value ${value} is ${depth} level(s) deep, but its parent is not that deep.`)
    if (before > depth) frames.push({ phase: 'pop', activeLine: L('pop the stack while'), index, shape: serialize(root), current: null, message: `Remove ancestors deeper than depth ${depth} from the stack.` })
    const node = { value, left: null, right: null }
    let parent = null
    if (depth === 0) root = node
    else {
      parent = stack[depth - 1]
      if (!parent.left) parent.left = node
      else if (!parent.right) parent.right = node
      else throw new Error(`Node ${parent.value} would get a third child.`)
    }
    frames.push({ phase: 'attach', activeLine: L('attach the new node'), index, shape: serialize(root), current: positionOf(root, node), message: parent ? `${value} becomes a ${parent.left === node ? 'left' : 'right'} child of ${parent.value}.` : `${value} becomes the root.` })
    stack.push(node)
  })
  const result = serialize(root)
  frames.push({ phase: 'done', activeLine: L('return the root'), index: -1, shape: result, current: null, result, message: `Rebuilt tree in level order: [${result.map(v => (v === null ? 'null' : v)).join(', ')}].` })
  return { input: { traversal }, result, frames }
}

export const code = `rebuild the tree from its dashed preorder string
  read the string as values, each with a depth set by its leading dashes
  set stack to empty
  for each value with its depth, in order
    pop the stack while it holds more nodes than the depth
    attach the new node as the left child if that slot is free, otherwise as the right child
    push the new node onto the stack
  return the root`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def recover_from_preorder(traversal):
    import re
    stack = []
    root = None
    for dashes, digits in re.findall(r'(-*)(\\d+)', traversal):
        depth = len(dashes)
        node = [int(digits), None, None]
        del stack[depth:]
        if depth == 0:
            root = node
        elif stack[-1][1] is None:
            stack[-1][1] = node
        else:
            stack[-1][2] = node
        stack.append(node)
    if root is None:
        return []
    out = [root[0]]
    queue = [root]
    for current in queue:
        for child in (current[1], current[2]):
            out.append(child[0] if child is not None else None)
            if child is not None:
                queue.append(child)
    while out and out[-1] is None:
        out.pop()
    return out
`
