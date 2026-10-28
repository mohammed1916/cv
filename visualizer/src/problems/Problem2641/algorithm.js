// Level-order slots: a node at slot k has its left child at the next free slot and its right child after it.
export function decodeTree(values) {
  if (values[0] === null) return null
  const root = { id: 0, value: values[0], left: null, right: null }
  const queue = [root]
  let cursor = 1
  for (let q = 0; q < queue.length; q++) {
    const node = queue[q]
    for (const side of ['left', 'right']) {
      if (cursor < values.length && values[cursor] !== null) {
        node[side] = { id: cursor, value: values[cursor], left: null, right: null }
        queue.push(node[side])
      }
      cursor++
    }
  }
  if (queue.length !== values.filter(v => v !== null).length) throw new Error('Every value must belong to the tree.')
  return root
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || !Array.isArray(input.root)) throw new Error('Use an object with a "root" level-order array.')
  const { root } = input
  if (root.length < 1 || root.length > 15 || root[0] === null) throw new Error('root must be a level-order array of 1 to 15 entries with a non-null root.')
  for (const v of root) {
    if (v !== null && (!Number.isInteger(v) || v < 1 || v > 100)) throw new Error('Node values are integers from 1 to 100, or null.')
  }
  decodeTree(root)
  return { root }
}

export function buildTrace(input) {
  const values = input.root
  const tree = decodeTree(values)
  const parent = new Map()
  const levels = []
  let current = [tree]
  while (current.length) {
    levels.push(current)
    const next = []
    for (const node of current) {
      for (const child of [node.left, node.right]) {
        if (child) { parent.set(child.id, node); next.push(child) }
      }
    }
    current = next
  }
  const frames = [{ phase: 'start', activeLine: L('set the current level to just the root'), depth: -1, ids: [], total: null, group: null, updated: {}, message: 'Every node will be replaced by the sum of its cousins. The root has no cousins, so it becomes 0.' }]
  const updated = {}
  const newValue = new Map()
  levels.forEach((nodes, depth) => {
    const total = nodes.reduce((sum, node) => sum + node.value, 0)
    frames.push({ phase: 'level', activeLine: L('compute the level total'), depth, ids: nodes.map(node => node.id), total, group: null, updated: { ...updated }, message: `Level ${depth} totals ${total}.` })
    for (const node of nodes) {
      const up = parent.get(node.id)
      const group = up ? (up.left ? up.left.value : 0) + (up.right ? up.right.value : 0) : node.value
      const value = total - group
      newValue.set(node.id, value)
      updated[node.id] = value
      frames.push({ phase: 'node', activeLine: L('set the new value'), depth, ids: [node.id], total, group, updated: { ...updated }, message: `Node ${node.value} has sibling group ${group}, so its new value is ${total} minus ${group}, which is ${value}.` })
    }
  })
  const result = values.map((value, index) => (value === null ? null : newValue.get(index)))
  frames.push({ phase: 'done', activeLine: L('return the new values'), depth: -1, ids: [], total: null, group: null, updated: { ...updated }, message: 'Every node now holds the sum of its cousins.' })
  return { input, root: tree, result, frames }
}

export const code = `replace each node value with the sum of its cousins
  set the current level to just the root
  while the current level is not empty
    compute the level total of the values on this level
    for each node on this level
      the sibling group is the sum of its parent children, or the node itself for the root
      set the new value to the level total minus the sibling group
    set the current level to the children of this level from left to right
  return the new values in the original array layout`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def replace_with_cousin_sums(root):
    if not root or root[0] is None:
        return []
    children = {}
    queue = [0]
    cursor = 1
    for index in queue:
        kids = []
        for _ in range(2):
            if cursor < len(root) and root[cursor] is not None:
                kids.append(cursor)
                queue.append(cursor)
            cursor += 1
        children[index] = kids
    group = {0: root[0]}
    for parent in queue:
        total_kids = sum(root[child] for child in children[parent])
        for child in children[parent]:
            group[child] = total_kids
    result = [None] * len(root)
    level = [0]
    while level:
        total = sum(root[i] for i in level)
        for i in level:
            result[i] = total - group[i]
        level = [child for i in level for child in children[i]]
    return result
`
