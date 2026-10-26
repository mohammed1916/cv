import { treeFromLevelOrder, levelOrderFromTree } from '../../components/shared/treeLayout.js'

export function parseInput(text) {
  const data = JSON.parse(text)
  const { root, v, d } = data ?? {}
  if (!Array.isArray(root) || root.length < 1 || root.length > 2000 || root.some(x => x !== null && (!Number.isInteger(x) || Math.abs(x) > 100)) || root[0] === null) throw new Error('root must be a level-order array of 1–2,000 items, the first not null.')
  if (!Number.isInteger(v) || Math.abs(v) > 100) throw new Error('v must be an integer with |v| ≤ 100.')
  if (!Number.isInteger(d) || d < 1 || d > 50) throw new Error('d must be an integer depth from 1 to 50.')
  return { root, v, d }
}

export function buildTrace({ root, v, d }) {
  let top = treeFromLevelOrder(root)
  let nextId = 100000
  const newNode = (value, left, right) => ({ id: nextId++, value, left, right })
  const frames = [{ phase: 'start', depth: 1, current: null, activeLine: 2, message: `Insert ${v} as a new row at depth ${d}.` }]
  if (d === 1) {
    top = newNode(v, top, null)
    frames.push({ phase: 'insert', depth: 1, current: top.id, activeLine: 3, message: `Depth 1: ${v} becomes the new root above the old tree.` })
  } else {
    let level = top ? [top] : []
    for (let depth = 1; depth < d - 1 && level.length; depth++) {
      const next = []
      for (const node of level) { if (node.left) next.push(node.left); if (node.right) next.push(node.right) }
      level = next
      frames.push({ phase: 'descend', depth: depth + 1, current: null, activeLine: 5, message: `Descend to depth ${depth + 1}: ${level.length} node${level.length === 1 ? '' : 's'}.` })
    }
    for (const node of level) {
      node.left = newNode(v, node.left, null)
      node.right = newNode(v, null, node.right)
      frames.push({ phase: 'insert', depth: d, current: node.id, activeLine: 8, message: `Under ${node.value}: new ${v} nodes take over both child slots.` })
    }
  }
  const result = levelOrderFromTree(top)
  frames.push({ phase: 'done', depth: d, current: null, result, activeLine: 10, message: `Level order: [${result.map(x => (x === null ? 'null' : x)).join(', ')}].` })
  return { input: { root, v, d }, root: top, result, frames }
}

export const code = `def addOneRow(root, v, d):
    if d == 1: return TreeNode(v, root, None)
    level = [root]
    for _ in range(d - 2):
        level = [c for n in level for c in (n.left, n.right) if c]
    for node in level:
        node.left = TreeNode(v, node.left, None)
        node.right = TreeNode(v, None, node.right)
    return root`.split('\n').map((text, index) => ({ line: index + 1, text }))
