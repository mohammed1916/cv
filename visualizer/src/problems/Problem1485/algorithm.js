const CODE_LINES = [
  'copies is an empty map from original node to copy',
  'define clone(node)',
  'if node is null then return null',
  'if node is already in copies then return copies[node]',
  'make a copy with the same value and record copies[node] = copy',
  'copy.left = clone(node.left)',
  'copy.right = clone(node.right)',
  'copy.random = clone(node.random)',
  'return copy',
  'return clone(root)',
]

export const code = CODE_LINES.map((text, index) => ({ line: index + 1, text }))
const L = text => {
  const index = CODE_LINES.findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`pseudocode line missing: ${text}`)
  return index + 1
}

export const python = `class Node:
    def __init__(self, val, left=None, right=None, random=None):
        self.val = val
        self.left = left
        self.right = right
        self.random = random


def clone_tree(val, left, right, random):
    originals = [Node(v) for v in val]
    for i in range(len(val)):
        originals[i].left = originals[left[i]] if left[i] >= 0 else None
        originals[i].right = originals[right[i]] if right[i] >= 0 else None
        originals[i].random = originals[random[i]] if random[i] >= 0 else None
    copies = {}

    def clone(node):
        if node is None:
            return None
        if node in copies:
            return copies[node]
        copy = Node(node.val)
        copies[node] = copy
        copy.left = clone(node.left)
        copy.right = clone(node.right)
        copy.random = clone(node.random)
        return copy

    clone(originals[0])
    order = list(copies.values())
    index = {id(c): k for k, c in enumerate(order)}
    out_left = [index[id(c.left)] if c.left is not None else -1 for c in order]
    out_right = [index[id(c.right)] if c.right is not None else -1 for c in order]
    out_random = [index[id(c.random)] if c.random is not None else -1 for c in order]
    return {"val": [c.val for c in order], "left": out_left, "right": out_right, "random": out_random}
`
const PY_LINES = python.split('\n')
const P = text => {
  const index = PY_LINES.findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`python line missing: ${text}`)
  return index + 1
}

export const phases = [
  { id: 'start', label: 'Empty map', description: 'No copies exist yet.' },
  { id: 'empty', label: 'Null', description: 'A missing pointer stays missing.' },
  { id: 'create', label: 'Copy', description: 'Make one new node and record it in the map.' },
  { id: 'seen', label: 'Reuse', description: 'The node was already copied; reuse that copy.' },
  { id: 'link', label: 'Link', description: 'Wire the left, right and random pointers.' },
  { id: 'done', label: 'Result', description: 'Return the copy of the root.' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with val, left, right and random arrays.')
  const { val, left, right, random } = input
  const arrays = [val, left, right, random]
  if (!arrays.every(Array.isArray) || !arrays.every(a => a.length === val.length)) throw new Error('val, left, right and random must have the same length.')
  const n = val.length
  if (n < 1 || n > 10) throw new Error('The tree has 1 to 10 nodes (visualization cap).')
  if (!val.every(v => Number.isInteger(v) && v >= 0 && v <= 9)) throw new Error('Values are integers from 0 to 9 (visualization cap).')
  const ok = x => Number.isInteger(x) && x >= -1 && x < n
  if (!left.every(ok) || !right.every(ok) || !random.every(ok)) throw new Error('Pointers are node indices, or -1 for null.')
  const seenChild = new Set()
  for (let v = 0; v < n; v++) {
    for (const child of [left[v], right[v]]) {
      if (child === -1) continue
      if (seenChild.has(child) || child === 0) throw new Error('Node 0 is the root; every other node is the child of exactly one parent.')
      seenChild.add(child)
    }
  }
  const reached = new Set()
  const walk = v => {
    if (v === -1 || reached.has(v)) return
    reached.add(v)
    walk(left[v])
    walk(right[v])
  }
  walk(0)
  if (reached.size !== n) throw new Error('Every node must be reachable from node 0 through left and right.')
  return { val, left, right, random }
}

export function buildTrace({ val, left, right, random }) {
  const n = val.length
  const copyOf = new Map()
  const created = []
  const frames = []
  const frame = (phase, activeLine, pythonLine, node, message) => frames.push({
    phase, activeLine, pythonLine, node, message,
    copies: [...copyOf.entries()].map(([orig, copy]) => [orig, copy]), created: [...created],
  })
  const clone = node => {
    if (node === -1) {
      frame('empty', L('if node is null'), P('if node is None'), node, 'This pointer is null, so the copy is null.')
      return
    }
    if (copyOf.has(node)) {
      frame('seen', L('if node is already in copies'), P('if node in copies'), node, `Node ${node} was copied earlier; reuse copy ${copyOf.get(node)}.`)
      return
    }
    const copy = created.length
    copyOf.set(node, copy)
    created.push(node)
    frame('create', L('make a copy with the same value'), P('copy = Node(node.val)'), node, `Copy node ${node} (value ${val[node]}) as new node ${copy}.`)
    clone(left[node])
    clone(right[node])
    frame('link', L('copy.left = clone'), P('copy.left = clone(node.left)'), node, `Node ${node}: left and right are wired.`)
    clone(random[node])
    frame('link', L('copy.random = clone'), P('copy.random = clone(node.random)'), node, `Node ${node}: random pointer wired.`)
  }
  frame('start', L('copies is an empty map'), P('copies = {}'), -1, 'No node has been copied yet.')
  clone(0)
  const out = { val: [], left: [], right: [], random: [] }
  const nodeIds = created
  // Output: copies numbered in creation order, pointers rewritten to those numbers.
  const newIndex = new Map(nodeIds.map((orig, k) => [orig, k]))
  for (const orig of nodeIds) {
    out.val.push(val[orig])
    out.left.push(left[orig] === -1 ? -1 : newIndex.get(left[orig]))
    out.right.push(right[orig] === -1 ? -1 : newIndex.get(right[orig]))
    out.random.push(random[orig] === -1 ? -1 : newIndex.get(random[orig]))
  }
  frame('done', L('return clone(root)'), P('return {"val"'), -1, `Cloned ${nodeIds.length} of ${n} node${n === 1 ? '' : 's'}; the copy of node 0 is new node ${copyOf.get(0)}.`)
  return { input: { val, left, right, random }, result: out, frames, created: nodeIds }
}
