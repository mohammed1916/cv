export function parseInput(text) {
  const obj = JSON.parse(text)
  if (!obj || typeof obj !== 'object' || !Array.isArray(obj.nums)) throw new Error('Use a JSON object with a "nums" array.')
  const { nums } = obj
  if (nums.length < 1 || nums.length > 30) throw new Error('nums must have 1 to 30 entries for this visualization.')
  if (nums.some(v => !Number.isInteger(v) || v < 1 || v > 100000)) throw new Error('Each value must be an integer from 1 to 100000.')
  return { nums }
}

export function buildTrace({ nums }) {
  const stack = []
  const frames = [{ phase: 'start', activeLine: L('set stack to'), index: -1, stack: [], message: 'Start with an empty stack and read the values left to right.' }]
  nums.forEach((value, index) => {
    let current = value
    frames.push({ phase: 'read', activeLine: L('set current to value'), index, stack: [...stack], current, message: `Read ${value}.` })
    while (stack.length > 0 && stack[stack.length - 1] === current) {
      const top = stack.pop()
      current = top + current
      frames.push({ phase: 'merge', activeLine: L('remove the top value'), index, stack: [...stack], current, message: `The top equals ${current / 2}, so they merge into ${current}.` })
    }
    stack.push(current)
    frames.push({ phase: 'push', activeLine: L('push current'), index, stack: [...stack], current, message: `Push ${current}.` })
  })
  frames.push({ phase: 'done', activeLine: L('return the stack'), index: -1, stack: [...stack], current: null, message: `No adjacent equal elements remain: [${stack.join(', ')}].` })
  return { input: { nums }, result: [...stack], frames }
}

export const code = `merge adjacent equal elements (nums):
  set stack to an empty list
  for each value in nums
    set current to value
    while the stack is not empty and its top equals current do
      remove the top value t from the stack
      set current to t plus current
    push current onto the stack
  return the stack

a merge can cascade: the new sum may equal the value now on top`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def merge_adjacent_equal(nums):
    stack = []
    for value in nums:
        current = value
        while stack and stack[-1] == current:
            current = stack.pop() + current
        stack.append(current)
    return stack
`
