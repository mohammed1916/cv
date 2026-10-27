import { treeFromLevelOrder, levelOrderFromTree } from '../../components/shared/treeLayout.js'

export function parseInput(text) {
  const data = JSON.parse(text)
  const { root, val } = data ?? {}
  if (!Array.isArray(root) || root.length < 1 || root.length > 5000 || root.some(v => v !== null && (!Number.isInteger(v) || Math.abs(v) > 10000000))) throw new Error('root must be a BST level-order array of up to 5,000 items.')
  if (root[0] === null) throw new Error('The root cannot be null.')
  if (!Number.isInteger(val) || Math.abs(val) > 10000000) throw new Error('val must be an integer with |val| ≤ 10,000,000.')
  return { root, val }
}

// Walk down: go left when val is smaller, right when larger, until the node matches or the path ends.
export function buildTrace({ root, val }) {
  let node = treeFromLevelOrder(root)
  const path = []
  const frames = [{ phase: 'start', current: node?.id ?? null, path: [], result: null, activeLine: 2, message: `Search for ${val} from the root.` }]
  while (node) {
    path.push(node.id)
    if (node.value === val) {
      frames.push({ phase: 'found', current: node.id, path: [...path], result: node, activeLine: 4, message: `Found ${val}.` })
      break
    }
    const goLeft = val < node.value
    frames.push({ phase: 'step', current: node.id, path: [...path], result: null, activeLine: goLeft ? 5 : 6, message: `${val} ${goLeft ? '<' : '>'} ${node.value}: go ${goLeft ? 'left' : 'right'}.` })
    node = goLeft ? node.left : node.right
  }
  const found = node && node.value === val ? node : null
  const result = found ? levelOrderFromTree(found) : null
  if (!found) frames.push({ phase: 'missing', current: null, path: [...path], result: null, activeLine: 8, message: `${val} is not in the tree.` })
  frames.push({ phase: 'done', current: found?.id ?? null, path: [...path], result, activeLine: 9, message: found ? `Subtree rooted at ${val}: [${result.map(v => (v === null ? 'null' : v)).join(', ')}].` : 'Return null.' })
  return { input: { root, val }, root: treeFromLevelOrder(root), result, frames }
}

export const code = `set current to the root
while current exists
  compare the target with the current value
  if they are equal, return the whole subtree at current; otherwise move to the left child for a smaller target or the right child for a larger one
return an empty subtree`.split('\n').map((text, index) => ({ line: index + 1, text }))

// Family line 4 either returns the matching subtree or reports a missing child; line 5 returns the result.
export function familyLine(frame) {
  if (frame.activeLine === 4) return /missing child/.test(frame.message) ? 5 : 4
  if (frame.activeLine === 5) return /^Return \[\]/.test(frame.message) ? 5 : 4
  return ({ 1: 1, 3: 3 })[frame.activeLine] ?? frame.activeLine
}

export const python = `def search_bst(root, val):
    values, lefts, rights = [], [], []

    def make(value):
        values.append(value)
        lefts.append(None)
        rights.append(None)
        return len(values) - 1

    if not root or root[0] is None:
        return []
    start = make(root[0])
    queue = [start]
    head = 0
    i = 1
    while head < len(queue) and i < len(root):
        current = queue[head]
        head += 1
        if root[i] is not None:
            lefts[current] = make(root[i])
            queue.append(lefts[current])
        i += 1
        if i < len(root) and root[i] is not None:
            rights[current] = make(root[i])
            queue.append(rights[current])
        i += 1

    current = start
    while current is not None and values[current] != val:
        current = lefts[current] if val < values[current] else rights[current]
    if current is None:
        return []

    result = [values[current]]
    queue = [current]
    head = 0
    while head < len(queue):
        node = queue[head]
        head += 1
        for child in (lefts[node], rights[node]):
            if child is None:
                result.append(None)
            else:
                result.append(values[child])
                queue.append(child)
    while result and result[-1] is None:
        result.pop()
    return result`
