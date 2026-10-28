import { treeFromLevelOrder } from '../../components/shared/treeLayout.js'

export function parseInput(text) {
  const input = JSON.parse(text)
  const values = input?.values
  if (!Array.isArray(values) || values.length < 1 || values.length > 15 || values[0] === null) throw new Error('Use {"values": [...]} with 1 to 15 level-order entries and a non-null root.')
  if (values.some(v => v !== null && (!Number.isInteger(v) || v < -100000 || v > 100000))) throw new Error('Node values are integers from -100000 to 100000, or null for a missing child.')
  return { values }
}

export function buildTrace(input) {
  const root = treeFromLevelOrder(input.values)
  const frames = [{ phase: 'start', activeLine: L('put the root in a queue'), level: 0, ids: [], levelSum: null, bestLevel: null, bestSum: null, message: 'Put the root in a queue. Level 1 holds only the root.' }]
  let frontier = root ? [root] : []
  let level = 1
  let bestLevel = null
  let bestSum = null
  while (frontier.length > 0) {
    const levelSum = frontier.reduce((sum, n) => sum + n.value, 0)
    const ids = frontier.map(n => n.id)
    frames.push({ phase: 'level', activeLine: L('set level sum to'), level, ids, levelSum, bestLevel, bestSum, message: `Level ${level} sums to ${levelSum}.` })
    if (bestSum === null || levelSum > bestSum) {
      bestSum = levelSum
      bestLevel = level
      frames.push({ phase: 'better', activeLine: L('set best sum to level sum'), level, ids, levelSum, bestLevel, bestSum, message: `${levelSum} is the new best sum, reached at level ${level}.` })
    } else {
      frames.push({ phase: 'keep', activeLine: L('if best sum is none'), level, ids, levelSum, bestLevel, bestSum, message: `${levelSum} does not beat ${bestSum}, so level ${bestLevel} stays the best.` })
    }
    frontier = frontier.flatMap(n => [n.left, n.right].filter(Boolean))
    level++
  }
  frames.push({ phase: 'done', activeLine: L('return best level'), level: 0, ids: [], levelSum: null, bestLevel, bestSum, message: `Smallest level with the maximum sum: ${bestLevel}.` })
  return { input, root, result: bestLevel, frames }
}

export const code = `find the smallest level whose node values have the largest sum
  set best level to none and best sum to none
  put the root in a queue and set level to one
  repeat while the queue is not empty
    set level sum to the sum of node values in the queue
    if best sum is none or level sum is greater than best sum then
      set best sum to level sum and best level to level
    replace the queue with the children of all nodes in it
    add one to level
  return best level`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def max_level_sum(values):
    def make(v):
        return {'val': v, 'left': None, 'right': None}
    root = make(values[0])
    queue = [root]
    cursor = 1
    for node in queue:
        if cursor < len(values) and values[cursor] is not None:
            node['left'] = make(values[cursor])
            queue.append(node['left'])
        cursor += 1
        if cursor < len(values) and values[cursor] is not None:
            node['right'] = make(values[cursor])
            queue.append(node['right'])
        cursor += 1
    best_level, best_sum = None, None
    frontier = [root]
    level = 1
    while frontier:
        level_sum = sum(n['val'] for n in frontier)
        if best_sum is None or level_sum > best_sum:
            best_sum, best_level = level_sum, level
        frontier = [c for n in frontier for c in (n['left'], n['right']) if c is not None]
        level += 1
    return best_level
`
