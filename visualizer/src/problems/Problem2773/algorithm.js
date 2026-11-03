export const code = `Height of a special binary tree whose leaves are chained
If the root is empty, return 0
Set best to 0
Push the root with depth 1
While the stack is not empty
  Pop a node and its depth
  Set best to the larger of best and depth
  If the node is a leaf, skip its leaf links and continue
  If it has a right child, push that child with depth plus one
  If it has a left child, push that child with depth plus one
Return best`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def special_height(root):
    if root is None:
        return 0
    best = 0
    stack = [(root, 1)]
    while stack:
        node, depth = stack.pop()
        best = max(best, depth)
        if node.left is None and node.right is None:
            continue
        if node.right is not None:
            stack.append((node.right, depth + 1))
        if node.left is not None:
            stack.append((node.left, depth + 1))
    return best
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
  { id: 'start', label: 'Root', description: 'Start from the root at depth 1.' },
  { id: 'pop', label: 'Visit', description: 'Take a node and its depth off the stack.' },
  { id: 'measure', label: 'Measure', description: 'Compare this depth with the best so far.' },
  { id: 'leaf', label: 'Leaf', description: 'Leaf links are chained, not followed.' },
  { id: 'push', label: 'Descend', description: 'Push real children one level deeper.' },
  { id: 'done', label: 'Height', description: 'Report the deepest node count.' },
]

// Input: nested object {"v": value, "l": subtree or null, "r": subtree or null}.
// Leaves are chained left to right by the special structure; the chain is shown but never followed.
export function parseInput(text) {
  const input = JSON.parse(text)
  if (input === null || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with v, and optional l and r subtrees.')
  const nodes = []
  const build = (spec, path) => {
    if (spec === null) return null
    if (typeof spec !== 'object' || Array.isArray(spec) || !Number.isInteger(spec.v) || spec.v < 1 || spec.v > 99) throw new Error(`Node at ${path} needs an integer v from 1 to 99.`)
    if (nodes.length >= 12) throw new Error('The visualization caps the tree at 12 nodes.')
    const id = nodes.length
    const item = { id, v: spec.v, left: null, right: null }
    nodes.push(item)
    item.left = build(spec.l ?? null, `${path}.l`)
    item.right = build(spec.r ?? null, `${path}.r`)
    return id
  }
  const root = build(input, 'root')
  return { root, nodes }
}

function leafOrder(tree) {
  const order = []
  const walk = id => {
    if (id === null) return
    const n = tree.nodes[id]
    if (n.left === null && n.right === null) order.push(id)
    walk(n.left)
    walk(n.right)
  }
  walk(tree.root)
  return order
}

export function buildTrace(tree) {
  const frames = []
  const { nodes, root } = tree
  const leaves = leafOrder(tree)
  const stack = []
  let best = 0
  const visited = []
  const add = (phase, line, py, extra) => frames.push({
    phase, activeLine: L(line), pythonLine: P(py),
    current: -1, depth: 0, best, pending: stack.map(item => item.id), visited: [...visited],
    leaves, ok: null, message: '', ...extra,
  })

  add('start', 'Height of a special binary tree', 'def special_height', { message: 'Find the deepest node count, ignoring the leaf links.' })
  if (root === null) {
    add('done', 'If the root is empty', 'if root is None', { ok: true, message: 'Empty tree has height 0.' })
    return { input: tree, tree, result: 0, frames }
  }
  stack.push({ id: root, depth: 1 })
  add('start', 'Push the root with depth 1', 'stack = [(root, 1)]', { current: root, depth: 1, message: `Root ${nodes[root].v} waits at depth 1.` })

  while (stack.length) {
    const { id, depth } = stack.pop()
    const n = nodes[id]
    add('pop', 'Pop a node and its depth', 'node, depth = stack.pop()', { current: id, depth, message: `Visit ${n.v} at depth ${depth}.` })
    visited.push(id)
    best = Math.max(best, depth)
    add('measure', 'Set best to the larger', 'best = max(best, depth)', { current: id, depth, message: `Best is now ${best}.` })
    if (n.left === null && n.right === null) {
      add('leaf', 'If the node is a leaf', 'if node.left is None and node.right is None', { current: id, depth, message: `${n.v} is a leaf. Its chain links to neighbouring leaves are not followed.` })
      continue
    }
    if (n.right !== null) {
      stack.push({ id: n.right, depth: depth + 1 })
      add('push', 'If it has a right child', 'if node.right is not None', { current: id, depth, message: `Push right child ${nodes[n.right].v} at depth ${depth + 1}.` })
    }
    if (n.left !== null) {
      stack.push({ id: n.left, depth: depth + 1 })
      add('push', 'If it has a left child', 'if node.left is not None', { current: id, depth, message: `Push left child ${nodes[n.left].v} at depth ${depth + 1}.` })
    }
  }

  add('done', 'Return best', 'return best', { current: -1, depth: 0, ok: true, message: `The genuine height is ${best} nodes.` })
  return { input: tree, tree, result: best, frames }
}
