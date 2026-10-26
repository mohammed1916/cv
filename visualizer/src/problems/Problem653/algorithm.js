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

export const code = `def findTarget(root, k):
    seen, stack, node = set(), [], root
    while node or stack:
        while node:
            stack.append(node); node = node.left
        node = stack.pop()
        if k - node.val in seen: return True
        seen.add(node.val)
        node = node.right
    return False`.split('\n').map((text, index) => ({ line: index + 1, text }))
