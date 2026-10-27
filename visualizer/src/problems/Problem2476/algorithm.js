import { treeFromLevelOrder } from '../../components/shared/treeLayout.js'

export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || !Array.isArray(data.root) || !Array.isArray(data.queries)) throw new Error('Use an object with a level-order array root and an array queries, for example {"root":[4,2,6,1,3],"queries":[2,5]}.')
  if (data.root.length < 1 || data.root.length > 31 || data.root[0] === null) throw new Error('root must be a level-order array of 1 to 31 entries with a non-null first entry.')
  if (data.root.some(v => v !== null && (!Number.isInteger(v) || v < 0 || v > 50))) throw new Error('Tree values are integers from 0 to 50, or null for a missing child.')
  if (data.queries.length < 1 || data.queries.length > 8) throw new Error('queries must have 1 to 8 values.')
  if (data.queries.some(v => !Number.isInteger(v) || v < 0 || v > 50)) throw new Error('Each query is an integer from 0 to 50.')
  const tree = treeFromLevelOrder(data.root)
  const seen = []
  const walk = node => { if (!node) return; walk(node.left); seen.push(node.value); walk(node.right) }
  walk(tree)
  if (seen.some((v, i) => i > 0 && v <= seen[i - 1])) throw new Error('The tree must be a binary search tree with distinct values.')
  return { root: [...data.root], queries: [...data.queries] }
}

export function buildTrace({ root, queries }) {
  const tree = treeFromLevelOrder(root)
  const ordered = []
  const walk = node => { if (!node) return; walk(node.left); ordered.push(node); walk(node.right) }
  walk(tree)
  const values = ordered.map(n => n.value)
  const frames = []
  const answer = []
  frames.push({ phase: 'sort', activeLine: L('read the tree values in sorted order'), values, query: null, low: null, high: null, lowIndex: -1, highIndex: -1, roles: {}, answer: [], message: `An in-order walk of the binary search tree gives ${values.join(', ')}.` })
  for (const q of queries) {
    let lowIndex = -1
    let highIndex = -1
    for (let i = 0; i < values.length; i++) {
      if (values[i] <= q) lowIndex = i
    }
    for (let i = values.length - 1; i >= 0; i--) {
      if (values[i] >= q) highIndex = i
    }
    const low = lowIndex >= 0 ? values[lowIndex] : -1
    const high = highIndex >= 0 ? values[highIndex] : -1
    answer.push([low, high])
    const roles = {}
    if (lowIndex >= 0) roles[ordered[lowIndex].id] = 'active'
    if (highIndex >= 0) roles[ordered[highIndex].id] = 'active'
    frames.push({ phase: 'query', activeLine: L('set low to the largest'), values, query: q, low, high, lowIndex, highIndex, roles, answer: answer.map(p => [...p]), message: `Query ${q}: largest value at most it is ${low}, smallest value at least it is ${high}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return answer'), values, query: null, low: null, high: null, lowIndex: -1, highIndex: -1, roles: {}, answer: answer.map(p => [...p]), message: 'All queries are answered.' })
  return { input: { root, queries }, result: answer, root: tree, frames }
}

export const code = `closest nodes in a binary search tree (root, queries)
  read the tree values in sorted order with an in-order walk
  set answer to an empty list
  for each query q
    set low to the largest value at most q, or minus one if none
    set high to the smallest value at least q, or minus one if none
    add the pair low and high to answer
  return answer`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1
export const python = `import bisect


class TreeNode:
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


def closest_nodes_in_bst(root, queries):
    values = []

    def walk(current):
        if current is None:
            return
        walk(current.left)
        values.append(current.val)
        walk(current.right)

    walk(build(root))
    answer = []
    for q in queries:
        i = bisect.bisect_right(values, q) - 1
        j = bisect.bisect_left(values, q)
        low = values[i] if i >= 0 else -1
        high = values[j] if j < len(values) else -1
        answer.append([low, high])
    return answer
`
