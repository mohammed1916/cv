import { treeFromLevelOrder } from '../../components/shared/treeLayout.js'

export function parseInput(text) {
  const data = JSON.parse(text)
  const { root, k } = data ?? {}
  if (!Array.isArray(root) || root.length < 1 || root.length > 10000 || root.some(v => v !== null && (!Number.isInteger(v) || Math.abs(v) > 10000)) || root[0] === null) throw new Error('root must be a BST level-order array of 1–10,000 items with values |v| ≤ 10,000; the first item is not null.')
  if (!Number.isInteger(k) || Math.abs(k) > 100000) throw new Error('k must be an integer with |k| ≤ 100,000.')
  return { root, k }
}

// Walk the tree; remember values seen. When a node's partner (k − value) was seen earlier, report the pair.
export function buildTrace({ root, k }) {
  const tree = treeFromLevelOrder(root)
  const seen = new Set()
  let found = null
  const visited = []
  const frames = [{ phase: 'start', current: null, visited: [], seen: [], pair: null, activeLine: 2, message: `Look for two distinct nodes summing to ${k}.` }]
  const stack = []
  let node = tree
  while ((node || stack.length) && !found) {
    while (node) { stack.push(node); node = node.left }
    node = stack.pop()
    visited.push(node.id)
    const partner = k - node.value
    if (seen.has(partner)) {
      found = [partner, node.value]
      frames.push({ phase: 'match', current: node.id, visited: [...visited], seen: [...seen], pair: found, activeLine: 6, message: `${node.value} + ${partner} = ${k}: both nodes exist.` })
      break
    }
    seen.add(node.value)
    frames.push({ phase: 'visit', current: node.id, visited: [...visited], seen: [...seen], pair: null, activeLine: 5, message: `Visit ${node.value}; need ${partner} later. Seen so far: ${[...seen].join(', ')}.` })
    node = node.right
  }
  const result = found !== null
  frames.push({ phase: 'done', current: null, visited: [...visited], seen: [...seen], pair: found, result, activeLine: 8, message: result ? `Pair found: ${found.join(' + ')} = ${k}.` : 'No two nodes sum to k.' })
  return { input: { root, k }, root: tree, result, frames }
}

export const code = `set seen to an empty set and stack to [root]
while the stack is not empty:
  pop a node and compute need = k - its value
  if need is already in seen, return true
  add the node value to seen and push its children
return false`.split('\n').map((text, index) => ({ line: index + 1, text }))

// Tree trace: activeLine 1 (setup), 3 (inspect per popped node), 4 (true), 5 (update), done (6 when false).
export const LINE_MAP = { 1: 1, 3: 3, 4: 4, 5: 6 }

export function familyLine(frame) {
  if (frame.phase === 'done') return frame.result === true ? 4 : 6
  return LINE_MAP[frame.activeLine] ?? frame.activeLine
}

export const python = `def find_target(root, k):
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

    seen = set()
    stack = [build_tree(root)]
    while stack:
        node = stack.pop()
        need = k - node["val"]
        if need in seen:
            return True
        seen.add(node["val"])
        if node["right"] is not None:
            stack.append(node["right"])
        if node["left"] is not None:
            stack.append(node["left"])
    return False`
