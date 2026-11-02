// LeetCode 1740 (draft): Find Distance in a Binary Tree.
// Input: { root: level-order list (null = missing child), p, q }. Values are unique and both are in the tree.
// Distance (in edges) = depth(p) + depth(q) - 2 * depth(lowest common ancestor).

const CODE_TEXT = `FUNCTION findDistance(root, p, q)
    depth ← empty map, parent ← empty map
    stack ← [root with depth 0]
    WHILE stack is not empty
        pop (node, d) and record depth d for node
        FOR each present child of node
            record parent of the child as node, push child with depth d plus 1
    ancestors ← every node on the path from p up to the root
    x ← q
    WHILE x is not in ancestors, move x up to its parent
    RETURN depth of p plus depth of q minus 2 times depth of x`

export const code = CODE_TEXT.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def find_distance(root, p, q):
    depth = {}
    parent = {root: None}
    stack = [(root, 0)]
    while stack:
        node, d = stack.pop()
        depth[node] = d
        for child in (node.left, node.right):
            if child is not None:
                parent[child] = node
                stack.append((child, d + 1))
    ancestors = set()
    x = p
    while x is not None:
        ancestors.add(x)
        x = parent[x]
    y = q
    while y not in ancestors:
        y = parent[y]
    return depth[p] + depth[q] - 2 * depth[y]
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
  { id: 'depth', label: 'Depths', description: 'Record each node depth and parent.' },
  { id: 'mark', label: 'Mark path', description: 'Mark every ancestor of p.' },
  { id: 'climb', label: 'Climb q', description: 'Climb from q until it meets the marked path.' },
  { id: 'answer', label: 'Distance', description: 'Combine the three depths.' },
]

function parseTree(values) {
  if (!Array.isArray(values) || values.length < 1 || values.length > 15) throw new Error('root is a level-order list of 1 to 15 entries, with null for a missing node.')
  if (values[0] === null) throw new Error('root cannot be null.')
  const seen = new Set()
  values.forEach((v, i) => {
    if (v === null) return
    if (!Number.isInteger(v) || seen.has(v)) throw new Error('Node values are distinct integers in this visualization.')
    seen.add(v)
    if (i > 0 && values[Math.floor((i - 1) / 2)] === null) throw new Error('A child cannot sit under a missing parent.')
  })
  return values
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with root, p and q.')
  const root = parseTree(input.root)
  if (!root.includes(input.p) || !root.includes(input.q)) throw new Error('p and q must both be values in the tree.')
  return { root, p: input.p, q: input.q }
}

export function buildTrace({ root, p, q }) {
  const size = root.length
  const depthOf = {}
  const parentOf = { [root[0]]: null }
  const frames = []
  const stack = [[0, 0]]
  const order = []
  while (stack.length) {
    const [id, d] = stack.pop()
    depthOf[root[id]] = d
    order.push(root[id])
    for (const c of [2 * id + 1, 2 * id + 2]) {
      if (c < size && root[c] !== null) {
        parentOf[root[c]] = root[id]
        stack.push([c, d + 1])
      }
    }
    frames.push({ pythonLine: P('node, d = stack.pop()'), phase: 'depth', activeLine: L('pop (node, d)'), current: root[id], marked: [], climbing: null, depths: { ...depthOf }, message: `Visit ${root[id]} at depth ${d}.` })
  }
  const ancestors = []
  let x = p
  while (x !== null) {
    ancestors.push(x)
    frames.push({ pythonLine: P('ancestors.add(x)'), phase: 'mark', activeLine: L('ancestors ← every node on the path from p'), current: x, marked: [...ancestors], climbing: null, depths: { ...depthOf }, message: `Mark ${x} as an ancestor of p.` })
    x = parentOf[x]
  }
  let y = q
  while (!ancestors.includes(y)) {
    frames.push({ pythonLine: P('y = parent[y]'), phase: 'climb', activeLine: L('WHILE x is not in ancestors'), current: y, marked: [...ancestors], climbing: y, depths: { ...depthOf }, message: `${y} is not marked, so climb to ${parentOf[y]}.` })
    y = parentOf[y]
  }
  const distance = depthOf[p] + depthOf[q] - 2 * depthOf[y]
  frames.push({ pythonLine: P('return depth[p] + depth[q]'), phase: 'answer', activeLine: L('RETURN depth of p plus depth of q'), current: y, marked: [...ancestors], climbing: null, depths: { ...depthOf }, message: `LCA is ${y}: ${depthOf[p]} + ${depthOf[q]} - 2 * ${depthOf[y]} = ${distance} edges.` })
  return { input: { root, p, q }, result: distance, lca: y, frames }
}
