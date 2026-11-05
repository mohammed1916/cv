const CODE_LINES = `function deleteTreeNodes(parent, value) {
  const n = parent.length
  const children = Array.from({ length: n }, () => [])
  for (let v = 1; v < n; v++) children[parent[v]].push(v)
  const order = []
  const stack = [0]
  while (stack.length) {
    const v = stack.pop()
    order.push(v)
    stack.push(...children[v])
  }
  const total = [...value]
  for (const v of [...order].reverse()) {
    for (const c of children[v]) total[v] += total[c]
  }
  const removed = Array(n).fill(false)
  for (const v of order) {
    if (total[v] === 0 || (v !== 0 && removed[parent[v]])) removed[v] = true
  }
  return removed.filter(r => !r).length
}`.split('\n')

export const code = CODE_LINES.map((text, index) => ({ line: index + 1, text }))
const L = text => {
  const index = CODE_LINES.findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`pseudocode line missing: ${text}`)
  return index + 1
}

export const python = `def delete_tree_nodes(parent, value):
    n = len(parent)
    children = [[] for _ in range(n)]
    for v in range(1, n):
        children[parent[v]].append(v)
    order = []
    stack = [0]
    while stack:
        v = stack.pop()
        order.append(v)
        stack.extend(children[v])
    total = list(value)
    for v in reversed(order):
        for c in children[v]:
            total[v] += total[c]
    removed = [False] * n
    for v in order:
        if total[v] == 0 or (v != 0 and removed[parent[v]]):
            removed[v] = True
    return sum(1 for v in range(n) if not removed[v])
`
const PY_LINES = python.split('\n')
const P = text => {
  const index = PY_LINES.findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`python line missing: ${text}`)
  return index + 1
}

export const phases = [
  { id: 'build', label: 'Children', description: 'Turn parent links into child lists.' },
  { id: 'sum', label: 'Subtree sums', description: 'Add each node to its children totals, children first.' },
  { id: 'zero', label: 'Zero sum', description: 'A zero-sum subtree is deleted with all its nodes.' },
  { id: 'inherit', label: 'Inherited', description: 'The node sits under a deleted subtree.' },
  { id: 'keep', label: 'Kept', description: 'The node and its ancestors have non-zero sums.' },
  { id: 'done', label: 'Count', description: 'Count the surviving nodes.' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with parent and value arrays.')
  const { parent, value } = input
  if (!Array.isArray(parent) || !Array.isArray(value) || parent.length !== value.length) throw new Error('parent and value must be arrays of the same length.')
  const n = parent.length
  if (n < 1 || n > 12) throw new Error('The tree has 1 to 12 nodes (visualization cap).')
  if (parent[0] !== -1) throw new Error('Node 0 is the root, so parent[0] must be -1.')
  for (let v = 1; v < n; v++) {
    if (!Number.isInteger(parent[v]) || parent[v] < 0 || parent[v] >= n) throw new Error('Each non-root parent is a node index.')
    let walk = v
    for (let steps = 0; walk !== 0; steps++) {
      if (steps > n) throw new Error('parent links must form a tree rooted at node 0.')
      walk = parent[walk]
    }
  }
  if (!value.every(item => Number.isInteger(item) && Math.abs(item) <= 9)) throw new Error('Each value is an integer from -9 to 9 (visualization cap).')
  return { parent, value }
}

export function buildTrace({ parent, value }) {
  const n = parent.length
  const frames = []
  const children = Array.from({ length: n }, () => [])
  for (let v = 1; v < n; v++) children[parent[v]].push(v)
  const snapshot = (sum, removed, index, extra = {}) => ({ sum: [...sum], removed: [...removed], index, ...extra })
  const sum = [...value]
  const removed = Array(n).fill(false)
  frames.push({ phase: 'build', activeLine: L('const children = Array.from'), pythonLine: P('children = [[] for'), message: 'Each node lists the children that point to it.', ...snapshot(sum, removed, -1) })
  const order = []
  const stack = [0]
  while (stack.length) {
    const v = stack.pop()
    order.push(v)
    stack.push(...children[v])
  }
  frames.push({ phase: 'build', activeLine: L('const order = []'), pythonLine: P('order = []'), message: 'Visit parents before children, then process in reverse.', ...snapshot(sum, removed, -1) })
  for (const v of [...order].reverse()) {
    for (const c of children[v]) sum[v] += sum[c]
    frames.push({ phase: 'sum', activeLine: L('for (const v of [...order].reverse())'), pythonLine: P('for v in reversed(order)'), message: `Subtree of ${v} sums to ${sum[v]}.`, ...snapshot(sum, removed, v) })
  }
  for (const v of order) {
    if (sum[v] === 0) {
      removed[v] = true
      frames.push({ phase: 'zero', activeLine: L('if (total[v] === 0 ||'), pythonLine: P('if total[v] == 0'), message: `Subtree of ${v} sums to 0, so it is deleted with its descendants.`, ...snapshot(sum, removed, v) })
    } else if (v !== 0 && removed[parent[v]]) {
      removed[v] = true
      frames.push({ phase: 'inherit', activeLine: L('if (total[v] === 0 ||'), pythonLine: P('removed[parent[v]]'), message: `Node ${v} hangs under a deleted subtree.`, ...snapshot(sum, removed, v) })
    } else {
      frames.push({ phase: 'keep', activeLine: L('if (total[v] === 0 ||'), pythonLine: P('if total[v] == 0'), message: `Node ${v} survives.`, ...snapshot(sum, removed, v) })
    }
  }
  const count = removed.filter(item => !item).length
  frames.push({ phase: 'done', activeLine: L('return removed.filter'), pythonLine: P('return sum('), message: `${count} node${count === 1 ? '' : 's'} remain.`, ...snapshot(sum, removed, -1) })
  return { input: { parent, value }, result: count, frames }
}
