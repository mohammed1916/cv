import { treeFromLevelOrder } from '../../components/shared/treeLayout.js'

export function parseInput(text) {
  const values = JSON.parse(text)
  if (!Array.isArray(values) || values.length < 1 || values.length > 25 || values.some(v => v !== null && (!Number.isInteger(v) || v < 1 || v > 2147483647))) throw new Error('Enter a special binary tree (each node is the smaller of its children) of up to 25 items: positive integers or null.')
  if (values[0] === null) throw new Error('The root cannot be null.')
  return values
}

// The root is the minimum of the whole tree, so the answer is the smallest value that differs from the root.
export function buildTrace(values) {
  const root = treeFromLevelOrder(values)
  const rootValue = root.value
  let second = Infinity
  const frames = [{ phase: 'start', current: null, second: null, activeLine: 2, message: `The root ${rootValue} is the minimum; look for the smallest value that is larger.` }]
  const stack = [root]
  const seen = []
  while (stack.length) {
    const node = stack.pop()
    seen.push(node.id)
    if (node.value > rootValue && node.value < second) second = node.value
    frames.push({ phase: 'visit', current: node.id, seen: [...seen], second: second === Infinity ? null : second, activeLine: 5, message: `Visit ${node.value}${node.value > rootValue ? `: larger than ${rootValue}, a candidate` : `: equal to the minimum`}.` })
    if (node.right) stack.push(node.right)
    if (node.left) stack.push(node.left)
  }
  const result = second === Infinity ? -1 : second
  frames.push({ phase: 'done', current: null, seen, second: result, result, activeLine: 8, message: `Second minimum: ${result}.` })
  return { input: values, root, result, frames }
}

export const code = `def findSecondMinimumValue(root):
    first, second = root.val, inf
    stack = [root]
    while stack:
        node = stack.pop()
        if first < node.val < second: second = node.val
        if node.left: stack.append(node.left)
        if node.right: stack.append(node.right)
    return second if second < inf else -1`.split('\n').map((text, index) => ({ line: index + 1, text }))
