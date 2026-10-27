import { TracedHeap, heapView } from '../../components/shared/heapModel.js'

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Enter an object with mat and k.')
  const { mat, k } = input
  if (!Array.isArray(mat) || mat.length < 1 || mat.length > 4) throw new Error('mat has 1 to 4 rows.')
  const cols = mat[0]?.length ?? 0
  if (cols < 1 || cols > 4) throw new Error('Each row has 1 to 4 values.')
  for (const row of mat) {
    if (!Array.isArray(row) || row.length !== cols) throw new Error('All rows must have the same length.')
    if (!row.every(v => Number.isInteger(v) && v >= 1 && v <= 20)) throw new Error('Values are integers from 1 to 20.')
    if (row.some((v, i) => i > 0 && v < row[i - 1])) throw new Error('Each row must be sorted in non-decreasing order.')
  }
  const total = cols ** mat.length
  if (!Number.isInteger(k) || k < 1 || k > total) throw new Error(`k is an integer from 1 to ${total}.`)
  return { mat, k }
}

export function buildTrace({ mat, k }) {
  let sums = [0]
  const frames = [{ phase: 'start', row: null, popped: [], heap: null, activeLine: L('set sums to [0]'), message: 'Start with the empty choice, sum 0.' }]
  mat.forEach((row, r) => {
    const heap = new TracedHeap((a, b) => a[0] - b[0], { order: 'min', format: v => v[0] })
    sums.forEach((s, i) => heap.push([s + row[0], i, 0]))
    const next = []
    while (next.length < k && heap.size) {
      const [value, i, j] = heap.pop()
      next.push(value)
      if (j + 1 < row.length) heap.push([sums[i] + row[j + 1], i, j + 1])
      frames.push({ phase: 'pop', row: r, popped: next.slice(), heap: heapView(heap, { title: `Heap while merging row ${r}` }).heap ?? null, activeLine: L('pop the smallest entry'), message: `Row ${r}: sum ${value} is the ${next.length}-th smallest so far.` })
    }
    sums = next
  })
  const result = sums[k - 1]
  frames.push({ phase: 'done', row: null, popped: sums.slice(), heap: null, activeLine: L('return sums[k - 1]'), message: `The ${k}-th smallest sum is ${result}.` })
  return { input: { mat, k }, result, frames }
}

export const code = `kth smallest sum with one value from each row
  set sums to [0]
  for each row
    make a heap of (sums[i] + row[0], i, 0) for every index i in sums
    set next to an empty list
    while next has fewer than k values and the heap is not empty
      pop the smallest entry (s, i, j) and append s to next
      if j + 1 is inside the row then push (sums[i] + row[j + 1], i, j + 1)
    set sums to next
  return sums[k - 1]`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `import heapq

def kth_smallest_sum(mat, k):
    sums = [0]
    for row in mat:
        heap = [(sums[i] + row[0], i, 0) for i in range(len(sums))]
        heapq.heapify(heap)
        nxt = []
        while heap and len(nxt) < k:
            s, i, j = heapq.heappop(heap)
            nxt.append(s)
            if j + 1 < len(row):
                heapq.heappush(heap, (sums[i] + row[j + 1], i, j + 1))
        sums = nxt
    return sums[k - 1]
`
