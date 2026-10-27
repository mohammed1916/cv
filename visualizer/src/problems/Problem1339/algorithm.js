import { treeFromLevelOrder } from '../../components/shared/treeLayout.js'

const MOD = 1000000007

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with tree, such as {"tree":[1,2,3]}.')
  const { tree: arr } = input
  if (!Array.isArray(arr) || arr.length < 2 || arr.length > 15 || arr[0] === null) throw new Error('tree must be a level-order array of 2 to 15 entries with a non-null root.')
  if (arr.some(v => v !== null && (!Number.isInteger(v) || v < 1 || v > 20))) throw new Error('Node values are integers from 1 to 20, or null.')
  if (arr.filter(v => v !== null).length < 2) throw new Error('The tree needs at least two nodes so that one edge can be cut.')
  return { tree: arr }
}

export const code = `maximum product of the two parts after cutting one edge of a binary tree
  set total to the sum of all node values
  for each node v from the bottom up
    set subtree of v to its value plus the subtrees of its children
    if v is not the root then
      set product to subtree of v times (total minus subtree of v)
      set best to the larger of best and product
  return best modulo 1000000007`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export function buildTrace({ tree }) {
  const root = treeFromLevelOrder(tree)
  const sumOf = node => (node ? node.value + sumOf(node.left) + sumOf(node.right) : 0)
  const total = sumOf(root)
  const sums = {}
  let best = 0
  const frames = [{ phase: 'total', activeLine: L('set total to the sum'), current: null, sums: {}, best: 0, total, message: `Total of all node values: ${total}.` }]
  const measure = node => {
    if (!node) return 0
    const subtree = node.value + measure(node.left) + measure(node.right)
    sums[node.id] = subtree
    if (node === root) {
      frames.push({ phase: 'measure', activeLine: L('set subtree of v'), current: node.id, sums: { ...sums }, best, total, message: `The root's subtree is the whole tree, ${subtree}; it has no edge above it to cut.` })
    } else {
      const product = subtree * (total - subtree)
      best = Math.max(best, product)
      frames.push({ phase: 'cut', activeLine: L('set best to the larger'), current: node.id, sums: { ...sums }, best, total, message: `Cut above node ${node.value}: ${subtree} times ${total - subtree} = ${product}.` })
    }
    return subtree
  }
  measure(root)
  const result = best % MOD
  frames.push({ phase: 'done', activeLine: L('return best modulo'), current: null, sums: { ...sums }, best, total, message: `Largest product ${best}, modulo 1000000007 is ${result}.` })
  return { input: { tree }, root, result, frames }
}

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
    for current in queue:
        if cursor < len(arr) and arr[cursor] is not None:
            current.left = TreeNode(arr[cursor])
            queue.append(current.left)
        cursor += 1
        if cursor < len(arr) and arr[cursor] is not None:
            current.right = TreeNode(arr[cursor])
            queue.append(current.right)
        cursor += 1
    return root

def max_split_product(tree):
    root = build(tree)
    sums = []

    def subtree(current):
        total_here = current.val
        if current.left:
            total_here += subtree(current.left)
        if current.right:
            total_here += subtree(current.right)
        sums.append(total_here)
        return total_here

    total = subtree(root)
    best = 0
    for value in sums[:-1]:
        best = max(best, value * (total - value))
    return best % 1000000007
`
