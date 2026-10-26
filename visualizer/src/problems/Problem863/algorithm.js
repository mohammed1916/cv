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
  f('start', 2, `Tree nodes only point downward, so first record every node's parent. Then distance-k nodes are k BFS steps from ${target}.`)
  const dfs = (node, par) => {
    if (!node) return
    parent.set(node, par)
    parentDone.push(node.id)
    f('parent', 5, `Visit ${node.value}: its parent is ${par ? par.value : 'none (root)'}.`, { current: node.id })
    dfs(node.left, node)
    dfs(node.right, node)
  }
  dfs(root, null)
  let queue = [targetNode]
  const seen = new Set([targetNode])
  const dists = { [targetNode.id]: 0 }
  let dist = 0
  const snap = (phase, line, message, extra = {}) => f(phase, line, message, { seen: [...seen].map(n => n.id), queue: queue.map(n => n.id), dists: { ...dists }, dist, ...extra })
  snap('seed', 9, `Start BFS at target ${target} with distance 0.`)
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
      snap('expand', 16, `Expand ${node.value}: ${added.length ? `new neighbours ${added.join(', ')} at distance ${dist + 1}` : 'no unseen neighbours'} (children and parent).`, { current: node.id })
    }
    queue = next
    dist++
    snap('level', 17, `Level complete: ${queue.length} node(s) are exactly ${dist} away from ${target}.`)
  }
  const result = queue.map(n => n.value)
  snap('done', 18, `Distance ${k} from ${target}: [${result.join(', ')}].`)
  return { input: { tree, target, k }, root, result, frames }
}

export const code = `def distanceK(root, target, k):
    parent = {}
    def dfs(node, par):
        if node:
            parent[node] = par
            dfs(node.left, node)
            dfs(node.right, node)
    dfs(root, None)
    queue = deque([target])
    seen = {target}
    dist = 0
    while queue and dist < k:
        for _ in range(len(queue)):
            node = queue.popleft()
            for nb in (node.left, node.right, parent[node]):
                if nb and nb not in seen:
                    seen.add(nb)
                    queue.append(nb)
        dist += 1
    return [n.val for n in queue]`.split('\n').map((text, index) => ({ line: index + 1, text }))
