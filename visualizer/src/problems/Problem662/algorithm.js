import { treeFromLevelOrder } from '../../components/shared/treeLayout.js'

export function parseInput(text) {
  const values = JSON.parse(text)
  if (!Array.isArray(values) || values.length < 1 || values.length > 3000 || values.some(v => v !== null && (!Number.isInteger(v) || Math.abs(v) > 100))) throw new Error('Enter a LeetCode level-order array of up to 3,000 items: integers from −100 to 100 or null.')
  if (values[0] === null) throw new Error('The root cannot be null.')
  return values
}

// Number every position as in a complete binary tree (children of p are 2p and 2p+1). A level's width
// is last index − first index + 1, counting missing nodes between the outermost present nodes.
export function buildTrace(values) {
  const root = treeFromLevelOrder(values)
  const frames = [{ phase: 'start', depth: 0, width: null, best: 0, activeLine: 2, message: 'Assign heap positions to nodes; the width of a level spans its outermost nodes.' }]
  let best = 0
  let level = root ? [{ node: root, p: 1 }] : []
  let depth = 0
  while (level.length) {
    const width = level[level.length - 1].p - level[0].p + 1
    best = Math.max(best, width)
    frames.push({ phase: 'level', depth, width, best, first: level[0].p, last: level[level.length - 1].p, activeLine: 6, message: `Level ${depth}: positions ${level[0].p}…${level[level.length - 1].p}, width ${width}.` })
    const next = []
    for (const { node, p } of level) {
      if (node.left) next.push({ node: node.left, p: 2 * p })
      if (node.right) next.push({ node: node.right, p: 2 * p + 1 })
    }
    level = next
    depth++
  }
  frames.push({ phase: 'done', depth, width: null, best, result: best, activeLine: 9, message: `Maximum width: ${best}.` })
  return { input: values, result: best, frames }
}

export const code = `def widthOfBinaryTree(root):
    best = 0
    level = [(root, 1)] if root else []
    while level:
        best = max(best, level[-1][1] - level[0][1] + 1)
        nxt = []
        for node, p in level:
            if node.left: nxt.append((node.left, 2 * p))
            if node.right: nxt.append((node.right, 2 * p + 1))
        level = nxt
    return best`.split('\n').map((text, index) => ({ line: index + 1, text }))
