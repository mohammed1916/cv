const CODE_LINES = [
  'if root is null then return null',
  'define clone(node)',
  'copy is a new node with the same value',
  'for each child in order',
  'append clone(child) to copy.children',
  'return copy',
  'return clone(root)',
]

export const code = CODE_LINES.map((text, index) => ({ line: index + 1, text }))
const L = text => {
  const index = CODE_LINES.findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`pseudocode line missing: ${text}`)
  return index + 1
}

export const python = `class NaryNode:
    def __init__(self, val, children=None):
        self.val = val
        self.children = children if children is not None else []


def clone_nary(val, children):
    if not val:
        return None
    nodes = [NaryNode(v) for v in val]
    for i, kids in enumerate(children):
        nodes[i].children = [nodes[c] for c in kids]

    def clone(node):
        copy = NaryNode(node.val)
        for child in node.children:
            copy.children.append(clone(child))
        return copy

    root = clone(nodes[0])
    order = []
    stack = [root]
    while stack:
        node = stack.pop()
        order.append(node)
        stack.extend(reversed(node.children))
    index = {id(c): k for k, c in enumerate(order)}
    return {"val": [c.val for c in order],
            "children": [[index[id(ch)] for ch in c.children] for c in order]}
`
const PY_LINES = python.split('\n')
const P = text => {
  const index = PY_LINES.findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`python line missing: ${text}`)
  return index + 1
}

export const phases = [
  { id: 'start', label: 'Root', description: 'Begin at the root.' },
  { id: 'create', label: 'Copy', description: 'Create a new node with the same value.' },
  { id: 'descend', label: 'Child', description: 'Clone the next child in order.' },
  { id: 'attach', label: 'Attach', description: 'The cloned child joins the copy in its original position.' },
  { id: 'done', label: 'Result', description: 'Return the copy of the root.' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with val and children arrays.')
  const { val, children } = input
  if (!Array.isArray(val) || !Array.isArray(children) || val.length !== children.length) throw new Error('val and children must have the same length.')
  const n = val.length
  if (n > 10) throw new Error('The tree has at most 10 nodes (visualization cap).')
  if (!val.every(v => Number.isInteger(v) && v >= 0 && v <= 9)) throw new Error('Values are integers from 0 to 9 (visualization cap).')
  const parentCount = Array(n).fill(0)
  for (const kids of children) {
    if (!Array.isArray(kids)) throw new Error('Each children entry is a list of node indices.')
    for (const c of kids) {
      if (!Number.isInteger(c) || c < 1 || c >= n) throw new Error('Children are node indices from 1 to n-1; node 0 is the root.')
      parentCount[c]++
    }
  }
  if (n > 0 && parentCount.slice(1).some(count => count !== 1)) throw new Error('Every node except the root must have exactly one parent.')
  const reached = new Set()
  const walk = v => { if (reached.has(v)) return; reached.add(v); children[v].forEach(walk) }
  if (n > 0) walk(0)
  if (n > 0 && reached.size !== n) throw new Error('Every node must be reachable from node 0.')
  return { val, children }
}

export function buildTrace({ val, children }) {
  const n = val.length
  const frames = []
  const created = []
  const copyOf = new Map()
  const frame = (phase, activeLine, pythonLine, node, message) => frames.push({
    phase, activeLine, pythonLine, node, message, created: [...created], copyOf: new Map(copyOf), kids: children,
  })
  if (n === 0) {
    frame('done', L('if root is null'), P('if not val'), -1, 'The root is null, so the copy is null.')
    return { input: { val, children }, result: null, frames, created: [] }
  }
  const clone = node => {
    const copy = created.length
    copyOf.set(node, copy)
    created.push(node)
    frame('create', L('copy is a new node'), P('copy = NaryNode(node.val)'), node, `Copy node ${node} (value ${val[node]}) as new node ${copy}.`)
    for (const child of children[node]) {
      frame('descend', L('for each child in order'), P('for child in node.children'), child, `Descend into child ${child} of ${node}.`)
      clone(child)
      frame('attach', L('append clone(child)'), P('copy.children.append(clone(child))'), child, `Child ${child} is cloned and attached to copy ${copyOf.get(node)}.`)
    }
    return copy
  }
  frame('start', L('if root is null'), P('if not val'), 0, `Start cloning from the root, value ${val[0]}.`)
  clone(0)
  const newIndex = new Map(created.map((orig, k) => [orig, k]))
  const out = { val: created.map(orig => val[orig]), children: created.map(orig => children[orig].map(c => newIndex.get(c))) }
  frame('done', L('return clone(root)'), P('return {"val"'), -1, `Cloned ${created.length} node${created.length === 1 ? '' : 's'}, keeping child order.`)
  return { input: { val, children }, result: out, frames, created }
}
