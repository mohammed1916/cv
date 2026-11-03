// Level-order serialization: the root first, then each present node's left and right child slots, with null for an empty slot.
export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with a tree list.')
  const { tree } = input
  if (!Array.isArray(tree) || tree.length < 1 || tree.length > 25 || tree[0] === null) throw new Error('tree starts with a root value and has at most 25 slots.')
  const realCount = tree.filter(v => v !== null).length
  if (realCount > 12) throw new Error('The tree has at most 12 nodes.')
  for (const v of tree) if (v !== null && (!Number.isInteger(v) || v < -9 || v > 9)) throw new Error('Node values are integers from -9 to 9 or null.')
  return { tree }
}

export function buildTree(tree) {
  const nodes = []
  const make = value => {
    const node = { id: nodes.length, val: value, left: null, right: null, parent: null }
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
      node[side] = child
      child.parent = node
      queue.push(child)
    }
  }
  return { root, nodes }
}

// Every simple path in a tree is found from each start node. The DFS refuses to extend a path onto a repeated value.
export function buildTrace({ tree }) {
  const { nodes } = buildTree(tree)
  const frames = []
  let best = -Infinity
  let bestPath = []
  const snap = extra => ({ best, bestPath: bestPath.slice(), ...extra })
  frames.push(snap({ pythonLine: PY('best = None'), phase: 'start', activeLine: L('best = nothing yet'), start: -1, path: [], cur: -1, sum: 0, blocked: -1, message: `${nodes.length} node${nodes.length === 1 ? '' : 's'}; try every node as a start.` }))
  for (const start of nodes) {
    frames.push(snap({ pythonLine: PY('for start in nodes'), phase: 'start', activeLine: L('for each start node'), start: start.id, path: [], cur: -1, sum: 0, blocked: -1, message: `Start a path at node ${start.id} (value ${start.val}).` }))
    const used = new Set()
    const path = []
    const visit = (node, parent, sum) => {
      if (used.has(node.val)) {
        frames.push(snap({ pythonLine: PY('if node.val in used'), phase: 'blocked', activeLine: L('if the value is already on the path'), start: start.id, path: path.map(p => p.id), cur: node.id, sum, blocked: node.id, message: `Value ${node.val} already appears on the path, so stop here.` }))
        return
      }
      used.add(node.val)
      path.push(node)
      const total = sum + node.val
      frames.push(snap({ pythonLine: PY('used.add'), phase: 'enter', activeLine: L('extend the path to this node'), start: start.id, path: path.map(p => p.id), cur: node.id, sum: total, blocked: -1, message: `Extend the path to node ${node.id}; sum ${total}.` }))
      if (total > best) {
        best = total
        bestPath = path.map(p => p.id)
        frames.push(snap({ pythonLine: PY('best = total'), phase: 'best', activeLine: L('keep the larger sum'), start: start.id, path: path.map(p => p.id), cur: node.id, sum: total, blocked: -1, message: `New best ${best} along ${bestPath.join(' - ')}.` }))
      }
      for (const next of [node.left, node.right, node.parent]) {
        if (next && next !== parent) visit(next, node, total)
      }
      path.pop()
      used.delete(node.val)
      frames.push(snap({ pythonLine: PY('used.remove'), phase: 'leave', activeLine: L('step back off this node'), start: start.id, path: path.map(p => p.id), cur: node.id, sum, blocked: -1, message: `Step back off node ${node.id}.` }))
    }
    visit(start, null, 0)
  }
  frames.push(snap({ pythonLine: PY('return best'), phase: 'done', activeLine: L('return the best sum'), start: -1, path: [], cur: -1, sum: best, blocked: -1, message: `Maximum distinct path sum: ${best}.` }))
  return { input: { tree }, result: best, frames }
}

export const code = `maximum sum of a path with distinct values in a binary tree
  best = nothing yet
  for each start node
    run a depth first search from the start with an empty used set
    at each node reached
      if the value is already on the path then stop here
      extend the path to this node and add its value to the sum
      keep the larger sum in best
      visit each neighbour (left, right or parent) that is not the node we came from
      step back off this node and remove its value
  return the best sum`.split('\n').map((text, index) => ({ line: index + 1, text }))

const L = s => {
  const index = code.findIndex(c => c.text.includes(s))
  if (index < 0) throw new Error(`Missing pseudocode line: ${s}`)
  return index + 1
}

export const python = `def max_distinct_path_sum(nodes):  # each node has left, right and parent links
    best = None
    def visit(node, parent, used, total):
        nonlocal best
        if node.val in used:
            return
        used.add(node.val)
        total += node.val
        if best is None or total > best:
            best = total
        for nxt in (node.left, node.right, node.parent):
            if nxt is not None and nxt is not parent:
                visit(nxt, node, used, total)
        used.remove(node.val)
    for start in nodes:
        visit(start, None, set(), 0)
    return best
`

const PY = s => {
  const index = python.split('\n').findIndex(line => line.includes(s))
  if (index < 0) throw new Error(`Missing python line: ${s}`)
  return index + 1
}
