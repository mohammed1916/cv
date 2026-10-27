const LIMIT = 12

export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || !Array.isArray(data.preorder)) throw new Error('Use an object with a preorder array, for example {"preorder":[8,5,1,7,10,12]}.')
  const { preorder } = data
  if (preorder.length < 1 || preorder.length > LIMIT) throw new Error(`Use 1 to ${LIMIT} values in preorder.`)
  if (preorder.some(v => !Number.isInteger(v) || v < 1 || v > 100)) throw new Error('Preorder values are integers from 1 to 100.')
  if (new Set(preorder).size !== preorder.length) throw new Error('Preorder values must be distinct.')
  return { preorder }
}

/** Serializes a binary tree to LeetCode's level-order array, with trailing nulls trimmed. */
export function levelOrder(root) {
  if (!root) return []
  const out = []
  const queue = [root]
  for (let q = 0; q < queue.length; q++) {
    const node = queue[q]
    if (node) {
      out.push(node.value)
      queue.push(node.left, node.right)
    } else {
      out.push(null)
    }
  }
  while (out.length && out[out.length - 1] === null) out.pop()
  return out
}

const show = v => (Number.isFinite(v) ? String(v) : v < 0 ? '-inf' : 'inf')
const snapshot = node => node && { id: node.id, value: node.value, left: snapshot(node.left), right: snapshot(node.right) }

export function buildTrace(input) {
  const { preorder } = input
  const frames = []
  let index = 0
  let count = 0
  let root = null
  frames.push({ phase: 'start', activeLine: L('index = 0'), cursor: 0, consumed: 0, node: null, low: null, high: null, tree: null, message: 'The first preorder value is the root. Each later value goes left or right of its ancestors, inside the bounds they leave.' })
  const build = (low, high, parent, side) => {
    const cursor = index < preorder.length ? index : -1
    if (cursor === -1 || !(low < preorder[index] && preorder[index] < high)) {
      const message = cursor === -1
        ? 'No values are left, so this subtree is empty.'
        : `${preorder[index]} is outside (${show(low)}, ${show(high)}), so this subtree is empty.`
      frames.push({ phase: 'skip', activeLine: L('return None'), cursor, consumed: index, node: null, low: show(low), high: show(high), tree: snapshot(root), message })
      return null
    }
    const value = preorder[index]
    const cursorValue = index
    index += 1
    const node = { id: count++, value, left: null, right: null }
    if (parent) parent[side] = node
    else root = node
    frames.push({ phase: 'place', activeLine: L('node = TreeNode(value)'), cursor: cursorValue, consumed: index, node: node.id, low: show(low), high: show(high), tree: snapshot(root), message: `Place ${value}. Its subtree must stay between ${show(low)} and ${show(high)}.` })
    build(low, value, node, 'left')
    build(value, high, node, 'right')
    return node
  }
  build(-Infinity, Infinity, null, null)
  const result = levelOrder(root)
  frames.push({ phase: 'done', activeLine: L('return build('), cursor: -1, consumed: preorder.length, node: null, low: null, high: null, tree: snapshot(root), message: `The tree is complete. Level order: [${result.map(v => (v === null ? 'null' : v)).join(', ')}].` })
  return { input, result, frames }
}

export const code = `def bstFromPreorder(preorder):
    index = 0
    def build(low, high):
        nonlocal index
        if index == len(preorder) or not low < preorder[index] < high:
            return None
        value = preorder[index]
        index += 1
        node = TreeNode(value)
        node.left = build(low, value)
        node.right = build(value, high)
        return node
    return build(float('-inf'), float('inf'))`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1
