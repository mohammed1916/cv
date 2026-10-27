export function parseInput(text) {
  const data = JSON.parse(text)
  const { nums, k } = data ?? {}
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 8) throw new Error('Use "nums" as an array of 1 to 8 integers.')
  if (nums.some(x => !Number.isInteger(x) || x < -20 || x > 20)) throw new Error('Each number is an integer from -20 to 20.')
  if (!Number.isInteger(k) || k < 1 || k > 2 ** nums.length) throw new Error('"k" is an integer from 1 to 2 to the power of the length.')
  return { nums, k }
}

export function buildTrace({ nums, k }) {
  const total = nums.filter(x => x > 0).reduce((a, b) => a + b, 0)
  const b = nums.map(x => Math.abs(x)).sort((x, y) => x - y)
  const n = b.length
  const heap = [{ sum: 0, last: -1 }]
  const takeSmallest = () => {
    let at = 0
    for (let j = 1; j < heap.length; j++) {
      if (heap[j].sum < heap[at].sum || (heap[j].sum === heap[at].sum && heap[j].last < heap[at].last)) at = j
    }
    return heap.splice(at, 1)[0]
  }
  const frames = [{ phase: 'start', activeLine: L('put the empty choice'), sum: 0, rank: 1, total, message: `Sum of positive numbers is ${total}. The empty choice sums to 0.` }]
  for (let step = 1; step < k; step++) {
    const { sum, last } = takeSmallest()
    if (last + 1 < n) heap.push({ sum: sum + b[last + 1], last: last + 1 })
    if (last >= 0 && last + 1 < n) heap.push({ sum: sum - b[last] + b[last + 1], last: last + 1 })
    frames.push({ phase: 'pop', activeLine: L('take the smallest sum'), sum, rank: step + 1, total, message: `Subset sum ${sum} is the ${step + 1}-th smallest of the absolute values.` })
  }
  const top = heap.reduce((a, e) => (e.sum < a.sum ? e : a))
  const result = total - top.sum
  frames.push({ phase: 'done', activeLine: L('return total minus the sum'), sum: top.sum, rank: k, total, message: `The k-th largest subsequence sum is ${total} minus ${top.sum}, which is ${result}.` })
  return { input: { nums, k }, result, frames }
}

export const code = `k-th largest subsequence sum of nums
  set total to the sum of the positive numbers
  sort the absolute values of nums ascending into b
  put the empty choice, with sum 0 and last index -1, into a min heap
  repeat k minus 1 times
    take the smallest sum s with last index i out of the heap
    if i plus 1 is in range then push s plus b[i+1] with last index i+1
    if i is not -1 and i plus 1 is in range then push s minus b[i] plus b[i+1] with last index i+1
  return total minus the sum at the top of the heap`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `import heapq

def k_sum(nums, k):
    total = sum(x for x in nums if x > 0)
    b = sorted(abs(x) for x in nums)
    n = len(b)
    heap = [(0, -1)]
    for _ in range(k - 1):
        s, i = heapq.heappop(heap)
        if i + 1 < n:
            heapq.heappush(heap, (s + b[i + 1], i + 1))
            if i >= 0:
                heapq.heappush(heap, (s - b[i] + b[i + 1], i + 1))
    return total - heap[0][0]
`
