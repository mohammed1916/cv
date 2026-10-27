import { treeFromLevelOrder } from '../../components/shared/treeLayout.js'

export function parseInput(text) {
  const spec = JSON.parse(text)
  const { arr, k } = spec
  if (!Array.isArray(arr) || arr.length < 1 || arr.length > 30 || arr[0] === null) throw new Error('Use a level-order array of 1 to 30 entries with a non-null root.')
  const values = arr.filter(v => v !== null)
  if (values.some(v => !Number.isInteger(v) || v < 1 || v > 100) || new Set(values).size !== values.length) {
    throw new Error('Values are distinct integers from 1 to 100.')
  }
  if (!reachableValues(arr).includes(k)) throw new Error('k must be a node in the tree.')
  return spec
}

// Values that become nodes: an array entry after a missing parent is never placed in the tree.
export function reachableValues(arr) {
  const out = []
  const walk = node => {
    if (!node) return
    out.push(node.value)
    walk(node.left)
    walk(node.right)
  }
  walk(treeFromLevelOrder(arr))
  return out
}

export function buildTrace(spec) {
  const root = treeFromLevelOrder(spec.arr)
  const parent = new Map()
  const byValue = new Map()
  const link = node => {
    byValue.set(node.value, node)
    for (const child of [node.left, node.right]) {
      if (!child) continue
      parent.set(child.id, node)
      link(child)
    }
  }
  link(root)
  const start = byValue.get(spec.k)
  const neighbours = node => [node.left, node.right, parent.get(node.id)].filter(Boolean)
  const queue = [start]
  const seen = new Set([start.id])
  const frames = [{ phase: 'start', activeLine: L('queue = deque([target])'), node: start.id, queue: [start.value], visited: [start.id], message: `Start at ${spec.k} and search outward. Parent links count as edges.` }]
  while (queue.length) {
    const node = queue.shift()
    if (!node.left && !node.right) {
      frames.push({ phase: 'found', activeLine: L('return node.val'), node: node.id, queue: queue.map(n => n.value), visited: [...seen], message: `${node.value} is a leaf at the smallest distance from ${spec.k}.` })
      return { input: spec, root: treeFromLevelOrder(spec.arr), result: node.value, frames }
    }
    for (const next of neighbours(node)) {
      if (seen.has(next.id)) continue
      seen.add(next.id)
      queue.push(next)
    }
    frames.push({ phase: 'expand', activeLine: L('for nxt in'), node: node.id, queue: queue.map(n => n.value), visited: [...seen], message: `${node.value} is not a leaf: queue its unseen neighbours.` })
  }
  throw new Error('A tree always has a leaf.')
}

export const code = `def findClosestLeaf(root, k):
    parent = {}
    target = None
    stack = [root]
    while stack:
        node = stack.pop()
        if node.val == k:
            target = node
        for child in (node.left, node.right):
            if child:
                parent[child] = node
                stack.append(child)
    queue = deque([target])
    seen = {target}
    while queue:
        node = queue.popleft()
        if not node.left and not node.right:
            return node.val
        for nxt in (node.left, node.right, parent.get(node)):
            if nxt and nxt not in seen:
                seen.add(nxt)
                queue.append(nxt)`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1
