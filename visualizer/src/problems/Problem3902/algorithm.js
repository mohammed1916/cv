// Level-order serialization: the root first, then each present node's left and right child slots, with null for an empty slot.
export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with a tree list.')
  const { tree } = input
  if (!Array.isArray(tree) || tree.length < 1 || tree.length > 25 || tree[0] === null) throw new Error('tree starts with a root value and has at most 25 slots.')
  if (tree.filter(v => v !== null).length > 12) throw new Error('The tree has at most 12 nodes.')
  for (const v of tree) if (v !== null && (!Number.isInteger(v) || v < -9 || v > 9)) throw new Error('Node values are integers from -9 to 9 or null.')
  return { tree }
}

export function buildTree(tree) {
  const nodes = []
  const make = value => {
    const node = { id: nodes.length, val: value, left: null, right: null, depth: 0 }
    nodes.push(node)
    return node
  }
  const root = make(tree[0])
  const queue = [root]
  let at = 1
  for (let q = 0; q < queue.length; q += 1) {
    const node = queue[q]
    for (const side of ['left', 'right']) {
      if (at >= tree.length) break
      const value = tree[at]
      at += 1
      if (value === null) continue
      const child = make(value)
      child.depth = node.depth + 1
      node[side] = child
      queue.push(child)
    }
  }
  return { root, nodes }
}

// Odd levels are read left to right and stop before the first node without a left child.
// Even levels are read right to left and stop before the first node without a right child.
export function buildTrace({ tree }) {
  const { root, nodes } = buildTree(tree)
  const frames = []
  const levels = []
  for (const node of nodes) {
    if (!levels[node.depth]) levels[node.depth] = []
    levels[node.depth].push(node)
  }
  const sums = []
  const snap = extra => ({ sums: sums.slice(), ...extra })
  frames.push(snap({ pythonLine: PY('level = [root]'), phase: 'start', activeLine: L('level = [root]'), level: 0, order: [], read: -1, stop: -1, levelSum: 0, message: `${levels.length} level${levels.length === 1 ? '' : 's'} in the tree.` }))
  for (let d = 0; d < levels.length; d += 1) {
    const oneBased = d + 1
    const oddLevel = oneBased % 2 === 1
    const order = oddLevel ? levels[d] : levels[d].slice().reverse()
    const side = oddLevel ? 'left' : 'right'
    frames.push(snap({ pythonLine: PY('if depth % 2 == 1:'), phase: 'level', activeLine: L('if depth is odd then read'), level: oneBased, order: order.map(n => n.id), read: -1, stop: -1, levelSum: 0, message: `Level ${oneBased}: read ${oddLevel ? 'left to right' : 'right to left'}, stopping before a node with no ${side} child.` }))
    let total = 0
    let stopped = false
    for (const node of order) {
      if (node[side] === null) {
        stopped = true
        frames.push(snap({ pythonLine: PY('if child is None'), phase: 'stop', activeLine: L('odd levels stop at a node with no left child'), level: oneBased, order: order.map(n => n.id), read: -1, stop: node.id, levelSum: total, message: `Node ${node.id} has no ${side} child, so the level sum stops at ${total}.` }))
        break
      }
      total += node.val
      frames.push(snap({ pythonLine: PY('total += node.val'), phase: 'read', activeLine: L('total += node value'), level: oneBased, order: order.map(n => n.id), read: node.id, stop: -1, levelSum: total, message: `Add node ${node.id} (${node.val}); running sum ${total}.` }))
    }
    sums.push(total)
    frames.push(snap({ pythonLine: PY('sums.append(total)'), phase: 'levelDone', activeLine: L('append total to sums'), level: oneBased, order: order.map(n => n.id), read: -1, stop: -1, levelSum: total, message: `Level ${oneBased} sum: ${total}${stopped ? ' (stopped early)' : ''}.` }))
  }
  frames.push(snap({ pythonLine: PY('return sums'), phase: 'done', activeLine: L('return sums'), level: 0, order: [], read: -1, stop: -1, levelSum: 0, message: `Level sums: [${sums.join(', ')}].` }))
  return { input: { tree }, result: sums.slice(), frames }
}

export const code = `zigzag level sums of a binary tree
  level = [root]
  sums = empty list
  depth = 1
  while level is not empty
    if depth is odd then read the level left to right, else read it right to left
    total = 0
    for each node in that order
      odd levels stop at a node with no left child; even levels stop at one with no right child
      total += node value
    append total to sums
    level = all children of this level, left to right
    depth += 1
  return sums`.split('\n').map((text, index) => ({ line: index + 1, text }))

const L = s => {
  const index = code.findIndex(c => c.text.includes(s))
  if (index < 0) throw new Error(`Missing pseudocode line: ${s}`)
  return index + 1
}

export const python = `def zigzag_level_sum(root):
    level = [root]
    sums = []
    depth = 1
    while level:
        if depth % 2 == 1:
            order = level
        else:
            order = list(reversed(level))
        total = 0
        for node in order:
            child = node.left if depth % 2 == 1 else node.right
            if child is None:
                break
            total += node.val
        sums.append(total)
        level = [c for node in level for c in (node.left, node.right) if c is not None]
        depth += 1
    return sums
`

const PY = s => {
  const index = python.split('\n').findIndex(line => line.includes(s))
  if (index < 0) throw new Error(`Missing python line: ${s}`)
  return index + 1
}
