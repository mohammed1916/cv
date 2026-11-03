export const phases = [
  { id: 'setup', label: 'Setup', description: 'Read the tree in level order and queue the root.' },
  { id: 'level', label: 'Level', description: 'Count the nodes waiting in the queue; they form the current level.' },
  { id: 'link', label: 'Link', description: 'Point each node at the next node queued on the same level.' },
  { id: 'enqueue', label: 'Children', description: 'Queue the children of the node that was just linked.' },
  { id: 'done', label: 'Result', description: 'Every node points to its right neighbour on its level, or to null.' },
]

const CODE_LINES = [
  'FUNCTION connect(root)',
  '  queue <- [root]',
  '  WHILE queue is not empty',
  '    size <- number of nodes queued for this level',
  '    FOR k from 1 to size',
  '      node <- pop the front; node.next <- new front, or null on the last node',
  '      push node.left and node.right when they exist',
  '  RETURN root',
]

const PYTHON_LINES = [
  'from collections import deque',
  'def connect(root):',
  '    queue = deque([root])',
  '    while queue:',
  '        size = len(queue)',
  '        for k in range(size):',
  '            node = queue.popleft()',
  '            node.next = queue[0] if k < size - 1 else None',
  '            if node.left: queue.append(node.left)',
  '            if node.right: queue.append(node.right)',
  '    return root',
]

const py = text => PYTHON_LINES.findIndex(line => line.includes(text)) + 1

export const python = PYTHON_LINES.join('\n')
export const code = CODE_LINES.map((text, index) => ({ line: index + 1, text }))
export const pythonLineMap = {
  1: py('def connect'), 2: py('queue = deque'), 3: py('while queue'), 4: py('size = len'), 5: py('for k in'),
  6: py('popleft'), 7: py('if node.left'), 8: py('return root'),
}

const NODE_LIMIT = 30
const VALUE_LIMIT = 99

// Input: a JSON array in level order, where null marks a missing child. Trailing entries may be omitted.
export function parseInput(text) {
  let entries
  try {
    entries = typeof text === 'string' ? JSON.parse(text) : text
  } catch {
    throw new Error('Input must be a JSON array in level order, such as [4,2,9,1,null,null,6,3]')
  }
  if (!Array.isArray(entries) || entries.length < 1 || entries.length > NODE_LIMIT + 1) {
    throw new Error(`Enter a JSON array of 1-${NODE_LIMIT + 1} entries in level order. Use null for a missing child.`)
  }
  if (entries[0] === null) throw new Error('The first entry is the root and cannot be null.')
  entries.forEach((value, index) => {
    if (value !== null && (!Number.isInteger(value) || Math.abs(value) > VALUE_LIMIT)) {
      throw new Error(`Entry ${index} must be null or an integer from -${VALUE_LIMIT} to ${VALUE_LIMIT}.`)
    }
  })
  return { entries: [...entries] }
}

// Builds the tree by consuming entries two at a time, left child then right child, in queue order.
function buildTree(entries) {
  const nodes = [{ id: 0, value: entries[0], depth: 0, left: null, right: null }]
  const queue = [nodes[0]]
  let used = 1
  for (let head = 0; head < queue.length; head++) {
    const node = queue[head]
    for (const side of ['left', 'right']) {
      const value = used < entries.length ? entries[used] : null
      used += 1
      if (value === null) continue
      const child = { id: nodes.length, value, depth: node.depth + 1, left: null, right: null }
      nodes.push(child)
      node[side] = child
      queue.push(child)
    }
  }
  if (used < entries.length) throw new Error(`Entry ${used} is not attached to any node. Remove the extra entries.`)
  return nodes
}

export function buildTrace(text) {
  const { entries } = parseInput(text)
  const nodes = buildTree(entries)
  const levels = []
  for (const node of nodes) {
    levels[node.depth] = levels[node.depth] || []
    levels[node.depth].push(node.id)
  }
  const input = {
    entries,
    nodes: nodes.map(({ id, value, depth }) => ({ id, value, depth })),
    levels,
  }

  const frames = []
  const nextOf = {}
  const snap = (phase, activeLine, message, { depth = 0, queue = [], current = -1, extra = {} } = {}) => frames.push({
    phase, activeLine, message,
    snapshot: { depth, queue: queue.map(node => node.id), current, next: { ...nextOf }, ...extra },
  })

  const queue = [nodes[0]]
  snap('setup', 2, `The root ${nodes[0].value} is queued. Each level will be linked from left to right.`, { queue })
  let depth = 0
  while (queue.length > 0) {
    const size = queue.length
    snap('level', 4, `Level ${depth} has ${size} node(s) waiting in the queue.`, { depth, queue })
    for (let k = 0; k < size; k++) {
      const node = queue.shift()
      nextOf[node.id] = k < size - 1 ? queue[0].id : null
      const target = k < size - 1 ? `${queue[0].value}` : 'null, because it is the last node on this level'
      snap('link', 6, `Node ${node.value} points to ${target}.`, { depth, queue, current: node.id })
      if (node.left) queue.push(node.left)
      if (node.right) queue.push(node.right)
      snap('enqueue', 7, `Queue the children of ${node.value} for the next level.`, { depth, queue, current: node.id })
    }
    depth += 1
  }

  const result = nodes.map(node => (nextOf[node.id] === null || nextOf[node.id] === undefined ? null : nodes[nextOf[node.id]].value))
  snap('done', 8, `Every node is linked. ${result.filter(v => v !== null).length} node(s) have a right neighbour.`, { depth, extra: { result } })
  return { input, result, frames }
}
