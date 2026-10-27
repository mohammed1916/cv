export function minimumOperations(nums, k) {
  // Returns the operation count, or -1 when fewer than two numbers remain below the threshold.
  const values = [...nums].sort((a, b) => a - b)
  let ops = 0
  while (values[0] < k) {
    if (values.length < 2) return -1
    const x = values.shift()
    const y = values.shift()
    values.push(2 * x + y)
    values.sort((a, b) => a - b)
    ops++
  }
  return ops
}

export function parseInput(text) {
  const data = JSON.parse(text)
  const { nums, k } = data ?? {}
  if (!Array.isArray(nums) || nums.length < 2 || nums.length > 8) throw new Error('Use "nums" as an array of 2 to 8 numbers.')
  if (nums.some(x => !Number.isInteger(x) || x < 1 || x > 30)) throw new Error('Each number is an integer from 1 to 30.')
  if (!Number.isInteger(k) || k < 1 || k > 30) throw new Error('"k" is an integer from 1 to 30.')
  if (minimumOperations(nums, k) === -1) throw new Error('No sequence of operations makes every number reach k.')
  return { nums, k }
}

export function buildTrace({ nums, k }) {
  const heap = [...nums]
  let ops = 0
  const frames = [{ phase: 'start', activeLine: L('set operations to 0'), values: [...nums].sort((a, b) => a - b), pair: [], ops, message: `Every number must reach ${k}.` }]
  for (;;) {
    heap.sort((a, b) => a - b)
    if (heap[0] >= k) break
    if (heap.length < 2) break
    const x = heap.shift()
    const y = heap.shift()
    const merged = 2 * x + y
    heap.push(merged)
    ops++
    frames.push({ phase: 'combine', activeLine: L('put twice x plus y back'), values: [...heap].sort((a, b) => a - b), pair: [x, y], ops, message: `Combine ${x} and ${y} into ${merged}. Operations: ${ops}.` })
  }
  heap.sort((a, b) => a - b)
  const result = heap[0] >= k ? ops : -1
  frames.push({ phase: 'done', activeLine: L('return operations'), values: heap, pair: [], ops, message: result === -1 ? 'Not every number reached the threshold.' : `Smallest number is ${heap[0]}, so ${ops} operations are needed.` })
  return { input: { nums, k }, result, frames }
}

export const code = `minimum operations so every number reaches at least k, given nums and k
  set operations to 0
  put every number into a min heap
  while the smallest number is below k
    if fewer than two numbers remain then return -1
    take the two smallest numbers, x first and then y
    put twice x plus y back into the heap
    add 1 to operations
  return operations`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `import heapq

def min_operations(nums, k):
    heap = list(nums)
    heapq.heapify(heap)
    ops = 0
    while heap and heap[0] < k:
        if len(heap) < 2:
            return -1
        x = heapq.heappop(heap)
        y = heapq.heappop(heap)
        heapq.heappush(heap, 2 * x + y)
        ops += 1
    return ops
`
