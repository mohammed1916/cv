import { treeFromLevelOrder } from '../../components/shared/treeLayout.js'

export function parseInput(text) {
  const values = JSON.parse(text)
  if (!Array.isArray(values) || values.length < 1 || values.length > 3000 || values.some(v => v !== null && (!Number.isInteger(v) || Math.abs(v) > 100))) throw new Error('Enter a LeetCode level-order array of up to 3,000 items: integers from −100 to 100 or null.')
  if (values[0] === null) throw new Error('The root cannot be null.')
  return values
}

// Number the nodes as in a complete binary tree: the children of position p are 2p and 2p + 1. A level's width
// spans from its first to its last position, counting missing nodes in between. Positions are shifted
// down by the first position of each level so the numbers stay small.
export function buildTrace(values) {
  const root = treeFromLevelOrder(values)
  const frames = [{ phase: 'start', depth: 0, level: [], width: null, best: 0, activeLine: L('let best = 0'), pythonLine: P('best = 0'), message: 'Give the root position 0; the width of a level spans its outermost nodes.' }]
  let best = 0
  let level = root ? [{ node: root, pos: 0 }] : []
  let depth = 0
  while (level.length) {
    const width = level[level.length - 1].pos - level[0].pos + 1
    best = Math.max(best, width)
    frames.push({ phase: 'level', depth, level: level.map(({ node, pos }) => ({ id: node.id, value: node.value, pos })), width, best, activeLine: L('best = Math.max'), pythonLine: P('best = max('), message: `Level ${depth}: positions ${level[0].pos}…${level[level.length - 1].pos}, width ${width}.` })
    const next = []
    for (const { node, pos } of level) {
      if (node.left) next.push({ node: node.left, pos: 2 * pos })
      if (node.right) next.push({ node: node.right, pos: 2 * pos + 1 })
    }
    if (next.length) {
      const shift = next[0].pos
      for (const item of next) item.pos -= shift
    }
    level = next
    depth++
  }
  frames.push({ phase: 'done', depth, level: [], width: null, best, result: best, activeLine: L('return best'), pythonLine: P('return best'), message: `Maximum width: ${best}.` })
  return { input: values, root, result: best, frames }
}

const SOURCE = `function widthOfBinaryTree(root) {
  let best = 0
  let level = root ? [{ node: root, pos: 0 }] : []
  while (level.length > 0) {
    best = Math.max(best, level[level.length - 1].pos - level[0].pos + 1)
    const next = []
    for (const { node, pos } of level) {
      if (node.left) next.push({ node: node.left, pos: 2 * pos })
      if (node.right) next.push({ node: node.right, pos: 2 * pos + 1 })
    }
    if (next.length > 0) {
      const shift = next[0].pos
      for (const item of next) item.pos -= shift
    }
    level = next
  }
  return best
}`
export const code = SOURCE.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def width_of_binary_tree(root):
    best = 0
    level = [(root, 0)] if root else []
    while level:
        best = max(best, level[-1][1] - level[0][1] + 1)
        nxt = []
        for node, pos in level:
            if node["left"]:
                nxt.append((node["left"], 2 * pos))
            if node["right"]:
                nxt.append((node["right"], 2 * pos + 1))
        if nxt:
            shift = nxt[0][1]
            nxt = [(child, p - shift) for child, p in nxt]
        level = nxt
    return best`
const P = s => python.split('\n').findIndex(t => t.includes(s)) + 1
