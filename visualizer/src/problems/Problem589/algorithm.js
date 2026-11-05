import { treeFromNary } from '../../components/shared/treeLayout.js'

export function parseInput(text) {
  const items = JSON.parse(text)
  if (!Array.isArray(items) || items.length > 10000 || items.some(v => v !== null && (!Number.isInteger(v) || v < 0 || v > 10000))) throw new Error('Enter a LeetCode N-ary serialization: up to 10,000 items, each an integer 0–10,000 or null.')
  if (items.length && items[0] === null) throw new Error('The root cannot be null.')
  return items
}

export function buildTrace(items) {
  const root = treeFromNary(items)
  const frames = [{ phase: 'start', current: null, order: [], activeLine: 2, message: 'Preorder: visit a node first, then its children from left to right.' }]
  const order = []
  const visited = []
  if (root) {
    const stack = [root]
    while (stack.length) {
      const node = stack.pop()
      order.push(node.value)
      visited.push(node.id)
      frames.push({ phase: 'visit', current: node.id, visited: [...visited], order: [...order], activeLine: 5, message: `Visit ${node.value}; append it to the output.` })
      for (let i = node.children.length - 1; i >= 0; i--) stack.push(node.children[i])
    }
  }
  frames.push({ phase: 'done', current: null, visited, order: [...order], result: order, activeLine: 7, message: `Preorder: [${order.join(', ')}].` })
  return { input: items, root, result: order, frames }
}

export const code = `const stack = root ? [root] : []
const output = []
while (stack.length > 0) {
  const node = stack.pop()
  output.push(node.val)
  for (let i = node.children.length - 1; i >= 0; i--) stack.push(node.children[i])
}
return output`.split('\n').map((text, index) => ({ line: index + 1, text }))

// The family visualizer reports its own step numbers (1 setup, 3 visit, 5 return).
export const LINE_MAP = { 1: 1, 3: 5, 5: 8 }

export const python = `def preorder(root):
    stack = [root] if root is not None else []
    output = []
    while stack:
        current = stack.pop()
        output.append(current['val'])
        stack.extend(reversed(current.get('children', [])))
    return output`
