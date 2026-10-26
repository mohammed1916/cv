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

export const code = `def averageOfLevels(root):
    out, level = [], [root]
    while level:
        total = 0
        for node in level: total += node.val
        out.append(total / len(level))
        level = [c for n in level for c in (n.left, n.right) if c]
    return out`.split('\n').map((text, index) => ({ line: index + 1, text }))
