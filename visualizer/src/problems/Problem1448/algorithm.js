import { treeFromLevelOrder } from '../../components/shared/treeLayout.js'

export function parseInput(text) {
  const obj = JSON.parse(text)
  if (!obj || typeof obj !== 'object' || !Array.isArray(obj.values)) throw new Error('Use an object with a values array in level order.')
  const { values } = obj
  if (values.length < 1 || values.length > 15) throw new Error('values has 1 to 15 entries in this visualization.')
  if (values[0] === null) throw new Error('The root must not be null.')
  if (values.some(v => v !== null && (!Number.isInteger(v) || v < -5 || v > 5))) throw new Error('Node values are integers from -5 to 5, or null.')
  return { values }
}

export function buildTrace(input) {
  const root = treeFromLevelOrder(input.values)
  let count = 0
  const frames = [{ phase: 'start', activeLine: L('set count to 0'), node: null, best: null, count, message: 'Start at the root with nothing above it.' }]
  const visit = (node, best) => {
    if (!node) return
    const good = node.value >= best
    if (good) {
      count++
      frames.push({ phase: 'good', activeLine: L('increase count by one'), node: node.id, best, count, message: `Node ${node.value} is at least the largest ${best} above it, so it is good.` })
    } else {
      frames.push({ phase: 'visit', activeLine: L('if the value of node is at least best'), node: node.id, best, count, message: `Node ${node.value} is below ${best}; it is not good.` })
    }
    const nextBest = Math.max(best, node.value)
    visit(node.left, nextBest)
    visit(node.right, nextBest)
  }
  visit(root, -Infinity)
  frames.push({ phase: 'done', activeLine: L('return count'), node: null, best: null, count, message: `${count} good nodes.` })
  return { input, result: count, root, frames }
}

export const code = `count good nodes in a binary tree
  set count to 0
  visit the root with best set to minus infinity
  return count
define visit(node, best) as follows
  if node is empty then stop
  if the value of node is at least best then increase count by one
  set the new best to the larger of best and the value of node
  visit the left child with the new best
  visit the right child with the new best`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def count_good_nodes(values):
    n = len(values)
    left = [None] * n
    right = [None] * n
    queue = [0]
    cursor = 1
    for node in queue:
        if cursor < n and values[cursor] is not None:
            left[node] = cursor
            queue.append(cursor)
        cursor += 1
        if cursor < n and values[cursor] is not None:
            right[node] = cursor
            queue.append(cursor)
        cursor += 1
    count = 0
    stack = [(0, float('-inf'))]
    while stack:
        idx, best = stack.pop()
        if values[idx] >= best:
            count += 1
        new_best = max(best, values[idx])
        if left[idx] is not None:
            stack.append((left[idx], new_best))
        if right[idx] is not None:
            stack.append((right[idx], new_best))
    return count
`
