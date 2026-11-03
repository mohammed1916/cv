export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with root (level order, null for missing) and leaf.')
  const { root, leaf } = input
  if (!Array.isArray(root) || root.length < 1 || root.length > 31 || root[0] === null) throw new Error('root is a level-order list of 1 to 31 slots that starts with a value.')
  const values = root.filter(v => v !== null)
  if (!values.every(v => Number.isInteger(v) && v >= 1 && v <= 99) || new Set(values).size !== values.length) throw new Error('Node values are distinct integers from 1 to 99.')
  if (!Number.isInteger(leaf) || !values.includes(leaf)) throw new Error('leaf is the value of a node in root.')
  const tree = buildTree(root)
  const target = tree.byVal.get(leaf)
  if (target.left || target.right) throw new Error('leaf must be a leaf node with no children.')
  return { root, leaf }
}

// Level-order list to linked nodes; a node consumes the next two slots as its left and right children.
function buildTree(slots) {
  const byVal = new Map()
  const make = val => {
    const node = { val, left: null, right: null, parent: null }
    byVal.set(val, node)
    return node
  }
  const top = make(slots[0])
  const queue = [top]
  let i = 1
  for (let q = 0; q < queue.length; q++) {
    const node = queue[q]
    for (const side of ['left', 'right']) {
      if (i < slots.length && slots[i] !== null) {
        node[side] = make(slots[i])
        node[side].parent = node
        queue.push(node[side])
      }
      i++
    }
  }
  if (slots.slice(i).some(v => v !== null)) throw new Error('Some values have no parent slot.')
  return { top, byVal }
}

export function buildTrace({ root, leaf }) {
  const tree = buildTree(root)
  const layout = {}
  let x = 0
  const place = (node, depth) => {
    if (!node) return
    place(node.left, depth + 1)
    layout[node.val] = { x: x++, y: depth }
    place(node.right, depth + 1)
  }
  place(tree.top, 0)
  const all = [...tree.byVal.values()]
  const snap = () => all.map(n => ({ val: n.val, left: n.left ? n.left.val : null, right: n.right ? n.right.val : null, parent: n.parent ? n.parent.val : null }))
  const frames = []
  let cur = tree.byVal.get(leaf)
  let prev = null
  const push = f => frames.push({ cur: null, prev: null, parent: null, other: null, links: snap(), leaf, ...f, links: snap() })
  push({ phase: 'start', activeLine: L('let cur be the leaf'), pythonLine: P('cur = leaf'), message: `Leaf ${leaf} will become the root. Its old parent chain is the path to rewire.` })
  while (cur) {
    push({ phase: 'check', activeLine: L('while cur is not none'), pythonLine: P('while cur is not None'), cur: cur.val, prev: prev ? prev.val : null, message: `Current node ${cur.val}.` })
    const parent = cur.parent
    const other = cur.left === prev ? cur.right : cur.left
    push({ phase: 'pick', activeLine: L('let parent be'), pythonLine: P('parent = cur.parent'), cur: cur.val, prev: prev ? prev.val : null, parent: parent ? parent.val : null, other: other ? other.val : null, message: parent ? `Old parent ${parent.val} becomes the left child of ${cur.val}${other ? `; off-path child ${other.val} moves to the right` : ''}.` : `${cur.val} is the old root, so it gets no left child${other ? `; off-path child ${other.val} stays on the right` : ''}.` })
    cur.left = parent
    cur.right = other
    if (other) other.parent = cur
    push({ phase: 'link', activeLine: L('make parent the left'), pythonLine: P('cur.left = parent'), cur: cur.val, prev: prev ? prev.val : null, parent: parent ? parent.val : null, other: other ? other.val : null, message: `Links of ${cur.val} now point to ${parent ? parent.val : 'nothing'} and ${other ? other.val : 'nothing'}.` })
    cur.parent = prev
    prev = cur
    cur = parent
    push({ phase: 'advance', activeLine: L('let prev be cur'), pythonLine: P('prev = cur'), cur: cur ? cur.val : null, prev: prev.val, message: cur ? `Move up: ${cur.val} is next.` : 'No old parent left; the walk ends.' })
  }
  push({ phase: 'done', activeLine: L('return the leaf'), pythonLine: P('return leaf'), cur: null, prev: prev.val, message: `${leaf} is the new root.` })
  return { input: { root, leaf }, result: leaf, layout, frames }
}

export const code = `reroot the tree so that the leaf becomes the root
  let cur be the leaf and prev be none
  while cur is not none
    let parent be the old parent of cur
    let other be the child of cur that is not prev
    make parent the left child of cur and other the right child
    set cur's parent to prev and other's parent to cur
    let prev be cur and cur be parent
  return the leaf as the new root`.split('\n').map((text, index) => ({ line: index + 1, text }))

const lines = code.map(c => c.text)
const L = s => {
  const index = lines.findIndex(text => text.includes(s))
  if (index < 0) throw new Error(`Missing pseudocode line: ${s}`)
  return index + 1
}
const P = s => {
  const pyLines = python.split('\n')
  const index = pyLines.findIndex(line => line.includes(s))
  if (index < 0) throw new Error(`Missing python line: ${s}`)
  return index + 1
}

export const python = `class TreeNode:
    def __init__(self, val):
        self.val = val
        self.left = None
        self.right = None
        self.parent = None


def flip_binary_tree(root, leaf):
    cur = leaf
    prev = None
    while cur is not None:
        parent = cur.parent
        other = cur.right if cur.left is prev else cur.left
        cur.left = parent
        cur.right = other
        if other is not None:
            other.parent = cur
        cur.parent = prev
        prev = cur
        cur = parent
    return leaf
`
