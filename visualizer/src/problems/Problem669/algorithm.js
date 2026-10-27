import { treeFromLevelOrder, levelOrderFromTree } from '../../components/shared/treeLayout.js'

export function parseInput(text) {
  const data = JSON.parse(text)
  const { root, low, high } = data ?? {}
  if (!Array.isArray(root) || root.length < 1 || root.length > 10000 || root[0] === null || root.some(v => v !== null && (!Number.isInteger(v) || Math.abs(v) > 10000))) throw new Error('root must be a level-order BST array of 1–10,000 items; the first is not null.')
  if (!Number.isInteger(low) || !Number.isInteger(high) || low > high || Math.abs(low) > 10000 || Math.abs(high) > 10000) throw new Error('low and high must be integers with low ≤ high and |v| ≤ 10,000.')
  return { root, low, high }
}

// A node below low is replaced by its right subtree (trimmed); above high by its left; otherwise keep it and trim both sides.
export function buildTrace({ root, low, high }) {
  const top = treeFromLevelOrder(root)
  const frames = [{ phase: 'start', current: null, pruned: [], activeLine: 2, message: `Keep values in [${low}, ${high}].` }]
  const pruned = []
  function trim(node) {
    if (!node) return null
    if (node.value < low) {
      pruned.push(node.id)
      frames.push({ phase: 'prune', current: node.id, pruned: [...pruned], activeLine: 4, message: `${node.value} < ${low}: discard it and keep only its right subtree.` })
      return trim(node.right)
    }
    if (node.value > high) {
      pruned.push(node.id)
      frames.push({ phase: 'prune', current: node.id, pruned: [...pruned], activeLine: 5, message: `${node.value} > ${high}: discard it and keep only its left subtree.` })
      return trim(node.left)
    }
    frames.push({ phase: 'keep', current: node.id, pruned: [...pruned], activeLine: 7, message: `${node.value} is in range: keep it and trim both subtrees.` })
    node.left = trim(node.left)
    node.right = trim(node.right)
    return node
  }
  const trimmed = trim(top)
  const result = levelOrderFromTree(trimmed)
  frames.push({ phase: 'done', current: null, pruned: [...pruned], result, activeLine: 9, message: `Trimmed level order: [${result.map(v => (v === null ? 'null' : v)).join(', ')}].` })
  return { input: { root, low, high }, root: trimmed, result, frames, prunedIds: new Set(pruned) }
}

export const code = `define trim(node): if node is empty, return empty
if node value is less than low, return trim(right child)
if node value is greater than high, return trim(left child)
otherwise trim both children, attach them to node, and return node
return trim(root)`.split('\n').map((text, index) => ({ line: index + 1, text }))

// Tree trace: activeLine 1 (setup), 3 (inspect), 4 (update, final tree), 5 (return).
// Inspect frames name the verdict: too small (line 2), too large (line 3), in range (line 4).
export const LINE_MAP = { 1: 1, 4: 5, 5: 5 }

export function familyLine(frame) {
  if (frame.phase === 'inspect') return /too small/.test(frame.message) ? 2 : /too large/.test(frame.message) ? 3 : 4
  if (frame.phase === 'done') return 5
  return LINE_MAP[frame.activeLine] ?? frame.activeLine
}

export const python = `def trim_bst(root, low, high):
    def build_tree(values):
        if not values or values[0] is None:
            return None
        top = {"val": values[0], "left": None, "right": None}
        queue = [top]
        index = 1
        position = 0
        while position < len(queue):
            node = queue[position]
            position += 1
            for side in ("left", "right"):
                if index < len(values) and values[index] is not None:
                    child = {"val": values[index], "left": None, "right": None}
                    node[side] = child
                    queue.append(child)
                index += 1
        return top

    def serialize(top):
        if top is None:
            return []
        queue = [top]
        values = []
        position = 0
        while position < len(queue):
            node = queue[position]
            position += 1
            if node is None:
                values.append(None)
            else:
                values.append(node["val"])
                queue.append(node["left"])
                queue.append(node["right"])
        while values and values[-1] is None:
            values.pop()
        return values

    def trim(node):
        if node is None:
            return None
        if node["val"] < low:
            return trim(node["right"])
        if node["val"] > high:
            return trim(node["left"])
        node["left"] = trim(node["left"])
        node["right"] = trim(node["right"])
        return node

    return serialize(trim(build_tree(root)))`
