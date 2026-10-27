export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with the keys nums and queries.')
  const { nums, queries } = input
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 6 || nums.some(v => !Number.isInteger(v) || v < 0 || v > 4)) {
    throw new Error('nums is 1 to 6 integers from 0 to 4.')
  }
  const n = nums.length
  if (!Array.isArray(queries) || queries.length < 1 || queries.length > 7) throw new Error('queries needs 1 to 7 [l, r] pairs.')
  queries.forEach((pair, i) => {
    if (!Array.isArray(pair) || pair.length !== 2 || !Number.isInteger(pair[0]) || !Number.isInteger(pair[1]) || pair[0] < 0 || pair[0] > pair[1] || pair[1] >= n) {
      throw new Error(`queries[${i}] must be [l, r] with 0 <= l <= r < n.`)
    }
  })
  return { nums, queries }
}

export function buildTrace(input) {
  const { nums, queries } = input
  const n = nums.length
  const byStart = Array.from({ length: n }, () => [])
  for (const [l, r] of queries) byStart[l].push(r)
  const end = Array(n + 1).fill(0)
  const heap = []
  const frames = []
  let cover = 0
  let used = 0
  let at = -1
  const snap = (phase, activeLine, message) => frames.push({
    phase, activeLine, at, cover, used, heap: [...heap], message,
  })
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

  snap('start', L('set used to zero'), 'Nothing is used yet. The heap holds right ends of queries that have started.')
  for (let i = 0; i < n; i++) {
    at = i
    cover -= end[i]
    snap('expire', L('remove queries that ended'), `Queries that ended before index ${i} stop covering it.`)
    for (const r of byStart[i]) push(r)
    if (byStart[i].length) snap('push', L('push every query that starts'), `Queries starting at ${i} join the heap by right end.`)
    while (cover < nums[i] && heap.length && heap[0] >= i) {
      const r = pop()
      cover++
      end[r + 1]++
      used++
      snap('pick', L('pop the query with the largest'), `Use the query reaching ${r}. Index ${i} is covered ${cover} of ${nums[i]} times.`)
    }
    if (cover < nums[i]) {
      snap('fail', L('if cover is still below'), `Index ${i} needs ${nums[i]} but only ${cover} queries reach it. Return -1.`)
      return { input, result: -1, frames }
    }
  }
  at = -1
  const result = queries.length - used
  snap('done', L('return the number of queries'), `Maximum queries removable: ${result}.`)
  return { input, result, frames }
}

export const code = `set used to zero, cover to zero, and the heap to empty
for each index i from left to right
  remove queries that ended before i from cover
  push every query that starts at i onto the heap, keyed by its right end
  while cover is below nums[i] and the heap has a query reaching i
    pop the query with the largest right end, use it, and count it in used
    cover goes up by one, and it stops covering after its right end
  if cover is still below nums[i], return -1
return the number of queries minus used`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `import heapq

def max_removable(nums, queries):
    n = len(nums)
    by_start = [[] for _ in range(n)]
    for l, r in queries:
        by_start[l].append(r)
    end = [0] * (n + 1)
    heap = []
    cover = 0
    used = 0
    for i in range(n):
        cover -= end[i]
        for r in by_start[i]:
            heapq.heappush(heap, -r)
        while cover < nums[i] and heap and -heap[0] >= i:
            r = -heapq.heappop(heap)
            cover += 1
            end[r + 1] += 1
            used += 1
        if cover < nums[i]:
            return -1
    return len(queries) - used
`
