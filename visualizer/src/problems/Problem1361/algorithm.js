export const phases = [
  { id: 'start', label: 'Start', description: 'Each node should have at most one parent, and exactly one node should have no parent: the root.' },
  { id: 'indegree', label: 'Count parents', description: 'For each child listed, add one to its parent count. A count of 2 or more means two parents, so the answer is false.' },
  { id: 'root', label: 'Find root', description: 'Exactly one node must have no parent. Zero roots or several roots make the answer false.' },
  { id: 'walk', label: 'Walk from root', description: 'Walk down from the root. Every node must be reached exactly once, which rules out cycles and disconnected pieces.' },
  { id: 'done', label: 'Complete', description: 'Return whether the nodes form exactly one binary tree.' },
]

export const examples = [
  { label: 'One tree', input: '{"n":4,"leftChild":[1,-1,3,-1],"rightChild":[2,-1,-1,-1]}' },
  { label: 'Node with two parents', input: '{"n":4,"leftChild":[1,-1,3,-1],"rightChild":[2,3,-1,-1]}' },
  { label: 'Two components', input: '{"n":4,"leftChild":[1,0,-1,-1],"rightChild":[-1,-1,-1,-1]}' },
]

export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || !Array.isArray(data.leftChild) || !Array.isArray(data.rightChild)) throw new Error('Use an object with n, leftChild and rightChild lists.')
  const { n } = data
  if (!Number.isInteger(n) || n < 1 || n > 12) throw new Error('n must be from 1 to 12 in this visualization.')
  if (data.leftChild.length !== n || data.rightChild.length !== n) throw new Error('leftChild and rightChild must each have n entries.')
  for (const v of [...data.leftChild, ...data.rightChild]) {
    if (!Number.isInteger(v) || v < -1 || v >= n) throw new Error('Each child must be -1 or a node index from 0 to n - 1.')
  }
  return { n, leftChild: data.leftChild, rightChild: data.rightChild }
}

export function buildTrace({ n, leftChild, rightChild }) {
  const parents = Array(n).fill(0)
  const snap = (extra = {}) => ({ n, leftChild, rightChild, parents: [...parents], ...extra })
  const frames = [{ phase: 'start', activeLine: L('const parents = Array'), pythonLine: P('parents = [0]'), snapshot: snap(),
    message: `${n} nodes; a valid tree has exactly one root and no node with two parents.` }]
  let ok = true
  for (let v = 0; v < n && ok; v++) {
    for (const child of [leftChild[v], rightChild[v]]) {
      if (child === -1) continue
      parents[child]++
      if (parents[child] > 1) ok = false
    }
    frames.push({ phase: 'indegree', activeLine: L('parents[child]++'), pythonLine: P('parents[child] += 1'), snapshot: snap({ current: v }),
      message: `Node ${v} lists children ${[leftChild[v], rightChild[v]].filter(c => c !== -1).join(' and ') || 'none'}.` })
    if (!ok) {
      frames.push({ phase: 'done', activeLine: L('return false'), pythonLine: P('return False'), snapshot: snap({ current: v }),
        message: 'A node has two parents, so these nodes cannot form one tree.', result: false })
      return { input: { n, leftChild, rightChild }, result: false, frames }
    }
  }
  const roots = parents.map((p, i) => (p === 0 ? i : -1)).filter(i => i !== -1)
  frames.push({ phase: 'root', activeLine: L('const roots ='), pythonLine: P('roots ='), snapshot: snap({ roots }),
    message: `Nodes without a parent: ${roots.length ? roots.join(', ') : 'none'}.` })
  if (roots.length !== 1) {
    frames.push({ phase: 'done', activeLine: L('return false'), pythonLine: P('return False'), snapshot: snap({ roots }),
      message: `There must be exactly one root, but there are ${roots.length}.`, result: false })
    return { input: { n, leftChild, rightChild }, result: false, frames }
  }
  const seen = new Set()
  const stack = [roots[0]]
  let result = true
  while (stack.length) {
    const v = stack.pop()
    if (seen.has(v)) { result = false; break }
    seen.add(v)
    frames.push({ phase: 'walk', activeLine: L('const v = stack.pop()'), pythonLine: P('v = stack.pop()'), snapshot: snap({ current: v, seen: [...seen] }),
      message: `Visit node ${v}; ${seen.size} of ${n} reached so far.` })
    for (const child of [leftChild[v], rightChild[v]]) if (child !== -1) stack.push(child)
  }
  result = result && seen.size === n
  frames.push({ phase: 'done', activeLine: L('return seen.size'), pythonLine: P('return len(seen)'), snapshot: snap({ seen: [...seen] }),
    message: `${seen.size} of ${n} nodes are reachable from the root; ${result ? 'so they form one tree.' : 'so some node is left out or repeated.'}`, result })
  return { input: { n, leftChild, rightChild }, result, frames }
}

export const code = `function validateBinaryTreeNodes(n, leftChild, rightChild) {
  const parents = Array(n).fill(0)
  for (let v = 0; v < n; v++) {
    for (const child of [leftChild[v], rightChild[v]]) {
      if (child !== -1) parents[child]++
      if (child !== -1 && parents[child] > 1) return false
    }
  }
  const roots = []
  for (let v = 0; v < n; v++) if (parents[v] === 0) roots.push(v)
  if (roots.length !== 1) return false
  const seen = new Set()
  const stack = [roots[0]]
  while (stack.length > 0) {
    const v = stack.pop()
    if (seen.has(v)) return false
    seen.add(v)
    for (const child of [leftChild[v], rightChild[v]]) if (child !== -1) stack.push(child)
  }
  return seen.size === n
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def validate_binary_tree_nodes(n, left_child, right_child):
    parents = [0] * n
    for v in range(n):
        for child in (left_child[v], right_child[v]):
            if child != -1:
                parents[child] += 1
                if parents[child] > 1:
                    return False
    roots = [v for v in range(n) if parents[v] == 0]
    if len(roots) != 1:
        return False
    seen = set()
    stack = [roots[0]]
    while stack:
        v = stack.pop()
        if v in seen:
            return False
        seen.add(v)
        for child in (left_child[v], right_child[v]):
            if child != -1:
                stack.append(child)
    return len(seen) == n
`
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1
