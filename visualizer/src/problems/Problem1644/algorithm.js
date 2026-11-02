// LeetCode 1644 (draft): Lowest Common Ancestor of a Binary Tree II.
// Input: { root: level-order list (null = missing child), p, q }. Values are unique, so a node is identified by its value.
// A value that is not in the tree means that node does not belong, and the answer is null.

const CODE_TEXT = `FUNCTION lowestCommonAncestor(root, p, q)
    foundP ← false, foundQ ← false
    FUNCTION visit(node)
        IF node is empty, RETURN empty
        left ← visit(node.left)
        right ← visit(node.right)
        IF node is p, set foundP to true
        IF node is q, set foundQ to true
        IF node is p or node is q, RETURN node
        IF left and right are both present, RETURN node
        RETURN whichever of left or right is present
    result ← visit(root)
    IF foundP and foundQ are both true, RETURN result
    RETURN null`

export const code = CODE_TEXT.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def lowest_common_ancestor(root, p, q):
    found = {"p": False, "q": False}

    def visit(node):
        if node is None:
            return None
        left = visit(node.left)
        right = visit(node.right)
        if node.val == p:
            found["p"] = True
        if node.val == q:
            found["q"] = True
        if node.val == p or node.val == q:
            return node
        if left is not None and right is not None:
            return node
        return left if left is not None else right

    result = visit(root)
    if found["p"] and found["q"]:
        return result
    return None
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
  { id: 'start', label: 'Start', description: 'Both targets are unfound.' },
  { id: 'visit', label: 'Visit', description: 'Check a node after its children report back.' },
  { id: 'answer', label: 'Answer', description: 'Both targets found? Then the reported node is the LCA.' },
]

export function parseTree(values) {
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

export function buildNodes(values) {
  return values.map((v, i) => v === null ? null : {
    id: i,
    val: v,
    left: 2 * i + 1 < values.length && values[2 * i + 1] !== null ? 2 * i + 1 : null,
    right: 2 * i + 2 < values.length && values[2 * i + 2] !== null ? 2 * i + 2 : null,
  })
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with root, p and q.')
  const root = parseTree(input.root)
  if (!Number.isInteger(input.p) || !Number.isInteger(input.q)) throw new Error('p and q are integer node values (a value absent from the tree is allowed).')
  return { root, p: input.p, q: input.q }
}

export function buildTrace({ root, p, q }) {
  const nodes = buildNodes(root)
  const state = { p, q, foundP: false, foundQ: false }
  const frames = []
  frames.push({ pythonLine: P('found = {'), phase: 'start', activeLine: L('foundP ← false'), current: null, returned: null, foundP: false, foundQ: false, message: `Look for p = ${p} and q = ${q} in one post-order walk.` })
  const visit = id => {
    if (id === null) return null
    const node = nodes[id]
    const left = visit(node.left)
    const right = visit(node.right)
    const isP = node.val === p
    const isQ = node.val === q
    if (isP) state.foundP = true
    if (isQ) state.foundQ = true
    let returned
    let line
    let py
    let why
    if (isP || isQ) {
      returned = id
      line = L('IF node is p or node is q, RETURN node')
      py = P('if node.val == p or node.val == q:')
      why = `${node.val} is a target, so it is returned.`
    } else if (left !== null && right !== null) {
      returned = id
      line = L('IF left and right are both present')
      py = P('if left is not None and right is not None:')
      why = `Both sides report a target, so ${node.val} is the candidate.`
    } else {
      returned = left !== null ? left : right
      line = L('RETURN whichever of left or right is present')
      py = P('return left if left is not None else right')
      why = returned === null ? `Nothing below ${node.val} is a target.` : `Pass ${nodes[returned].val} up from below ${node.val}.`
    }
    frames.push({ pythonLine: py, phase: 'visit', activeLine: line, current: id, returned, foundP: state.foundP, foundQ: state.foundQ, message: `At ${node.val}: ${why}` })
    return returned
  }
  const result = visit(0)
  const answerId = state.foundP && state.foundQ ? result : null
  const answer = answerId === null ? null : nodes[answerId].val
  frames.push({ pythonLine: P('if found["p"] and found["q"]'), phase: 'answer', activeLine: L('IF foundP and foundQ'), current: null, returned: answerId, foundP: state.foundP, foundQ: state.foundQ, message: answer === null ? 'A target is missing from the tree, so the answer is null.' : `Both targets found. LCA is ${answer}.` })
  return { input: { root, p, q }, tree: nodes, result: answer, frames }
}
