import { treeFromLevelOrder, levelOrderFromTree } from '../../components/shared/treeLayout.js'

export function parseInput(text) {
  const data = JSON.parse(text)
  const { a, b } = data ?? {}
  const ok = t => Array.isArray(t) && t.length <= 2000 && t.every(v => v === null || (Number.isInteger(v) && Math.abs(v) <= 10000))
  if (!ok(a) || !ok(b)) throw new Error('Enter {"a":[...],"b":[...]}: level-order trees of up to 2,000 items with integers |v| ≤ 10,000 or null.')
  if ((a.length && a[0] === null) || (b.length && b[0] === null)) throw new Error('A root cannot be null; use [] for an empty tree.')
  return { a, b }
}

// Gives every node in a tree a new id, so ids from the two inputs never collide in the display.
function offsetIds(node, offset) {
  if (!node) return null
  return { ...node, id: node.id + offset, left: offsetIds(node.left, offset), right: offsetIds(node.right, offset) }
}

// Merge of two trees: values add where both exist; otherwise the existing subtree is kept.
export function buildTrace({ a, b }) {
  const ta = treeFromLevelOrder(a), tb = offsetIds(treeFromLevelOrder(b), 10000)
  const frames = [{ phase: 'start', current: null, activeLine: 2, message: 'Walk both trees together from the roots.' }]
  function merge(x, y) {
    if (!x) return y
    if (!y) return x
    const node = { id: x.id, value: x.value + y.value, left: null, right: null }
    frames.push({ phase: 'merge', current: node.id, activeLine: 5, message: `Both nodes exist: ${x.value} + ${y.value} = ${node.value}.` })
    node.left = merge(x.left, y.left)
    node.right = merge(x.right, y.right)
    return node
  }
  const root = merge(ta, tb)
  if (!root) frames.push({ phase: 'merge', current: null, activeLine: 3, message: 'Both trees are empty.' })
  const serial = levelOrderFromTree(root)
  frames.push({ phase: 'done', current: null, result: serial, activeLine: 7, message: `Merged level order: [${serial.map(v => (v === null ? 'null' : v)).join(', ')}].` })
  return { input: { a, b }, root, result: serial, frames }
}

export const code = `align the two roots at the top
define merge for two positions: if both positions are empty, return empty
otherwise sum the two values, treating a missing node as zero
merge the left children and merge the right children at the same positions
return a new node holding the sum and the merged children
return the level-order serialization of the merged tree`.split('\n').map((text, index) => ({ line: index + 1, text }))

// The tree-family visualizer reports its own step numbers (1 setup, 3 sum, 4 combine, 5 return).
export const LINE_MAP = { 1: 1, 3: 3, 4: 5, 5: 6 }

export const python = `def merge_trees(root1, root2):
    def build(values):
        if not values or values[0] is None:
            return None
        top = {'val': values[0], 'left': None, 'right': None}
        queue, i = [top], 1
        while queue and i < len(values):
            current = queue.pop(0)
            if values[i] is not None:
                current['left'] = {'val': values[i], 'left': None, 'right': None}
                queue.append(current['left'])
            i += 1
            if i < len(values) and values[i] is not None:
                current['right'] = {'val': values[i], 'left': None, 'right': None}
                queue.append(current['right'])
            i += 1
        return top

    def merge(a, b):
        if a is None and b is None:
            return None
        total = (a['val'] if a is not None else 0) + (b['val'] if b is not None else 0)
        left = merge(a['left'] if a is not None else None, b['left'] if b is not None else None)
        right = merge(a['right'] if a is not None else None, b['right'] if b is not None else None)
        return {'val': total, 'left': left, 'right': right}

    def serialize(tree):
        if tree is None:
            return []
        queue, values, i = [tree], [], 0
        while i < len(queue):
            current = queue[i]
            i += 1
            if current is None:
                values.append(None)
            else:
                values.append(current['val'])
                queue.append(current['left'])
                queue.append(current['right'])
        while values and values[-1] is None:
            values.pop()
        return values

    return serialize(merge(build(root1), build(root2)))`
