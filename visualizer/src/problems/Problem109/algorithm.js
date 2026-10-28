export { parseSortedList, buildSortedTreeStory as buildSortedListStory } from '../../components/shared/sortedTreeTrace.js';

// ---- Convert Sorted List to Binary Search Tree (statement-sourced; see scratch statements/109.md) ----
export function parseInput(text) {
  const values = JSON.parse(text)
  if (!Array.isArray(values) || values.length < 1 || values.length > 15) throw new Error('Use a sorted list of 1 to 15 integers (the list stands in for the linked list).')
  if (values.some(v => !Number.isInteger(v) || Math.abs(v) > 10000)) throw new Error('Values are integers from -10000 to 10000.')
  if (values.some((v, i) => i > 0 && v <= values[i - 1])) throw new Error('The values must be strictly increasing.')
  return values
}

// Canonical choice: the root of each range is its floor midpoint.
export function buildTrace(values) {
  let nextId = 0
  const frames = []
  const build = (lo, hi) => {
    if (lo > hi) return null
    const mid = Math.floor((lo + hi) / 2)
    const node = { id: nextId++, value: values[mid], left: null, right: null }
    frames.push({ phase: 'pick', activeLine: L('mid = floor'), node: node.id, lo, hi, message: `Range ${lo} to ${hi} picks index ${mid}, value ${values[mid]}, as its root.` })
    node.left = build(lo, mid - 1)
    node.right = build(mid + 1, hi)
    return node
  }
  const root = build(0, values.length - 1)
  const result = toLevelOrder(root)
  frames.push({ phase: 'done', activeLine: L('return root'), node: null, lo: null, hi: null, message: `Balanced tree built. Level order: [${result.map(v => (v === null ? 'null' : v)).join(', ')}].` })
  return { input: values, result, frames }
}

function toLevelOrder(root) {
  const out = []
  const queue = [root]
  for (let i = 0; i < queue.length; i++) {
    const node = queue[i]
    if (!node) { out.push(null); continue }
    out.push(node.value)
    queue.push(node.left, node.right)
  }
  while (out.length && out[out.length - 1] === null) out.pop()
  return out
}

export const code = `sorted list to bst (values):
  return build(0, the last index of values)

build(lo, hi):
  if lo is greater than hi then return empty
  set mid = floor((lo + hi) / 2)
  create a node with value values[mid]
  node.left = build(lo, mid - 1)
  node.right = build(mid + 1, hi)
  return root node`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def sorted_list_to_bst(values):
    def build(lo, hi):
        if lo > hi:
            return None
        mid = (lo + hi) // 2
        return (values[mid], build(lo, mid - 1), build(mid + 1, hi))
    root = build(0, len(values) - 1)
    out = []
    queue = [root]
    for node in queue:
        if node is None:
            out.append(None)
            continue
        out.append(node[0])
        queue.append(node[1])
        queue.append(node[2])
    while out and out[-1] is None:
        out.pop()
    return out
`
