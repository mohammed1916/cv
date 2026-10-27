import { treeFromLevelOrder } from '../../components/shared/treeLayout.js'

function valuesIn(root) {
  const found = []
  const stack = root ? [root] : []
  while (stack.length) {
    const node = stack.pop()
    found.push(node.value)
    if (node.left) stack.push(node.left)
    if (node.right) stack.push(node.right)
  }
  return found
}

export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || !Array.isArray(data.arr) || !Number.isInteger(data.x) || !Number.isInteger(data.y)) {
    throw new Error('Use {"arr": [...], "x": n, "y": n} with a level-order array and two integer values.')
  }
  const { arr, x, y } = data
  if (arr.length < 2 || arr.length > 15 || arr[0] === null) throw new Error('arr must be a level-order array of 2 to 15 entries with a non-null root.')
  const values = arr.filter(v => v !== null)
  if (values.some(v => !Number.isInteger(v) || v < 0 || v > 99)) throw new Error('Node values are integers from 0 to 99, or null.')
  if (new Set(values).size !== values.length) throw new Error('Node values must be unique.')
  if (x === y) throw new Error('x and y must be different values.')
  const placed = valuesIn(treeFromLevelOrder(arr))
  if (!placed.includes(x) || !placed.includes(y)) throw new Error('x and y must both be placed in the tree (a value after a missing parent is never placed).')
  return { arr, x, y }
}

export function buildTrace(input) {
  const { arr, x, y } = input
  const root = treeFromLevelOrder(arr)
  const frames = [{ phase: 'start', activeLine: L('queue = deque'), node: null, depths: {}, found: new Map(), result: null, message: `Search for ${x} and ${y} with a breadth-first walk. Each node records its depth and parent.` }]
  const queue = [{ node: root, parent: null, depth: 0 }]
  const seen = new Map()
  const depths = {}
  let result = null
  for (let head = 0; head < queue.length && result === null; head++) {
    const { node, parent, depth } = queue[head]
    depths[node.id] = depth
    frames.push({ phase: 'visit', activeLine: L('node, parent, depth = queue.popleft()'), node: node.id, depths: { ...depths }, found: new Map(seen), result: null, message: `Dequeue ${node.value} at depth ${depth}${parent === null ? ' (the root has no parent)' : `, child of ${parent}`}.` })
    if (node.value === x || node.value === y) {
      seen.set(node.value, { depth, parent, id: node.id })
      frames.push({ phase: 'found', activeLine: L('seen[node.val] = (depth, parent)'), node: node.id, depths: { ...depths }, found: new Map(seen), result: null, message: `Record ${node.value}: depth ${depth}, parent ${parent ?? 'none'}.` })
    }
    if (seen.has(x) && seen.has(y)) {
      const a = seen.get(x), b = seen.get(y)
      result = a.depth === b.depth && a.parent !== b.parent
      const why = result
        ? `${x} and ${y} are cousins: both at depth ${a.depth} with different parents.`
        : a.depth !== b.depth ? `${x} and ${y} are not cousins: depths ${a.depth} and ${b.depth} differ.` : `${x} and ${y} are not cousins: they share parent ${a.parent}.`
      frames.push({ phase: 'done', activeLine: L('return dx == dy and px != py'), node: null, depths: { ...depths }, found: new Map(seen), result, message: why })
      break
    }
    if (node.left) queue.push({ node: node.left, parent: node.value, depth: depth + 1 })
    if (node.right) queue.push({ node: node.right, parent: node.value, depth: depth + 1 })
  }
  if (result === null) {
    result = false
    frames.push({ phase: 'done', activeLine: L('return False'), node: null, depths: { ...depths }, found: new Map(seen), result, message: 'The walk finished without finding both values.' })
  }
  return { input, root, result, frames }
}

export const code = `from collections import deque

def isCousins(root, x, y):
    queue = deque([(root, None, 0)])
    seen = {}
    while queue:
        node, parent, depth = queue.popleft()
        if node.val in (x, y):
            seen[node.val] = (depth, parent)
        if x in seen and y in seen:
            dx, px = seen[x]
            dy, py = seen[y]
            return dx == dy and px != py
        if node.left:
            queue.append((node.left, node.val, depth + 1))
        if node.right:
            queue.append((node.right, node.val, depth + 1))
    return False`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1
