export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Use an object with one key, nums.')
  const { nums } = data
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 12) throw new Error('nums must be an array of 1 to 12 integers.')
  if (nums.some(v => !Number.isInteger(v) || v < 0 || v > 5)) throw new Error('Each value is an integer from 0 to 5.')
  return { nums }
}

export function buildTrace({ nums }) {
  const stack = []
  let operations = 0
  const frames = []
  const frame = (phase, line, index, message) => frames.push({ phase, activeLine: line, index, stack: [...stack], operations, message })
  frame('start', L('set operations to 0'), -1, 'Start with no operations and an empty stack.')
  for (let i = 0; i < nums.length; i++) {
    const x = nums[i]
    while (stack.length && stack[stack.length - 1] > x) {
      const top = stack.pop()
      frame('pop', L('remove the top'), i, `${top} is larger than ${x}, so it leaves the stack.`)
    }
    if (x === 0) {
      frame('zero', L('skip x'), i, `${x} is already zero and needs no operation.`)
      continue
    }
    if (!stack.length || stack[stack.length - 1] < x) {
      stack.push(x)
      operations++
      frame('push', L('add 1 to operations'), i, `${x} needs its own operation. Operations so far: ${operations}.`)
    } else {
      frame('same', L('if the stack is empty'), i, `${x} is already on top of the stack, so it shares an operation.`)
    }
  }
  frame('done', L('return operations'), -1, `Minimum operations: ${operations}.`)
  return { input: { nums }, result: operations, frames }
}

export const code = `minimum operations to make every element zero
  set operations to 0 and set an empty stack
  for each value x of nums from left to right do
    while the stack is not empty and its top is larger than x do
      remove the top from the stack
    if x is 0 then
      skip x and go to the next value
    if the stack is empty or its top is less than x then
      push x onto the stack and add 1 to operations
  return operations`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => { const i = code.findIndex(c => c.text.includes(s)); if (i < 0) throw new Error('missing code line: ' + s); return i + 1 }

export const python = `def min_operations(nums):
    stack = []
    operations = 0
    for x in nums:
        while stack and stack[-1] > x:
            stack.pop()
        if x == 0:
            continue
        if not stack or stack[-1] < x:
            stack.append(x)
            operations += 1
    return operations
`
