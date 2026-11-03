const CODE = [
  'fewest moves so that every prefix sum is nonnegative',
  'heap is empty, running sum is 0 and moves is 0',
  'for each value x in nums, in order',
  '  push x onto the heap and add x to the running sum',
  '  while the running sum is negative',
  '    pop the smallest value m from the heap',
  '    subtract m from the running sum and count one move',
  '    move m to the end of the array',
  'return moves',
]
export const code = CODE.map((text, index) => ({ line: index + 1, text }))

const PY = [
  'import heapq',
  '',
  'def min_operations(nums):',
  '    heap = []',
  '    total = 0',
  '    moves = 0',
  '    for x in nums:',
  '        heapq.heappush(heap, x)',
  '        total += x',
  '        while total < 0:',
  '            m = heapq.heappop(heap)',
  '            total -= m',
  '            moves += 1',
  '    return moves',
]
export const python = `${PY.join('\n')}\n`

const L = key => {
  const found = code.findIndex(c => c.text.includes(key))
  if (found < 0) throw new Error(`Missing pseudocode line: ${key}`)
  return found + 1
}
const P = key => {
  const found = PY.findIndex(line => line.includes(key))
  if (found < 0) throw new Error(`Missing python line: ${key}`)
  return found + 1
}

// Minimal binary min-heap so the trace can show the stored values.
class MinHeap {
  constructor() { this.items = [] }
  push(value) {
    const a = this.items
    a.push(value)
    let i = a.length - 1
    while (i > 0) {
      const parent = (i - 1) >> 1
      if (a[parent] <= a[i]) break
      ;[a[parent], a[i]] = [a[i], a[parent]]
      i = parent
    }
  }
  pop() {
    const a = this.items
    const top = a[0]
    const last = a.pop()
    if (a.length > 0) {
      a[0] = last
      let i = 0
      for (;;) {
        const left = 2 * i + 1
        const right = left + 1
        let smallest = i
        if (left < a.length && a[left] < a[smallest]) smallest = left
        if (right < a.length && a[right] < a[smallest]) smallest = right
        if (smallest === i) break
        ;[a[smallest], a[i]] = [a[i], a[smallest]]
        i = smallest
      }
    }
    return top
  }
  sorted() { return [...this.items].sort((p, q) => p - q) }
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with a nums list.')
  const { nums } = input
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 10) throw new Error('nums has 1 to 10 integers for the visualization.')
  if (nums.some(x => !Number.isInteger(x) || x < -9 || x > 9)) throw new Error('Each value is a whole number from -9 to 9.')
  if (nums.reduce((a, b) => a + b, 0) < 0) throw new Error('The total of nums must be nonnegative.')
  return { nums }
}

export function buildTrace({ nums }) {
  const frames = []
  const heap = new MinHeap()
  let total = 0
  let moves = 0
  const moved = []
  const F = (phase, codeKey, pyKey, message, state) => frames.push({
    phase, activeLine: L(codeKey), pythonLine: P(pyKey), message,
    heap: heap.sorted(), total, moves, moved: moved.slice(), ...state,
  })
  F('setup', 'heap is empty', 'heap = []', 'No values are chosen yet; the running sum is 0.', { i: -1, x: null, popped: null })
  for (let i = 0; i < nums.length; i++) {
    const x = nums[i]
    heap.push(x)
    total += x
    F('push', 'push x onto the heap', 'heapq.heappush(heap, x)', `Push ${x}. The running sum is ${total}.`, { i, x, popped: null })
    while (total < 0) {
      const m = heap.pop()
      total -= m
      moves += 1
      moved.push(m)
      F('move', 'pop the smallest value m', 'm = heapq.heappop(heap)', `The sum is negative, so move the smallest value ${m} to the end. Sum is now ${total}.`, { i, x, popped: m })
    }
  }
  F('done', 'return moves', 'return moves', `Fewest moves: ${moves}.`, { i: -1, x: null, popped: null })
  return { input: { nums }, result: moves, frames }
}
