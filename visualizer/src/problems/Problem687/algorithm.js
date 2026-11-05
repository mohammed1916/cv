import { treeFromLevelOrder } from '../../components/shared/treeLayout.js'

export function parseInput(text) {
  const values = JSON.parse(text)
  if (!Array.isArray(values) || values.length < 1 || values.length > 2000 || values.some(v => v !== null && (!Number.isInteger(v) || Math.abs(v) > 1000))) throw new Error('Enter a LeetCode level-order array of up to 2,000 items: integers from −1,000 to 1,000 or null.')
  if (values[0] === null) throw new Error('The root cannot be null.')
  return values
}

// arm(node) is the longest downward path that starts at node and keeps one value. A path through node joins
// its two arms, but only the children that match node's value can extend it.
export function buildTrace(values) {
  const root = treeFromLevelOrder(values)
  let best = 0
  let bestId = null
  const arms = new Map()
  const frames = [{ phase: 'start', node: null, arms: {}, best, activeLine: L('let best = 0'), pythonLine: P('best = 0'), message: 'Find, for each node, the longest run of equal values going down.' }]
  const arm = node => {
    if (!node) return 0
    const left = arm(node.left)
    const right = arm(node.right)
    const fromLeft = node.left && node.left.value === node.value ? left + 1 : 0
    const fromRight = node.right && node.right.value === node.value ? right + 1 : 0
    const through = fromLeft + fromRight
    if (through > best) { best = through; bestId = node.id }
    arms.set(node.id, Math.max(fromLeft, fromRight))
    frames.push({ phase: 'node', node: node.id, arms: Object.fromEntries(arms), best, through, activeLine: L('const fromLeft'), pythonLine: P('from_left ='), message: `Node ${node.value}: arms ${fromLeft} and ${fromRight}, path through it ${through} edge(s).` })
    return Math.max(fromLeft, fromRight)
  }
  arm(root)
  frames.push({ phase: 'done', node: bestId, arms: Object.fromEntries(arms), best, result: best, activeLine: L('return best'), pythonLine: P('return best'), message: `Longest univalue path: ${best} edge(s).` })
  return { input: values, root, result: best, frames }
}

const SOURCE = `function longestUnivaluePath(root) {
  let best = 0
  const arm = node => {
    if (!node) return 0
    const left = arm(node.left)
    const right = arm(node.right)
    const fromLeft = node.left && node.left.val === node.val ? left + 1 : 0
    const fromRight = node.right && node.right.val === node.val ? right + 1 : 0
    best = Math.max(best, fromLeft + fromRight)
    return Math.max(fromLeft, fromRight)
  }
  arm(root)
  return best
}`
export const code = SOURCE.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def longest_univalue_path(root):
    best = 0

    def arm(node):
        nonlocal best
        if node is None:
            return 0
        left = arm(node["left"])
        right = arm(node["right"])
        from_left = left + 1 if node["left"] and node["left"]["val"] == node["val"] else 0
        from_right = right + 1 if node["right"] and node["right"]["val"] == node["val"] else 0
        best = max(best, from_left + from_right)
        return max(from_left, from_right)

    arm(root)
    return best`
const P = s => python.split('\n').findIndex(t => t.includes(s)) + 1
