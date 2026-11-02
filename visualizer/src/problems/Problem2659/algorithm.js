export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with nums.')
  const { nums } = input
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 12) throw new Error('nums is a list of 1 to 12 integers.')
  if (!nums.every(Number.isInteger)) throw new Error('Every value in nums is an integer.')
  if (new Set(nums).size !== nums.length) throw new Error('The values in nums are distinct.')
  return { nums }
}

export function buildTrace({ nums }) {
  const queue = [...nums]
  const order = [...nums].sort((a, b) => a - b)
  const frames = []
  let operations = 0
  let removed = 0
  frames.push({ pythonLine: 5, phase: 'start', activeLine: L('sort the values'), queue: [...queue], operations, message: `Smallest values in order: ${order.join(', ')}.` })
  while (queue.length) {
    operations++
    if (queue[0] === order[removed]) {
      const value = queue.shift()
      removed++
      frames.push({ pythonLine: 11, phase: 'remove', activeLine: L('front is the smallest'), queue: [...queue], operations, message: `${value} is the smallest left; remove it.` })
    } else {
      queue.push(queue.shift())
      frames.push({ pythonLine: 14, phase: 'rotate', activeLine: L('move the front to the back'), queue: [...queue], operations, message: `${queue[queue.length - 1]} is not the smallest; move it to the back.` })
    }
  }
  frames.push({ pythonLine: 15, phase: 'done', activeLine: L('return the count'), queue: [], operations, message: `The array is empty after ${operations} operations.` })
  return { input: { nums }, result: operations, frames }
}

export const code = `count operations to empty the array
  sort the values to know the next smallest
  set operations to 0 and removed to 0
  while the array is not empty
    add 1 to operations
    if the front is the smallest remaining value
      remove the front and add 1 to removed
    else
      move the front to the back
  return the count`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `from collections import deque

def count_operations(nums):
    queue = deque(nums)
    order = sorted(nums)
    operations = 0
    removed = 0
    while queue:
        operations += 1
        if queue[0] == order[removed]:
            queue.popleft()
            removed += 1
        else:
            queue.rotate(-1)
    return operations
`
