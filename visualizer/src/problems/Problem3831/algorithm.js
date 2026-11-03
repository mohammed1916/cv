export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with values and level.')
  const { values, level } = input
  if (!Array.isArray(values) || values.length < 1 || values.length > 15) throw new Error('values lists 1 to 15 integers.')
  if (!values.every(Number.isInteger)) throw new Error('Each value is an integer.')
  if (new Set(values).size !== values.length) throw new Error('Values are distinct, so the search tree is unambiguous.')
  if (!Number.isInteger(level) || level < 0 || level > 14) throw new Error('level is an integer from 0 to 14.')
  return { values, level }
}

export const code = `upper median of a binary search tree level
  root = none
  for each value in insertion order
    insert value into the search tree
  found = []
  queue = [(root, 0)]
  while queue is not empty
    pop (node, depth)
    if depth equals level then add node value to found
    push its children with depth plus 1
  if found is empty then return -1
  sort found
  return found[floor(len(found) / 2)]`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => { const i = code.findIndex(c => c.text.includes(s)); if (i < 0) throw new Error(`missing pseudocode: ${s}`); return i + 1 }

export const python = `def level_upper_median(values, level):
    root = None
    for v in values:
        if root is None:
            root = [v, None, None]
            continue
        node = root
        while True:
            side = 1 if v < node[0] else 2
            if node[side] is None:
                node[side] = [v, None, None]
                break
            node = node[side]
    found = []
    queue = [(root, 0)] if root else []
    head = 0
    while head < len(queue):
        node, depth = queue[head]
        head += 1
        if depth == level:
            found.append(node[0])
        for child in (node[1], node[2]):
            if child is not None:
                queue.append((child, depth + 1))
    if not found:
        return -1
    found.sort()
    return found[len(found) // 2]`
const PY = python.split('\n')
const Q = s => { const i = PY.findIndex(l => l.includes(s)); if (i < 0) throw new Error(`missing python: ${s}`); return i + 1 }

export function buildTrace({ values, level }) {
  // Build the full tree first to fix each node's position; frames then replay the construction.
  const nodes = []
  let root = null
  for (const v of values) {
    const id = nodes.length
    nodes.push({ id, val: v, left: null, right: null, depth: 0, parent: null, rank: 0 })
    if (root === null) { root = id; continue }
    let cur = root
    for (;;) {
      const side = v < nodes[cur].val ? 'left' : 'right'
      if (nodes[cur][side] === null) { nodes[cur][side] = id; nodes[id].parent = cur; nodes[id].depth = nodes[cur].depth + 1; break }
      cur = nodes[cur][side]
    }
  }
  let rank = 0
  const inorder = (id) => { if (id === null) return; inorder(nodes[id].left); nodes[id].rank = rank++; inorder(nodes[id].right) }
  inorder(root)
  const frames = []
  const present = new Set()
  frames.push({ phase: 'start', present: [], current: null, path: [], found: [], nodes, level, sorted: null, pickIndex: null, result: null, pythonLine: Q('root = None'), activeLine: L('root = none'), message: `Insert ${values.length} distinct values, then read level ${level}.` })
  for (const id of nodes.map(n => n.id)) {
    const v = nodes[id].val
    const path = []
    if (id === 0) {
      present.add(id)
      frames.push({ phase: 'insert', present: [...present], current: id, path: [], found: [], nodes, level, sorted: null, pickIndex: null, result: null, pythonLine: Q('root = [v, None, None]'), activeLine: L('insert value into the search tree'), message: `${v} becomes the root.` })
      continue
    }
    let cur = 0
    for (;;) {
      path.push(cur)
      if (v < nodes[cur].val) { if (nodes[cur].left === id) break; cur = nodes[cur].left } else { if (nodes[cur].right === id) break; cur = nodes[cur].right }
    }
    path.push(id)
    present.add(id)
    frames.push({ phase: 'insert', present: [...present], current: id, path: [...path], found: [], nodes, level, sorted: null, pickIndex: null, result: null, pythonLine: Q('side = 1 if v < node[0]'), activeLine: L('insert value into the search tree'), message: `${v} walks down ${path.length - 1} comparison${path.length - 1 === 1 ? '' : 's'} and attaches as a ${nodes[id].depth === nodes[nodes[id].parent].depth + 1 && v < nodes[nodes[id].parent].val ? 'left' : 'right'} child of ${nodes[nodes[id].parent].val}.` })
  }
  const found = []
  const queue = root === null ? [] : [root]
  let head = 0
  while (head < queue.length) {
    const id = queue[head++]
    if (nodes[id].depth === level) found.push(nodes[id].val)
    for (const c of [nodes[id].left, nodes[id].right]) if (c !== null) queue.push(c)
    frames.push({ phase: 'scan', present: [...present], current: id, path: [], found: [...found], nodes, level, sorted: null, pickIndex: null, result: null, pythonLine: Q('if depth == level'), activeLine: L('if depth equals level'), message: nodes[id].depth === level ? `Node ${nodes[id].val} is on level ${level}; collected.` : `Node ${nodes[id].val} is on level ${nodes[id].depth}; skipped.` })
  }
  if (found.length === 0) {
    frames.push({ phase: 'done', present: [...present], current: null, path: [], found: [], nodes, level, sorted: null, pickIndex: null, result: -1, pythonLine: Q('return -1'), activeLine: L('then return -1'), message: `Level ${level} has no nodes: answer -1.` })
    return { input: { values, level }, result: -1, frames }
  }
  const sorted = [...found].sort((a, b) => a - b)
  const pickIndex = Math.floor(sorted.length / 2)
  const result = sorted[pickIndex]
  frames.push({ phase: 'pick', present: [...present], current: null, path: [], found: [...found], nodes, level, sorted, pickIndex, result, pythonLine: Q('found.sort()'), activeLine: L('sort found'), message: `${sorted.length} value${sorted.length === 1 ? '' : 's'} on level ${level}; the upper median is ${result}.` })
  frames.push({ phase: 'done', present: [...present], current: null, path: [], found: [...found], nodes, level, sorted, pickIndex, result, pythonLine: Q('return found[len(found)'), activeLine: L('return found[floor'), message: `Upper median of level ${level}: ${result}.` })
  return { input: { values, level }, result, frames }
}
