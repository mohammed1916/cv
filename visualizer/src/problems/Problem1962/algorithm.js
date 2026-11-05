// LeetCode 1962: keep the piles in a max-heap. Each operation takes the largest pile and leaves ceil(pile / 2) in its place.
const SOURCE = [
  "function minStoneSum(piles, k) {",
  "  const heap = [...piles]",
  "  for (let i = Math.floor(heap.length / 2) - 1; i >= 0; i--) siftDown(heap, i)",
  "  for (let op = 0; op < k; op++) {",
  "    const top = heap[0]",
  "    heap[0] = top - Math.floor(top / 2)",
  "    siftDown(heap, 0)",
  "  }",
  "  return heap.reduce((a, b) => a + b, 0)",
  "}",
]

export const code = SOURCE.map((text, index) => ({ line: index + 1, text }))

export const python = `import heapq

def min_stone_sum(piles, k):
    heap = [-p for p in piles]
    heapq.heapify(heap)
    for _ in range(k):
        top = -heapq.heappop(heap)
        heapq.heappush(heap, -(top - top // 2))
    return -sum(heap)
`

const L = text => { const i = SOURCE.findIndex(line => line.includes(text)); if (i < 0) throw new Error(`no code line: ${text}`); return i + 1 }
const P = text => { const i = python.split('\n').findIndex(line => line.includes(text)); if (i < 0) throw new Error(`no python line: ${text}`); return i + 1 }

export const phases = [
  { id: 'remove', label: 'Remove half', description: 'Halve the largest pile and restore the heap.' },
  { id: 'done', label: 'Result', description: 'Stones left after all operations.' },
]

export function parseInput(text) {
  let input
  try { input = JSON.parse(text) } catch { throw new Error('Enter JSON like {"piles":[5,4,9],"k":2}.') }
  const { piles, k } = input || {}
  if (!Array.isArray(piles) || piles.length < 1 || piles.length > 8 || !piles.every(v => Number.isInteger(v) && v >= 1 && v <= 100)) throw new Error('piles holds 1 to 8 integers from 1 to 100.')
  if (!Number.isInteger(k) || k < 1 || k > 12) throw new Error('k is an integer from 1 to 12.')
  return { piles, k }
}

function siftDown(heap, i) {
  for (;;) {
    const left = 2 * i + 1, right = left + 1
    let big = i
    if (left < heap.length && heap[left] > heap[big]) big = left
    if (right < heap.length && heap[right] > heap[big]) big = right
    if (big === i) return
    ;[heap[i], heap[big]] = [heap[big], heap[i]]
    i = big
  }
}

export function buildTrace({ piles, k }) {
  const heap = [...piles]
  for (let i = Math.floor(heap.length / 2) - 1; i >= 0; i--) siftDown(heap, i)
  const frames = [{ phase: 'remove', activeLine: L('const heap = [...piles]'), pythonLine: P('heapq.heapify'), message: `Heap built: largest pile ${heap[0]} at the top.`, heap: [...heap], op: 0, before: null, after: null }]
  for (let op = 1; op <= k; op++) {
    const top = heap[0]
    heap[0] = top - Math.floor(top / 2)
    siftDown(heap, 0)
    frames.push({ phase: 'remove', activeLine: L('heap[0] = top'), pythonLine: P('heapq.heappush'), message: `Operation ${op}: ${top} loses ${Math.floor(top / 2)} stones and becomes ${top - Math.floor(top / 2)}.`, heap: [...heap], op, before: top, after: top - Math.floor(top / 2) })
  }
  const result = heap.reduce((a, b) => a + b, 0)
  frames.push({ phase: 'done', activeLine: L('return heap.reduce'), pythonLine: P('return -sum'), message: `Stones remaining: ${result}.`, heap: [...heap], op: k, before: null, after: null, result })
  return { input: { piles, k }, result, frames }
}
