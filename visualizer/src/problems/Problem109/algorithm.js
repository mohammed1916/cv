export { parseSortedList, buildSortedTreeStory as buildSortedListStory } from '../../components/shared/sortedTreeTrace.js';

// ---- Convert Sorted List to Binary Search Tree (statement-sourced; see scratch statements/109.md) ----
export function parseInput(text) {
  let values = text
  if (typeof values === 'string') {
    try { values = JSON.parse(values) } catch { throw new Error('Use a JSON array of sorted integers, such as [-10,-3,0,5,9].') }
  }
  if (values && typeof values === 'object' && !Array.isArray(values) && 'list' in values) values = values.list
  if (!Array.isArray(values) || values.length < 1 || values.length > 15) throw new Error('Use a sorted list of 1 to 15 integers (the list stands in for the linked list).')
  if (values.some(v => !Number.isInteger(v) || Math.abs(v) > 10000)) throw new Error('Values are integers from -10000 to 10000.')
  if (values.some((v, i) => i > 0 && v <= values[i - 1])) throw new Error('The values must be strictly increasing.')
  return values
}

// Canonical choice: the root of each range is its floor midpoint.
// Copies the list into an array, then builds half-open intervals [lo, hi) with the canonical lower midpoint.
// Frames and nodes use the shape SortedTreeStory reads.
function buildListStory(values) {
  const nodes = []
  const frames = []
  const emit = (phase, activeLine, message, extra = {}) => {
    frames.push({ phase, activeLine, message, copied: values.length, lo: 0, hi: values.length, ...extra })
    return frames.length - 1
  }
  emit('init', 9, 'Read the linked list in order before choosing subtree roots.', { copied: 0 })
  values.forEach((value, index) => emit('visit', 12, `Copy list node #${index}: ${value}.`, { copied: index + 1, cursor: index }))
  function build(lo, hi, parent = null, side = null, depth = 0) {
    if (lo === hi) { emit('return', 3, 'Empty interval: attach no child.', { lo, hi, parent, side }); return null }
    const mid = lo + Math.floor((hi - lo - 1) / 2)
    emit('compare', 4, `Choose index ${mid}. Left has ${mid - lo} values; right has ${hi - mid - 1}.`, { lo, hi, mid, parent, side })
    const node = { id: mid, val: values[mid], depth, parent, left: null, right: null }
    node.createdAt = emit('update', 5, `Create node #${mid}${parent === null ? ' as the root' : ` as the ${side} child of #${parent}`}.`, { lo, hi, mid, parent, side })
    nodes.push(node)
    emit('visit', 6, 'Build the left interval; these values precede the root in sorted order.', { lo, hi: mid, mid, parent: mid, side: 'left' })
    node.left = build(lo, mid, mid, 'left', depth + 1)
    emit('visit', 7, 'Build the right interval; these values follow the root in sorted order.', { lo: mid + 1, hi, mid, parent: mid, side: 'right' })
    node.right = build(mid + 1, hi, mid, 'right', depth + 1)
    node.height = 1 + Math.max(node.left?.height ?? 0, node.right?.height ?? 0)
    node.returnedAt = emit('return', 8, `Subtree #${mid} is complete: child heights ${node.left?.height ?? 0} and ${node.right?.height ?? 0}. Return it to the parent.`, { lo, hi, mid })
    return node
  }
  const root = build(0, values.length)
  emit('done', 14, values.length ? 'Complete: inorder traversal reproduces the input, and every subtree has balanced heights.' : 'Empty list produces an empty tree.')
  return { root, nodes, frames, values }
}

// Each frame keeps its index (for the tree scene) and gets the pseudocode line it performs.
const PSEUDO_LINE_FOR_LEGACY = { 9: 2, 12: 2, 3: 6, 4: 7, 5: 8, 6: 9, 7: 10, 8: 11, 14: 11 }

export function buildTrace(input) {
  const values = parseInput(input)
  const story = buildListStory(values)
  const frames = story.frames.map((frame, index) => ({
    ...frame,
    index,
    legacyLine: frame.activeLine,
    activeLine: PSEUDO_LINE_FOR_LEGACY[frame.activeLine],
    explanation: frame.message,
  }))
  return { input: values, story, result: levelOrderValues(story.root), frames }
}

// The shared tree nodes store their value in `val`.
function levelOrderValues(root) {
  const out = []
  const queue = [root]
  for (let i = 0; i < queue.length; i++) {
    const node = queue[i]
    if (!node) { out.push(null); continue }
    out.push(node.val)
    queue.push(node.left, node.right)
  }
  while (out.length && out[out.length - 1] === null) out.pop()
  return out
}

export const code = `sorted list to bst (head):
  copy the list into values in order
  return build(0, the length of values)

build(lo, hi):
  if lo is at least hi then return empty
  set mid = lo + floor((hi - lo - 1) / 2)
  create a node with value values[mid]
  node.left = build(lo, mid)
  node.right = build(mid + 1, hi)
  return root node`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def sorted_list_to_bst(values):
    def build(lo, hi):
        if lo >= hi:
            return None
        mid = lo + (hi - lo - 1) // 2
        return (values[mid], build(lo, mid), build(mid + 1, hi))
    root = build(0, len(values))
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

// Maps each pseudocode activeLine to the Python line that performs the same action.
export const pythonLineMap = {
  2: 7,
  3: 7,
  6: 3,
  7: 5,
  8: 6,
  9: 6,
  10: 6,
  11: 6,
}
