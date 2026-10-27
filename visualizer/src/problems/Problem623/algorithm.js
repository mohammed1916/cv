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

export const code = `if the depth is one, make a new root whose left child is the old tree
otherwise start the frontier at the root
advance the frontier down until it holds the nodes just above the insertion depth
under each frontier node, insert a new value node on the left that keeps the old left subtree
and a new value node on the right that keeps the old right subtree
return the tree serialized in level order`.split('\n').map((text, index) => ({ line: index + 1, text }))

// The tree-family visualizer reports its own step numbers (1 setup, 3 advance, 4 insert, 5 return).
export const LINE_MAP = { 1: 1, 3: 3, 4: 4, 5: 6 }

export const python = `def add_one_row(root, val, depth):
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

    tree = build(root)
    if depth == 1:
        tree = {'val': val, 'left': tree, 'right': None}
    else:
        row = [tree]
        for _ in range(depth - 2):
            row = [child for current in row for child in (current['left'], current['right']) if child is not None]
        for current in row:
            current['left'] = {'val': val, 'left': current['left'], 'right': None}
            current['right'] = {'val': val, 'left': None, 'right': current['right']}
    return serialize(tree)`
