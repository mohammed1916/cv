export const phases = [
  { id: 'start', label: 'Build tree', description: 'Read the level-order list into linked nodes. The root starts the stack unfinished.' },
  { id: 'pop', label: 'Pop entry', description: 'Take the entry on top of the stack. It is a node or an empty child.' },
  { id: 'empty', label: 'Empty child', description: 'An empty child has nothing to emit, so it is dropped.' },
  { id: 'schedule', label: 'Schedule children', description: 'First visit: push the node back marked finished, then its right child, then its left child, so the left subtree is handled first.' },
  { id: 'emit', label: 'Emit node', description: 'A finished node is emitted only after both of its subtrees have been emitted.' },
  { id: 'done', label: 'Result', description: 'Return the emitted values in postorder.' },
]

export const code = `function postorder(root):
    output = []
    stack = [(root, false)]
    while stack is not empty:
        node, finished = stack.pop()
        if node is null:
            continue
        if finished:
            output.append(node.value)
        else:
            stack.push((node, true))
            stack.push((node.right, false))
            stack.push((node.left, false))
    return output`

export const python = `def postorder(root):
    output = []
    stack = [(root, False)]
    while stack:
        node, finished = stack.pop()
        if node is None:
            continue
        if finished:
            output.append(node.val)
        else:
            stack.append((node, True))
            stack.append((node.right, False))
            stack.append((node.left, False))
    return output`

const lineOf = (source, fragment) => source.split('\n').findIndex(line => line.includes(fragment)) + 1
const C = fragment => lineOf(code, fragment)
const P = fragment => lineOf(python, fragment)

// Level order with nulls: each non-null node consumes the next two entries as its left and right children.
function buildTree(values) {
  const make = index => values[index] === null ? null : { id: index, value: values[index], left: null, right: null }
  const root = make(0)
  const queue = [root]
  let next = 1
  while (queue.length && next < values.length) {
    const node = queue.shift()
    node.left = make(next)
    next += 1
    if (node.left) queue.push(node.left)
    if (next < values.length) {
      node.right = make(next)
      next += 1
      if (node.right) queue.push(node.right)
    }
  }
  if (values.slice(next).some(v => v !== null)) throw new Error('Some entries have no parent node. Check the null placeholders.')
  return root
}

export function parseInput(text) {
  let values
  try { values = JSON.parse(text) } catch { throw new Error('Enter a JSON array in level order, such as [4,2,null,1,3].') }
  if (!Array.isArray(values) || values.length < 1 || values.length > 30) throw new Error('Use 1 to 30 entries.')
  if (values[0] === null) throw new Error('The first entry is the root, so it cannot be null.')
  values.forEach(v => {
    if (v !== null && (!Number.isInteger(v) || Math.abs(v) > 100)) throw new Error('Entries must be integers from -100 to 100, or null.')
  })
  buildTree(values)
  return values
}

export function buildTrace(values) {
  const root = buildTree(values)
  const frames = []
  const output = []
  const stack = [{ node: root, finished: false }]
  const outputIds = []
  const snap = (current, currentId = null) => ({
    tree: root,
    stack: stack.map(({ node, finished }) => node ? { id: node.id, value: node.value, finished } : null),
    stackIds: stack.filter(({ node }) => node).map(({ node }) => node.id),
    output: output.slice(),
    outputIds: outputIds.slice(),
    current,
    currentId,
  })
  const add = (phase, c, p, message, current = null, currentId = null) => frames.push({ phase, activeLine: C(c), pythonLine: P(p), message, snapshot: snap(current, currentId) })

  add('start', 'stack = [', 'stack = [', `The root ${root.value} starts the stack, not yet expanded.`)
  while (stack.length) {
    const { node, finished } = stack.pop()
    add('pop', 'node, finished = stack', 'node, finished = stack',
      node ? `Pop node ${node.value}${finished ? ', which is finished' : ', which is not yet expanded'}.` : 'Pop an empty child.',
      node ? node.value : null, node ? node.id : null)
    if (node === null) {
      add('empty', 'if node is', 'if node is', 'An empty child is dropped.')
      continue
    }
    if (finished) {
      output.push(node.value)
      outputIds.push(node.id)
      add('emit', 'output.append', 'output.append', `Emit ${node.value}: both of its subtrees were emitted before it.`, node.value, node.id)
      continue
    }
    stack.push({ node, finished: true })
    stack.push({ node: node.right, finished: false })
    stack.push({ node: node.left, finished: false })
    add('schedule', 'push((node, true))', 'append((node, True))',
      `Node ${node.value} waits until its children are done. Its left child ${node.left ? node.left.value : 'empty'} is on top.`, node.value, node.id)
  }
  add('done', 'return output', 'return output', `Postorder is ${output.join(', ')}.`)
  return { input: values, result: output, frames }
}
