export function parseInput(text) {
  const nums = JSON.parse(text)
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 1000 || nums.some(v => !Number.isInteger(v) || v < 0 || v > 1000) || new Set(nums).size !== nums.length) throw new Error('Enter a JSON array of 1–1,000 distinct integers from 0 to 1,000.')
  return nums
}

// The maximum becomes the root; its left and right subarrays build the two subtrees.
export function buildTrace(nums) {
  let id = 0
  const frames = [{ phase: 'start', current: null, range: [0, nums.length - 1], activeLine: 2, message: 'Find the maximum of the whole array; it becomes the root.' }]
  function build(lo, hi) {
    if (lo > hi) return null
    let best = lo
    for (let i = lo + 1; i <= hi; i++) if (nums[i] > nums[best]) best = i
    const node = { id: id++, value: nums[best], left: null, right: null, range: [lo, hi] }
    frames.push({ phase: 'pick', current: node.id, range: [lo, hi], activeLine: 4, message: `Maximum of [${lo}..${hi}] is ${nums[best]} at index ${best}: make it a node.` })
    node.left = build(lo, best - 1)
    node.right = build(best + 1, hi)
    return node
  }
  const root = build(0, nums.length - 1)
  const serial = []
  const queue = root ? [root] : []
  for (let q = 0; q < queue.length; q++) { serial.push(queue[q].value); if (queue[q].left) queue.push(queue[q].left); if (queue[q].right) queue.push(queue[q].right) }
  frames.push({ phase: 'done', current: null, range: null, activeLine: 6, message: `Built a tree with ${nums.length} nodes; root ${root?.value}.`, result: serial })
  return { input: nums, root, result: serial, frames }
}

export const code = `set stack to an empty list of roots
for each value in nums from left to right:
  pop each smaller root from the stack; the last popped root becomes the new node's left child
  if the stack is not empty, make the new node the right child of the stack top
  push the new node onto the stack
return the root at the bottom of the stack`.split('\n').map((text, index) => ({ line: index + 1, text }))

// Tree trace: activeLine 1 (setup), 4 (update once per value), 5 (return).
export const LINE_MAP = { 1: 1, 4: 5, 5: 6 }

export const familyLine = frame => LINE_MAP[frame.activeLine] ?? frame.activeLine

export const python = `def construct_maximum_binary_tree(nums):
    def serialize(top):
        if top is None:
            return []
        queue = [top]
        values = []
        position = 0
        while position < len(queue):
            node = queue[position]
            position += 1
            if node is None:
                values.append(None)
            else:
                values.append(node["val"])
                queue.append(node["left"])
                queue.append(node["right"])
        while values and values[-1] is None:
            values.pop()
        return values

    stack = []
    for value in nums:
        node = {"val": value, "left": None, "right": None}
        while stack and stack[-1]["val"] < value:
            node["left"] = stack.pop()
        if stack:
            stack[-1]["right"] = node
        stack.append(node)
    return serialize(stack[0])`
