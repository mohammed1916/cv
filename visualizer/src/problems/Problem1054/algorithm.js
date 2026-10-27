export function parseInput(text) {
  const data = JSON.parse(text)
  const { barcodes } = data ?? {}
  if (!Array.isArray(barcodes) || barcodes.length < 1 || barcodes.length > 12) throw new Error('Use "barcodes" as an array of 1 to 12 values.')
  if (barcodes.some(v => !Number.isInteger(v) || v < 1 || v > 6)) throw new Error('Each barcode is an integer from 1 to 6.')
  const counts = new Map()
  for (const v of barcodes) counts.set(v, (counts.get(v) ?? 0) + 1)
  if (Math.max(...counts.values()) > Math.ceil(barcodes.length / 2)) throw new Error('No arrangement avoids neighbours: one value is more than half of the list.')
  return { barcodes }
}

export function buildTrace({ barcodes }) {
  const counts = new Map()
  for (const v of barcodes) counts.set(v, (counts.get(v) ?? 0) + 1)
  const heap = [...counts].map(([v, c]) => ({ c, v }))
  // Higher remaining count first; on a tie, the smaller value first. This matches the Python heap order.
  const before = (a, b) => a.c > b.c || (a.c === b.c && a.v < b.v)
  const takeTop = () => {
    let at = 0
    for (let j = 1; j < heap.length; j++) if (before(heap[j], heap[at])) at = j
    return heap.splice(at, 1)[0]
  }
  const result = []
  const frames = [{ phase: 'start', activeLine: L('count how many times each barcode appears'), placed: -1, result: [], message: 'Count each barcode, then place the most frequent one that differs from the last.' }]
  while (heap.length) {
    const first = takeTop()
    if (result.length && result[result.length - 1] === first.v) {
      const second = takeTop()
      result.push(second.v)
      if (second.c - 1 > 0) heap.push({ c: second.c - 1, v: second.v })
      heap.push(first)
      frames.push({ phase: 'swap', activeLine: L('take the next entry instead'), placed: second.v, result: [...result], message: `${first.v} would repeat, so ${second.v} is placed instead.` })
    } else {
      result.push(first.v)
      if (first.c - 1 > 0) heap.push({ c: first.c - 1, v: first.v })
      frames.push({ phase: 'place', activeLine: L('append the value'), placed: first.v, result: [...result], message: `Place ${first.v}.` })
    }
  }
  frames.push({ phase: 'done', activeLine: L('return result'), placed: -1, result: [...result], message: 'No two neighbours match.' })
  return { input: { barcodes }, result, frames }
}

export const code = `rearrange barcodes so that no two neighbours are equal
  count how many times each barcode appears
  put (count, value) pairs into a max heap, most frequent first and smaller value first on ties
  set result to an empty list
  repeat while the heap is not empty
    take the top entry (count, value)
    if value equals the last item of result then take the next entry instead, and put the first one back
    append the value, and push back its count minus one when it is still positive
  return result`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `import heapq
from collections import Counter

def rearrange_barcodes(barcodes):
    heap = [(-c, v) for v, c in Counter(barcodes).items()]
    heapq.heapify(heap)
    result = []
    while heap:
        neg, v = heapq.heappop(heap)
        if result and result[-1] == v:
            neg2, v2 = heapq.heappop(heap)
            result.append(v2)
            if neg2 + 1 < 0:
                heapq.heappush(heap, (neg2 + 1, v2))
            heapq.heappush(heap, (neg, v))
        else:
            result.append(v)
            if neg + 1 < 0:
                heapq.heappush(heap, (neg + 1, v))
    return result
`
