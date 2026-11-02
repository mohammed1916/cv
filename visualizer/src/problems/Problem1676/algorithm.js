// LeetCode 1676 (draft): Lowest Common Ancestor of a Binary Tree IV.
// Input: { root: level-order list (null = missing child), nodes: distinct values known to be in the tree }.
// A node is an ancestor of itself. Returns the value of the deepest node that is an ancestor of every supplied node.

const CODE_TEXT = `FUNCTION lowestCommonAncestor(root, nodes)
    targets ← the set of supplied nodes
    FUNCTION visit(node)
        IF node is empty, RETURN empty
        IF node is in targets, RETURN node
        left ← visit(node.left)
        right ← visit(node.right)
        IF left and right are both present, RETURN node
        RETURN whichever of left or right is present
    RETURN visit(root)`

export const code = CODE_TEXT.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def lowest_common_ancestor(root, nodes):
    targets = set(nodes)

    def visit(node):
        if node is None:
            return None
        if node.val in targets:
            return node
        left = visit(node.left)
        right = visit(node.right)
        if left is not None and right is not None:
            return node
        return left if left is not None else right

    return visit(root)
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
  { id: 'start', label: 'Targets', description: 'Collect the supplied nodes.' },
  { id: 'visit', label: 'Visit', description: 'Descend until a target or an empty branch.' },
  { id: 'join', label: 'Join', description: 'Targets on both sides meet at this node.' },
  { id: 'answer', label: 'Answer', description: 'Report the returned node.' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with root and nodes.')
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
  const nodes = input.nodes
  if (!Array.isArray(nodes) || nodes.length < 1 || nodes.length > 6) throw new Error('nodes is a list of 1 to 6 values.')
  if (new Set(nodes).size !== nodes.length || !nodes.every(v => seen.has(v))) throw new Error('Every node must be a distinct value in the tree.')
  return { root: values, nodes }
}

export function buildTrace({ root, nodes }) {
  const targets = new Set(nodes)
  const frames = []
  const size = root.length
  frames.push({ pythonLine: P('targets = set(nodes)'), phase: 'start', activeLine: L('targets ← the set of supplied nodes'), current: null, returned: null, visited: [], message: `Targets: ${nodes.join(', ')}.` })
  const visited = []
  const visit = id => {
    if (id === null) return null
    visited.push(id)
    const value = root[id]
    if (targets.has(value)) {
      frames.push({ pythonLine: P('if node.val in targets:'), phase: 'visit', activeLine: L('IF node is in targets'), current: id, returned: id, visited: [...visited], message: `${value} is a target, so the walk stops here and returns it.` })
      return id
    }
    frames.push({ pythonLine: P('left = visit(node.left)'), phase: 'visit', activeLine: L('left ← visit(node.left)'), current: id, returned: null, visited: [...visited], message: `${value} is not a target; search its children.` })
    const [l, r] = [2 * id + 1, 2 * id + 2]
    const left = l < size && root[l] !== null ? visit(l) : null
    const right = r < size && root[r] !== null ? visit(r) : null
    if (left !== null && right !== null) {
      frames.push({ pythonLine: P('if left is not None and right is not None:'), phase: 'join', activeLine: L('IF left and right are both present'), current: id, returned: id, visited: [...visited], message: `Targets on both sides of ${value}, so ${value} is the answer candidate.` })
      return id
    }
    const pick = left !== null ? left : right
    frames.push({ pythonLine: P('return left if left is not None else right'), phase: 'visit', activeLine: L('RETURN whichever of left or right is present'), current: id, returned: pick, visited: [...visited], message: pick === null ? `Nothing below ${value} is a target.` : `Only one side reports, so ${root[pick]} moves up.` })
    return pick
  }
  const result = visit(0)
  const answer = result === null ? null : root[result]
  frames.push({ pythonLine: P('return visit(root)'), phase: 'answer', activeLine: L('RETURN visit(root)'), current: null, returned: result, visited: [...visited], message: `LCA of ${nodes.join(', ')} is ${answer}.` })
  return { input: { root, nodes }, result: answer, frames }
}
