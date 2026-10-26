import { treeFromLevelOrder } from '../../components/shared/treeLayout.js'

export function parseInput(text) {
  const values = JSON.parse(text)
  if (!Array.isArray(values) || values.length < 1 || values.length > 10000 || values.some(v => v !== null && (!Number.isInteger(v) || Math.abs(v) > 1000000000))) throw new Error('Enter a LeetCode level-order array of 1–10,000 items: integers with |v| ≤ 1e9 or null.')
  if (values[0] === null) throw new Error('The root cannot be null.')
  return values
}

// For each node, the longest univalue chain going down through its left and right children.
export function buildTrace(values) {
  const root = treeFromLevelOrder(values)
  let best = 0
  const frames = [{ phase: 'start', current: null, best: 0, arrows: {}, activeLine: 2, message: 'Measure each node by the univalue arms below it.' }]
  const arms = {}
  function arm(node) {
    if (!node) return 0
    const left = arm(node.left), right = arm(node.right)
    const leftArm = node.left && node.left.value === node.value ? left + 1 : 0
    const rightArm = node.right && node.right.value === node.value ? right + 1 : 0
    arms[node.id] = Math.max(leftArm, rightArm)
    best = Math.max(best, leftArm + rightArm)
    frames.push({ phase: 'node', current: node.id, best, arms: { ...arms }, activeLine: 6, message: `Node ${node.value}: arms ${leftArm} and ${rightArm}; best path through it ${leftArm + rightArm}.` })
    return arms[node.id]
  }
  arm(root)
  frames.push({ phase: 'done', current: null, best, arms: { ...arms }, result: best, activeLine: 9, message: `Longest univalue path: ${best} edge${best === 1 ? '' : 's'}.` })
  return { input: values, root, result: best, frames }
}

export const code = `def longestUnivaluePath(root):
    best = 0
    def arm(node):
        nonlocal best
        if not node: return 0
        left, right = arm(node.left), arm(node.right)
        l = left + 1 if node.left and node.left.val == node.val else 0
        r = right + 1 if node.right and node.right.val == node.val else 0
        best = max(best, l + r)
        return max(l, r)
    arm(root)
    return best`.split('\n').map((text, index) => ({ line: index + 1, text }))
