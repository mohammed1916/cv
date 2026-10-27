export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with the keys queries and k.')
  const { queries, k } = input
  if (!Array.isArray(queries) || queries.length < 1 || queries.length > 8) throw new Error('queries needs 1 to 8 [x, y] points.')
  queries.forEach((point, i) => {
    if (!Array.isArray(point) || point.length !== 2 || point.some(v => !Number.isInteger(v) || v < -10 || v > 10)) {
      throw new Error(`queries[${i}] must be [x, y] with integers from -10 to 10.`)
    }
  })
  if (!Number.isInteger(k) || k < 1 || k > 8) throw new Error('k must be an integer from 1 to 8.')
  return { queries, k }
}

export function buildTrace(input) {
  const { queries, k } = input
  const frames = []
  const heap = []
  const answers = []
  let current = -1
  let distance = null
  const snap = (phase, activeLine, message) => frames.push({
    phase, activeLine, current, distance, heap: [...heap], answers: [...answers], message,
  })
  // A max-heap of distances: the largest distance sits on top.
  const push = value => {
    heap.push(value)
    let i = heap.length - 1
    while (i > 0 && heap[(i - 1) >> 1] < heap[i]) { const p = (i - 1) >> 1; [heap[p], heap[i]] = [heap[i], heap[p]]; i = p }
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
        if (l < heap.length && heap[l] > heap[m]) m = l
        if (r < heap.length && heap[r] > heap[m]) m = r
        if (m === i) break
        [heap[i], heap[m]] = [heap[m], heap[i]]
        i = m
      }
    }
    return top
  }

  snap('start', L('set the heap to empty'), 'The heap starts empty. Obstacles are added in query order.')
  for (let i = 0; i < queries.length; i++) {
    current = i
    const [x, y] = queries[i]
    distance = Math.abs(x) + Math.abs(y)
    push(distance)
    snap('add', L('add its distance'), `Obstacle ${i + 1} at (${x}, ${y}) is at distance ${distance}.`)
    if (heap.length > k) {
      const removed = pop()
      snap('trim', L('remove the largest'), `The heap holds more than ${k}, so distance ${removed} leaves.`)
    }
    answers.push(heap.length === k ? heap[0] : -1)
    snap('answer', heap.length === k ? L('the answer is its largest') : L('otherwise the answer is -1'),
      heap.length === k ? `The ${k}th nearest distance is ${heap[0]}.` : `Only ${heap.length} obstacle(s), so the answer is -1.`)
  }
  current = -1
  distance = null
  snap('done', L('return the answers'), `Answers: [${answers.join(', ')}].`)
  return { input, result: answers, frames }
}

export const code = `set the heap to empty
for each query point in order
  add its distance from the origin to the heap
  if the heap holds more than k distances, remove the largest
  if the heap holds k distances, the answer is its largest
  otherwise the answer is -1
return the answers`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `import heapq

def kth_nearest(queries, k):
    heap = []
    answers = []
    for x, y in queries:
        heapq.heappush(heap, -(abs(x) + abs(y)))
        if len(heap) > k:
            heapq.heappop(heap)
        answers.append(-heap[0] if len(heap) == k else -1)
    return answers
`
