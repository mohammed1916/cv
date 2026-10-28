import { parseSortedList, buildSortedTreeStory } from '../../components/shared/sortedTreeTrace.js';
export function buildSortedArrayStory(text) {
  const values = parseSortedList(text);
  if(values.some((v,i)=>i>0&&v===values[i-1]))throw new Error('Use strictly increasing array values.');
  return {values,...buildSortedTreeStory(values,'array')};
}

// ---- Convert Sorted Array to Binary Search Tree (statement-sourced; see scratch statements/108.md) ----
export function parseInput(text) {
  const nums = JSON.parse(text)
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 15) throw new Error('Use a sorted array of 1 to 15 integers.')
  if (nums.some(v => !Number.isInteger(v) || Math.abs(v) > 10000)) throw new Error('Values are integers from -10000 to 10000.')
  if (nums.some((v, i) => i > 0 && v <= nums[i - 1])) throw new Error('The values must be strictly increasing.')
  return nums
}

// Canonical choice: the root of each range is its floor midpoint.
export function buildTrace(nums) {
  let nextId = 0
  const frames = []
  const build = (lo, hi) => {
    if (lo > hi) return null
    const mid = Math.floor((lo + hi) / 2)
    const node = { id: nextId++, value: nums[mid], left: null, right: null }
    frames.push({ phase: 'pick', activeLine: L('mid = floor'), node: node.id, lo, hi, message: `Range ${lo} to ${hi} picks index ${mid}, value ${nums[mid]}, as its root.` })
    node.left = build(lo, mid - 1)
    node.right = build(mid + 1, hi)
    return node
  }
  const root = build(0, nums.length - 1)
  const result = toLevelOrder(root)
  frames.push({ phase: 'done', activeLine: L('return root'), node: null, lo: null, hi: null, message: `Balanced tree built. Level order: [${result.map(v => (v === null ? 'null' : v)).join(', ')}].` })
  return { input: nums, result, frames }
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

export const code = `sorted array to bst (nums):
  return build(0, the last index of nums)

build(lo, hi):
  if lo is greater than hi then return empty
  set mid = floor((lo + hi) / 2)
  create a node with value nums[mid]
  node.left = build(lo, mid - 1)
  node.right = build(mid + 1, hi)
  return root node`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def sorted_array_to_bst(nums):
    def build(lo, hi):
        if lo > hi:
            return None
        mid = (lo + hi) // 2
        return (nums[mid], build(lo, mid - 1), build(mid + 1, hi))
    root = build(0, len(nums) - 1)
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
