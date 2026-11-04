// LeetCode 1650: Lowest Common Ancestor of a Binary Tree III, using parent pointers only.
// Input: { root: level-order list (null = missing child), p, q }. Both values are in the tree and unique.
// The root is not supplied to the algorithm: it only walks parent pointers, and the tree is built from the list for display.

export const code = [
  "function lowestCommonAncestor(p, q) {",
  "  let a = p, b = q;",
  "  while (a !== b) {",
  "    a = a.parent !== null ? a.parent : q;",
  "    b = b.parent !== null ? b.parent : p;",
  "  }",
  "  return a;",
  "}",
].map((text, index) => ({ line: index + 1, text }))

export const python = `class Node:
    def __init__(self, val):
        self.val = val
        self.left = None
        self.right = None
        self.parent = None

def lowest_common_ancestor(p, q):
    a, b = p, q
    while a is not b:
        a = a.parent if a.parent is not None else q
        b = b.parent if b.parent is not None else p
    return a
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
  { id: 'start', label: 'Start', description: 'Walkers begin at p and q.' },
  { id: 'walk', label: 'Walk', description: 'Both walkers climb one parent (or switch).' },
  { id: 'found', label: 'Meet', description: 'The walkers stand on the same node: the LCA.' },
]

function parseTree(values) {
  if (!Array.isArray(values) || values.length < 1 || values.length > 15) throw new Error('root is a level-order list of 1 to 15 entries, with null for a missing node.')
  if (values[0] === null) throw new Error('root cannot be null.')
  const seen = new Set()
  values.forEach((v, i) => {
    if (v === null) return
    if (!Number.isInteger(v)) throw new Error('Node values are integers.')
    if (seen.has(v)) throw new Error('Node values must be unique in this visualization.')
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

// Nodes keyed by array index, with parent links from the level-order list.
export function buildNodes(values) {
  return values.map((v, i) => v === null ? null : { id: i, val: v, parent: i === 0 ? null : Math.floor((i - 1) / 2) })
}

export function buildTrace({ root, p, q }) {
  const nodes = buildNodes(root)
  const idP = root.indexOf(p)
  const idQ = root.indexOf(q)
  const frames = []
  let a = idP
  let b = idQ
  frames.push({ pythonLine: P('a, b = p, q'), phase: 'start', activeLine: L('let a = p, b = q;'), a, b, message: `Walker A starts at ${p}, walker B starts at ${q}.` })
  let steps = 0
  while (a !== b) {
    steps += 1
    const aHasParent = nodes[a].parent !== null
    const bHasParent = nodes[b].parent !== null
    const na = aHasParent ? nodes[a].parent : idQ
    const nb = bHasParent ? nodes[b].parent : idP
    const switched = !aHasParent || !bHasParent
    const message = `A ${aHasParent ? `moves up to ${root[na]}` : `has no parent, so it jumps to ${q}`}; B ${bHasParent ? `moves up to ${root[nb]}` : `has no parent, so it jumps to ${p}`}.`
    a = na
    b = nb
    frames.push({ pythonLine: P('a = a.parent if'), phase: switched ? 'walk' : 'walk', activeLine: L('a = a.parent !== null'), a, b, switched, message, step: steps })
  }
  const answer = root[a]
  frames.push({ pythonLine: P('return a'), phase: 'found', activeLine: L('return a;'), a, b, message: `The walkers meet at ${answer}, the lowest common ancestor.` })
  return { input: { root, p, q }, tree: nodes, result: answer, frames }
}
