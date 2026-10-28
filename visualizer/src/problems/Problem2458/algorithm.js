import { treeFromLevelOrder } from '../../components/shared/treeLayout.js'

export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || !Array.isArray(data.root) || data.root.length < 1 || data.root.length > 64 || data.root[0] === null) throw new Error('Use root as a level-order array of up to 64 entries with a non-null root.')
  const values = data.root.filter(v => v !== null)
  const n = values.length
  if (n > 15) throw new Error('Use at most 15 nodes.')
  if (values.some(v => !Number.isInteger(v) || v < 1 || v > n) || new Set(values).size !== n) throw new Error('Node values must be distinct integers from 1 to the number of nodes.')
  if (!Array.isArray(data.queries) || data.queries.length < 1 || data.queries.length > 15 || data.queries.some(q => !Number.isInteger(q) || q < 1 || q > n)) throw new Error('Use 1 to 15 queries, each the value of a node in the tree.')
  return { root: data.root, queries: data.queries }
}

export function buildTrace({ root: arr, queries }) {
  const root = treeFromLevelOrder(arr)
  const byValue = new Map(), depth = new Map(), height = new Map(), answer = new Map()
  const bottomUp = []
  const measure = (node, d) => {
    if (!node) return 0
    depth.set(node.id, d)
    byValue.set(node.value, node)
    const h = 1 + Math.max(measure(node.left, d + 1), measure(node.right, d + 1))
    height.set(node.id, h)
    bottomUp.push(node)
    return h
  }
  measure(root, 0)
  const frames = [{ phase: 'start', activeLine: L('compute the height of every subtree'), node: null, tags: {}, removed: [], message: 'Measure every subtree in nodes, from the bottom up.' }]
  const shown = new Map()
  for (const node of bottomUp) {
    shown.set(node.id, height.get(node.id))
    frames.push({ phase: 'height', activeLine: L('compute the height of every subtree'), node: node.id, tags: Object.fromEntries(shown), removed: [], message: `The subtree at ${node.value} is ${height.get(node.id)} node(s) tall.` })
  }
  answer.set(root.id, 0)
  frames.push({ phase: 'answer', activeLine: L('set the answer for the root'), node: root.id, tags: Object.fromEntries(answer), removed: [], message: 'Removing the whole tree leaves nothing, so the answer for the root is 0.' })
  const topDown = []
  const collect = node => { if (node) { topDown.push(node); collect(node.left); collect(node.right) } }
  collect(root)
  for (const parent of topDown) {
    const kids = [parent.left, parent.right].filter(Boolean)
    for (const child of kids) {
      const others = kids.filter(s => s !== child).map(s => height.get(s.id))
      const other = others.length ? Math.max(...others) : 0
      answer.set(child.id, Math.max(answer.get(parent.id), depth.get(parent.id) + 1 + other))
      frames.push({ phase: 'answer', activeLine: L('the answer for c is the larger'), node: child.id, tags: Object.fromEntries(answer), removed: [], message: `Removing ${child.value} leaves height ${answer.get(child.id)}.` })
    }
  }
  const subtreeIds = node => (node ? [node.id, ...subtreeIds(node.left), ...subtreeIds(node.right)] : [])
  const result = []
  for (const q of queries) {
    const node = byValue.get(q)
    result.push(answer.get(node.id))
    frames.push({ phase: 'query', activeLine: L('for each query return'), node: node.id, tags: Object.fromEntries(answer), removed: subtreeIds(node), result: [...result], message: `Remove the subtree at ${q}: the height left is ${answer.get(node.id)}.` })
  }
  frames.push({ phase: 'done', activeLine: L('for each query return'), node: null, tags: Object.fromEntries(answer), removed: [], result: [...result], message: `Answers: [${result.join(', ')}].` })
  return { input: { root: arr, queries }, root, result, frames }
}

export const code = `height of the tree after removing each queried subtree
  compute the height of every subtree, counted in nodes, from the bottom up
  set the answer for the root to zero
  for each node from the top down, for each child c of node p
    the answer for c is the larger of the answer for p and the depth of p plus one plus the tallest other child
  for each query return the answer of the node holding that value`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def height_after_subtree_removals(root, queries):
    def build(arr):
        if not arr or arr[0] is None:
            return None
        top = [arr[0], None, None]
        queue = [top]
        cursor = 1
        for node in queue:
            if cursor < len(arr) and arr[cursor] is not None:
                node[1] = [arr[cursor], None, None]
                queue.append(node[1])
            cursor += 1
            if cursor < len(arr) and arr[cursor] is not None:
                node[2] = [arr[cursor], None, None]
                queue.append(node[2])
            cursor += 1
        return top

    top = build(root)
    depth, height, answer = {}, {}, {}

    def measure(node, d):
        depth[node[0]] = d
        h = 1
        for child in (node[1], node[2]):
            if child is not None:
                h = max(h, 1 + measure(child, d + 1))
        height[node[0]] = h
        return h

    measure(top, 0)
    answer[top[0]] = 0
    stack = [top]
    while stack:
        parent = stack.pop()
        kids = [c for c in (parent[1], parent[2]) if c is not None]
        for child in kids:
            others = [height[s[0]] for s in kids if s is not child]
            other = max(others) if others else 0
            answer[child[0]] = max(answer[parent[0]], depth[parent[0]] + 1 + other)
            stack.append(child)
    return [answer[q] for q in queries]
`
