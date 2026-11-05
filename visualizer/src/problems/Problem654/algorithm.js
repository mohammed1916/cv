export function parseInput(text) {
  const nums = JSON.parse(text)
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 1000 || nums.some(v => !Number.isInteger(v) || Math.abs(v) > 1000)) throw new Error('Enter a JSON array of 1–1,000 integers from −1,000 to 1,000.')
  if (new Set(nums).size !== nums.length) throw new Error('Values must be distinct.')
  return nums
}

// Build over the range [lo, hi]: the largest value becomes the root, then recurse on the left and right parts.
export function buildTrace(nums) {
  let nextId = 0
  const frames = []
  const build = (lo, hi) => {
    if (lo > hi) return null
    let best = lo
    for (let i = lo + 1; i <= hi; i++) if (nums[i] > nums[best]) best = i
    const node = { id: nextId++, value: nums[best], left: null, right: null }
    frames.push({ phase: 'range', lo, hi, best, value: nums[best], activeLine: L('let best = lo'), pythonLine: P('best = lo'), message: `Range ${lo}…${hi}: the largest value is ${nums[best]} at index ${best}; it becomes this node.` })
    node.left = build(lo, best - 1)
    node.right = build(best + 1, hi)
    return node
  }
  const root = build(0, nums.length - 1)
  const result = levelValues(root)
  frames.push({ phase: 'done', lo: 0, hi: nums.length - 1, best: null, value: null, result, activeLine: L('return build(0'), pythonLine: P('return build(0'), message: 'The maximum binary tree is built.' })
  return { input: nums, root, result, frames }
}

function levelValues(root) {
  const out = []
  const queue = root ? [root] : []
  for (let q = 0; q < queue.length; q++) {
    const node = queue[q]
    out.push(node.value)
    if (node.left) queue.push(node.left)
    if (node.right) queue.push(node.right)
  }
  return out
}

const SOURCE = `function constructMaximumBinaryTree(nums) {
  const build = (lo, hi) => {
    if (lo > hi) return null
    let best = lo
    for (let i = lo + 1; i <= hi; i++) {
      if (nums[i] > nums[best]) best = i
    }
    const node = { val: nums[best], left: null, right: null }
    node.left = build(lo, best - 1)
    node.right = build(best + 1, hi)
    return node
  }
  return build(0, nums.length - 1)
}`
export const code = SOURCE.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def construct_maximum_binary_tree(nums):
    def build(lo, hi):
        if lo > hi:
            return None
        best = lo
        for i in range(lo + 1, hi + 1):
            if nums[i] > nums[best]:
                best = i
        node = {"val": nums[best], "left": None, "right": None}
        node["left"] = build(lo, best - 1)
        node["right"] = build(best + 1, hi)
        return node

    return build(0, len(nums) - 1)`
const P = s => python.split('\n').findIndex(t => t.includes(s)) + 1
