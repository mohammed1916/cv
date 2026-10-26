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
  const less = (a, b) => arr[a[0]] * arr[b[1]] < arr[b[0]] * arr[a[1]]
  const heap = []
  const up = i => { while (i > 0) { const p = (i - 1) >> 1; if (less(heap[i], heap[p])) { [heap[i], heap[p]] = [heap[p], heap[i]]; i = p } else break } }
  const down = i => { for (;;) { let m = i; const l = 2 * i + 1, r = l + 1; if (l < heap.length && less(heap[l], heap[m])) m = l; if (r < heap.length && less(heap[r], heap[m])) m = r; if (m === i) break; [heap[i], heap[m]] = [heap[m], heap[i]]; i = m } }
  const show = () => heap.map(([i, j]) => `${arr[i]}/${arr[j]}`)
  for (let j = 1; j < n; j++) heap.push([0, j])
  for (let i = (heap.length >> 1) - 1; i >= 0; i--) down(i)
  const frames = [{ phase: 'start', activeLine: 5, heap: show(), popped: [], current: null, round: 0, message: `Seed the heap with ${arr[0]}/arr[j] for every j: each column's smallest fraction. Then heapify.` }]
  const popped = []
  for (let r = 1; r <= k - 1; r++) {
    const top = heap[0]
    const last = heap.pop()
    if (heap.length) { heap[0] = last; down(0) }
    popped.push(`${arr[top[0]]}/${arr[top[1]]}`)
    frames.push({ phase: 'pop', activeLine: 7, heap: show(), popped: [...popped], current: top, round: r, message: `Pop #${r}: ${arr[top[0]]}/${arr[top[1]]} is the ${r}${r === 1 ? 'st' : r === 2 ? 'nd' : r === 3 ? 'rd' : 'th'} smallest fraction.` })
    const [i, j] = top
    if (i + 1 < j) {
      heap.push([i + 1, j]); up(heap.length - 1)
      frames.push({ phase: 'push', activeLine: 9, heap: show(), popped: [...popped], current: [i + 1, j], round: r, message: `Column ${arr[j]} still has a larger numerator available: push ${arr[i + 1]}/${arr[j]}, the next fraction in that column.` })
    } else {
      frames.push({ phase: 'skip', activeLine: 8, heap: show(), popped: [...popped], current: null, round: r, message: `Numerator index ${i + 1} would reach denominator index ${j}, so column ${arr[j]} is exhausted.` })
    }
  }
  const [i, j] = heap[0]
  const result = [arr[i], arr[j]]
  frames.push({ phase: 'done', activeLine: 11, heap: show(), popped, current: heap[0], round: k, message: `The heap top ${result[0]}/${result[1]} is the ${k}-th smallest fraction.` })
  return { input: { arr, k }, result, frames }
}
export const code = `import heapq
def kthSmallestPrimeFraction(arr, k):
    n = len(arr)
    heap = [(arr[0] / arr[j], 0, j) for j in range(1, n)]
    heapq.heapify(heap)
    for _ in range(k - 1):
        _, i, j = heapq.heappop(heap)
        if i + 1 < j:
            heapq.heappush(heap, (arr[i + 1] / arr[j], i + 1, j))
    _, i, j = heap[0]
    return [arr[i], arr[j]]`.split('\n').map((text, index) => ({ line: index + 1, text }))
