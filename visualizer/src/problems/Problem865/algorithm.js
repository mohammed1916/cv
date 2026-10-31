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
  f('start', L('walk(node) returns'), 'Each call returns (depth of its subtree, lowest node containing all of that subtree\'s deepest nodes).', { pythonLine: 31 })
  const dfs = node => {
    if (!node) return [0, null]
    f('enter', L('walk the left child'), `Enter ${node.value}; solve the left child first, then the right.`, { current: node.id, pythonLine: 34 })
    const [dl, l] = dfs(node.left)
    const [dr, r] = dfs(node.right)
    let out
    let msg
    if (dl > dr) { out = [dl + 1, l]; msg = `Left depth ${dl} beats right depth ${dr}: the deepest nodes are only on the left, so keep the left candidate (${l.value}).` }
    else if (dr > dl) { out = [dr + 1, r]; msg = `Right depth ${dr} beats left depth ${dl}: keep the right candidate (${r.value}).` }
    else { out = [dl + 1, node]; msg = `Both sides have depth ${dl}${dl ? '' : ' (leaf)'}: deepest nodes are on both sides (or this is a leaf), so ${node.value} itself is the lowest common ancestor.` }
    heights[node.id] = `h${out[0]}`
    done.push(node.id)
    const line = dl > dr ? L('if left depth is greater') : dr > dl ? L('if right depth is greater') : L('return (left depth + 1, node)')
    f('combine', line, `Node ${node.value}: ${msg} Return depth ${out[0]}.`, { current: node.id, candidate: out[1].id, pythonLine: dl > dr ? 37 : dr > dl ? 39 : 40 })
    return out
  }
  const [, ans] = dfs(root)
  const sub = nodesOf(ans).map(n => n.id)
  f('done', L('return the answer node'), `The smallest subtree containing every deepest node is rooted at ${ans.value}.`, { candidate: ans.id, subtree: sub, pythonLine: 42 })
  return { input: tree, root, result: ans.value, resultSubtree: levelOrderFromTree(ans), frames }
}

export const code = `walk(node) returns (depth, answer node) for the subtree at node
  if node is empty, return (0, none)
  walk the left child, getting (left depth, left answer)
  walk the right child, getting (right depth, right answer)
  if left depth is greater than right depth, return (left depth + 1, left answer)
  if right depth is greater than left depth, return (right depth + 1, right answer)
  return (left depth + 1, node)
return the answer node of walk(root)`.split('\n').map((text, index) => ({ line: index + 1, text }))

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


def subtree_with_all_deepest(tree):
    def dfs(current):
        if current is None:
            return 0, None
        dl, left = dfs(current.left)
        dr, right = dfs(current.right)
        if dl > dr:
            return dl + 1, left
        if dr > dl:
            return dr + 1, right
        return dl + 1, current

    return dfs(build_tree(tree))[1].val
`
