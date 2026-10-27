import { treeFromLevelOrder, levelOrderFromTree } from '../../components/shared/treeLayout.js'

export function parseInput(text) {
  const data = JSON.parse(text)
  const { root, val } = data ?? {}
  if (!Array.isArray(root) || root.length < 1 || root.length > 1000 || root.some(v => v !== null && (!Number.isInteger(v) || Math.abs(v) > 100000000))) throw new Error('root must be a BST level-order array of up to 1,000 items.')
  if (root[0] === null) throw new Error('The root cannot be null.')
  if (!Number.isInteger(val) || Math.abs(val) > 100000000) throw new Error('val must be an integer with |val| ≤ 100,000,000.')
  return { root, val }
}

// Walk down to the empty slot where val belongs (left of smaller nodes, right of larger), and attach a new leaf.
export function buildTrace({ root, val }) {
  const top = treeFromLevelOrder(root)
  const newId = 100000
  const frames = [{ phase: 'start', current: top.id, activeLine: 2, message: `Find the empty slot where ${val} belongs.` }]
  let node = top
  let inserted = false
  while (!inserted) {
    const goLeft = val < node.value
    const child = goLeft ? node.left : node.right
    if (!child) {
      const leaf = { id: newId, value: val, left: null, right: null }
      if (goLeft) node.left = leaf; else node.right = leaf
      frames.push({ phase: 'attach', current: leaf.id, activeLine: 6, message: `Empty ${goLeft ? 'left' : 'right'} slot under ${node.value}: attach ${val}.` })
      inserted = true
    } else {
      frames.push({ phase: 'step', current: child.id, activeLine: goLeft ? 4 : 5, message: `${val} ${goLeft ? '<' : '>'} ${node.value}: go ${goLeft ? 'left' : 'right'}.` })
      node = child
    }
  }
  const result = levelOrderFromTree(top)
  frames.push({ phase: 'done', current: null, result, activeLine: 8, message: `Level order: [${result.map(v => (v === null ? 'null' : v)).join(', ')}].` })
  return { input: { root, val }, root: top, result, frames }
}

export const code = `create a new leaf node holding the value
if the tree is empty, return the new leaf as the tree
set current to the root
while true
  if the value is less than current's value, go left; otherwise go right
  if that child is missing, attach the new leaf there and stop; otherwise set current to that child
return the root`.split('\n').map((text, index) => ({ line: index + 1, text }))

// Family line 3 chooses a side at each visited node (line 5 here); line 4 attaches or starts the tree; line 5 returns.
export function familyLine(frame) {
  if (frame.activeLine === 4) return /first node/.test(frame.message) ? 2 : 6
  if (frame.activeLine === 5) return 7
  return ({ 1: 1, 3: 5 })[frame.activeLine] ?? frame.activeLine
}

export const python = `def insert_into_bst(root, val):
    values, lefts, rights = [], [], []

    def make(value):
        values.append(value)
        lefts.append(None)
        rights.append(None)
        return len(values) - 1

    if not root or root[0] is None:
        return [val]
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

    leaf = make(val)
    current = start
    while True:
        if val < values[current]:
            if lefts[current] is None:
                lefts[current] = leaf
                break
            current = lefts[current]
        else:
            if rights[current] is None:
                rights[current] = leaf
                break
            current = rights[current]

    result = []
    queue = [start]
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
    result.insert(0, values[start])
    while result and result[-1] is None:
        result.pop()
    return result`
