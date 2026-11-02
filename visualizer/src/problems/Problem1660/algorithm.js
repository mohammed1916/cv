// LeetCode 1660 (draft): Correct a Binary Tree.
// Input: { root: level-order list (null = missing child), bad: [from, to] }.
// The node with value `from` has its right pointer wrongly set to the node with value `to`, which sits at the same depth
// and further right. Real children are one level deeper, so a right pointer that lands on a node already seen at the
// same depth is the defect. The defective node (and its genuine subtree) is detached from its parent.

const CODE_TEXT = `FUNCTION correctBinaryTree(root)
    depth[root] ← 0, parent[root] ← empty
    queue ← [root]
    WHILE queue is not empty
        node ← pop the front of queue
        IF node.right already has a depth equal to depth of node
            detach node from its parent
            RETURN root
        FOR each present child of node that is not yet seen
            depth[child] ← depth of node plus 1, parent[child] ← node
            push child onto queue
    RETURN root`

export const code = CODE_TEXT.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `from collections import deque

class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def correct_binary_tree(root):
    depth = {root: 0}
    parent = {root: None}
    queue = deque([root])
    while queue:
        node = queue.popleft()
        d = depth[node]
        if node.right is not None and depth.get(node.right) == d:
            up = parent[node]
            if up.left is node:
                up.left = None
            else:
                up.right = None
            return root
        for child in (node.left, node.right):
            if child is not None and child not in depth:
                depth[child] = d + 1
                parent[child] = node
                queue.append(child)
    return root
`

const PY = python.split('\n')
const L = text => {
  const index = code.findIndex(c => c.text.includes(text))
  if (index < 0) throw new Error(`missing pseudocode line: ${text}`)
  return index + 1
}
const P = text => {
  const index = PY.findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`missing python line: ${text}`)
  return index + 1
}

export const phases = [
  { id: 'start', label: 'Start', description: 'Seed the walk with the root.' },
  { id: 'visit', label: 'Visit', description: 'Process one node level by level.' },
  { id: 'defect', label: 'Defect', description: 'A right pointer lands on a node already at this depth.' },
  { id: 'detach', label: 'Detach', description: 'Remove the defective node from its parent.' },
  { id: 'done', label: 'Result', description: 'Serialize the corrected tree.' },
]

function level(i) { return Math.floor(Math.log2(i + 1)) }

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with root and bad.')
  const values = input.root
  if (!Array.isArray(values) || values.length < 1 || values.length > 15) throw new Error('root is a level-order list of 1 to 15 entries, with null for a missing node.')
  if (values[0] === null) throw new Error('root cannot be null.')
  const seen = new Set()
  values.forEach((v, i) => {
    if (v === null) return
    if (!Number.isInteger(v) || seen.has(v)) throw new Error('Node values are distinct integers in this visualization.')
    seen.add(v)
    if (i > 0 && values[Math.floor((i - 1) / 2)] === null) throw new Error('A child cannot sit under a missing parent.')
  })
  const bad = input.bad
  if (!Array.isArray(bad) || bad.length !== 2) throw new Error('bad is a pair [from, to].')
  const [from, to] = bad
  const fi = values.indexOf(from)
  const ti = values.indexOf(to)
  if (fi < 0 || ti < 0) throw new Error('Both bad values must be in the tree.')
  if (fi === 0) throw new Error('The root cannot be the defective node.')
  if (level(fi) !== level(ti) || ti <= fi) throw new Error('to must be at the same depth as from and to its right.')
  return { root: values, bad: [from, to] }
}

export function buildNodes(values, bad) {
  const nodes = values.map((v, i) => v === null ? null : {
    id: i, val: v,
    left: 2 * i + 1 < values.length && values[2 * i + 1] !== null ? 2 * i + 1 : null,
    right: 2 * i + 2 < values.length && values[2 * i + 2] !== null ? 2 * i + 2 : null,
  })
  if (bad) {
    const from = values.indexOf(bad[0])
    nodes[from].right = values.indexOf(bad[1])
  }
  return nodes
}

// Heap-indexed output: a missing node keeps its slot, so children of a removed node are not shifted.
function serialize(nodes, rootId) {
  const out = []
  const fill = (id, idx) => {
    if (id === null) return
    out[idx] = nodes[id].val
    fill(nodes[id].left, 2 * idx + 1)
    fill(nodes[id].right, 2 * idx + 2)
  }
  fill(rootId, 0)
  const list = Array.from({ length: out.length }, (_, i) => (out[i] === undefined ? null : out[i]))
  while (list.length && list[list.length - 1] === null) list.pop()
  return list
}

export function buildTrace({ root, bad }) {
  const nodes = buildNodes(root, bad)
  const badFrom = bad[0]
  const badTo = bad[1]
  const depth = new Map([[0, 0]])
  const parent = new Map([[0, null]])
  const queue = [0]
  const frames = []
  let defect = null
  frames.push({ pythonLine: P('queue = deque([root])'), phase: 'start', activeLine: L('queue ← [root]'), current: 0, defect: null, removed: null, seen: [0], message: 'Walk the tree level by level from the root, without following a pointer that points sideways.' })
  while (queue.length && defect === null) {
    const id = queue.shift()
    const d = depth.get(id)
    const node = nodes[id]
    const rightSeen = node.right !== null && depth.has(node.right) && depth.get(node.right) === d
    if (rightSeen) {
      defect = id
      frames.push({ pythonLine: P('if node.right is not None and depth.get'), phase: 'defect', activeLine: L('IF node.right already has a depth equal'), current: id, defect: id, removed: null, seen: [...depth.keys()], message: `${node.val}.right points to ${nodes[node.right].val}, which is already at depth ${d}. That pointer is the defect.` })
      break
    }
    frames.push({ pythonLine: P('node = queue.popleft()'), phase: 'visit', activeLine: L('node ← pop the front of queue'), current: id, defect: null, removed: null, seen: [...depth.keys()], message: `Visit ${node.val} at depth ${d}.` })
    for (const c of [node.left, node.right]) {
      if (c !== null && !depth.has(c)) {
        depth.set(c, d + 1)
        parent.set(c, id)
        queue.push(c)
      }
    }
  }
  let finalRoot = 0
  if (defect !== null) {
    const up = parent.get(defect)
    if (nodes[up].left === defect) nodes[up].left = null
    else nodes[up].right = null
    frames.push({ pythonLine: P('up.left = None'), phase: 'detach', activeLine: L('detach node from its parent'), current: up, defect, removed: defect, seen: [...depth.keys()], message: `Detach ${nodes[defect].val} (with its genuine subtree) from ${nodes[up].val}. ${badTo} keeps its real parent.` })
  }
  const result = serialize(nodes, finalRoot)
  frames.push({ pythonLine: P('return root'), phase: 'done', activeLine: L('RETURN root'), current: null, defect, removed: defect, seen: [...depth.keys()], message: `Corrected tree: [${result.map(v => v === null ? 'null' : v).join(', ')}].` })
  return { input: { root, bad: [badFrom, badTo] }, result, frames }
}
