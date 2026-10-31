// A tree is represented as 0 (a leaf) or [left, right] (an internal node with two children).
export function parseInput(text) {
  const n = JSON.parse(text)
  if (!Number.isInteger(n) || n < 1 || n > 11) throw new Error('Enter a single integer n between 1 and 11 (visualization cap: Catalan(5) = 42 trees).')
  return n
}

export function countNodes(t) { return t === 0 ? 1 : 1 + countNodes(t[0]) + countNodes(t[1]) }

/** Gives every node a unique id and returns { id, value, left, right }. */
export function toNode(tree, counter = { next: 0 }) {
  if (tree === undefined) return null
  const node = { id: counter.next++, value: 0, left: null, right: null }
  if (tree !== 0) { node.left = toNode(tree[0], counter); node.right = toNode(tree[1], counter) }
  return node
}

function levelOrder(tree) {
  const out = []
  const queue = [tree]
  for (let q = 0; q < queue.length; q++) {
    const t = queue[q]
    if (t === null) { out.push(null); continue }
    out.push(0)
    queue.push(t === 0 ? null : t[0], t === 0 ? null : t[1])
  }
  while (out[out.length - 1] === null) out.pop()
  return out
}

export function buildTrace(n) {
  const memo = new Map([[1, [0]]])
  const memoSizes = () => [...memo.entries()].sort((a, b) => a[0] - b[0]).map(([size, trees]) => [size, trees.length])
  const frames = [{ phase: 'start', size: n, memo: memoSizes(), shown: null, pair: null, pythonLine: 4, activeLine: L('memo is a table'), message: `Build every full binary tree with ${n} nodes. Every node has 0 or 2 children, so n must be odd; memo[1] holds the single-node tree.` }]
  function rec(m, depth) {
    if (memo.has(m)) return memo.get(m)
    frames.push({ phase: 'call', size: m, memo: memoSizes(), shown: null, pair: null, pythonLine: 27, activeLine: L('set trees to an empty list'), message: `build(${m}): not memoised yet. Try every odd left size from 1 to ${m - 2}; the right side gets ${m - 1} - left_size nodes.` })
    const trees = []
    for (let leftSize = 1; leftSize < m; leftSize += 2) {
      const lefts = rec(leftSize, depth + 1)
      const rightSize = m - 1 - leftSize
      const rights = rec(rightSize, depth + 1)
      frames.push({ phase: 'memo', size: m, memo: memoSizes(), shown: null, pair: [leftSize, rightSize], pythonLine: 28, activeLine: L('for each odd left size'), message: `For size ${m} with ${leftSize} node(s) on the left and ${rightSize} on the right: ${lefts.length} x ${rights.length} = ${lefts.length * rights.length} combination(s), using memoised lists.` })
      for (const left of lefts) {
        for (const right of rights) {
          const tree = [left, right]
          trees.push(tree)
          frames.push({ phase: 'combine', size: m, memo: memoSizes(), shown: tree, pair: [leftSize, rightSize], pythonLine: 31, activeLine: L('add a new root'), message: `New root with a ${leftSize}-node left subtree and a ${rightSize}-node right subtree: tree #${trees.length} of size ${m}.` })
        }
      }
    }
    memo.set(m, trees)
    frames.push({ phase: 'store', size: m, memo: memoSizes(), shown: trees[trees.length - 1], pair: null, pythonLine: 32, activeLine: L('set memo[m] to trees'), message: `memo[${m}] = ${trees.length} tree(s). It will be reused instead of rebuilt.` })
    return trees
  }
  const trees = n % 2 === 0 ? [] : rec(n, 0)
  const result = trees.map(levelOrder)
  frames.push({ phase: 'done', size: n, memo: memoSizes(), shown: trees.length ? trees[0] : null, pair: null, pythonLine: n % 2 === 0 ? 3 : 35, activeLine: L('return build(n)'), message: n % 2 === 0 ? 'Even n has no full binary tree: return [].' : `Return all ${trees.length} full binary tree(s) with ${n} nodes.` })
  return { input: n, trees, result, frames }
}

export const code = `memo is a table from size to list of trees, starting with memo[1] = [a single leaf]
define build(m), which returns every full tree with m nodes
  if m is in memo, return memo[m]
  set trees to an empty list
  for each odd left size from 1 up to m - 2, do
    for each left tree in build(left size), do
      for each right tree in build(m - 1 - left size), do
        add a new root with left and right as its children to trees
  set memo[m] to trees
  return trees
return build(n), with each tree written in level order`.split('\n').map((text, index) => ({ line: index + 1, text }))

const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def all_possible_fbt(n):
    if n % 2 == 0:
        return []
    memo = {1: [0]}

    def level_order(tree):
        out = []
        queue = [tree]
        for t in queue:
            if t is None:
                out.append(None)
                continue
            out.append(0)
            if isinstance(t, list):
                queue.append(t[0])
                queue.append(t[1])
            else:
                queue.append(None)
                queue.append(None)
        while out and out[-1] is None:
            out.pop()
        return out

    def build(m):
        if m in memo:
            return memo[m]
        trees = []
        for left_size in range(1, m, 2):
            for left in build(left_size):
                for right in build(m - 1 - left_size):
                    trees.append([left, right])
        memo[m] = trees
        return trees

    return [level_order(t) for t in build(n)]
`
