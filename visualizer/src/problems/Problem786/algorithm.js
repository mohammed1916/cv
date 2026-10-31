import { TracedHeap, heapView } from '../../components/shared/heapModel.js'
const isPrime = x => { if (x < 2) return false; for (let d = 2; d * d <= x; d++) if (x % d === 0) return false; return true }
export function parseInput(text) {
  const v = JSON.parse(text)
  const err = 'Enter {"arr":[1,2,3,5],"k":3}: arr is 1 followed by 1-11 strictly increasing primes (at most 12 values, each at most 1000); 1 <= k <= n(n-1)/2.'
  if (!v || !Array.isArray(v.arr) || !Number.isInteger(v.k)) throw new Error(err)
  const { arr, k } = v
  const n = arr.length
  if (n < 2 || n > 12 || arr[0] !== 1) throw new Error(err)
  for (let i = 1; i < n; i++) if (!Number.isInteger(arr[i]) || arr[i] > 1000 || !isPrime(arr[i]) || arr[i] <= arr[i - 1]) throw new Error(err)
  if (k < 1 || k > n * (n - 1) / 2) throw new Error(err)
  return { arr, k }
}
export function buildTrace({ arr, k }) {
  const n = arr.length
  const heap = new TracedHeap((a, b) => arr[a[0]] * arr[b[1]] - arr[b[0]] * arr[a[1]], { format: ([i, j]) => `${arr[i]}/${arr[j]}` })
  const show = () => heap.data.map(([i, j]) => `${arr[i]}/${arr[j]}`)
  const view = () => heapView(heap, { title: 'Min-heap of fractions (root = smallest)' }).heap
  for (let j = 1; j < n; j++) heap.push([0, j])
  const frames = [{ phase: 'start', pythonLine: 6, activeLine: 2, heap: show(), heapState: view(), popped: [], current: null, round: 0, message: `Seed the heap with ${arr[0]}/arr[j] for every j: each column's smallest fraction. Each push sifts up so the smallest fraction sits at the root.` }]
  const popped = []
  for (let r = 1; r <= k - 1; r++) {
    const top = heap.pop()
    popped.push(`${arr[top[0]]}/${arr[top[1]]}`)
    frames.push({ phase: 'pop', pythonLine: 8, activeLine: 5, heap: show(), heapState: view(), popped: [...popped], current: top, round: r, message: `Pop #${r}: ${arr[top[0]]}/${arr[top[1]]} is the ${r}${r === 1 ? 'st' : r === 2 ? 'nd' : r === 3 ? 'rd' : 'th'} smallest fraction.` })
    const [i, j] = top
    if (i + 1 < j) {
      heap.push([i + 1, j])
      frames.push({ phase: 'push', pythonLine: 10, activeLine: 7, heap: show(), heapState: view(), popped: [...popped], current: [i + 1, j], round: r, message: `Column ${arr[j]} still has a larger numerator available: push ${arr[i + 1]}/${arr[j]}, the next fraction in that column.` })
    } else {
      frames.push({ phase: 'skip', pythonLine: 9, activeLine: 8, heap: show(), heapState: view(), popped: [...popped], current: null, round: r, message: `Numerator index ${i + 1} would reach denominator index ${j}, so column ${arr[j]} is exhausted.` })
    }
  }
  const [i, j] = heap.peek()
  const result = [arr[i], arr[j]]
  frames.push({ phase: 'done', pythonLine: 12, activeLine: 9, heap: show(), heapState: view(), popped, current: heap.peek(), round: k, message: `The heap top ${result[0]}/${result[1]} is the ${k}-th smallest fraction.` })
  return { input: { arr, k }, result, frames }
}
export const code = `set n to the length of arr
for each column j from 1 to n - 1
  push the fraction arr[0] / arr[j] (indices 0, j) onto a min-heap
repeat k - 1 times
  pop the smallest fraction arr[i] / arr[j] from the heap
  if i + 1 is less than j then
    push the fraction arr[i + 1] / arr[j] (indices i + 1, j)
  otherwise column j is exhausted, so push nothing
return [arr[i], arr[j]] for the heap top`.split('\n').map((text, index) => ({ line: index + 1, text }))
export const python = `import heapq

def kth_smallest_prime_fraction(arr, k):
    n = len(arr)
    heap = [(arr[0] / arr[j], 0, j) for j in range(1, n)]
    heapq.heapify(heap)
    for _ in range(k - 1):
        _, i, j = heapq.heappop(heap)
        if i + 1 < j:
            heapq.heappush(heap, (arr[i + 1] / arr[j], i + 1, j))
    _, i, j = heap[0]
    return [arr[i], arr[j]]
`
