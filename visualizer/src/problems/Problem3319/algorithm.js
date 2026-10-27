import { treeFromLevelOrder } from '../../components/shared/treeLayout.js'

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with tree and k, such as {"tree":[1,2,3],"k":1}.')
  const { tree, k } = input
  if (!Array.isArray(tree) || tree.length < 1 || tree.length > 15 || tree[0] === null) throw new Error('tree must be a level-order array of 1 to 15 entries with a non-null root.')
  if (tree.some(v => v !== null && (!Number.isInteger(v) || v < 0 || v > 99))) throw new Error('Node values are integers from 0 to 99, or null.')
  if (!Number.isInteger(k) || k < 1 || k > 15) throw new Error('k must be an integer from 1 to 15.')
  return { tree, k }
}

export const code = `k-th largest size among perfect binary subtrees
  set sizes to an empty list
  measure each subtree bottom up, returning its height, its size and whether it is perfect
  a node with no children is height 1, size 1 and perfect
  a node with children has size 1 plus the sizes of its children
  it is perfect only when it has two children, both perfect, with equal heights
  if it is perfect then append its size to sizes
  sort sizes from largest to smallest
  return the size at position k, or -1 when there are fewer than k`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export function buildTrace({ tree, k }) {
  const root = treeFromLevelOrder(tree)
  const sizes = []
  const perfectIds = []
  const tags = {}
  const frames = [{ phase: 'start', activeLine: L('set sizes to an empty list'), current: null, perfectIds: [], tags: {}, sizes: [], message: 'Measure every subtree from the leaves up.' }]
  const measure = node => {
    if (!node) return null
    const left = measure(node.left)
    const right = measure(node.right)
    let info
    if (!left && !right) {
      info = { height: 1, size: 1, perfect: true }
    } else {
      info = {
        height: 1 + Math.max(left?.height ?? 0, right?.height ?? 0),
        size: 1 + (left?.size ?? 0) + (right?.size ?? 0),
        perfect: !!left && !!right && left.perfect && right.perfect && left.height === right.height,
      }
    }
    if (info.perfect) { sizes.push(info.size); perfectIds.push(node.id) }
    tags[node.id] = `size ${info.size}`
    const activeLine = !left && !right ? L('a node with no children') : info.perfect ? L('if it is perfect then append') : L('it is perfect only when')
    frames.push({ phase: 'measure', activeLine, current: node.id, perfectIds: [...perfectIds], tags: { ...tags }, sizes: [...sizes], message: info.perfect ? `Node ${node.value} roots a perfect subtree of size ${info.size}.` : `Node ${node.value} does not root a perfect subtree.` })
    return info
  }
  measure(root)
  sizes.sort((a, b) => b - a)
  const result = k <= sizes.length ? sizes[k - 1] : -1
  frames.push({ phase: 'done', activeLine: L('return the size at position k'), current: null, perfectIds: [...perfectIds], tags: { ...tags }, sizes: [...sizes], message: result === -1 ? `Only ${sizes.length} perfect subtrees, so the answer is -1.` : `Perfect subtree sizes, largest first: ${sizes.join(', ')}. Position ${k} is ${result}.` })
  return { input: { tree, k }, root, result, frames }
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

def kth_largest_perfect_subtree(tree, k):
    root = build(tree)
    sizes = []

    def measure(current):
        if current is None:
            return None
        left = measure(current.left)
        right = measure(current.right)
        if left is None and right is None:
            height, size, perfect = 1, 1, True
        else:
            height = 1 + max(left[0] if left else 0, right[0] if right else 0)
            size = 1 + (left[1] if left else 0) + (right[1] if right else 0)
            perfect = left is not None and right is not None and left[2] and right[2] and left[0] == right[0]
        if perfect:
            sizes.append(size)
        return height, size, perfect

    measure(root)
    sizes.sort(reverse=True)
    return sizes[k - 1] if k <= len(sizes) else -1
`
