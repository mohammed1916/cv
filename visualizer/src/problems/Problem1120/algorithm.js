const MAX_NODES = 30
const MAX_VALUE = 100000

export function parseInput(text) {
  const values = JSON.parse(text)
  if (!Array.isArray(values)) throw new Error('Use a JSON array in level order, with null for missing children.')
  if (values.length < 1 || values.length > MAX_NODES) throw new Error(`Use 1 to ${MAX_NODES} entries.`)
  if (values[0] === null) throw new Error('The first entry is the root and cannot be null.')
  buildTree(values)
  for (const v of values) {
    if (v !== null && (!Number.isInteger(v) || v < 0 || v > MAX_VALUE)) throw new Error(`Each node value is an integer from 0 to ${MAX_VALUE}, or null.`)
  }
  return { values }
}

// Level-order array to linked nodes. Each node keeps its array index as id.
function buildTree(values) {
  const nodes = values.map((val, id) => (val === null ? null : { id, val, left: null, right: null }))
  const root = nodes[0]
  const queue = [root]
  let next = 1
  for (let qi = 0; qi < queue.length; qi++) {
    const node = queue[qi]
    if (next < values.length) { node.left = nodes[next++]; if (node.left) queue.push(node.left) }
    if (next < values.length) { node.right = nodes[next++]; if (node.right) queue.push(node.right) }
  }
  if (next !== values.length) throw new Error('Extra entries after the tree is complete.')
  return { root, nodes: nodes.filter(Boolean) }
}

export function buildTrace({ values }) {
  const { root, nodes } = buildTree(values)
  const done = {}
  let best = { value: null, id: null }
  const frames = []
  const snap = extra => ({ done: { ...done }, best: { ...best }, ...extra })

  frames.push({ pythonLine: 14, activeLine: L('call visit(root)'), phase: 'start', node: root.id, message: 'Visit the root; each call returns the sum and size of its subtree.', ...snap() })

  function visit(node) {
    frames.push({ pythonLine: 4, activeLine: L('if node is empty'), phase: 'enter', node: node.id, message: `Enter node ${node.val}; its children are visited first.`, ...snap() })
    const left = node.left ? visit(node.left) : { total: 0, size: 0 }
    const right = node.right ? visit(node.right) : { total: 0, size: 0 }
    const total = node.val + left.total + right.total
    const size = 1 + left.size + right.size
    frames.push({ pythonLine: 8, activeLine: L('total is node value'), phase: 'combine', node: node.id, total, size, message: `Subtree at ${node.val} sums to ${total} over ${size} node${size === 1 ? '' : 's'}.`, ...snap() })
    const average = total / size
    done[node.id] = { total, size, average }
    frames.push({ pythonLine: 10, activeLine: L('average is total'), phase: 'average', node: node.id, total, size, average, message: `Average ${total} / ${size} = ${average.toFixed(5)}.`, ...snap() })
    const improved = best.value === null || average > best.value
    if (improved) best = { value: average, id: node.id }
    frames.push({ pythonLine: 11, activeLine: L('if average is above best'), phase: improved ? 'update' : 'keep', node: node.id, average, message: improved ? `${average.toFixed(5)} is the new best average.` : `${average.toFixed(5)} does not beat the best so far.`, ...snap() })
    return { total, size }
  }

  visit(root)
  frames.push({ pythonLine: 15, activeLine: L('return best'), phase: 'done', node: null, message: `The largest subtree average is ${best.value.toFixed(5)}.`, ...snap() })
  const plain = nodes.map(n => ({ id: n.id, val: n.val, left: n.left ? n.left.id : null, right: n.right ? n.right.id : null }))
  return { input: { values }, result: best.value, nodes: plain, root: root.id, frames }
}

export const code = `maximum average subtree of root
  best starts at negative infinity
  visit(node) returns (sum, count)
    if node is empty then return (0, 0)
    visit the left child
    visit the right child
    total is node value plus both sums; size is one plus both counts
    average is total divided by size
    if average is above best then best = average
    return (total, size)
  call visit(root) and return best`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => {
  const index = code.findIndex(c => c.text.includes(s))
  if (index < 0) throw new Error(`Missing pseudocode line: ${s}`)
  return index + 1
}

export const python = `def maximum_average_subtree(root):
    best = [float('-inf')]
    def visit(node):
        if node is None:
            return 0, 0
        left_sum, left_count = visit(node.left)
        right_sum, right_count = visit(node.right)
        total = node.val + left_sum + right_sum
        size = 1 + left_count + right_count
        average = total / size
        if average > best[0]:
            best[0] = average
        return total, size
    visit(root)
    return best[0]
`
