import { treeFromLevelOrder } from '../../components/shared/treeLayout.js'

export function parseInput(text) {
  const values = JSON.parse(text)
  if (!Array.isArray(values) || values.length < 1 || values.length > 10000 || values.some(v => v !== null && (!Number.isInteger(v) || Math.abs(v) > 2147483647))) throw new Error('Enter a LeetCode level-order array of 1–10,000 items: integers within 32-bit range or null.')
  if (values[0] === null) throw new Error('The root cannot be null.')
  return values
}

// Visits each level from left to right, averaging its values.
export function buildTrace(values) {
  const root = treeFromLevelOrder(values)
  const frames = [{ phase: 'start', depth: 0, current: null, sums: [], averages: [], activeLine: 2, message: 'Walk the tree one level at a time and average each level.' }]
  const averages = []
  let level = root ? [root] : []
  let depth = 0
  const seen = []
  while (level.length) {
    let sum = 0
    for (const node of level) {
      sum += node.value
      seen.push(node.id)
      frames.push({ phase: 'visit', depth, current: node.id, seen: [...seen], sums: [...averages], running: sum, activeLine: 5, message: `Level ${depth}: add ${node.value}; running sum ${sum}.` })
    }
    const average = sum / level.length
    averages.push(average)
    frames.push({ phase: 'level', depth, current: null, seen: [...seen], sums: [...averages], activeLine: 7, message: `Level ${depth} average: ${sum} / ${level.length} = ${average}.` })
    level = level.flatMap(node => [node.left, node.right].filter(Boolean))
    depth++
  }
  frames.push({ phase: 'done', depth, current: null, seen, sums: [...averages], result: averages, activeLine: 9, message: `Level averages: [${averages.join(', ')}].` })
  return { input: values, root, result: averages, frames }
}

export const code = `set frontier to the root and output to an empty list
while frontier is not empty:
  sum the values on this level and count its nodes
  append their average to output
  replace frontier with all children of the frontier nodes
return output`.split('\n').map((text, index) => ({ line: index + 1, text }))

// Tree trace: activeLine 1 (setup), 4 (update once per level), 5 (return).
export const LINE_MAP = { 1: 1, 4: 4, 5: 6 }

export const familyLine = frame => LINE_MAP[frame.activeLine] ?? frame.activeLine

export const python = `def average_of_levels(root):
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

    frontier = [build_tree(root)]
    output = []
    while frontier:
        output.append(sum(node["val"] for node in frontier) / len(frontier))
        frontier = [child for node in frontier for child in (node["left"], node["right"]) if child is not None]
    return output`
