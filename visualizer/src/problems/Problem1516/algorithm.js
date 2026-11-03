export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input) || !input.root) throw new Error('Use an object with root, p and q.')
  const seen = new Set()
  const check = node => {
    if (!node || typeof node !== 'object' || !Number.isInteger(node.val) || !Array.isArray(node.children)) throw new Error('Each node needs an integer val and a children list.')
    if (seen.has(node.val)) throw new Error('Node values must be unique.')
    seen.add(node.val)
    if (seen.size > 20) throw new Error('The visualization caps the tree at 20 nodes.')
    node.children.forEach(check)
  }
  check(input.root)
  if (!Number.isInteger(input.p) || !Number.isInteger(input.q)) throw new Error('p and q are node values.')
  if (!seen.has(input.p) || !seen.has(input.q)) throw new Error('p and q must both appear in the tree.')
  if (input.p === input.q) throw new Error('p and q must be different nodes.')
  return { root: input.root, p: input.p, q: input.q }
}

const snap = node => ({ val: node.val, children: node.children.map(snap) })
const toNode = plain => ({ val: plain.val, children: plain.children.map(toNode) })
const findNode = (node, value) => {
  if (node.val === value) return node
  for (const child of node.children) {
    const hit = findNode(child, value)
    if (hit) return hit
  }
  return null
}
const parentOf = (root, target) => {
  let found = null
  const walk = node => node.children.forEach(child => {
    if (child === target) found = node
    else walk(child)
  })
  walk(root)
  return found
}
const inSubtree = (top, target) => top === target || top.children.some(child => inSubtree(child, target))

export const code = `move node p and its subtree to the end of q's children
  find nodes p and q
  if p is already a direct child of q then return the root unchanged
  find the parent of p and the parent of q
  if q lies inside the subtree of p
    detach q from its parent
    put q in the position p occupied, under p's parent, or make q the root
    append p to the end of q's children
  else
    detach p from its parent
    append p to the end of q's children
  return the root`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => {
  const index = code.findIndex(c => c.text.includes(s))
  if (index < 0) throw new Error(`Missing pseudocode line: ${s}`)
  return index + 1
}

export const python = `class Node:
    def __init__(self, val, children=None):
        self.val = val
        self.children = children if children is not None else []

def parent_of(root, target):
    stack = [root]
    while stack:
        node = stack.pop()
        for child in node.children:
            if child is target:
                return node
            stack.append(child)
    return None

def in_subtree(top, target):
    stack = [top]
    while stack:
        node = stack.pop()
        if node is target:
            return True
        stack.extend(node.children)
    return False

def move_subtree(root, p, q):
    if p in q.children:
        return root
    p_parent = parent_of(root, p)
    if in_subtree(p, q):
        q_parent = parent_of(root, q)
        q_parent.children.remove(q)
        if p_parent is None:
            root = q
        else:
            p_parent.children[p_parent.children.index(p)] = q
        q.children.append(p)
    else:
        p_parent.children.remove(p)
        q.children.append(p)
    return root
`
const P = s => {
  const index = python.split('\n').findIndex(line => line.includes(s))
  if (index < 0) throw new Error(`Missing python line: ${s}`)
  return index + 1
}

export function buildTrace({ root: plain, p: pv, q: qv }) {
  let top = toNode(plain)
  const pNode = findNode(top, pv)
  const qNode = findNode(top, qv)
  const frames = []
  let mode = null
  const push = (frame) => frames.push({ ...frame, tree: snap(top), p: pv, q: qv, mode })

  push({ pythonLine: P('def move_subtree'), phase: 'start', activeLine: L('move node p'), message: `Move ${pv} and its subtree under ${qv}.` })
  push({ pythonLine: P('if p in q.children'), phase: 'check', activeLine: L('if p is already a direct child'), message: qNode.children.includes(pNode) ? `${pv} is already a child of ${qv}.` : `${pv} is not yet a child of ${qv}.` })
  if (qNode.children.includes(pNode)) {
    push({ pythonLine: P('return root'), phase: 'done', activeLine: L('return the root unchanged'), message: 'Nothing changes; the root stays the same.' })
    return { input: { root: plain, p: pv, q: qv }, result: snap(top), frames }
  }

  const pParent = parentOf(top, pNode)
  const qParent = parentOf(top, qNode)
  push({ pythonLine: P('p_parent = parent_of'), phase: 'locate', activeLine: L('find the parent of p'), message: `${pv}'s parent is ${pParent ? pParent.val : 'none (root)'}; ${qv}'s parent is ${qParent ? qParent.val : 'none'}.` })

  const inside = inSubtree(pNode, qNode)
  mode = inside ? 'inside' : 'outside'
  push({ pythonLine: P('if in_subtree(p, q)'), phase: 'decide', activeLine: L('if q lies inside the subtree of p'), message: inside ? `${qv} lies inside ${pv}'s subtree, so ${qv} must move first.` : `${qv} is outside ${pv}'s subtree, so ${pv} can move directly.` })

  if (inside) {
    qParent.children.splice(qParent.children.indexOf(qNode), 1)
    push({ pythonLine: P('q_parent.children.remove(q)'), phase: 'detach', activeLine: L('detach q from its parent'), message: `Detach ${qv} from ${qParent.val}.` })
    if (pParent === null) {
      top = qNode
    } else {
      pParent.children[pParent.children.indexOf(pNode)] = qNode
    }
    push({ pythonLine: P('p_parent.children[p_parent.children.index(p)] = q'), phase: 'splice', activeLine: L('put q in the position p occupied'), message: pParent === null ? `${qv} becomes the new root.` : `${qv} takes the slot ${pv} occupied under ${pParent.val}.` })
    qNode.children.push(pNode)
    push({ pythonLine: P('q.children.append(p)'), phase: 'attach', activeLine: L('append p to the end of q'), message: `Append ${pv} to the end of ${qv}'s children.` })
  } else {
    pParent.children.splice(pParent.children.indexOf(pNode), 1)
    push({ pythonLine: P('p_parent.children.remove(p)'), phase: 'detach', activeLine: L('detach p from its parent'), message: `Detach ${pv} from ${pParent.val}.` })
    qNode.children.push(pNode)
    push({ pythonLine: P('q.children.append(p)'), phase: 'attach', activeLine: L('append p to the end of q'), message: `Append ${pv} to the end of ${qv}'s children.` })
  }

  push({ pythonLine: P('return root'), phase: 'done', activeLine: L('return the root'), message: `${pv} now sits under ${qv}; the root is ${top.val}.` })
  return { input: { root: plain, p: pv, q: qv }, result: snap(top), frames }
}
