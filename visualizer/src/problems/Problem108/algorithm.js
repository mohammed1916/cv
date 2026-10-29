import { parseSortedList, buildSortedTreeStory } from '../../components/shared/sortedTreeTrace.js';
export function buildSortedArrayStory(text) {
  const values = parseSortedList(text);
  if(values.some((v,i)=>i>0&&v===values[i-1]))throw new Error('Use strictly increasing array values.');
  return {values,...buildSortedTreeStory(values,'array')};
}

// ---- Convert Sorted Array to Binary Search Tree (statement-sourced; see scratch statements/108.md) ----
export function parseInput(text) {
  let nums = text
  if (typeof nums === 'string') {
    try { nums = JSON.parse(nums) } catch { throw new Error('Use a JSON array of sorted integers, such as [-10,-3,0,5,9].') }
  }
  if (nums && typeof nums === 'object' && !Array.isArray(nums) && 'nums' in nums) nums = nums.nums
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 15) throw new Error('Use a sorted array of 1 to 15 integers.')
  if (nums.some(v => !Number.isInteger(v) || Math.abs(v) > 10000)) throw new Error('Values are integers from -10000 to 10000.')
  if (nums.some((v, i) => i > 0 && v <= nums[i - 1])) throw new Error('The values must be strictly increasing.')
  return nums
}

// Half-open intervals [lo, hi) with the canonical lower midpoint (the same root choice as the code and Python).
// Frames and nodes use the shape SortedTreeStory reads.
function buildIntervalStory(values) {
  const nodes = []
  const frames = []
  const emit = (phase, activeLine, message, extra = {}) => {
    frames.push({ phase, activeLine, message, copied: values.length, lo: 0, hi: values.length, ...extra })
    return frames.length - 1
  }
  emit('init', 9, 'Use the sorted array directly. Choose a midpoint for each interval.')
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
  emit('done', 9, values.length ? 'Complete: inorder traversal reproduces the input, and every subtree has balanced heights.' : 'Empty array produces an empty tree.')
  return { root, nodes, frames }
}

// Each frame keeps its index (for the tree scene) and gets the pseudocode line it performs.
const PSEUDO_LINE_FOR_LEGACY = { 9: 2, 3: 5, 4: 6, 5: 7, 6: 8, 7: 9, 8: 10 }

export function buildTrace(input) {
  const nums = parseInput(input)
  const story = buildIntervalStory(nums)
  const frames = story.frames.map((frame, index) => ({
    ...frame,
    index,
    legacyLine: frame.activeLine,
    activeLine: frame.phase === 'done' ? 10 : PSEUDO_LINE_FOR_LEGACY[frame.activeLine],
    explanation: frame.message,
  }))
  return { input: nums, story: { ...story, values: nums }, result: levelOrderValues(story.root), frames }
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

export const code = `sorted array to bst (nums):
  return build(0, the length of nums)

build(lo, hi):
  if lo is at least hi then return empty
  set mid = lo + floor((hi - lo - 1) / 2)
  create a node with value nums[mid]
  node.left = build(lo, mid)
  node.right = build(mid + 1, hi)
  return root node`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def sorted_array_to_bst(nums):
    def build(lo, hi):
        if lo >= hi:
            return None
        mid = lo + (hi - lo - 1) // 2
        return (nums[mid], build(lo, mid), build(mid + 1, hi))
    root = build(0, len(nums))
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
  5: 3,
  6: 5,
  7: 6,
  8: 6,
  9: 6,
  10: 6,
}
