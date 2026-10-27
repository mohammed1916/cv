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

export const code = `set best to 0
define arm(node) as the longest equal-value path going down from node, counted in edges
  if node is empty, return 0; otherwise get the arm of each child first
  left is one more than the left child's arm when the left child has the same value as node, otherwise 0
  right is one more than the right child's arm when the right child has the same value as node, otherwise 0
  set best to the larger of best and left plus right
  return the larger of left and right
call arm on the root
return best`.split('\n').map((text, index) => ({ line: index + 1, text }))

// Family line 3 gathers the child arms, line 4 joins them and updates the best path, line 5 returns.
export const LINE_MAP = { 1: 1, 3: 3, 4: 6, 5: 9 }

export const python = `def longest_univalue_path(root):
    if not root or root[0] is None:
        return 0
    values, lefts, rights = [], [], []

    def make(value):
        values.append(value)
        lefts.append(None)
        rights.append(None)
        return len(values) - 1

    start = make(root[0])
    queue = [start]
    head = 0
    i = 1
    while head < len(queue) and i < len(root):
        current = queue[head]
        head += 1
        if root[i] is not None:
            lefts[current] = make(root[i])
            queue.append(lefts[current])
        i += 1
        if i < len(root) and root[i] is not None:
            rights[current] = make(root[i])
            queue.append(rights[current])
        i += 1

    best = 0

    def arm(node):
        nonlocal best
        left_len = right_len = 0
        if lefts[node] is not None:
            child = arm(lefts[node])
            if values[lefts[node]] == values[node]:
                left_len = child + 1
        if rights[node] is not None:
            child = arm(rights[node])
            if values[rights[node]] == values[node]:
                right_len = child + 1
        best = max(best, left_len + right_len)
        return max(left_len, right_len)

    arm(start)
    return best`
