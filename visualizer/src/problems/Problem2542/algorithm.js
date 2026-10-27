export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with the keys nums1, nums2 and k.')
  const { nums1, nums2, k } = input
  if (!Array.isArray(nums1) || !Array.isArray(nums2) || nums1.length !== nums2.length || nums1.length < 1 || nums1.length > 8) {
    throw new Error('nums1 and nums2 must be equal-length lists of 1 to 8 entries.')
  }
  if ([...nums1, ...nums2].some(v => !Number.isInteger(v) || v < 0 || v > 20)) throw new Error('Values must be integers from 0 to 20.')
  if (!Number.isInteger(k) || k < 1 || k > nums1.length) throw new Error('k must be from 1 to the number of entries.')
  return { nums1, nums2, k }
}

export function buildTrace(input) {
  const { nums1, nums2, k } = input
  const frames = []
  const order = nums1.map((_, i) => i).sort((x, y) => nums2[y] - nums2[x] || nums1[y] - nums1[x])
  const heap = []
  let total = 0
  let best = 0
  let current = -1
  const snap = (phase, activeLine, message) => frames.push({
    phase, activeLine, current, order: [...order], heap: [...heap], total, best, message,
  })
  const push = value => {
    heap.push(value)
    let i = heap.length - 1
    while (i > 0 && heap[(i - 1) >> 1] > heap[i]) { const p = (i - 1) >> 1; [heap[p], heap[i]] = [heap[i], heap[p]]; i = p }
  }
  const pop = () => {
    const top = heap[0]
    const last = heap.pop()
    if (heap.length) {
      heap[0] = last
      let i = 0
      for (;;) {
        const l = 2 * i + 1
        const r = l + 1
        let m = i
        if (l < heap.length && heap[l] < heap[m]) m = l
        if (r < heap.length && heap[r] < heap[m]) m = r
        if (m === i) break
        [heap[i], heap[m]] = [heap[m], heap[i]]
        i = m
      }
    }
    return top
  }

  snap('start', L('pair each nums1 value'), 'Pairs are sorted by nums2, largest first.')
  for (let pos = 0; pos < order.length; pos++) {
    current = pos
    const a = nums1[order[pos]]
    const b = nums2[order[pos]]
    push(a)
    total += a
    snap('add', L('add a to the heap'), `Add ${a} from pair (${a}, ${b}) to the heap and the total.`)
    if (heap.length > k) {
      const removed = pop()
      total -= removed
      snap('drop', L('remove its smallest'), `The heap holds more than ${k}, so ${removed} leaves the total.`)
    }
    if (heap.length === k) {
      best = Math.max(best, total * b)
      snap('score', L('compare total times b'), `Score ${total} times ${b} is ${total * b}. Best is ${best}.`)
    }
  }
  current = -1
  snap('done', L('return the best score'), `Maximum score: ${best}.`)
  return { input, result: best, frames }
}

export const code = `pair each nums1 value with its nums2 value
sort the pairs by nums2 from largest to smallest
start with an empty min-heap and a total of zero
for each pair (a, b) in that order
  add a to the heap and to the total
  if the heap holds more than k values, remove its smallest from the total
  if the heap holds exactly k values, compare total times b with the best score
return the best score`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `import heapq

def max_score(nums1, nums2, k):
    pairs = sorted(zip(nums2, nums1), reverse=True)
    heap = []
    total = 0
    best = 0
    for b, a in pairs:
        heapq.heappush(heap, a)
        total += a
        if len(heap) > k:
            total -= heapq.heappop(heap)
        if len(heap) == k:
            best = max(best, total * b)
    return best
`
