import { treeFromLevelOrder, levelOrderFromTree } from '../../components/shared/treeLayout.js'

function nodesOf(root) {
  const list = []
  const walk = n => { if (n) { list.push(n); walk(n.left); walk(n.right) } }
  walk(root)
  return list
}

export function parseInput(text) {
  const tree = JSON.parse(text)
  if (!Array.isArray(tree) || !tree.length || tree.length > 63 || tree.some(x => x !== null && !Number.isInteger(x))) throw new Error('Enter a level-order JSON array of 1 to 63 integers or null.')
  if (tree[0] === null) throw new Error('The root cannot be null.')
  const values = tree.filter(x => x !== null)
  if (values.length > 30) throw new Error('Use at most 30 nodes (visualization cap).')
  if (new Set(values).size !== values.length) throw new Error('Node values must be unique.')
  if (nodesOf(treeFromLevelOrder(tree)).length !== values.length) throw new Error('Not a valid level-order serialization (a null node has children).')
  return tree
}

export function buildTrace(tree) {
  const root = treeFromLevelOrder(tree)
  const frames = []
  const heights = {}
  const done = []
  const f = (phase, activeLine, message, extra = {}) => frames.push({ phase, activeLine, message, current: null, candidate: null, heights: { ...heights }, done: done.slice(), subtree: [], ...extra })
  f('start', 2, 'Each call returns (depth of its subtree, lowest node containing all of that subtree\'s deepest nodes).')
  const dfs = node => {
    if (!node) return [0, null]
    f('enter', 5, `Enter ${node.value}; solve the left child first, then the right.`, { current: node.id })
    const [dl, l] = dfs(node.left)
    const [dr, r] = dfs(node.right)
    let out
    let msg
    if (dl > dr) { out = [dl + 1, l]; msg = `Left depth ${dl} beats right depth ${dr}: the deepest nodes are only on the left, so keep the left candidate (${l.value}).` }
    else if (dr > dl) { out = [dr + 1, r]; msg = `Right depth ${dr} beats left depth ${dl}: keep the right candidate (${r.value}).` }
    else { out = [dl + 1, node]; msg = `Both sides have depth ${dl}${dl ? '' : ' (leaf)'}: deepest nodes are on both sides (or this is a leaf), so ${node.value} itself is the lowest common ancestor.` }
    heights[node.id] = `h${out[0]}`
    done.push(node.id)
    f('combine', dl > dr ? 8 : dr > dl ? 10 : 11, `Node ${node.value}: ${msg} Return depth ${out[0]}.`, { current: node.id, candidate: out[1].id })
    return out
  }
  const [, ans] = dfs(root)
  const sub = nodesOf(ans).map(n => n.id)
  f('done', 12, `The smallest subtree containing every deepest node is rooted at ${ans.value}.`, { candidate: ans.id, subtree: sub })
  return { input: tree, root, result: ans.value, resultSubtree: levelOrderFromTree(ans), frames }
}

export const code = `def subtreeWithAllDeepest(root):
    def dfs(node):
        if not node:
            return 0, None
        dl, l = dfs(node.left)
        dr, r = dfs(node.right)
        if dl > dr:
            return dl + 1, l
        if dr > dl:
            return dr + 1, r
        return dl + 1, node
    return dfs(root)[1]`.split('\n').map((text, index) => ({ line: index + 1, text }))
