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
  const seen = new Set()
  for (const v of root) {
    if (v === null) continue
    if (!Number.isInteger(v) || v < 1 || v > 50) throw new Error('Node values are distinct integers from 1 to 50.')
    if (seen.has(v)) throw new Error('Node values must be distinct.')
    seen.add(v)
  }
  decodeTree(root)
  return { root }
}

// Swaps needed to sort values: each cycle of the target permutation of length k costs k minus one swaps.
function minimumSwaps(values) {
  const sorted = [...values].sort((a, b) => a - b)
  const rank = new Map(sorted.map((v, i) => [v, i]))
  const target = values.map(v => rank.get(v))
  const seen = new Array(values.length).fill(false)
  let swaps = 0
  for (let start = 0; start < values.length; start++) {
    if (seen[start]) continue
    let size = 0
    for (let cur = start; !seen[cur]; cur = target[cur]) { seen[cur] = true; size++ }
    swaps += size - 1
  }
  return swaps
}

export function buildTrace(input) {
  const root = decodeTree(input.root)
  const frames = [{ phase: 'start', activeLine: L('set total swaps to zero'), depth: -1, ids: [], values: [], swaps: 0, total: 0, message: 'Sort each level of the tree and add up the swaps.' }]
  let total = 0
  let current = [root]
  let depth = 0
  while (current.length) {
    const values = current.map(node => node.value)
    const swaps = minimumSwaps(values)
    total += swaps
    frames.push({ phase: 'level', activeLine: L('count the swaps'), depth, ids: current.map(node => node.id), values, swaps, total, message: `Level ${depth} holds [${values.join(', ')}] and needs ${swaps} swap(s).` })
    current = current.flatMap(node => [node.left, node.right].filter(Boolean))
    depth++
  }
  frames.push({ phase: 'done', activeLine: L('return the total swaps'), depth: -1, ids: [], values: [], swaps: 0, total, message: `Total operations: ${total}.` })
  return { input, root, result: total, frames }
}

export const code = `minimum swaps to sort every level of a binary tree
  set total swaps to zero
  set the current level to just the root
  while the current level is not empty
    read the values of the level from left to right
    count the swaps needed to sort those values
    add those swaps to total swaps
    set the current level to the children of this level from left to right
  return the total swaps`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def min_operations(root):
    if not root or root[0] is None:
        return 0
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
    total = 0
    level = [0]
    while level:
        values = [root[i] for i in level]
        rank = {v: r for r, v in enumerate(sorted(values))}
        target = [rank[v] for v in values]
        seen = [False] * len(values)
        for start in range(len(values)):
            if seen[start]:
                continue
            size = 0
            cur = start
            while not seen[cur]:
                seen[cur] = True
                cur = target[cur]
                size += 1
            total += size - 1
        level = [child for i in level for child in children[i]]
    return total
`
