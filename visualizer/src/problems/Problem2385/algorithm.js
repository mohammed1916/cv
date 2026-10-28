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
  const reached = queue.length
  if (reached !== values.filter(v => v !== null).length) throw new Error('Every value must belong to the tree.')
  return root
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || !Array.isArray(input.root)) throw new Error('Use an object with a "root" level-order array and a "start" value.')
  const { root, start } = input
  if (root.length < 1 || root.length > 15 || root[0] === null) throw new Error('root must be a level-order array of 1 to 15 entries with a non-null root.')
  const seen = new Set()
  for (const v of root) {
    if (v === null) continue
    if (!Number.isInteger(v) || v < 1 || v > 100) throw new Error('Node values are distinct integers from 1 to 100.')
    if (seen.has(v)) throw new Error('Node values must be distinct.')
    seen.add(v)
  }
  decodeTree(root)
  if (!Number.isInteger(start) || !seen.has(start)) throw new Error('start must be a value that appears in the tree.')
  return { root, start }
}

export function buildTrace(input) {
  const root = decodeTree(input.root)
  const neighbors = new Map()
  const byId = new Map()
  const link = (a, b) => { neighbors.get(a.id).push(b.id); neighbors.get(b.id).push(a.id) }
  const walk = node => {
    byId.set(node.id, node)
    neighbors.set(node.id, [])
    for (const child of [node.left, node.right]) if (child) { walk(child); link(node, child) }
  }
  walk(root)
  const startNode = [...byId.values()].find(node => node.value === input.start)
  const minutes = new Map([[startNode.id, 0]])
  const frames = [{ phase: 'start', activeLine: L('mark the start node'), minute: 0, newly: [startNode.id], infected: { [startNode.id]: 0 }, message: `Node ${input.start} is infected at minute 0.` }]
  let frontier = [startNode.id]
  let minute = 0
  for (;;) {
    const next = []
    for (const id of frontier) {
      for (const other of neighbors.get(id)) {
        if (!minutes.has(other)) { minutes.set(other, minute + 1); next.push(other) }
      }
    }
    if (next.length === 0) break
    minute++
    frontier = next
    frames.push({ phase: 'spread', activeLine: L('collect each neighbor'), minute, newly: next, infected: Object.fromEntries(minutes), message: `Minute ${minute}: ${next.map(id => byId.get(id).value).join(', ')} become infected.` })
  }
  frames.push({ phase: 'done', activeLine: L('return the last minute'), minute, newly: [], infected: Object.fromEntries(minutes), message: `The whole tree is infected after ${minute} minute(s).` })
  return { input, root, result: minute, frames }
}

export const code = `amount of time for a binary tree to be infected from a start node
  link every node to its parent and its children as neighbors
  mark the start node as infected at minute 0
  set the frontier to just the start node
  repeat while the frontier is not empty
    collect each neighbor that is not infected yet, one minute after its source
    if nothing was collected then stop repeating
    set the frontier to the collected nodes
  return the last minute that infected a node`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def amount_of_time(root, start):
    if not root or root[0] is None:
        return 0
    neighbors = {0: []}
    value_at = {0: root[0]}
    queue = [0]
    cursor = 1
    for index in queue:
        for _ in range(2):
            if cursor < len(root) and root[cursor] is not None:
                neighbors[cursor] = [index]
                neighbors[index].append(cursor)
                value_at[cursor] = root[cursor]
                queue.append(cursor)
            cursor += 1
    begin = next(i for i in neighbors if value_at[i] == start)
    distance = {begin: 0}
    frontier = [begin]
    while frontier:
        collected = []
        for index in frontier:
            for other in neighbors[index]:
                if other not in distance:
                    distance[other] = distance[index] + 1
                    collected.append(other)
        if not collected:
            break
        frontier = collected
    return max(distance.values())
`
