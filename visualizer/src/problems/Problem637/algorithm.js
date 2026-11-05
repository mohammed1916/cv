import { treeFromLevelOrder } from '../../components/shared/treeLayout.js'

export function parseInput(text) {
  const values = JSON.parse(text)
  if (!Array.isArray(values) || values.length < 1 || values.length > 10000 || values.some(v => v !== null && (!Number.isInteger(v) || Math.abs(v) > 2147483647))) throw new Error('Enter a LeetCode level-order array of 1–10,000 items: integers within 32-bit range or null.')
  if (values[0] === null) throw new Error('The root cannot be null.')
  return values
}

// Walk the tree one level at a time: sum the values, divide by the number of nodes, and move to the children.
export function buildTrace(values) {
  const root = treeFromLevelOrder(values)
  const frames = [{ phase: 'start', depth: 0, levelIds: [], current: null, seen: [], averages: [], activeLine: L('let level = root'), pythonLine: P('frontier = [build_tree'), message: 'Start with the root as the only node on level 0.' }]
  const averages = []
  const seen = []
  let level = root ? [root] : []
  let depth = 0
  while (level.length) {
    let sum = 0
    const levelIds = level.map(node => node.id)
    for (const node of level) {
      sum += node.value
      seen.push(node.id)
      frames.push({ phase: 'visit', depth, levelIds, current: node.id, seen: [...seen], averages: [...averages], running: sum, activeLine: L('sum += node.value'), pythonLine: P('output.append'), message: `Level ${depth}: add ${node.value}; running sum ${sum}.` })
    }
    const average = sum / level.length
    averages.push(average)
    frames.push({ phase: 'level', depth, levelIds, current: null, seen: [...seen], averages: [...averages], running: sum, activeLine: L('result.push('), pythonLine: P('output.append'), message: `Level ${depth} average: ${sum} / ${level.length} = ${average}.` })
    level = level.flatMap(node => [node.left, node.right].filter(Boolean))
    depth++
  }
  frames.push({ phase: 'done', depth, levelIds: [], current: null, seen, averages: [...averages], result: averages, activeLine: L('return result'), pythonLine: P('return output'), message: `Level averages: [${averages.join(', ')}].` })
  return { input: values, root, result: averages, frames }
}

const SOURCE = `function averageOfLevels(root) {
  const result = []
  let level = root ? [root] : []
  while (level.length > 0) {
    let sum = 0
    for (const node of level) sum += node.value
    result.push(sum / level.length)
    level = level.flatMap(node => [node.left, node.right].filter(Boolean))
  }
  return result
}`
export const code = SOURCE.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

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
const P = s => python.split('\n').findIndex(t => t.includes(s)) + 1
