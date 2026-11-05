// LeetCode 2196: Create Binary Tree From Descriptions.
// Each description [parent, child, isLeft] attaches child to parent on the left or right. The root is the only
// value that never appears as a child. Attach every description, then read the tree back level by level.

const MAX_DESCRIPTIONS = 9
const MAX_VALUE = 15

export function parseInput(text) {
  let rows
  try { rows = JSON.parse(text) } catch { throw new Error('Use JSON like [[20,15,1],[20,17,0],[15,2,0]].') }
  if (!Array.isArray(rows) || rows.length < 1 || rows.length > MAX_DESCRIPTIONS) throw new Error(`Use 1 to ${MAX_DESCRIPTIONS} descriptions.`)
  const children = new Set()
  const slots = new Set()
  const parents = new Set()
  for (const row of rows) {
    if (!Array.isArray(row) || row.length !== 3 || !Number.isInteger(row[0]) || !Number.isInteger(row[1]) || ![0, 1].includes(row[2])) throw new Error('Each description is [parent, child, isLeft] with isLeft 0 or 1.')
    if (row[0] < 1 || row[0] > MAX_VALUE || row[1] < 1 || row[1] > MAX_VALUE || row[0] === row[1]) throw new Error(`Values are distinct integers from 1 to ${MAX_VALUE}.`)
    if (children.has(row[1])) throw new Error('Each child may appear only once.')
    const slot = `${row[0]}:${row[2]}`
    if (slots.has(slot)) throw new Error('Each parent has at most one left and one right child.')
    children.add(row[1]); slots.add(slot); parents.add(row[0])
  }
  const roots = [...parents].filter(p => !children.has(p))
  if (roots.length !== 1) throw new Error('The descriptions must form one tree with a single root.')
  return { rows }
}

export const code = `FUNCTION createBinaryTree(descriptions)
    nodes ← empty map
    childSet ← empty set
    FOR each [parent, child, isLeft] in descriptions
        make nodes for parent and child if missing
        IF isLeft = 1 THEN nodes[parent].left ← nodes[child]
        ELSE nodes[parent].right ← nodes[child]
        add child to childSet
    root ← the parent that is not in childSet
    RETURN nodes[root]`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def create_binary_tree(descriptions):
    nodes = {}
    child_set = set()
    for parent, child, is_left in descriptions:
        nodes.setdefault(parent, {"val": parent, "left": None, "right": None})
        nodes.setdefault(child, {"val": child, "left": None, "right": None})
        if is_left:
            nodes[parent]["left"] = nodes[child]
        else:
            nodes[parent]["right"] = nodes[child]
        child_set.add(child)
    root = next(v for v in nodes if v not in child_set)
    return nodes[root]
`

const L = text => {
  const index = code.findIndex(line => line.text.includes(text))
  if (index < 0) throw new Error(`Missing pseudocode line: ${text}`)
  return index + 1
}
const P = text => {
  const index = python.split('\n').findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`Missing python line: ${text}`)
  return index + 1
}

export const phases = [
  { id: 'attach', label: 'Attach', description: 'Each description hangs one child on its parent.' },
  { id: 'root', label: 'Root', description: 'The parent that is never a child is the root.' },
  { id: 'done', label: 'Tree', description: 'The finished tree, level by level.' },
]

export function buildTrace({ rows }) {
  const left = new Map()
  const right = new Map()
  const childSet = new Set()
  const nodesSeen = new Set()
  const frames = []
  const snapshot = () => ({ left: new Map(left), right: new Map(right), nodes: [...nodesSeen].sort((a, b) => a - b) })
  const push = (phase, index, activeLine, pythonLine, message, extra = {}) => frames.push({ phase, index, activeLine, pythonLine, message, rows, ...snapshot(), ...extra })
  push('attach', -1, L('nodes ← empty'), P('nodes = {}'), `${rows.length} description(s) to attach.`)
  rows.forEach(([p, c, isLeft], i) => {
    nodesSeen.add(p); nodesSeen.add(c)
    if (isLeft) left.set(p, c); else right.set(p, c)
    childSet.add(c)
    push('attach', i, L('IF isLeft = 1'), P(isLeft ? 'nodes[parent]["left"]' : 'nodes[parent]["right"]'),
      `${p} gets ${c} as its ${isLeft ? 'left' : 'right'} child.`, { current: p, child: c })
  })
  const root = [...nodesSeen].find(v => !childSet.has(v))
  push('root', -1, L('root ← the parent'), P('root = next'), `${root} is never a child, so it is the root.`, { root })
  // Level-order read-back.
  const levels = []
  let frontier = [root]
  while (frontier.length) {
    levels.push(frontier)
    const next = []
    for (const v of frontier) { if (left.has(v)) next.push(left.get(v)); if (right.has(v)) next.push(right.get(v)) }
    frontier = next
  }
  const levelOrder = levels.flat().map(v => v)
  push('done', -1, L('RETURN nodes[root]'), P('return nodes[root]'), `The root is ${root}; the tree has ${nodesSeen.size} nodes in ${levels.length} level(s).`, { root, levels: levels.map(l => l.slice()) })
  return { input: { rows }, result: { root, levelOrder }, frames }
}
