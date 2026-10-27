import { treeFromNary } from '../../components/shared/treeLayout.js'

export function parseInput(text) {
  const items = JSON.parse(text)
  if (!Array.isArray(items) || items.length > 10000 || items.some(v => v !== null && (!Number.isInteger(v) || v < 0 || v > 10000))) throw new Error('Enter a LeetCode N-ary serialization: up to 10,000 items, each an integer 0–10,000 or null.')
  if (items.length && items[0] === null) throw new Error('The root cannot be null.')
  return items
}

export function buildTrace(items) {
  const root = treeFromNary(items)
  const frames = [{ phase: 'start', current: null, order: [], activeLine: 2, message: 'Postorder: finish all children before emitting the node.' }]
  const order = [], finished = []
  if (root) {
    const stack = [{ node: root, next: 0 }]
    frames.push({ phase: 'enter', current: root.id, finished: [], order: [], activeLine: 3, message: `Enter ${root.value}.` })
    while (stack.length) {
      const top = stack[stack.length - 1]
      if (top.next < top.node.children.length) {
        const child = top.node.children[top.next++]
        stack.push({ node: child, next: 0 })
        frames.push({ phase: 'enter', current: child.id, finished: [...finished], order: [...order], activeLine: 3, message: `Descend into ${child.value}.` })
      } else {
        stack.pop()
        order.push(top.node.value)
        finished.push(top.node.id)
        frames.push({ phase: 'exit', current: top.node.id, finished: [...finished], order: [...order], activeLine: 5, message: `All children of ${top.node.value} are done; emit it.` })
      }
    }
  }
  frames.push({ phase: 'done', current: null, finished, order: [...order], result: order, activeLine: 6, message: `Postorder: [${order.join(', ')}].` })
  return { input: items, root, result: order, frames }
}

export const code = `put the root on a stack marked not expanded
start the output as an empty list
while the stack is not empty
  pop the next entry from the stack
  if the entry is not expanded
    push it back marked expanded
    push its children onto the stack from right to left, not expanded
  otherwise append its value to the output
return the output`.split('\n').map((text, index) => ({ line: index + 1, text }))

// The family visualizer reports its own step numbers (1 setup, 3 defer, 4 visit, 5 return).
export const LINE_MAP = { 1: 1, 3: 6, 4: 8, 5: 9 }

export const python = `def postorder(root):
    stack = [(root, False)] if root is not None else []
    output = []
    while stack:
        current, expanded = stack.pop()
        if expanded:
            output.append(current['val'])
        else:
            stack.append((current, True))
            stack.extend((child, False) for child in reversed(current.get('children', [])))
    return output`
