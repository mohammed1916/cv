import { treeFromLevelOrder } from '../../components/shared/treeLayout.js'

function nodesOf(root) {
  const list = []
  const walk = n => { if (n) { list.push(n); walk(n.left); walk(n.right) } }
  walk(root)
  return list
}

export function parseInput(text) {
  const v = JSON.parse(text)
  if (!v || typeof v !== 'object' || Array.isArray(v)) throw new Error('Enter {"tree": [level-order values with null], "target": value, "k": number}.')
  const { tree, target, k } = v
  if (!Array.isArray(tree) || !tree.length || tree.length > 63 || tree.some(x => x !== null && !Number.isInteger(x))) throw new Error('tree must be a level-order array of 1 to 63 integers or null.')
  if (tree[0] === null) throw new Error('The root cannot be null.')
  const values = tree.filter(x => x !== null)
  if (values.length > 30) throw new Error('Use at most 30 nodes (visualization cap).')
  if (new Set(values).size !== values.length) throw new Error('Node values must be unique.')
  const root = treeFromLevelOrder(tree)
  if (nodesOf(root).length !== values.length) throw new Error('tree is not a valid level-order serialization (a null node has children).')
  if (!values.includes(target)) throw new Error('target must be the value of a node in the tree.')
  if (!Number.isInteger(k) || k < 0 || k > 30) throw new Error('k must be an integer from 0 to 30.')
  return { tree, target, k }
}

export function buildTrace({ tree, target, k }) {
  const root = treeFromLevelOrder(tree)
  const all = nodesOf(root)
  const targetNode = all.find(n => n.value === target)
  const parent = new Map()
  const frames = []
  const parentDone = []
  const f = (phase, activeLine, message, extra = {}) => frames.push({ phase, activeLine, message, current: null, parentDone: parentDone.slice(), seen: [], queue: [], dists: {}, dist: 0, ...extra })
  f('start', L('let parent be an empty map'), `Tree nodes only point downward, so first record every node's parent. Then distance-k nodes are k BFS steps from ${target}.`, { pythonLine: 32 })
  const dfs = (node, par) => {
    if (!node) return
    parent.set(node, par)
    parentDone.push(node.id)
    f('parent', L('set parent of the node'), `Visit ${node.value}: its parent is ${par ? par.value : 'none (root)'}.`, { current: node.id, pythonLine: 36 })
    dfs(node.left, node)
    dfs(node.right, node)
  }
  dfs(root, null)
  let queue = [targetNode]
  const seen = new Set([targetNode])
  const dists = { [targetNode.id]: 0 }
  let dist = 0
  const snap = (phase, line, message, extra = {}) => f(phase, line, message, { seen: [...seen].map(n => n.id), queue: queue.map(n => n.id), dists: { ...dists }, dist, ...extra })
  snap('seed', L('let queue hold only the target'), `Start BFS at target ${target} with distance 0.`, { pythonLine: 42 })
  while (queue.length && dist < k) {
    const level = queue.length
    const next = []
    const before = queue
    queue = []
    for (let t = 0; t < level; t++) {
      const node = before[t]
      const added = []
      for (const nb of [node.left, node.right, parent.get(node)]) {
        if (nb && !seen.has(nb)) { seen.add(nb); next.push(nb); dists[nb.id] = dist + 1; added.push(nb.value) }
      }
      queue = [...before.slice(t + 1), ...next]
      snap('expand', L('if the neighbour exists'), `Expand ${node.value}: ${added.length ? `new neighbours ${added.join(', ')} at distance ${dist + 1}` : 'no unseen neighbours'} (children and parent).`, { current: node.id, pythonLine: 49 })
    }
    queue = next
    dist++
    snap('level', L('increase distance by 1'), `Level complete: ${queue.length} node(s) are exactly ${dist} away from ${target}.`, { pythonLine: 52 })
  }
  const result = queue.map(n => n.value)
  snap('done', L('return the values left'), `Distance ${k} from ${target}: [${result.join(', ')}].`, { pythonLine: 53 })
  return { input: { tree, target, k }, root, result, frames }
}

export const code = `let parent be an empty map
depth-first walk from the root, visiting each node
  set parent of the node to the node that led here (none for the root)
  walk into the left child, then into the right child
let queue hold only the target, and mark the target as seen
let distance be 0
while the queue is not empty and distance is less than k do
  for each node currently in the queue do
    take the next node out of the queue
    for each neighbour in (left child, right child, parent)
      if the neighbour exists and is not seen, mark it seen and add it to the queue
  increase distance by 1
return the values left in the queue`.split('\n').map((text, index) => ({ line: index + 1, text }))

const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `from collections import deque


class TreeNode:
    def __init__(self, val):
        self.val = val
        self.left = None
        self.right = None


def build_tree(values):
    if not values or values[0] is None:
        return None
    root = TreeNode(values[0])
    queue = deque([root])
    i = 1
    while queue and i < len(values):
        current = queue.popleft()
        if i < len(values) and values[i] is not None:
            current.left = TreeNode(values[i])
            queue.append(current.left)
        i += 1
        if i < len(values) and values[i] is not None:
            current.right = TreeNode(values[i])
            queue.append(current.right)
        i += 1
    return root


def distance_k(tree, target, k):
    root = build_tree(tree)
    parent = {}

    def dfs(current, par):
        if current is not None:
            parent[current] = par
            dfs(current.left, current)
            dfs(current.right, current)

    dfs(root, None)
    start = next(n for n in parent if n.val == target)
    queue = deque([start])
    seen = {start}
    dist = 0
    while queue and dist < k:
        for _ in range(len(queue)):
            current = queue.popleft()
            for nb in (current.left, current.right, parent[current]):
                if nb is not None and nb not in seen:
                    seen.add(nb)
                    queue.append(nb)
        dist += 1
    return [n.val for n in queue]
`
