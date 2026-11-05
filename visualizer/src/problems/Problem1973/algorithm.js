// LeetCode 1973: a node qualifies when its value equals the sum of everything below it. Post-order traversal returns each subtree sum, and the children's sums give the descendant sum.
const SOURCE = [
  "function equalToDescendants(root) {",
  "  let count = 0",
  "  const subtreeSum = node => {",
  "    if (!node) return 0",
  "    const left = subtreeSum(node.left)",
  "    const right = subtreeSum(node.right)",
  "    if (node.val === left + right) count++",
  "    return node.val + left + right",
  "  }",
  "  subtreeSum(root)",
  "  return count",
  "}",
]

export const code = SOURCE.map((text, index) => ({ line: index + 1, text }))

export const python = `def equal_to_descendants(root):
    count = 0
    def subtree_sum(node):
        nonlocal count
        if node is None:
            return 0
        left = subtree_sum(node.left)
        right = subtree_sum(node.right)
        if node.val == left + right:
            count += 1
        return node.val + left + right
    subtree_sum(root)
    return count
`

const L = text => { const i = SOURCE.findIndex(line => line.includes(text)); if (i < 0) throw new Error(`no code line: ${text}`); return i + 1 }
const P = text => { const i = python.split('\n').findIndex(line => line.includes(text)); if (i < 0) throw new Error(`no python line: ${text}`); return i + 1 }

export const phases = [
  { id: 'visit', label: 'Visit nodes', description: 'Visit children first, then compare each node with the sum below it.' },
  { id: 'done', label: 'Result', description: 'Count of matching nodes.' },
]

// Level-order array, null for a missing child, as in common tree notation.
export function parseInput(text) {
  let values
  try { values = JSON.parse(text) } catch { throw new Error('Enter a level-order JSON array, for example [5,3,9,null,null,1].') }
  if (!Array.isArray(values) || values.length < 1 || values.length > 15) throw new Error('Use 1 to 15 entries for the visualization.')
  if (values[0] === null) throw new Error('The root cannot be null.')
  if (!values.every(v => v === null || (Number.isInteger(v) && Math.abs(v) <= 100))) throw new Error('Values are integers from -100 to 100, or null.')
  const nodes = values.map((val, index) => (val === null ? null : { id: index, val, left: null, right: null }))
  let next = 1
  for (let i = 0; i < nodes.length && next < nodes.length; i++) {
    if (!nodes[i]) continue
    nodes[i].left = next < nodes.length ? nodes[next++] : null
    nodes[i].right = next < nodes.length ? nodes[next++] : null
  }
  return { root: nodes[0] }
}

function plain(node) {
  if (!node) return null
  return { id: node.id, val: node.val, children: [node.left, node.right].filter(Boolean).map(plain) }
}

export function buildTrace({ root }) {
  const frames = []
  const sums = new Map()
  let count = 0
  const matches = []
  const visit = node => {
    if (!node) return 0
    const left = visit(node.left)
    const right = visit(node.right)
    const match = node.val === left + right
    if (match) { count++; matches.push(node.id) }
    sums.set(node.id, node.val + left + right)
    frames.push({ phase: 'visit', activeLine: L(match ? 'count++' : 'if (node.val === left + right)'), pythonLine: P(match ? 'count += 1' : 'if node.val =='), message: `Node ${node.id} (value ${node.val}): descendants sum to ${left + right}${match ? ', so it counts.' : ', so it does not count.'}`, focus: node.id, matches: [...matches], sums: Object.fromEntries(sums), count, tree: plain(root), descendantSum: left + right })
    return node.val + left + right
  }
  visit(root)
  frames.push({ phase: 'done', activeLine: L('return count'), pythonLine: P('return count'), message: `${count} node(s) equal the sum of their descendants.`, focus: null, matches: [...matches], sums: Object.fromEntries(sums), count, tree: plain(root), descendantSum: null, result: count })
  return { input: { root }, result: count, frames }
}
