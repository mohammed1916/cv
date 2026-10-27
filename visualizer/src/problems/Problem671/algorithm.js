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

export const code = `set minimum to the root value, second to infinity, and stack to [root]
while the stack is not empty:
  pop a node
  if its value is greater than minimum, keep the smaller of second and its value, and do not explore below
  otherwise push its children onto the stack
return second, or -1 if no larger value was found`.split('\n').map((text, index) => ({ line: index + 1, text }))

// Tree trace: activeLine 1 (setup), 4 (update per popped node), 5 (return).
// Update frames name a candidate (line 4) or a node equal to the minimum that is explored (line 5).
export const LINE_MAP = { 1: 1, 5: 6 }

export function familyLine(frame) {
  if (frame.phase === 'update') return /candidate/.test(frame.message) ? 4 : 5
  return LINE_MAP[frame.activeLine] ?? frame.activeLine
}

export const python = `def find_second_minimum_value(root):
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

    tree = build_tree(root)
    minimum = tree["val"]
    second = float("inf")
    stack = [tree]
    while stack:
        node = stack.pop()
        if node["val"] > minimum:
            second = min(second, node["val"])
        else:
            if node["left"] is not None:
                stack.append(node["left"])
            if node["right"] is not None:
                stack.append(node["right"])
    return -1 if second == float("inf") else second`
