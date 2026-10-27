import { treeFromLevelOrder } from '../../components/shared/treeLayout.js'

export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || !Array.isArray(data.tree) || !Number.isInteger(data.x)) throw new Error('Use an object such as {"tree":[1,2,3],"x":1}.')
  const { tree, x } = data
  if (tree.length < 1 || tree.length > 15 || tree[0] === null) throw new Error('tree has 1 to 15 entries and a non-null root.')
  if (tree.some(v => v !== null && !Number.isInteger(v))) throw new Error('Tree values must be integers or null.')
  const root = treeFromLevelOrder(tree)
  const n = collect(root).length
  if (n !== tree.filter(v => v !== null).length) throw new Error('Every non-null entry must be attached to the tree by its position.')
  if (n % 2 === 0) throw new Error('The number of nodes must be odd.')
  const values = tree.filter(v => v !== null).sort((a, b) => a - b)
  if (values.some((v, i) => v !== i + 1)) throw new Error('Node values must be the distinct numbers 1 to n.')
  if (x < 1 || x > n) throw new Error(`x must be one of the node values 1 to ${n}.`)
  return { tree, x }
}

const collect = node => (node ? [node, ...collect(node.left), ...collect(node.right)] : [])
const find = (node, v) => {
  if (!node) return null
  if (node.value === v) return node
  return find(node.left, v) || find(node.right, v)
}

export function buildTrace({ tree, x }) {
  const root = treeFromLevelOrder(tree)
  const n = collect(root).length
  const frames = [{ phase: 'start', activeLine: L('count all nodes'), node: null, regions: {}, sizes: null, message: `The tree has ${n} nodes. Player 1 colors node ${x}.` }]
  const target = find(root, x)
  const left = collect(target.left).map(v => v.id)
  const right = collect(target.right).map(v => v.id)
  const parentSide = collect(root).map(v => v.id).filter(id => id !== target.id && !left.includes(id) && !right.includes(id))
  const sizes = { left: left.length, right: right.length, parent: parentSide.length }
  const regions = { left, right, parent: parentSide }
  frames.push({ phase: 'locate', activeLine: L('find the node whose value is x'), node: target.id, regions, sizes, message: `Node ${x} splits the rest into a left region of ${sizes.left}, a right region of ${sizes.right} and a parent side of ${sizes.parent}.` })
  const biggest = Math.max(sizes.left, sizes.right, sizes.parent)
  const result = biggest * 2 > n
  frames.push({ phase: 'compare', activeLine: L('if biggest times 2'), node: target.id, regions, sizes, message: `The largest region has ${biggest} nodes, ${result ? 'more than' : 'not more than'} half of ${n}.` })
  frames.push({ phase: 'done', activeLine: L('return'), node: null, regions, sizes, message: result ? 'Player 2 can win by coloring the largest region.' : 'Player 2 cannot win from any neighbor of x.' })
  return { input: { tree, x }, root, result, frames }
}

export const code = `second player can win the coloring game:
  count all nodes as n
  find the node whose value is x
  count the nodes in its left subtree as left
  count the nodes in its right subtree as right
  set parent side to n minus 1 minus left minus right
  set biggest to the largest of left, right and parent side
  if biggest times 2 is greater than n then
    return true
  otherwise
    return false`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def build(arr):
    if not arr or arr[0] is None:
        return None
    root = TreeNode(arr[0])
    queue = [root]
    cursor = 1
    for node in queue:
        if cursor < len(arr) and arr[cursor] is not None:
            node.left = TreeNode(arr[cursor])
            queue.append(node.left)
        cursor += 1
        if cursor < len(arr) and arr[cursor] is not None:
            node.right = TreeNode(arr[cursor])
            queue.append(node.right)
        cursor += 1
    return root

def btree_coloring_game_wins(tree, x):
    root = build(tree)
    def count(node):
        if node is None:
            return 0
        return 1 + count(node.left) + count(node.right)
    def find(node):
        if node is None:
            return None
        if node.val == x:
            return node
        return find(node.left) or find(node.right)
    n = count(root)
    target = find(root)
    left = count(target.left)
    right = count(target.right)
    parent_side = n - 1 - left - right
    biggest = max(left, right, parent_side)
    return biggest * 2 > n
`
