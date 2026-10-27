import { treeFromLevelOrder } from '../../components/shared/treeLayout.js'

function checkTree(values, label) {
  if (!Array.isArray(values) || values.length < 1 || values.length > 31 || values[0] === null) throw new Error(`${label} must be a level-order array of 1 to 31 entries with a non-null root.`)
  if (values.some(v => v !== null && (!Number.isInteger(v) || v < -50 || v > 50))) throw new Error(`${label} values are integers from -50 to 50, or null.`)
  const root = treeFromLevelOrder(values)
  const ordered = []
  const walk = node => { if (!node) return; walk(node.left); ordered.push(node.value); walk(node.right) }
  walk(root)
  if (ordered.length > 10) throw new Error(`${label} may have at most 10 nodes.`)
  if (ordered.some((v, i) => i > 0 && v <= ordered[i - 1])) throw new Error(`${label} is not a binary search tree with distinct values.`)
}

export function parseInput(text) {
  const input = JSON.parse(text)
  checkTree(input?.root1, 'root1')
  checkTree(input?.root2, 'root2')
  return { root1: input.root1, root2: input.root2 }
}

export function buildTrace({ root1, root2 }) {
  const t1 = treeFromLevelOrder(root1), t2 = treeFromLevelOrder(root2)
  const frames = [{ phase: 'start', activeLine: L('set first to the inorder'), which: 0, node: null, values: [], merged: [], message: 'Read each tree in order. In-order reading of a binary search tree gives a sorted list.' }]
  const inorder = (root, which) => {
    const out = []
    const visit = node => {
      if (!node) return
      visit(node.left)
      out.push(node.value)
      frames.push({ phase: 'walk', activeLine: L('append its value'), which, node: node.id, values: [...out], merged: [], message: `Tree ${which} appends ${node.value}.` })
      visit(node.right)
    }
    visit(root)
    return out
  }
  const first = inorder(t1, 1), second = inorder(t2, 2)
  const merged = []
  let i = 0, j = 0
  while (i < first.length && j < second.length) {
    if (first[i] <= second[j]) merged.push(first[i++])
    else merged.push(second[j++])
    frames.push({ phase: 'merge', activeLine: L('take the smaller front value'), which: 0, node: null, values: [], merged: [...merged], message: `Take ${merged[merged.length - 1]} from the smaller front value.` })
  }
  merged.push(...first.slice(i), ...second.slice(j))
  frames.push({ phase: 'merge', activeLine: L('append the remaining values'), which: 0, node: null, values: [], merged: [...merged], message: 'Append the values left in the list that still has some.' })
  frames.push({ phase: 'done', activeLine: L('return merged'), which: 0, node: null, values: [], merged: [...merged], message: `All elements in order: ${merged.join(', ')}.` })
  return { input: { root1, root2 }, root1: t1, root2: t2, result: merged, frames }
}

export const code = `all elements of two binary search trees (root1, root2)
  set first to the inorder values of root1
  set second to the inorder values of root2
  set merged to an empty list
  set i and j to zero
  while i is inside first and j is inside second
    take the smaller front value and append it to merged
  append the remaining values of first and second to merged
  return merged
inorder values of a tree (node)
  visit the left subtree
  visit the node and append its value
  visit the right subtree`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def build_tree(values):
    if not values or values[0] is None:
        return None
    root = TreeNode(values[0])
    queue = [root]
    cursor = 1
    for node in queue:
        if cursor < len(values) and values[cursor] is not None:
            node.left = TreeNode(values[cursor])
            queue.append(node.left)
        cursor += 1
        if cursor < len(values) and values[cursor] is not None:
            node.right = TreeNode(values[cursor])
            queue.append(node.right)
        cursor += 1
    return root

def inorder(node, out):
    if node is None:
        return
    inorder(node.left, out)
    out.append(node.val)
    inorder(node.right, out)

def get_all_elements(root1, root2):
    first = []
    second = []
    inorder(build_tree(root1), first)
    inorder(build_tree(root2), second)
    merged = []
    i = 0
    j = 0
    while i < len(first) and j < len(second):
        if first[i] <= second[j]:
            merged.append(first[i])
            i += 1
        else:
            merged.append(second[j])
            j += 1
    merged.extend(first[i:])
    merged.extend(second[j:])
    return merged
`
