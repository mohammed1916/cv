// LeetCode 2208: Minimum Operations to Halve Array Sum.
// One operation halves any value. Halving the current largest value always removes the most sum, so keep the values
// in a max-heap, halve the top, push the half back, and count operations until the removed amount reaches half the sum.

const MAX_LEN = 8
const MAX_VALUE = 20

export function parseInput(text) {
  let nums
  try { nums = JSON.parse(text) } catch { throw new Error('Use a JSON array of positive integers, e.g. [5,19,8,1].') }
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > MAX_LEN) throw new Error(`Use 1 to ${MAX_LEN} values. The visualization caps the length there.`)
  if (!nums.every(v => Number.isInteger(v) && v >= 1 && v <= MAX_VALUE)) throw new Error(`Each value is an integer from 1 to ${MAX_VALUE}.`)
  return { nums }
}

export const code = `FUNCTION halveArraySum(nums)
    heap ← max-heap of nums
    total ← sum of nums
    removed ← 0
    ops ← 0
    WHILE removed < total / 2
        x ← pop the largest value from heap
        half ← x / 2
        removed ← removed + half
        push half onto heap
        ops ← ops + 1
    RETURN ops`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `import heapq

def halve_array_sum(nums):
    heap = [-x for x in nums]
    heapq.heapify(heap)
    total = sum(nums)
    removed = 0
    ops = 0
    while removed < total / 2:
        x = -heapq.heappop(heap)
        half = x / 2
        removed += half
        heapq.heappush(heap, -half)
        ops += 1
    return ops
`

const L = text => {
  const index = code.findIndex(line => line.text.includes(text))
  if (index < 0) throw new Error(`Missing pseudocode line: ${text}`)
  return index + 1
}
const P = text => {
  const index = python.split('\n').findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`Missing python line: ${text}`)
  return index + 1
}

export const phases = [
  { id: 'start', label: 'Heap', description: 'Build a max-heap of the values and note the target.' },
  { id: 'halve', label: 'Halve the top', description: 'Halve the largest value and count the removed amount.' },
  { id: 'done', label: 'Result', description: 'The number of halvings needed.' },
]

export function buildTrace({ nums }) {
  const total = nums.reduce((a, b) => a + b, 0)
  const need = total / 2
  const heap = nums.slice()
  let removed = 0
  let ops = 0
  const frames = []
  const top = () => Math.max(...heap)
  const push = (phase, activeLine, pythonLine, message, extra = {}) => frames.push({ phase, index: ops, activeLine, pythonLine, message, nums, total, need, removed, ops, heap: heap.slice().sort((a, b) => b - a), ...extra })
  push('start', L('heap ← max-heap'), P('heap = [-x'), `The sum is ${total}. We must remove at least ${need}.`)
  while (removed < need) {
    const x = top()
    heap.splice(heap.indexOf(x), 1)
    const half = x / 2
    removed += half
    heap.push(half)
    ops += 1
    push('halve', L('x ← pop the largest'), P('x = -heapq.heappop'),
      `Halve ${x} to ${half}. Removed ${removed} of ${need} needed. Operations ${ops}.`, { x, half })
  }
  push('done', L('RETURN ops'), P('return ops'), `${ops} halving(s) remove at least half of the sum.`, { result: ops })
  return { input: { nums }, result: ops, frames }
}
