export function parseInput(text) {
  const obj = JSON.parse(text)
  if (!obj || typeof obj !== 'object' || !Array.isArray(obj.nums)) throw new Error('Use an object with a nums array.')
  if (obj.nums.length < 1 || obj.nums.length > 12) throw new Error('Use 1 to 12 values for the visualization.')
  if (obj.nums.some(v => !Number.isInteger(v) || v < 1 || v > 200000)) throw new Error('Values are integers from 1 to 200000.')
  return { nums: obj.nums }
}

export function buildTrace(input) {
  const { nums } = input
  const stack = []
  const frames = [{ phase: 'start', activeLine: L('set stack to empty'), index: -1, stack: [], message: 'Each stack entry is the maximum of one segment that will stay as a single element.' }]
  nums.forEach((x, i) => {
    frames.push({ phase: 'read', activeLine: L('for each value'), index: i, stack: [...stack], message: `Read ${x}.` })
    let cur = x
    if (stack.length && stack[stack.length - 1] > x) {
      cur = stack.pop()
      frames.push({ phase: 'merge', activeLine: L('if the stack top'), index: i, stack: [...stack], message: `The top is larger than ${x}, so ${x} joins that segment. Its maximum is ${cur}.` })
    } else {
      frames.push({ phase: 'push', activeLine: L('set cur to x'), index: i, stack: [...stack], message: `The top is not larger, so ${x} starts its own segment.` })
    }
    stack.push(cur)
    frames.push({ phase: 'push', activeLine: L('push cur'), index: i, stack: [...stack], message: `Push ${cur}. The stack now holds ${stack.length} segments.` })
  })
  frames.push({ phase: 'done', activeLine: L('return the number'), index: -1, stack: [...stack], message: `Largest final size: ${stack.length}.` })
  return { input, result: stack.length, frames }
}

export const code = `maximum size after merging segments:
  set stack to empty
  for each value x in nums, from left to right:
    set cur to x
    if the stack top is larger than x then
      pop the top and set cur to it
    push cur onto the stack
  return the number of entries in the stack`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def max_non_decreasing_size(nums):
    stack = []
    for x in nums:
        cur = x
        if stack and stack[-1] > x:
            cur = stack.pop()
        stack.append(cur)
    return len(stack)
`
